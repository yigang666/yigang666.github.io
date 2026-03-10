terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# CNAME record pointing to GitHub Pages
resource "cloudflare_record" "pages_cname" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain
  value   = var.github_pages_target
  type    = "CNAME"
  proxied = var.proxied
  ttl     = 1 # Auto TTL when proxied
  comment = "GitHub Pages — managed by Terraform"
}

# www subdomain redirect to apex
resource "cloudflare_record" "www_cname" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = var.domain
  type    = "CNAME"
  proxied = var.proxied
  ttl     = 1
  comment = "www redirect — managed by Terraform"
}

# Zone SSL settings
resource "cloudflare_zone_settings_override" "ssl_settings" {
  zone_id = var.cloudflare_zone_id

  settings {
    ssl                      = var.ssl_mode
    always_use_https         = "on"
    min_tls_version          = "1.2"
    tls_1_3                  = "zrt"
    automatic_https_rewrites = "on"
    security_level           = "medium"
  }
}
