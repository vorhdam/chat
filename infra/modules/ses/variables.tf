variable "domain_name" {
  type        = string
  description = "The domain name from which the emails will be sent"
}

variable "route53_zone_id" {
  type        = string
  description = "Route 53 hosted zone ID for the domain"
}

variable "environment" {
  type        = string
  description = "Environment name (dev or prod)"
  default     = "dev"
}

variable "configuration_set_name" {
  type        = string
  description = "Name of the SES configuration set"
  default     = "ses-config"
}