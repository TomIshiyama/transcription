# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

# Configure Terraform backend
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.2.0"
}

#####################################
# IAM Role for Lambda
#####################################
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

#####################################
# Lambda Function
#####################################
resource "aws_lambda_function" "slack_bot" {
  function_name = "${var.project_name}-function"
  role          = aws_iam_role.lambda_role.arn
  handler       = "dist/app.lambda.handler" # Lambda用のハンドラー関数
  runtime       = "nodejs20.x"

  filename         = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)

  timeout     = 30
  memory_size = 256

  environment {
    variables = {
      SLACK_BOT_TOKEN       = var.slack_bot_token
      SLACK_SIGNING_SECRET  = var.slack_signing_secret
      SLACK_APP_TOKEN       = var.slack_app_token
      OPENAI_API_KEY        = var.openai_api_key
      WHISPER_LOCAL_ENDPOINT = var.whisper_local_endpoint
      NODE_ENV              = "production"
    }
  }
}

#####################################
# API Gateway
#####################################
resource "aws_apigatewayv2_api" "slack_api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "slack_api" {
  api_id      = aws_apigatewayv2_api.slack_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "slack_lambda" {
  api_id             = aws_apigatewayv2_api.slack_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.slack_bot.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "slack_route" {
  api_id    = aws_apigatewayv2_api.slack_api.id
  route_key = "POST /slack/events"
  target    = "integrations/${aws_apigatewayv2_integration.slack_lambda.id}"
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.slack_bot.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.slack_api.execution_arn}/*/*/slack/events"
}
