# This initiates domain-level verification for email addresses.
resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

# Creates a TXT record in Route 53 to prove domain ownership to AWS SES.
resource "aws_route53_record" "ses_verification" {
  zone_id = var.route53_zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main.verification_token]
}

# Automatically waits for SES domain verification to complete before continuing.
resource "aws_ses_domain_identity_verification" "verification" {
  domain     = aws_ses_domain_identity.main.id
  depends_on = [aws_route53_record.ses_verification]
}

# Generates 3 DKIM tokens required by AWS Easy DKIM.
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Creates 3 CNAME records in Route 53 for DKIM verification.
resource "aws_route53_record" "dkim" {
  count   = 3
  zone_id = var.route53_zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# SPF record specifies that AWS SES servers are authorized to send email on behalf of your domain.
resource "aws_route53_record" "spf" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# DMARC record specifies how recipient servers should handle emails that fail SPF/DKIM checks.
resource "aws_route53_record" "dmarc" {
  zone_id = var.route53_zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = ["v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@${var.domain_name}"]
}

# Configuration Sets allow tracking metrics like bounces, complaints, opens, and clicks.
resource "aws_ses_configuration_set" "main" {
  name                       = "${var.configuration_set_name}-${var.environment}"
  reputation_metrics_enabled = true
}

# SNS Topic to receive real-time notifications when an email bounces or is marked as spam.
resource "aws_sns_topic" "ses_events" {
  name = "ses-events-topic-${var.environment}"
}

# SNS Topic Policy allowing SES service to publish event notifications to the topic.
resource "aws_sns_topic_policy" "ses_events_policy" {
  arn = aws_sns_topic.ses_events.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSESPublish"
        Effect = "Allow"
        Principal = {
          Service = "ses.amazonaws.com"
        }
        Action   = "sns:Publish"
        Resource = aws_sns_topic.ses_events.arn
      }
    ]
  })
}

# Binds the Configuration Set to publish bounce, complaint, and delivery events to the SNS topic.
resource "aws_ses_event_destination" "sns_destination" {
  name                   = "sns-event-destination"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true
  matching_types         = ["bounce", "complaint", "send", "reject"]

  sns_destination {
    topic_arn = aws_sns_topic.ses_events.arn
  }
}

# Programmatic IAM User created specifically for sending emails from your application.
resource "aws_iam_user" "ses_user" {
  name = "ses-sender-${var.environment}"

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Generates long-lived access keys (Access Key ID and Access Key Secret) for the user.
resource "aws_iam_access_key" "ses_user_key" {
  user = aws_iam_user.ses_user.name
}

# IAM Policy applying Principle of Least Privilege: allows ONLY sending emails via SES.
resource "aws_iam_user_policy" "ses_user_policy" {
  name = "SESSendOnlyPolicy"
  user = aws_iam_user.ses_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail"
        ]
        Resource = "*"
      }
    ]
  })
}