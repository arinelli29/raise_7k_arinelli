#!/usr/bin/env python3
"""
Setup script para o Analytics Backend com Machine Learning
Configura automaticamente o ambiente Python e inicializa o banco de dados
"""

import subprocess
import sys
import os

def install_requirements():
    """Instala as dependências necessárias"""
    print("📦 Instalando dependências...")

    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        print("✅ Dependências instaladas com sucesso!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False

def create_database():
    """Cria o banco de dados SQLite"""
    print("🗄️ Inicializando banco de dados...")

    try:
        # Importar após instalar dependências
        import sqlite3
        from datetime import date, timedelta
        import numpy as np

        # Criar banco
        conn = sqlite3.connect("analytics.db")
        cursor = conn.cursor()

        # Criar tabelas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS weekly_goals (
                id TEXT PRIMARY KEY,
                week_start DATE NOT NULL,
                week_end DATE NOT NULL,
                description TEXT NOT NULL,
                target_value REAL NOT NULL,
                actual_value REAL,
                completed BOOLEAN,
                completed_date DATETIME,
                created_by TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progress_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                progress_value REAL NOT NULL,
                daily_increment REAL,
                week_number INTEGER,
                month_number INTEGER,
                goals_completed INTEGER DEFAULT 0,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ml_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prediction_date DATE NOT NULL,
                predicted_final_value REAL,
                confidence_score REAL,
                model_used TEXT,
                features_used TEXT,
                actual_progress REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Gerar dados históricos se não existirem
        cursor.execute("SELECT COUNT(*) FROM progress_history")
        count = cursor.fetchone()[0]

        if count == 0:
            print("📊 Gerando dados históricos de exemplo...")

            start_date = date(2025, 8, 10)
            current_date = date.today()

            progress_data = []
            current_progress = 100  # Valor inicial

            delta = current_date - start_date
            for i in range(delta.days + 1):
                day = start_date + timedelta(days=i)

                # Simular progresso variável mas consistente
                base_daily = 13.8  # Meta diária para 7k
                variation = np.random.normal(0, 2.5)  # Variação aleatória
                daily_increment = max(5, base_daily + variation)  # Mínimo 5

                current_progress += daily_increment

                week_num = day.isocalendar()[1]
                month_num = day.month
                goals_completed = np.random.poisson(0.3) if day.weekday() == 6 else 0

                progress_data.append((
                    day.isoformat(),
                    current_progress,
                    daily_increment,
                    week_num,
                    month_num,
                    goals_completed
                ))

            cursor.executemany("""
                INSERT INTO progress_history
                (date, progress_value, daily_increment, week_number, month_number, goals_completed)
                VALUES (?, ?, ?, ?, ?, ?)
            """, progress_data)

            print(f"✅ {len(progress_data)} registros de progresso adicionados")

        # Adicionar metas de exemplo para Yasmin
        cursor.execute("SELECT COUNT(*) FROM weekly_goals WHERE created_by = ?", ("yasmin@fradema.com.br",))
        goals_count = cursor.fetchone()[0]

        if goals_count == 0:
            print("🎯 Criando metas de exemplo...")

            today = date.today()
            monday = today - timedelta(days=today.weekday())

            sample_goals = [
                ("goal_1", monday.isoformat(), (monday + timedelta(days=6)).isoformat(),
                 "Completar módulo de analytics", 100, "work"),
                ("goal_2", (monday - timedelta(days=7)).isoformat(), (monday - timedelta(days=1)).isoformat(),
                 "Implementar dashboard ML", 80, "work"),
                ("goal_3", (monday + timedelta(days=7)).isoformat(), (monday + timedelta(days=13)).isoformat(),
                 "Otimizar algoritmos de previsão", 120, "work"),
            ]

            for goal_id, start, end, desc, target, category in sample_goals:
                cursor.execute("""
                    INSERT INTO weekly_goals
                    (id, week_start, week_end, description, target_value, created_by, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (goal_id, start, end, desc, target, "yasmin@fradema.com.br", category))

            print(f"✅ {len(sample_goals)} metas de exemplo criadas")

        conn.commit()
        conn.close()

        print("✅ Banco de dados inicializado com sucesso!")
        return True

    except Exception as e:
        print(f"❌ Erro ao criar banco de dados: {e}")
        return False

def main():
    """Função principal de setup"""
    print("🚀 Configurando Analytics Backend com Machine Learning")
    print("=" * 60)

    # Verificar Python
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ é necessário")
        return False

    print(f"✅ Python {sys.version.split()[0]} detectado")

    # Instalar dependências
    if not install_requirements():
        return False

    # Criar banco de dados
    if not create_database():
        return False

    print("\n🎉 Setup concluído com sucesso!")
    print("\nPara iniciar o servidor:")
    print("  python main.py")
    print("\nOu com uvicorn:")
    print("  uvicorn main:app --host 0.0.0.0 --port 8000 --reload")

    print("\n📋 Credenciais de teste:")
    print("  Email: yasmin@fradema.com.br")
    print("  Token: yasmin-token")

    print("\n🔗 Endpoints disponíveis:")
    print("  http://localhost:8000/ - Status da API")
    print("  http://localhost:8000/api/analytics - Analytics com ML")
    print("  http://localhost:8000/api/weekly-goals - Metas semanais")
    print("  http://localhost:8000/docs - Documentação Swagger")

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)