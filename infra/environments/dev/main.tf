provider "aws" {
  region = var.AWS_REGION

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
  domain_name            = var.DOMAIN_NAME
  route53_zone_id        = var.ROUTE53_ZONE_ID
  environment            = "dev"
  configuration_set_name = "ses-config"
}