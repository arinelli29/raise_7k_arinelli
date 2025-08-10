"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export default function RegisterModal({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    const result = await register({ username, email, password });
    if (result.success) {
      onClose();
      if (onRegisterSuccess) onRegisterSuccess();
    } else {
      setError(result.error || "Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="glass-effect border-neon-purple">
          <CardHeader className="relative text-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
            <CardTitle className="text-2xl text-neon-purple neon-text flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6" />
              CRIAÇÃO NEURAL
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Gere sua nova identidade digital
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-neon-purple">
                  Nome de Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="CyberNinja2024"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-12 bg-dark-card border-gray-600 focus:border-neon-purple text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neon-purple">
                  Endereço Quântico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@futuro.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 bg-dark-card border-gray-600 focus:border-neon-purple text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-neon-purple">
                  Código de Segurança
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 bg-dark-card border-gray-600 focus:border-neon-purple text-white"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-neon-purple">
                  Confirmar Código
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 bg-dark-card border-gray-600 focus:border-neon-purple text-white"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-md border neon-border bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 text-neon-purple"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="neon"
                className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-pink"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    MATERIALIZANDO...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    CRIAR IDENTIDADE
                  </>
                )}
              </Button>

              {/* Switch to Login */}
              <div className="text-center text-sm">
                <span className="text-gray-400">
                  Já possui uma identidade?{" "}
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="text-neon-cyan hover:text-neon-blue p-0"
                  onClick={onSwitchToLogin}
                >
                  Fazer conexão neural
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
