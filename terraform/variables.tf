variable "aws_region" {
  description = "The AWS region to deploy resources to"
  type        = string
  default     = "ap-northeast-1" # Tokyo region as default
}

variable "project_name" {
  description = "The name of the project, used as a prefix for resource names"
  type        = string
  default     = "slack-transcription"
}

variable "lambda_zip_path" {
  description = "Path to the Lambda deployment package zip file"
  type        = string
  default     = "../deployment.zip" # This will be created by the build process
}

variable "slack_bot_token" {
  description = "Slack Bot Token (xoxb-...)"
  type        = string
  sensitive   = true
}

variable "slack_signing_secret" {
  description = "Slack Signing Secret"
  type        = string
  sensitive   = true
}

variable "slack_app_token" {
  description = "Slack App Token (xapp-...)"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API Key for Whisper transcription"
  type        = string
  sensitive   = true
}

variable "whisper_local_endpoint" {
  description = "Local endpoint for Whisper service (if used)"
  type        = string
  default     = ""
}
