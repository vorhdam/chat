provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "dev"
      ManagedBy   = "Terraform"
      Project     = "Nordaun"
    }
  }
}

module "ses" {
  source                 = "../../modules/ses"
  domain_name            = var.domain_name
  route53_zone_id        = var.route53_zone_id
  environment            = "dev"
  configuration_set_name = "ses-config"
}