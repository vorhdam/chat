# These are defined in the terraform.tfvars file as they are secret
variable "aws_region" {
  type        = string
  description = "AWS region for deployment"
}

variable "domain_name" {
  type        = string
  description = "The domain name from which the emails will be sent"
}

variable "route53_zone_id" {
  type        = string
  description = "Route 53 hosted zone ID for the domain"
}