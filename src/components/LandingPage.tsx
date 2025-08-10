"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import { Zap, Globe, Shield, Cpu, Sparkles, ChevronDown } from "lucide-react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const MatrixRain = () => {
  const [drops, setDrops] = useState<string[]>([]);

  useEffect(() => {
    const chars =
      "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const newDrops = Array.from(
      { length: 50 },
      () => chars[Math.floor(Math.random() * chars.length)]
    );
    setDrops(newDrops);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
      {drops.map((char, i) => (
        <motion.div
          key={i}
          className="matrix-char absolute text-neon-green"
          style={{
            left: `${(i * 2) % 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
          initial={{ y: -100 }}
          animate={{ y: "100vh" }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        >
          {char}
        </motion.div>
      ))}
    </div>
  );
};

const FloatingParticles = () => {
  // Memoize particle attributes so they remain stable after mount
  const particles = React.useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 3,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-neon-blue rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export default function LandingPage({ onEnterDashboard }: LandingPageProps) {
  // onEnterDashboard is required by the interface but not used in this implementation
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Ultra Performance",
      description: "Velocidade quântica para suas postagens",
      color: "text-neon-yellow",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Total",
      description: "Proteção cybernética avançada",
      color: "text-neon-blue",
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "IA Integrada",
      description: "Algoritmos neurais inteligentes",
      color: "text-neon-purple",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Conectividade Global",
      description: "Rede mundial instantânea",
      color: "text-neon-green",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background Effects - render only on client to avoid hydration mismatch */}
      {isClient && <MatrixRain />}
      {isClient && <FloatingParticles />}

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-20" />

      {/* Scan Lines Effect */}
      <div className="fixed inset-0 scan-lines opacity-30" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            {/* Logo/Title */}
            <motion.h1
              className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent"
              animate={{
                textShadow: [
                  "0 0 20px #00D2FF",
                  "0 0 40px #8A2BE2",
                  "0 0 20px #FF1493",
                  "0 0 40px #00D2FF",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              FUTURISTIC 7
            </motion.h1>

            <motion.h2
              className="text-2xl md:text-4xl text-neon-cyan neon-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              RUMO AOS 7k
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Bem-vinda, aqui poderá acompanhar o progresso de nosso trabalho ao
              decorrer dos meses.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              <Button
                variant="neon"
                size="lg"
                onClick={() => setShowLoginModal(true)}
                className="group relative overflow-hidden px-8 py-4"
              >
                <motion.span
                  className="relative z-10 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="w-5 h-5" />
                  ENTRAR NO FUTURO
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="buttonGlow"
                />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowRegisterModal(true)}
                className="border-neon-blue text-neon-blue hover:bg-neon-blue/10 px-8 py-4"
              >
                CRIAR CONTA
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-neon-cyan" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-center mb-16 text-neon-cyan neon-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            RECURSOS AVANÇADOS
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`glass-effect p-6 rounded-lg border border-gray-800 hover:border-neon-blue transition-all duration-300 ${
                  currentFeature === index ? "neon-border" : ""
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <motion.div
                  className={`${feature.color} mb-4`}
                  animate={
                    currentFeature === index ? { scale: [1, 1.2, 1] } : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSwitchToRegister={() => {
              setShowLoginModal(false);
              setShowRegisterModal(true);
            }}
            onLoginSuccess={() => {
              // O usuário será automaticamente redirecionado para o dashboard
              // através do useEffect no AppContent
            }}
          />
        )}

        {showRegisterModal && (
          <RegisterModal
            onClose={() => setShowRegisterModal(false)}
            onSwitchToLogin={() => {
              setShowRegisterModal(false);
              setShowLoginModal(true);
            }}
            onRegisterSuccess={() => {
              // O usuário será automaticamente redirecionado para o dashboard
              // através do useEffect no AppContent
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
