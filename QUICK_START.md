# 🚀 Guia Rápido de Início

## Iniciar o Sistema

### Opção 1: Script Automático (Recomendado)
```powershell
.\start.ps1
```

### Opção 2: Manual
```powershell
docker-compose up -d
```

## Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

## Credenciais Padrão

### Administrador
- **RA**: `admin`
- **Senha**: `00000000000`

### Professor
- **RA**: `12345`
- **Senha**: `12345678901`

## Comandos Úteis

```powershell
# Ver logs em tempo real
docker-compose logs -f

# Parar containers
docker-compose down

# Reconstruir (após mudanças no código)
docker-compose up -d --build

# Limpar tudo e recomeçar
docker-compose down -v
docker-compose up -d --build
```

## Estrutura de Pastas

```
PI-app-senac/
├── frontend/           # Nginx + HTML/CSS/JS
├── backend/            # PHP + Apache
├── database/           # MySQL init scripts
├── PI-app-main/        # Código fonte frontend
└── docker-compose.yml  # Orquestração
```

## Funcionalidades

### Administrador
- ✅ Criar/editar/excluir usuários (professores e admins)
- ✅ Criar/editar/excluir equipamentos
- ✅ Criar/editar/excluir salas
- ✅ Visualizar todas as reservas
- ✅ Cancelar qualquer reserva

### Professor
- ✅ Fazer reservas de equipamentos
- ✅ Fazer reservas de salas
- ✅ Visualizar minhas reservas
- ✅ Cancelar minhas reservas
- ✅ Alterar senha
- ✅ Alterar foto de perfil

## Imagens Padrão

Quando não fornecer foto, o sistema usa automaticamente:
- **Usuários**: `imagem-padrao.png`
- **Salas**: `sala-padrao.jpg`
- **Notebooks**: `notebook-padrao.avif`

## Troubleshooting

### Porta em uso
Edite `docker-compose.yml` e altere as portas:
```yaml
ports:
  - "3001:80"  # Frontend
  - "8081:80"  # Backend
```

### Erro de conexão
Aguarde ~30 segundos após iniciar. O MySQL precisa de tempo para inicializar.

### Ver erros
```powershell
docker-compose logs backend
docker-compose logs database
```

## Próximos Passos

1. Faça login como admin
2. Crie professores
3. Adicione equipamentos e salas
4. Teste as reservas

---

**Dúvidas?** Verifique o [README.md](README.md) completo
