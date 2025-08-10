"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PostsProvider } from "@/contexts/PostsContext";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

function AppContent() {
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">(
    "landing"
  );
  const { isAuthenticated, isLoading } = useAuth();

  console.log("AppContent renderizado:", {
    currentView,
    isAuthenticated,
    isLoading,
  });

  // Navegação automática baseada na autenticação
  useEffect(() => {
    console.log("Estado de autenticação mudou:", {
      isAuthenticated,
      isLoading,
      currentView,
    });

    if (isLoading) {
      console.log("Aguardando carregamento da autenticação...");
      return; // Aguardar carregamento da autenticação
    }

    if (isAuthenticated && currentView !== "dashboard") {
      console.log("Usuário autenticado, redirecionando para dashboard");
      setCurrentView("dashboard");
    } else if (!isAuthenticated && currentView !== "landing") {
      console.log("Usuário não autenticado, redirecionando para landing");
      setCurrentView("landing");
    }
  }, [isAuthenticated, isLoading]);

  // Importante: não bloquear a página inteira com loader global,
  // para o modal permanecer montado e exibir mensagens de erro

  return (
    <AnimatePresence mode="wait">
      {currentView === "landing" ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage onEnterDashboard={() => setCurrentView("dashboard")} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <PostsProvider>
            <Dashboard />
          </PostsProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
