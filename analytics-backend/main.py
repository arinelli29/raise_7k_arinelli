#!/usr/bin/env python3
"""
Analytics Backend com Machine Learning para o Futuristic Dashboard
Sistema avançado de previsão e análise de progresso até os 7k
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
    HTTPBasic,
    HTTPBasicCredentials,
)
import secrets
from pydantic import BaseModel, Field
from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import logging
import sqlite3
from contextlib import asynccontextmanager
import asyncio
import warnings
warnings.filterwarnings('ignore')

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Helpers to convert numpy/pandas scalars to native Python types
def _to_native(value):
    try:
        import numpy as _np
        import pandas as _pd
        if isinstance(value, _np.generic):
            return value.item()
        # pandas Timestamp/NaT handling if ever introduced
        if hasattr(_pd, 'Timestamp') and isinstance(value, _pd.Timestamp):
            return value.to_pydatetime()
    except Exception:
        pass
    return value

def _sanitize_dict(d: dict) -> dict:
    return {k: _to_native(v) for k, v in d.items()}

# Modelos Pydantic
class WeeklyGoal(BaseModel):
    id: Optional[str] = None
    week_start: date
    week_end: date
    description: str
    target_value: float
    actual_value: Optional[float] = None
    completed: Optional[bool] = None
    completed_date: Optional[datetime] = None
    created_by: str
    category: str = "general"

class GoalCompletion(BaseModel):
    goal_id: str
    completed: bool
    actual_value: Optional[float] = None
    notes: Optional[str] = None

class MLPrediction(BaseModel):
    predicted_progress: float
    confidence_interval: Dict[str, float]
    success_probability: float
    recommendations: List[str]
    risk_factors: List[str]
    optimal_weekly_target: float

class AnalyticsResponse(BaseModel):
    current_progress: float
    ml_prediction: MLPrediction
    weekly_performance: Dict[str, Any]
    trends: Dict[str, Any]
    kpi_analysis: Dict[str, Any]
    goal_completion_rate: float

# Database Setup
class DatabaseManager:
    def __init__(self, db_path: str = "analytics.db"):
        self.db_path = db_path
        self.init_database()

    def init_database(self):
        """Inicializa o banco de dados"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Tabela de metas semanais
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

        # Tabela de histórico de progresso
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

        # Tabela de previsões ML
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

        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")

    def get_connection(self):
        return sqlite3.connect(self.db_path)

# Machine Learning Engine
class MLAnalyticsEngine:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.is_trained = False
        self.feature_columns = [
            'days_elapsed', 'week_number', 'month_number',
            'goals_completed_week', 'avg_daily_progress',
            'momentum_score', 'consistency_score'
        ]

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepara features para o modelo ML"""
        # Calcular features derivadas
        df['momentum_score'] = self._calculate_momentum(df)
        df['consistency_score'] = self._calculate_consistency(df)
        df['avg_daily_progress'] = df['progress_value'].diff().rolling(7).mean()
        df['goals_completed_week'] = df['goals_completed'].rolling(7).sum()

        # Preencher valores nulos
        df = df.fillna(method='bfill').fillna(0)

        return df[self.feature_columns]

    def _calculate_momentum(self, df: pd.DataFrame) -> pd.Series:
        """Calcula score de momentum baseado na aceleração do progresso"""
        progress_diff = df['progress_value'].diff()
        acceleration = progress_diff.diff()
        return acceleration.rolling(14).mean().fillna(0)

    def _calculate_consistency(self, df: pd.DataFrame) -> pd.Series:
        """Calcula score de consistência baseado na variabilidade"""
        progress_diff = df['progress_value'].diff()
        cv = progress_diff.rolling(14).std() / progress_diff.rolling(14).mean()
        return (1 / (1 + cv)).fillna(0.5)

    def train_models(self, df: pd.DataFrame):
        """Treina múltiplos modelos ML"""
        try:
            if len(df) < 20:
                logger.warning("Dados insuficientes para treinar modelos ML")
                return False

            # Preparar dados
            X = self.prepare_features(df)
            y = df['progress_value'].values

            # Split dos dados
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Normalização
            self.scalers['main'] = StandardScaler()
            X_train_scaled = self.scalers['main'].fit_transform(X_train)
            X_test_scaled = self.scalers['main'].transform(X_test)

            # Treinar modelos
            models_config = {
                'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
                'gradient_boost': GradientBoostingRegressor(n_estimators=100, random_state=42),
                'linear': LinearRegression()
            }

            best_score = -np.inf
            best_model = None

            for name, model in models_config.items():
                model.fit(X_train_scaled, y_train)
                predictions = model.predict(X_test_scaled)
                score = r2_score(y_test, predictions)

                self.models[name] = {
                    'model': model,
                    'score': score,
                    'mse': mean_squared_error(y_test, predictions)
                }

                if score > best_score:
                    best_score = score
                    best_model = name

            self.best_model = best_model
            self.is_trained = True

            logger.info(f"Modelos treinados. Melhor modelo: {best_model} (R²: {best_score:.3f})")
            return True

        except Exception as e:
            logger.error(f"Erro ao treinar modelos: {e}")
            return False

    def predict_progress(self, current_data: Dict) -> MLPrediction:
        """Faz previsão do progresso final"""
        try:
            if not self.is_trained:
                return self._fallback_prediction(current_data)

            # Preparar features atuais
            features = np.array([[
                current_data['days_elapsed'],
                current_data['week_number'],
                current_data['month_number'],
                current_data.get('goals_completed_week', 0),
                current_data.get('avg_daily_progress', 0),
                current_data.get('momentum_score', 0.5),
                current_data.get('consistency_score', 0.5)
            ]])

            # Normalizar
            features_scaled = self.scalers['main'].transform(features)

            # Fazer previsões com todos os modelos
            predictions = {}
            for name, model_info in self.models.items():
                pred = model_info['model'].predict(features_scaled)[0]
                predictions[name] = pred

            # Usar ensemble ou melhor modelo
            final_prediction = predictions[self.best_model]

            # Calcular intervalo de confiança
            prediction_std = np.std(list(predictions.values()))
            confidence_interval = {
                'lower': final_prediction - 1.96 * prediction_std,
                'upper': final_prediction + 1.96 * prediction_std
            }

            # Calcular probabilidade de sucesso
            success_prob = min(100, max(0, (final_prediction / 7000) * 100))

            # Gerar recomendações
            recommendations = self._generate_recommendations(current_data, final_prediction)
            risk_factors = self._identify_risk_factors(current_data)

            # Calcular meta semanal ótima
            days_remaining = (date(2025, 12, 31) - date.today()).days
            weeks_remaining = max(1, days_remaining / 7)
            remaining_progress = 7000 - current_data['current_progress']
            optimal_weekly = remaining_progress / weeks_remaining

            return MLPrediction(
                predicted_progress=final_prediction,
                confidence_interval=confidence_interval,
                success_probability=success_prob,
                recommendations=recommendations,
                risk_factors=risk_factors,
                optimal_weekly_target=optimal_weekly
            )

        except Exception as e:
            logger.error(f"Erro na previsão ML: {e}")
            return self._fallback_prediction(current_data)

    def _fallback_prediction(self, current_data: Dict) -> MLPrediction:
        """Previsão simples quando ML não está disponível"""
        current_progress = current_data['current_progress']
        days_elapsed = current_data['days_elapsed']
        total_days = 508  # Dias totais até 31/12/2025

        # Projeção linear simples
        daily_rate = current_progress / max(1, days_elapsed)
        predicted_final = daily_rate * total_days

        success_prob = min(100, (predicted_final / 7000) * 100)

        return MLPrediction(
            predicted_progress=predicted_final,
            confidence_interval={'lower': predicted_final * 0.8, 'upper': predicted_final * 1.2},
            success_probability=success_prob,
            recommendations=["Mantenha o ritmo atual", "Monitore o progresso semanalmente"],
            risk_factors=["Dados insuficientes para análise avançada"],
            optimal_weekly_target=daily_rate * 7
        )

    def _generate_recommendations(self, data: Dict, prediction: float) -> List[str]:
        """Gera recomendações baseadas na análise"""
        recommendations = []

        if prediction < 6000:
            recommendations.append("🚨 AÇÃO URGENTE: Aumentar significativamente o ritmo")
            recommendations.append("📈 Considere revisar estratégias e aumentar metas semanais")
        elif prediction < 6500:
            recommendations.append("⚠️ Atenção necessária: Acelerar progresso")
            recommendations.append("🎯 Foque em metas de alto impacto")
        elif prediction < 7000:
            recommendations.append("📊 Bom progresso: Mantenha consistência")
            recommendations.append("🔧 Pequenos ajustes podem garantir sucesso")
        else:
            recommendations.append("🎉 Excelente progresso! Objetivo alcançável")
            recommendations.append("🚀 Continue com a estratégia atual")

        # Recomendações baseadas em consistência
        consistency = data.get('consistency_score', 0.5)
        if consistency < 0.3:
            recommendations.append("📅 Melhore a consistência: estabeleça rotina diária")

        return recommendations

    def _identify_risk_factors(self, data: Dict) -> List[str]:
        """Identifica fatores de risco"""
        risks = []

        momentum = data.get('momentum_score', 0)
        if momentum < 0:
            risks.append("📉 Momentum negativo detectado")

        consistency = data.get('consistency_score', 0.5)
        if consistency < 0.3:
            risks.append("⚡ Baixa consistência no progresso")

        avg_daily = data.get('avg_daily_progress', 0)
        if avg_daily < 13.8:  # Meta diária para 7k
            risks.append("🐌 Progresso diário abaixo da meta")

        return risks

# Analytics Service
class AnalyticsService:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.ml_engine = MLAnalyticsEngine()
        self._initialize_sample_data()

    def _initialize_sample_data(self):
        """Inicializa dados de exemplo se necessário"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Verificar se já existem dados
        cursor.execute("SELECT COUNT(*) FROM progress_history")
        count = cursor.fetchone()[0]

        if count == 0:
            # Gerar dados históricos simulados
            start_date = date(2025, 8, 10)
            current_date = date.today()

            progress_data = []
            current_progress = 50  # Valor inicial

            delta = current_date - start_date
            for i in range(delta.days + 1):
                day = start_date + timedelta(days=i)

                # Simular progresso variável
                daily_increment = np.random.normal(13.8, 3.0)  # Meta diária ± variação
                current_progress += max(0, daily_increment)

                week_num = day.isocalendar()[1]
                month_num = day.month
                goals_completed = np.random.poisson(1) if day.weekday() == 6 else 0

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

            conn.commit()
            logger.info(f"Dados históricos inicializados: {len(progress_data)} registros")

        conn.close()

        # Treinar modelos ML
        self._train_ml_models()

    def _train_ml_models(self):
        """Treina os modelos ML com dados históricos"""
        try:
            df = self.get_progress_dataframe()
            if len(df) > 10:
                self.ml_engine.train_models(df)
        except Exception as e:
            logger.error(f"Erro ao treinar modelos ML: {e}")

    def get_progress_dataframe(self) -> pd.DataFrame:
        """Obtém dados de progresso como DataFrame"""
        conn = self.db.get_connection()
        query = """
            SELECT date, progress_value, daily_increment, week_number,
                   month_number, goals_completed, created_at
            FROM progress_history
            ORDER BY date
        """
        df = pd.read_sql_query(query, conn)
        df['date'] = pd.to_datetime(df['date'])
        conn.close()
        return df

    def create_weekly_goal(self, goal: WeeklyGoal, user_email: str) -> str:
        """Cria uma nova meta semanal"""
        import uuid
        goal_id = str(uuid.uuid4())

        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO weekly_goals
            (id, week_start, week_end, description, target_value, created_by, category)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            goal_id,
            goal.week_start.isoformat(),
            goal.week_end.isoformat(),
            goal.description,
            goal.target_value,
            user_email,
            goal.category
        ))

        conn.commit()
        conn.close()

        logger.info(f"Meta semanal criada: {goal_id}")
        return goal_id

    def complete_weekly_goal(self, completion: GoalCompletion, user_email: str) -> bool:
        """Marca uma meta semanal como completa"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE weekly_goals
            SET completed = ?, actual_value = ?, completed_date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND created_by = ?
        """, (
            completion.completed,
            completion.actual_value,
            datetime.now().isoformat() if completion.completed else None,
            completion.goal_id,
            user_email
        ))

        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            logger.info(f"Meta {completion.goal_id} atualizada por {user_email}")
            return True

        conn.close()
        return False

    def get_weekly_goals(self, user_email: str, week_start: Optional[date] = None) -> List[Dict]:
        """Obtém metas semanais"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if week_start:
            cursor.execute("""
                SELECT * FROM weekly_goals
                WHERE created_by = ? AND week_start = ?
                ORDER BY created_at DESC
            """, (user_email, week_start.isoformat()))
        else:
            cursor.execute("""
                SELECT * FROM weekly_goals
                WHERE created_by = ?
                ORDER BY week_start DESC
                LIMIT 20
            """, (user_email,))

        columns = [desc[0] for desc in cursor.description]
        goals = [dict(zip(columns, row)) for row in cursor.fetchall()]

        conn.close()
        return goals

    def get_analytics(self, user_email: str) -> AnalyticsResponse:
        """Gera análise completa com ML"""
        # Obter dados atuais
        df = self.get_progress_dataframe()

        if df.empty:
            current_progress = 100
            days_elapsed = 1
        else:
            current_progress = df['progress_value'].iloc[-1]
            start_date = date(2025, 8, 10)
            days_elapsed = (date.today() - start_date).days

        # Preparar dados para ML
        week_number = date.today().isocalendar()[1]
        month_number = date.today().month

        current_data = {
            'current_progress': current_progress,
            'days_elapsed': days_elapsed,
            'week_number': week_number,
            'month_number': month_number,
            'goals_completed_week': self._get_weekly_goals_completed(user_email),
            'avg_daily_progress': df['daily_increment'].tail(7).mean() if len(df) > 7 else 13.8,
            'momentum_score': 0.5,
            'consistency_score': 0.7
        }

        # Gerar previsão ML
        ml_prediction = self.ml_engine.predict_progress(current_data)

        # Análise de performance semanal
        weekly_performance = self._analyze_weekly_performance(df, user_email)

        # Análise de tendências
        trends = self._analyze_trends(df)

        # KPIs
        kpi_analysis = self._calculate_kpis(df, current_data)

        # Taxa de conclusão de metas
        goal_completion_rate = self._calculate_goal_completion_rate(user_email)

        return AnalyticsResponse(
            current_progress=current_progress,
            ml_prediction=ml_prediction,
            weekly_performance=weekly_performance,
            trends=trends,
            kpi_analysis=kpi_analysis,
            goal_completion_rate=goal_completion_rate
        )

    def _get_weekly_goals_completed(self, user_email: str) -> int:
        """Conta metas completadas na semana atual"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        today = date.today()
        week_start = today - timedelta(days=today.weekday())

        cursor.execute("""
            SELECT COUNT(*) FROM weekly_goals
            WHERE created_by = ? AND completed = 1
            AND week_start >= ?
        """, (user_email, week_start.isoformat()))

        count = cursor.fetchone()[0]
        conn.close()
        return count

    def _analyze_weekly_performance(self, df: pd.DataFrame, user_email: str) -> Dict[str, Any]:
        """Analisa performance semanal"""
        if df.empty:
            return {"status": "insufficient_data"}

        # Últimas 4 semanas
        last_month = df.tail(28)

        weekly_avg = last_month.groupby('week_number')['daily_increment'].mean()
        # Buscar metas semanais antes de usá-las em qualquer retorno
        weekly_goals = self.get_weekly_goals(user_email)

        if weekly_avg.empty:
            return {
                "status": "insufficient_data",
                "avg_weekly_progress": 0.0,
                "best_week": 0.0,
                "worst_week": 0.0,
                "consistency": 0.0,
                "goals_set": len(weekly_goals),
                "goals_completed": len([g for g in weekly_goals if g.get('completed')])
            }

        def safe_float(x: float) -> float:
            try:
                import numpy as _np, pandas as _pd
                if _pd.isna(x) or _np.isinf(x):
                    return 0.0
            except Exception:
                pass
            return float(x)

        return _sanitize_dict({
            "avg_weekly_progress": safe_float(weekly_avg.mean()),
            "best_week": safe_float(weekly_avg.max()),
            "worst_week": safe_float(weekly_avg.min()),
            "consistency": safe_float(weekly_avg.std()),
            "goals_set": int(len(weekly_goals)),
            "goals_completed": int(len([g for g in weekly_goals if g.get('completed')]))
        })

    def _analyze_trends(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analisa tendências no progresso"""
        if len(df) < 14:
            return {"status": "insufficient_data"}

        # Tendência de 7 e 14 dias
        recent_7 = df.tail(7)['daily_increment'].mean()
        recent_14 = df.tail(14)['daily_increment'].mean()
        overall_avg = df['daily_increment'].mean()

        # Guard against NaN/inf
        for name, val in {"recent_7": recent_7, "recent_14": recent_14, "overall": overall_avg}.items():
            if pd.isna(val) or np.isinf(val):
                if name == "recent_7":
                    recent_7 = 0.0
                elif name == "recent_14":
                    recent_14 = 0.0
                else:
                    overall_avg = 0.0

        # Detectar aceleração/desaceleração
        momentum = recent_7 - recent_14
        def safe_float2(x: float) -> float:
            if pd.isna(x) or np.isinf(x):
                return 0.0
            return float(x)

        momentum_status = "accelerating" if safe_float2(momentum) > 0 else "decelerating"

        return _sanitize_dict({
            "recent_7_days_avg": safe_float2(recent_7),
            "recent_14_days_avg": safe_float2(recent_14),
            "overall_average": safe_float2(overall_avg),
            "momentum": safe_float2(momentum),
            "momentum_status": momentum_status,
            "vs_target": safe_float2(recent_7 - 13.8)  # 7000/508 dias
        })

    def _calculate_kpis(self, df: pd.DataFrame, current_data: Dict) -> Dict[str, Any]:
        """Calcula KPIs principais"""
        target_daily = 13.8  # 7000/508
        current_progress = current_data['current_progress']
        days_elapsed = current_data['days_elapsed']

        # Performance vs meta
        actual_daily_avg = current_progress / max(1, days_elapsed)
        performance_vs_target = (actual_daily_avg / target_daily) * 100

        # Dias restantes
        days_remaining = (date(2025, 12, 31) - date.today()).days
        required_daily = (7000 - current_progress) / max(1, days_remaining)

        # Sanitize any NaN/inf before returning
        for name, val in {
            "actual_daily_avg": actual_daily_avg,
            "performance_vs_target": performance_vs_target,
            "required_daily": required_daily,
        }.items():
            if np.isnan(val) or np.isinf(val):
                if name == "actual_daily_avg":
                    actual_daily_avg = 0.0
                elif name == "performance_vs_target":
                    performance_vs_target = 0.0
                else:
                    required_daily = 0.0

        return _sanitize_dict({
            "current_daily_average": float(actual_daily_avg),
            "target_daily_average": float(target_daily),
            "performance_vs_target_pct": float(performance_vs_target),
            "days_remaining": int(days_remaining),
            "required_daily_remaining": float(required_daily),
            "progress_percentage": float((current_progress / 7000) * 100),
            "on_track": bool(performance_vs_target >= 95)
        })

    def _calculate_goal_completion_rate(self, user_email: str) -> float:
        """Calcula taxa de conclusão de metas"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
            FROM weekly_goals
            WHERE created_by = ?
        """, (user_email,))

        result = cursor.fetchone()
        conn.close()

        if result[0] == 0:
            return 0.0

        return (result[1] / result[0]) * 100

# FastAPI App
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Iniciando Analytics Backend com ML...")
    yield
    # Shutdown
    logger.info("Desligando Analytics Backend...")

app = FastAPI(
    title="Futuristic Analytics API",
    description="Sistema avançado de analytics com Machine Learning para progresso até 7k",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar serviços
db_manager = DatabaseManager()
analytics_service = AnalyticsService(db_manager)
security_bearer = HTTPBearer(auto_error=False)
security_basic = HTTPBasic(auto_error=False)

# Auth (mock): aceita Bearer token OU Basic (usuario/senha)
async def verify_user(credentials_bearer: HTTPAuthorizationCredentials | None = Depends(security_bearer),
                      credentials_basic: HTTPBasicCredentials | None = Depends(security_basic)) -> str:
    """Retorna o email do usuário autenticado.
    Regras de dev:
      - Bearer yasmin-token
      - Basic user: yasmin@fradema.com.br, password: fda@2016
    """
    # Bearer token
    if credentials_bearer and credentials_bearer.scheme.lower() == "bearer":
        if secrets.compare_digest(credentials_bearer.credentials, "yasmin-token"):
            return "yasmin@fradema.com.br"

    # Basic auth
    if credentials_basic:
        valid_user = "yasmin@fradema.com.br"
        valid_pass = "fda@2016"
        if (
            secrets.compare_digest(credentials_basic.username, valid_user)
            and secrets.compare_digest(credentials_basic.password, valid_pass)
        ):
            return valid_user

    raise HTTPException(status_code=401, detail="Unauthorized")

@app.get("/")
async def root():
    return {
        "message": "Futuristic Analytics API com Machine Learning",
        "version": "1.0.0",
        "status": "active",
        "ml_models_trained": analytics_service.ml_engine.is_trained
    }

@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics(user_email: str = Depends(verify_user)):
    """Obtém análise completa com ML"""
    try:
        analytics = analytics_service.get_analytics(user_email)
        return analytics
    except Exception as e:
        logger.error(f"Erro ao gerar analytics: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@app.post("/api/weekly-goals")
async def create_weekly_goal(
    goal: WeeklyGoal,
    user_email: str = Depends(verify_user)
):
    """Cria nova meta semanal"""
    try:
        goal_id = analytics_service.create_weekly_goal(goal, user_email)
        return {"success": True, "goal_id": goal_id}
    except Exception as e:
        logger.error(f"Erro ao criar meta: {e}")
        raise HTTPException(status_code=500, detail="Erro ao criar meta")

@app.get("/api/weekly-goals")
async def get_weekly_goals(
    week_start: Optional[str] = None,
    user_email: str = Depends(verify_user)
):
    """Obtém metas semanais"""
    try:
        week_date = date.fromisoformat(week_start) if week_start else None
        goals = analytics_service.get_weekly_goals(user_email, week_date)
        return {"goals": goals}
    except Exception as e:
        logger.error(f"Erro ao buscar metas: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar metas")

@app.put("/api/weekly-goals/complete")
async def complete_weekly_goal(
    completion: GoalCompletion,
    user_email: str = Depends(verify_user)
):
    """Marca meta como completa"""
    try:
        success = analytics_service.complete_weekly_goal(completion, user_email)
        if success:
            return {"success": True, "message": "Meta atualizada com sucesso"}
        else:
            raise HTTPException(status_code=404, detail="Meta não encontrada")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao completar meta: {e}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar meta")

@app.get("/api/ml-insights")
async def get_ml_insights(user_email: str = Depends(verify_user)):
    """Obtém insights avançados de ML"""
    try:
        # Dados atuais
        df = analytics_service.get_progress_dataframe()
        current_progress = df['progress_value'].iloc[-1] if not df.empty else 100

        # Gerar insights
        insights = {
            "model_performance": {
                "is_trained": analytics_service.ml_engine.is_trained,
                "best_model": getattr(analytics_service.ml_engine, 'best_model', 'none'),
                "model_scores": {
                    name: info['score'] for name, info in analytics_service.ml_engine.models.items()
                } if analytics_service.ml_engine.is_trained else {}
            },
            "feature_importance": analytics_service.ml_engine.feature_columns,
            "prediction_accuracy": "Alta" if analytics_service.ml_engine.is_trained else "Limitada",
            "data_quality": {
                "total_days": len(df),
                "consistency_score": df['daily_increment'].std() if len(df) > 1 else 0,
                "outliers_detected": len(df[df['daily_increment'] > df['daily_increment'].mean() + 3*df['daily_increment'].std()]) if len(df) > 10 else 0
            }
        }

        return insights
    except Exception as e:
        logger.error(f"Erro ao gerar insights ML: {e}")
        raise HTTPException(status_code=500, detail="Erro ao gerar insights")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )