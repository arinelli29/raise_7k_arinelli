"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  Zap,
  Award,
  Rocket,
  Flame,
  Trophy,
  ChevronRight,
  BarChart3,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";

interface ProgressData {
  current_date: string;
  start_date: string;
  end_date: string;
  total_days: number;
  days_elapsed: number;
  days_remaining: number;
  progress_percentage: number;
  is_completed: boolean;
  message: string;
}

interface Milestone {
  date: string;
  title: string;
  description: string;
  percentage: number;
  achieved?: boolean;
}

interface DetailedStats {
  timeline: {
    total_days: number;
    days_elapsed: number;
    days_remaining: number;
    weeks_total: number;
    weeks_elapsed: number;
    months_total: number;
    months_elapsed: number;
  };
  daily_average_required: number;
  current_pace: string;
  meta_info: {
    target_value: number;
    current_estimate: number;
    success_probability: number;
  };
}

export default function GoalMeter() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchProgressData();
    // Atualizar a cada hora
    const interval = setInterval(fetchProgressData, 3600000);

    // Verificar conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError("");

      // Buscar dados de progresso
      const progressResponse = await fetch("/api/progress", {
        next: { revalidate: 3600 }, // Cache por 1 hora
      });
      if (!progressResponse.ok) throw new Error("Erro ao carregar progresso");
      const progressData = await progressResponse.json();
      setProgress(progressData);

      // Buscar marcos
      const milestonesResponse = await fetch("/api/milestones", {
        next: { revalidate: 3600 },
      });
      if (!milestonesResponse.ok) throw new Error("Erro ao carregar marcos");
      const milestonesData = await milestonesResponse.json();
      setMilestones(milestonesData.milestones);

      // Buscar estatísticas detalhadas
      const statsResponse = await fetch("/api/stats", {
        next: { revalidate: 1800 }, // Cache por 30 min
      });
      if (!statsResponse.ok) throw new Error("Erro ao carregar estatísticas");
      const statsData = await statsResponse.json();
      setStats(statsData);

      setLastUpdated(new Date());
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente.");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 25) return "from-neon-blue to-neon-cyan";
    if (percentage < 50) return "from-neon-cyan to-neon-green";
    if (percentage < 75) return "from-neon-green to-neon-yellow";
    if (percentage < 95) return "from-neon-yellow to-neon-orange";
    return "from-neon-orange to-neon-pink";
  };

  const getProgressIcon = (percentage: number) => {
    if (percentage < 25) return <Rocket className="w-8 h-8" />;
    if (percentage < 50) return <Zap className="w-8 h-8" />;
    if (percentage < 75) return <Flame className="w-8 h-8" />;
    if (percentage < 95) return <Star className="w-8 h-8" />;
    return <Trophy className="w-8 h-8" />;
  };

  const getPaceColor = (pace: string) => {
    switch (pace) {
      case "No prazo":
        return "text-neon-green";
      case "Atrasado":
        return "text-neon-orange";
      case "Concluído":
        return "text-neon-purple";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect border-neon-blue">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <motion.div
              className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-center text-gray-400 mt-4">
            Carregando medidor de metas...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-effect border-red-500">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-4 flex items-center justify-center gap-2">
            <WifiOff className="w-5 h-5" />
            {error}
          </div>
          <Button
            variant="neon"
            onClick={fetchProgressData}
            className="bg-red-500 hover:bg-red-600"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!progress) return null;

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="glass-effect border-neon-purple overflow-hidden">
          <CardHeader className="text-center border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-neon-green" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
                {lastUpdated && (
                  <span>
                    Atualizado: {lastUpdated.toLocaleTimeString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
            <CardTitle className="text-3xl text-neon-purple neon-text flex items-center justify-center gap-3">
              <Target className="w-8 h-8" />
              RUMO AOS 7K
            </CardTitle>
            <p className="text-gray-400 mt-2">{progress.message}</p>
          </CardHeader>

          <CardContent className="p-8">
            {/* Progress Ring */}
            <div className="relative flex items-center justify-center mb-8">
              <motion.div
                className="relative w-48 h-48"
                whileHover={{ scale: 1.05 }}
              >
                {/* Background Circle */}
                <svg
                  className="w-48 h-48 transform -rotate-90"
                  viewBox="0 0 200 200"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="rgb(55, 65, 81)"
                    strokeWidth="8"
                    className="opacity-30"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      80 *
                      (1 - progress.progress_percentage / 100)
                    }`}
                    className={`stroke-current bg-gradient-to-r ${getProgressColor(
                      progress.progress_percentage
                    )}`}
                    style={{
                      filter: "drop-shadow(0 0 10px currentColor)",
                    }}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    animate={{
                      strokeDashoffset:
                        2 *
                        Math.PI *
                        80 *
                        (1 - progress.progress_percentage / 100),
                    }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className={`text-neon-cyan mb-2`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getProgressIcon(progress.progress_percentage)}
                  </motion.div>
                  <motion.div
                    className="text-4xl font-bold text-white"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    {progress.progress_percentage.toFixed(1)}%
                  </motion.div>
                  <div className="text-sm text-gray-400">CONCLUÍDO</div>
                </div>
              </motion.div>
            </div>

            {/* Progress Bar Alternative */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Início: {progress.start_date}</span>
                <span>Fim: {progress.end_date}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getProgressColor(
                    progress.progress_percentage
                  )} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress_percentage}%` }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{
                    boxShadow: "0 0 20px currentColor",
                  }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-neon-blue">
                  {progress.days_elapsed}
                </div>
                <div className="text-xs text-gray-400">Dias Decorridos</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-neon-green">
                  {progress.days_remaining}
                </div>
                <div className="text-xs text-gray-400">Dias Restantes</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-neon-yellow">
                  {progress.total_days}
                </div>
                <div className="text-xs text-gray-400">Total de Dias</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-neon-purple">7K</div>
                <div className="text-xs text-gray-400">Meta Final</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                variant="neon"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {showDetails ? "Ocultar" : "Ver"} Detalhes
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    showDetails ? "rotate-90" : ""
                  }`}
                />
              </Button>
              <Button
                variant="outline"
                onClick={fetchProgressData}
                disabled={loading}
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Stats */}
      <AnimatePresence>
        {showDetails && stats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-effect border-neon-green">
              <CardHeader>
                <CardTitle className="text-neon-green flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas Detalhadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-neon-cyan">
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Semanas totais:</span>
                        <span className="text-white">
                          {stats.timeline.weeks_total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Semanas decorridas:
                        </span>
                        <span className="text-neon-blue">
                          {stats.timeline.weeks_elapsed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Meses totais:</span>
                        <span className="text-white">
                          {stats.timeline.months_total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-neon-yellow">
                      Performance
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Meta diária:</span>
                        <span className="text-neon-green">
                          {stats.daily_average_required}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ritmo atual:</span>
                        <span className={getPaceColor(stats.current_pace)}>
                          {stats.current_pace}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Probabilidade:</span>
                        <span className="text-neon-purple">
                          {stats.meta_info.success_probability}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-neon-orange">
                      Próximos Marcos
                    </h4>
                    <div className="space-y-2">
                      {milestones
                        .filter((m) => !m.achieved)
                        .slice(0, 2)
                        .map((milestone, index) => (
                          <div
                            key={index}
                            className="text-xs p-2 bg-gray-800/30 rounded"
                          >
                            <div className="text-neon-pink font-medium">
                              {milestone.title}
                            </div>
                            <div className="text-gray-400">
                              {milestone.percentage}% - {milestone.description}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
