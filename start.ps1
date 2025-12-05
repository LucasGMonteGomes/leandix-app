# Iniciar Sistema Sulien
# Execute este script para iniciar todos os containers

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Sistema de Reservas Sulien" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não está rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Iniciando containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  Sistema iniciado com sucesso!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acesse a aplicação em:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  Backend API: http://localhost:8080" -ForegroundColor White
    Write-Host ""
    Write-Host "Credenciais padrão:" -ForegroundColor Cyan
    Write-Host "  Admin - RA: admin | Senha: 00000000000" -ForegroundColor White
    Write-Host "  Professor - RA: 12345 | Senha: 12345678901" -ForegroundColor White
    Write-Host ""
    Write-Host "Para ver os logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "Para parar: docker-compose down" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Erro ao iniciar containers" -ForegroundColor Red
    Write-Host "Execute 'docker-compose logs' para mais detalhes" -ForegroundColor Yellow
}
