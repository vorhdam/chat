output "ses_domain_identity_arn" {
  description = "The ARN of the SES domain"
  value       = aws_ses_domain_identity.main.arn
}

output "configuration_set_name" {
  description = "The name of the SES configuration set"
  value       = aws_ses_configuration_set.main.name
}

output "sns_topic_arn" {
  description = "The ARN of the SNS topic receiving bounce and complaint notifications"
  value       = aws_sns_topic.ses_events.arn
}

output "user_access_key_id" {
  description = "AWS Access Key ID for the TypeScript API"
  value       = aws_iam_access_key.ses_user_key.id
  sensitive   = true
}

output "user_access_key_secret" {
  description = "AWS Access Key Secret for the TypeScript API"
  value       = aws_iam_access_key.ses_user_key.secret
  sensitive   = true
}

output "smtp_username" {
  description = "SES SMTP Username (same as Access Key ID)"
  value       = aws_iam_access_key.ses_user_key.id
  sensitive   = true
}

output "smtp_password" {
  description = "SES SMTP Password generated from the access key"
  value       = aws_iam_access_key.ses_user_key.ses_smtp_password_v4
  sensitive   = true
}