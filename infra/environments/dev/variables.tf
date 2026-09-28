# These are defined in the terraform.tfvars file as they are secret
variable "AWS_REGION" {
  type        = string
  description = "AWS region for deployment"
}

variable "DOMAIN_NAME" {
  type        = string
  description = "The domain name from which the emails will be sent"
}

variable "ROUTE53_ZONE_ID" {
  type        = string
  description = "Route 53 hosted zone ID for the domain"
}