output "domain_name" {
  description = "The CloudFront domain name"
  value       = aws_cloudfront_distribution.cdn.domain_name
}
