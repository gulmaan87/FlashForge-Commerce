# ─────────────────────────────────────────────────────
# IAM: ECS Task Execution Role
# ─────────────────────────────────────────────────────

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_execution" {
  name               = "${var.name_prefix}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "ecs_execution_managed" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow reading secrets from Secrets Manager
resource "aws_iam_role_policy" "ecs_secrets" {
  name = "${var.name_prefix}-ecs-secrets"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = values(var.secret_arns)
    }]
  })
}

# ─────────────────────────────────────────────────────
# CloudWatch Log Groups
# ─────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "services" {
  for_each          = var.services
  name              = "/ecs/${var.name_prefix}/${each.key}"
  retention_in_days = 14
}

# ─────────────────────────────────────────────────────
# ECS Cluster
# ─────────────────────────────────────────────────────

resource "aws_ecs_cluster" "this" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ─────────────────────────────────────────────────────
# Security Groups
# ─────────────────────────────────────────────────────

resource "aws_security_group" "alb" {
  name        = "${var.name_prefix}-alb-sg"
  description = "Allow HTTP/HTTPS from the internet to the ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "services" {
  name        = "${var.name_prefix}-services-sg"
  description = "Allow traffic from ALB and between FlashForge services"
  vpc_id      = var.vpc_id

  # Allow all ports from ALB
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Allow inter-service communication
  ingress {
    from_port = 0
    to_port   = 65535
    protocol  = "tcp"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ─────────────────────────────────────────────────────
# Application Load Balancer
# ─────────────────────────────────────────────────────

resource "aws_lb" "this" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false
}

resource "aws_lb_target_group" "services" {
  for_each = var.services

  name        = "${var.name_prefix}-${substr(each.key, 0, min(length(each.key), 20))}-tg"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  # Default: send to frontend
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["frontend"].arn
  }
}

# Path-based rules for each API service
resource "aws_lb_listener_rule" "services" {
  for_each = { for k, v in var.services : k => v if v.path_prefix != "/" }

  listener_arn = aws_lb_listener.http.arn
  priority     = index(keys({ for k, v in var.services : k => v if v.path_prefix != "/" }), each.key) + 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services[each.key].arn
  }

  condition {
    path_pattern {
      values = ["${each.value.path_prefix}", "${each.value.path_prefix}/*"]
    }
  }
}

# ─────────────────────────────────────────────────────
# ECS Task Definitions + Services
# ─────────────────────────────────────────────────────

resource "aws_ecs_task_definition" "services" {
  for_each = var.services

  family                   = "${var.name_prefix}-${each.key}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([{
    name      = each.key
    image     = "${var.ecr_urls[each.key]}:${var.image_tag}"
    essential = true

    portMappings = [{
      containerPort = each.value.port
      protocol      = "tcp"
    }]

    # Inject plain (non-secret) env vars
    environment = [for k, v in merge(
      { NODE_ENV = "production", LOG_LEVEL = "info", PORT = tostring(each.value.port) },
      each.value.extra_env
    ) : { name = k, value = v }]

    # Inject secrets from Secrets Manager as individual env vars
    secrets = lookup(var.secret_arns, each.key, null) != null ? [
      { name = "DATABASE_URL", valueFrom = "${var.secret_arns[each.key]}:DATABASE_URL::" },
      { name = "REDIS_URL", valueFrom = "${var.secret_arns[each.key]}:REDIS_URL::" },
      { name = "RABBITMQ_URL", valueFrom = "${var.secret_arns[each.key]}:RABBITMQ_URL::" },
    ] : []

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.name_prefix}/${each.key}"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

resource "aws_ecs_service" "services" {
  for_each = var.services

  name            = "${var.name_prefix}-${each.key}"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids  # use public so containers can reach Mongo/Redis/AMQP without NAT
    security_groups  = [aws_security_group.services.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services[each.key].arn
    container_name   = each.key
    container_port   = each.value.port
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy_attachment.ecs_execution_managed,
  ]

  lifecycle {
    ignore_changes = [desired_count, task_definition]  # managed by CI/CD after initial deploy
  }
}
