variable "cloudflare_api_token" {
  description = "Cloudflare API token with Zone.DNS permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the domain"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Root domain name (e.g. yigang.dev)"
  type        = string
}

variable "github_pages_target" {
  description = "GitHub Pages CNAME target (e.g. yigang666.github.io)"
  type        = string
  default     = "yigang666.github.io"
}

variable "ssl_mode" {
  description = "Cloudflare SSL mode: off, flexible, full, strict"
  type        = string
  default     = "full"

  validation {
    condition     = contains(["off", "flexible", "full", "strict"], var.ssl_mode)
    error_message = "ssl_mode must be one of: off, flexible, full, strict."
  }
}

variable "proxied" {
  description = "Whether to proxy DNS record through Cloudflare"
  type        = bool
  default     = true
}
