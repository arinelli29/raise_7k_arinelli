.PHONY: setup install run test clean docker-build docker-run help

# Variáveis
PYTHON := python3
PIP := pip3
UVICORN := uvicorn
DOCKER := docker
COMPOSE := docker-compose

# Configuração padrão
.DEFAULT_GOAL := help

# Setup completo do ambiente
setup: ## 🚀 Setup completo (dependências + banco)
	@echo "🚀 Configurando ambiente Analytics ML..."
	$(PYTHON) setup.py

# Instalar dependências apenas
install: ## 📦 Instalar dependências Python
	@echo "📦 Instalando dependências..."
	$(PIP) install -r requirements.txt

# Executar servidor de desenvolvimento
run: ## 🏃 Executar servidor de desenvolvimento
	@echo "🏃 Iniciando servidor de desenvolvimento..."
	$(PYTHON) main.py

# Executar com uvicorn (recomendado)
serve: ## 🚀 Executar com uvicorn (produção)
	@echo "🚀 Iniciando servidor com uvicorn..."
	$(UVICORN) main:app --host 0.0.0.0 --port 8000 --reload

# Executar testes
test: ## 🧪 Executar testes da API
	@echo "🧪 Executando testes..."
	$(PYTHON) test_ml_api.py

# Limpar arquivos temporários
clean: ## 🧹 Limpar arquivos temporários
	@echo "🧹 Limpando arquivos temporários..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name ".pytest_cache" -delete
	rm -f .coverage

# Build Docker
docker-build: ## 🐳 Build imagem Docker
	@echo "🐳 Construindo imagem Docker..."
	$(DOCKER) build -t analytics-ml .

# Executar com Docker
docker-run: ## 🐳 Executar container Docker
	@echo "🐳 Executando container..."
	$(DOCKER) run -p 8000:8000 analytics-ml

# Executar com docker-compose
up: ## 🚀 Iniciar com docker-compose
	@echo "🚀 Iniciando serviços..."
	$(COMPOSE) up -d

# Parar docker-compose
down: ## 🛑 Parar serviços docker-compose
	@echo "🛑 Parando serviços..."
	$(COMPOSE) down

# Rebuild e restart
restart: ## 🔄 Rebuild e reiniciar serviços
	@echo "🔄 Reiniciando serviços..."
	$(COMPOSE) down
	$(COMPOSE) up -d --build

# Ver logs
logs: ## 📋 Ver logs dos containers
	@echo "📋 Visualizando logs..."
	$(COMPOSE) logs -f analytics-api

# Verificar status dos serviços
status: ## 📊 Verificar status da API
	@echo "📊 Verificando status..."
	@curl -s http://localhost:8000/ | python -m json.tool || echo "❌ API não está respondendo"

# Backup do banco
backup: ## 💾 Backup do banco de dados
	@echo "💾 Criando backup do banco..."
	@cp analytics.db backup_$(shell date +%Y%m%d_%H%M%S).db
	@echo "✅ Backup criado: backup_$(shell date +%Y%m%d_%H%M%S).db"

# Verificar dependências
check-deps: ## 🔍 Verificar dependências instaladas
	@echo "🔍 Verificando dependências..."
	@$(PIP) list | grep -E "(fastapi|uvicorn|pandas|scikit-learn)"

# Atualizar dependências
update-deps: ## 📈 Atualizar dependências
	@echo "📈 Atualizando dependências..."
	$(PIP) install --upgrade -r requirements.txt

# Gerar requirements atualizado
freeze: ## ❄️ Gerar requirements.txt atualizado
	@echo "❄️ Gerando requirements.txt..."
	$(PIP) freeze > requirements.txt

# Executar modo desenvolvimento com auto-reload
dev: ## 🛠️ Modo desenvolvimento com auto-reload
	@echo "🛠️ Iniciando modo desenvolvimento..."
	$(UVICORN) main:app --host 0.0.0.0 --port 8000 --reload --log-level debug

# Verificar código com linting
lint: ## 🧹 Verificar código (se flake8 estiver instalado)
	@echo "🧹 Verificando código..."
	@$(PYTHON) -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || echo "ℹ️ flake8 não instalado"

# Instalar dependências de desenvolvimento
dev-install: ## 🛠️ Instalar dependências de desenvolvimento
	@echo "🛠️ Instalando deps de desenvolvimento..."
	$(PIP) install flake8 pytest black

# Formatar código
format: ## ✨ Formatar código com black (se instalado)
	@echo "✨ Formatando código..."
	@$(PYTHON) -m black . || echo "ℹ️ black não instalado (pip install black)"

# Verificar saúde da API
health: ## 🏥 Verificar saúde da API
	@echo "🏥 Verificando saúde da API..."
	@curl -s http://localhost:8000/api/analytics -H "Authorization: Bearer yasmin-token" | head -100 || echo "❌ Endpoint analytics indisponível"

# Informações do sistema
info: ## ℹ️ Informações do sistema
	@echo "ℹ️ Informações do sistema:"
	@echo "Python: $(shell $(PYTHON) --version)"
	@echo "Pip: $(shell $(PIP) --version)"
	@echo "Docker: $(shell $(DOCKER) --version 2>/dev/null || echo 'Não instalado')"
	@echo "Compose: $(shell $(COMPOSE) --version 2>/dev/null || echo 'Não instalado')"

# Limpeza completa
clean-all: clean ## 🧹 Limpeza completa (cache + containers)
	@echo "🧹 Limpeza completa..."
	$(COMPOSE) down --rmi all --volumes --remove-orphans 2>/dev/null || echo "Containers já removidos"
	$(DOCKER) system prune -f 2>/dev/null || echo "Docker não disponível"

# Ajuda
help: ## 📚 Mostrar esta ajuda
	@echo "🤖 Analytics ML Backend - Comandos Disponíveis:"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "📋 Exemplos de uso:"
	@echo "  make setup          # Configuração inicial completa"
	@echo "  make dev            # Desenvolvimento com auto-reload"
	@echo "  make test           # Executar todos os testes"
	@echo "  make up             # Docker compose up"
	@echo "  make status         # Verificar se API está funcionando"
	@echo ""
	@echo "🔗 URLs importantes:"
	@echo "  http://localhost:8000/        # Status da API"
	@echo "  http://localhost:8000/docs    # Documentação Swagger"
	@echo "  http://localhost:8000/api/analytics # Analytics ML"

# Venv helpers
VENV=.venv
PY=$(VENV)/bin/python
PIPV=$(VENV)/bin/pip
UV=$(VENV)/bin/uvicorn

venv: ## 🐍 Criar venv Python 3.12 em .venv
	@test -d $(VENV) || /opt/homebrew/bin/python3.12 -m venv $(VENV)
	@echo "✅ venv pronto em $(VENV)"

setup-venv: venv ## 📦 Instalar deps no venv
	$(PIPV) install -U pip
	$(PIPV) install -r requirements.txt

serve-venv: ## 🚀 Iniciar servidor com venv (uvicorn)
	$(UV) main:app --host 0.0.0.0 --port 8000 --reload

vrun: ## 🏃 Executar main.py usando venv
	$(PY) main.py

test-api: ## 🧪 Testar endpoints principais
	@curl -s http://127.0.0.1:8000/ | python -m json.tool || true
	@curl -s -H "Authorization: Bearer yasmin-token" http://127.0.0.1:8000/api/weekly-goals | head -100 || true
	@curl -s -H "Authorization: Bearer yasmin-token" http://127.0.0.1:8000/api/analytics | head -100 || true