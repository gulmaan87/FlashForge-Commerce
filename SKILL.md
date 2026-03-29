---
name: flashforge-aws-infrastructure
description: "FlashForge Commerce — AWS deployment tasks, Terraform layout, and architecture alignment"
risk: safe
source_patterns: "https://github.com/zxkane/aws-skills (general AWS/IaC patterns)"
date_added: "2026-03-20"
---

# FlashForge Commerce — AWS Infrastructure

## Overview

This project runs locally on **Docker Compose** (`infra/docker-compose/`). Production on AWS should preserve the same topology: **six Node services**, **Next.js frontend**, **PostgreSQL**, **Redis**, **RabbitMQ**, and **Prometheus/Grafana** (or managed equivalents).

Use [aws-skills](https://github.com/zxkane/aws-skills) for generic AWS automation and architecture patterns; use this file for **FlashForge-specific** sequencing and acceptance criteria.

---

## Task phases (recommended order)

### Phase 1 — Network foundation (done in repo)

| Task | Detail |
|------|--------|
| VPC + subnets | Multi-AZ public + private subnets via `infra/terraform/` |
| NAT | Optional `enable_nat_gateway` (cost vs private egress for Fargate/EC2) |
| Endpoints (later) | SSM, ECR API/dkr, CloudWatch Logs — reduce NAT data processing |

**Verify:** `cd infra/terraform && terraform init && terraform validate`

### Phase 2 — Data & messaging

| Task | AWS target | Notes |
|------|------------|--------|
| PostgreSQL | RDS PostgreSQL 15+ or Aurora Serverless v2 | One DB per service schema vs single cluster — match current Prisma layouts |
| Redis | ElastiCache Redis 7 | Reservation TTL + locks |
| RabbitMQ | Amazon MQ for RabbitMQ or Amazon EventBridge + SQS (requires app change) | Prefer Amazon MQ for drop-in URL compatibility |
| Secrets | Secrets Manager / SSM Parameter Store | `DATABASE_URL`, `REDIS_URL`, `RABBITMQ_URL` — never in images |

### Phase 3 — Compute

| Task | Options |
|------|---------|
| Microservices | **ECS Fargate** (one task definition per service) or **EKS** if you need the k8s path from `docs/architecture.md` |
| Frontend | Fargate behind ALB, or **Amplify Hosting** / **Vercel** if Next.js stays edge-hosted |
| Worker | Same cluster as services; scale on queue depth (Rabbit consumer lag or custom metric) |

### Phase 4 — Edge & traffic

| Task | Detail |
|------|--------|
| Ingress | ALB → target groups per service (path/host rules) or API Gateway + VPC Link |
| TLS | ACM on ALB |
| WAF | Optional — flash sales attract bots |

### Phase 5 — Observability & ops

| Task | Detail |
|------|--------|
| Metrics | CloudWatch Container Insights + scrape `/metrics` with **Amazon Managed Prometheus** or self-hosted Grafana on ECS |
| Logs | CloudWatch Logs groups per service; structured JSON from Pino |
| CI/CD | Build & push to **ECR**; Terraform or CDK pipeline; migrations as one-off tasks or init containers |

---

## Environment variables (parity with Compose)

Align task definitions with `infra/docker-compose/docker-compose.yml` (`x-app-env`): `DATABASE_URL`, `REDIS_URL`, `RABBITMQ_URL`, `LOG_LEVEL`, `NODE_ENV`, plus each service’s own URLs (checkout → inventory, payment, etc.). Prefer internal service discovery (Cloud Map) or explicit internal ALB rules.

---

## Repo map

| Path | Purpose |
|------|---------|
| `infra/terraform/` | Root module + `modules/vpc` — AWS network baseline |
| `infra/docker-compose/` | Reference for ports, env, and dependencies |
| `docs/architecture.md` | Service graph and data flows |

---

## When to use this skill

- Planning or implementing AWS infrastructure for FlashForge Commerce.
- Extending Terraform beyond VPC (RDS, ECS, MQ, etc.).
- Reviewing security (secrets, SG rules, least-privilege IAM) before production.
