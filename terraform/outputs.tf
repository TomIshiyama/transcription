output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.slack_bot.function_name
}

output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = "${aws_apigatewayv2_stage.slack_api.invoke_url}/slack/events"
}

output "slack_events_endpoint" {
  description = "Full URL for Slack Events API"
  value       = "${aws_apigatewayv2_stage.slack_api.invoke_url}/slack/events"
}

output "lambda_role_arn" {
  description = "ARN of the IAM role used by the Lambda function"
  value       = aws_iam_role.lambda_role.arn
}
