// WeeklyGoalsManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  Plus,
  BarChart3,
  Zap,
  Award,
  AlertTriangle,
  RefreshCw,
  Brain,
  Activity,
  Star,
  X,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import OptimizedImage from "./OptimizedImage";

interface WeeklyGoal {
  id: string;
  week_start: string;
  week_end: string;
  description: string;
  target_value: number;
  actual_value?: number;
  completed?: boolean;
  completed_date?: string;
  created_by: string;
  category: string;
}

interface MLPrediction {
  predicted_progress: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  success_probability: number;
  recommendations: string[];
  risk_factors: string[];
  optimal_weekly_target: number;
}

interface AnalyticsData {
  current_progress: number;
  ml_prediction: MLPrediction;
  weekly_performance: {
    avg_weekly_progress: number;
    best_week: number;
    worst_week: number;
    consistency: number;
    goals_set: number;
    goals_completed: number;
  };
  trends: {
    recent_7_days_avg: number;
    recent_14_days_avg: number;
    momentum_status: string;
    vs_target: number;
  };
  kpi_analysis: {
    current_daily_average: number;
    target_daily_average: number;
    performance_vs_target_pct: number;
    days_remaining: number;
    required_daily_remaining: number;
    progress_percentage: number;
    on_track: boolean;
  };
  goal_completion_rate: number;
}

export default function WeeklyGoalsManager() {
  const API_BASE =
    process.env.NEXT_PUBLIC_ANALYTICS_API_BASE_URL || "http://localhost:8000";
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [newGoal, setNewGoal] = useState({
    description: "",
    target_value: 0,
    category: "general",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const { user } = useAuth();

  // Credenciais do Analytics (Basic Auth)
  const [analyticsEmail, setAnalyticsEmail] = useState<string>("");
  const [analyticsPassword, setAnalyticsPassword] = useState<string>("");
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthed) {
      loadData();
    }
  }, [isAuthed]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Headers com Basic Auth
      const headers = {
        Authorization: `Basic ${btoa(
          `${analyticsEmail}:${analyticsPassword}`
        )}`,
        "Content-Type": "application/json",
      } as Record<string, string>;

      // Carregar analytics e metas em paralelo
      const [analyticsResponse, goalsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/analytics`, { headers }),
        fetch(`${API_BASE}/api/weekly-goals`, { headers }),
      ]);

      if (!analyticsResponse.ok || !goalsResponse.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const analyticsData = await analyticsResponse.json();
      const goalsData = await goalsResponse.json();

      setAnalytics(analyticsData);
      setGoals(goalsData.goals || []);
    } catch (err) {
      setError(
        "Erro ao conectar com a API de analytics. Verifique as credenciais e se o servidor Python está rodando."
      );
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyticsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      analyticsEmail === "yasmin@fradema.com.br" &&
      analyticsPassword === "xxx@2016"
    ) {
      setIsAuthed(true);
      setError("");
    } else {
      setIsAuthed(false);
      setError("Email ou senha incorretos");
    }
  };

  const getCurrentWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split("T")[0];
  };

  const getWeekEnd = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end.toISOString().split("T")[0];
  };

  const createGoal = async () => {
    try {
      const weekStart = selectedWeek || getCurrentWeek();
      const weekEnd = getWeekEnd(weekStart);

      const goalData = {
        week_start: weekStart,
        week_end: weekEnd,
        description: newGoal.description,
        target_value: newGoal.target_value,
        category: newGoal.category,
      };

      const response = await fetch(`${API_BASE}/api/weekly-goals`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(
            `${analyticsEmail}:${analyticsPassword}`
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar meta");
      }

      setSuccess("Meta criada com sucesso!");
      setShowCreateModal(false);
      setNewGoal({ description: "", target_value: 0, category: "general" });
      loadData();
    } catch (err) {
      setError("Erro ao criar meta");
      console.error(err);
    }
  };

  const toggleGoalCompletion = async (
    goalId: string,
    completed: boolean,
    actualValue?: number
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/weekly-goals/complete`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${btoa(
            `${analyticsEmail}:${analyticsPassword}`
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal_id: goalId,
          completed,
          actual_value: actualValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar meta");
      }

      setSuccess(
        completed ? "Meta marcada como concluída!" : "Meta desmarcada"
      );
      loadData();
    } catch (err) {
      setError("Erro ao atualizar meta");
      console.error(err);
    }
  };

  const getMomentumIcon = (status: string) => {
    switch (status) {
      case "accelerating":
        return <TrendingUp className="w-5 h-5 text-neon-green" />;
      case "decelerating":
        return <AlertTriangle className="w-5 h-5 text-neon-orange" />;
      default:
        return <Activity className="w-5 h-5 text-neon-blue" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "text-neon-green";
    if (percentage >= 75) return "text-neon-blue";
    if (percentage >= 50) return "text-neon-yellow";
    return "text-neon-orange";
  };

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(t);
  }, [success]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(t);
  }, [error]);

  // Exibir tela de login até autenticar
  if (!isAuthed) {
    return (
      <Card className="glass-effect border-neon-cyan max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-neon-cyan">Login do Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyticsLogin} className="space-y-4">
            {error && (
              <div className="p-2 text-sm text-red-400 border border-red-500/40 rounded bg-red-500/10">
                {error}
              </div>
            )}
            <div>
              <Label className="text-neon-cyan">Email</Label>
              <Input
                type="email"
                value={analyticsEmail}
                onChange={(e) => setAnalyticsEmail(e.target.value)}
                placeholder="Seu email"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-neon-cyan">Senha</Label>
              <Input
                type="password"
                value={analyticsPassword}
                onChange={(e) => setAnalyticsPassword(e.target.value)}
                placeholder="Sua senha"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <Button type="submit" variant="neon" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="glass-effect border-neon-blue">
        <CardContent className="p-6 text-center">
          <motion.div
            className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400">Carregando analytics com IA...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-effect border-red-500">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-400 mb-2">
            Erro de Conexão
          </h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Para resolver:</p>
            <p>
              1. Execute:{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">
                python main.py
              </code>
            </p>
            <p>2. Certifique-se que a API está rodando na porta 8000</p>
          </div>
          <Button variant="neon" onClick={loadData} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-neon-green/10 border border-neon-green rounded-lg text-neon-green"
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400"
          >
            <AlertTriangle className="w-5 h-5 inline mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ML Analytics Dashboard */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Progresso Atual */}
          <Card className="glass-effect border-neon-purple">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center gap-2">
                <Brain className="w-5 h-5" />
                IA - Progresso Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {analytics.current_progress.toFixed(0)}
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  de 7.000 (
                  {analytics.kpi_analysis.progress_percentage.toFixed(1)}%)
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-neon-purple to-neon-pink h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${analytics.kpi_analysis.progress_percentage}%`,
                    }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previsão ML */}
          <Card className="glass-effect border-neon-green">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Previsão ML
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.ml_prediction.predicted_progress.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Progresso Previsto
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-lg font-semibold ${getProgressColor(
                      analytics.ml_prediction.success_probability
                    )}`}
                  >
                    {analytics.ml_prediction.success_probability.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">chance de sucesso</div>
                </div>
                <div className="text-sm text-neon-green">
                  Meta Semanal Sugerida:{" "}
                  {analytics.ml_prediction.optimal_weekly_target.toFixed(0)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="glass-effect border-neon-cyan">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Momentum:</span>
                  <div className="flex items-center gap-2">
                    {getMomentumIcon(analytics.trends.momentum_status)}
                    <span className="text-white capitalize">
                      {analytics.trends.momentum_status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Vs Meta:</span>
                  <span
                    className={
                      analytics.kpi_analysis.on_track
                        ? "text-neon-green"
                        : "text-neon-orange"
                    }
                  >
                    {analytics.kpi_analysis.performance_vs_target_pct.toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Conclusão Metas:</span>
                  <span className="text-neon-blue">
                    {analytics.goal_completion_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recomendações da IA */}
      {analytics?.ml_prediction.recommendations && (
        <Card className="glass-effect border-neon-yellow">
          <CardHeader>
            <CardTitle className="text-neon-yellow flex items-center gap-2">
              <Star className="w-5 h-5" />
              Recomendações da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-neon-green font-semibold mb-2">
                  ✅ Ações Recomendadas:
                </h4>
                <ul className="space-y-1">
                  {analytics.ml_prediction.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-300 text-sm">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              {analytics.ml_prediction.risk_factors.length > 0 && (
                <div>
                  <h4 className="text-neon-orange font-semibold mb-2">
                    ⚠️ Fatores de Risco:
                  </h4>
                  <ul className="space-y-1">
                    {analytics.ml_prediction.risk_factors.map((risk, index) => (
                      <li key={index} className="text-gray-300 text-sm">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metas Semanais */}
      <Card className="glass-effect border-neon-blue">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-neon-blue flex items-center gap-2">
              <Target className="w-5 h-5" />
              Metas Semanais
            </CardTitle>
            <Button
              variant="neon"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Nenhuma meta criada ainda</p>
                <Button
                  variant="neon"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4"
                >
                  Criar Primeira Meta
                </Button>
              </div>
            ) : (
              goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">
                        {goal.description}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {goal.week_start} até {goal.week_end} • Meta:{" "}
                        {goal.target_value}
                      </p>
                      {goal.category !== "general" && (
                        <span className="inline-block px-2 py-1 bg-neon-purple/20 text-neon-purple text-xs rounded mt-1">
                          {goal.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {goal.completed ? (
                        <motion.div
                          className="flex items-center gap-2 text-neon-green"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Concluída</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGoalCompletion(goal.id, false)}
                          >
                            Desfazer
                          </Button>
                        </motion.div>
                      ) : (
                        <Button
                          variant="neon"
                          size="sm"
                          onClick={() =>
                            toggleGoalCompletion(
                              goal.id,
                              true,
                              goal.target_value
                            )
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marcar como Concluída
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação de Meta */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-effect w-full max-w-md rounded-lg border border-neon-cyan"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-neon-cyan">
                    Nova Meta Semanal
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-neon-blue">Descrição da Meta</Label>
                    <Input
                      value={newGoal.description}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, description: e.target.value })
                      }
                      placeholder="Ex: Completar 100 unidades do projeto X"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-neon-green">Valor Alvo</Label>
                    <Input
                      type="number"
                      value={newGoal.target_value || ""}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          target_value: Number(e.target.value),
                        })
                      }
                      placeholder="100"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-neon-purple">Categoria</Label>
                    <select
                      value={newGoal.category}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, category: e.target.value })
                      }
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    >
                      <option value="general">Geral</option>
                      <option value="work">Trabalho</option>
                      <option value="personal">Pessoal</option>
                      <option value="health">Saúde</option>
                      <option value="learning">Aprendizado</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-neon-yellow">
                      Semana (opcional)
                    </Label>
                    <Input
                      type="date"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Se vazio, usará a semana atual
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="neon"
                    onClick={createGoal}
                    disabled={!newGoal.description || !newGoal.target_value}
                    className="flex-1"
                  >
                    Criar Meta
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-hide handled via useEffect hooks */}
    </div>
  );
}
