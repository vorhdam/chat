variable "aws_region" {
  type        = string
  description = "AWS region for deployment"
  default     = "us-east-1"
}

variable "domain_name" {
  type        = string
  description = "The domain name from which the emails will be sent"
  default     = "nordaun.com"
}

variable "route53_zone_id" {
  type        = string
  description = "Route 53 hosted zone ID for the domain"
  ## change this
  default     = "Z0000000000000000000" 
}