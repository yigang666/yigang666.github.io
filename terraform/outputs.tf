output "cname_record_hostname" {
  description = "The hostname of the CNAME DNS record"
  value       = cloudflare_record.pages_cname.hostname
}

output "cname_record_value" {
  description = "The target value of the CNAME record"
  value       = cloudflare_record.pages_cname.value
}

output "www_record_hostname" {
  description = "The hostname of the www CNAME record"
  value       = cloudflare_record.www_cname.hostname
}

output "ssl_mode" {
  description = "Active Cloudflare SSL mode"
  value       = var.ssl_mode
}

output "zone_id" {
  description = "Cloudflare Zone ID"
  value       = var.cloudflare_zone_id
  sensitive   = true
}
