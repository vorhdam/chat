output "ses_access_key_id" {
  description = "AWS Access Key ID for SES sending"
  value       = module.ses.user_access_key_id
  sensitive   = true
}

output "ses_access_key_secret" {
  description = "AWS Access Key Secret for SES sending"
  value       = module.ses.user_access_key_secret
  sensitive   = true
}

output "sns_topic_arn" {
  description = "SNS Topic ARN for monitoring bounces and complaints"
  value       = module.ses.sns_topic_arn
}