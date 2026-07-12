



$root = $PSScriptRoot

Write-Host "=== FlashForge Commerce - Dev Startup ===" -ForegroundColor Cyan
Write-Host "Root: $root" -ForegroundColor Gray




Write-Host "`n[1/3] Generating Prisma clients..." -ForegroundColor Yellow

$prismaServices = @("product-service","inventory-service","checkout-service","payment-service","order-service")

foreach ($svc in $prismaServices) {
    $svcPath = Join-Path $root "services\$svc"
    Write-Host "  -> prisma generate ($svc)" -ForegroundColor Gray
    Push-Location $svcPath
    pnpm exec prisma generate
    Pop-Location
}




Write-Host "`n[2/3] Starting microservices..." -ForegroundColor Yellow

$services = @(
    @{ Name = "product-service";   Port = 4001 },
    @{ Name = "inventory-service"; Port = 4002 },
    @{ Name = "checkout-service";  Port = 4003 },
    @{ Name = "payment-service";   Port = 4004 },
    @{ Name = "order-service";     Port = 4005 },
    @{ Name = "worker-service";    Port = 4006 }
)

foreach ($svc in $services) {
    $svcPath = Join-Path $root "services\$($svc.Name)"
    Write-Host "  -> Starting $($svc.Name) on port $($svc.Port)" -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$svcPath'; pnpm run dev" -WindowStyle Normal
    Start-Sleep -Milliseconds 500
}




Write-Host "`n[3/3] Starting frontend on http://localhost:3000..." -ForegroundColor Yellow

$frontendPath = Join-Path $root "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; pnpm run dev" -WindowStyle Normal

Write-Host "`n=== All services started! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:          http://localhost:3000"
Write-Host "  Product Service:   http://localhost:4001"
Write-Host "  Inventory Service: http://localhost:4002"
Write-Host "  Checkout Service:  http://localhost:4003"
Write-Host "  Payment Service:   http://localhost:4004"
Write-Host "  Order Service:     http://localhost:4005"
Write-Host "  Worker Service:    http://localhost:4006"
Write-Host ""
Write-Host "MongoDB:   mongodb://localhost:27017" -ForegroundColor DarkGray
Write-Host "Redis:     redis://localhost:6379" -ForegroundColor DarkGray
Write-Host "RabbitMQ:  amqp://localhost:5672  (UI: http://localhost:15672)" -ForegroundColor DarkGray
