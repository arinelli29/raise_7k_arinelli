"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
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

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setError(result.error || "Email ou senha incorretos.");
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
        <Card className="glass-effect border-neon-blue">
          <CardHeader className="relative text-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
            <CardTitle className="text-2xl text-neon-cyan neon-text">
              ACESSO NEURAL
            </CardTitle>
            <p className="text-gray-400 mt-2">Conecte-se à matrix do futuro</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neon-blue">
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
                    className="pl-12 bg-dark-card border-gray-600 focus:border-neon-blue text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-neon-blue">
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
                    className="pl-12 pr-12 bg-dark-card border-gray-600 focus:border-neon-blue text-white"
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

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-md border neon-border bg-gradient-to-r from-neon-blue/10 to-neon-cyan/10 text-neon-cyan"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="neon"
                className="w-full py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    CONECTANDO...
                  </>
                ) : (
                  "INICIAR CONEXÃO"
                )}
              </Button>

              {/* Switch to Register */}
              <div className="text-center text-sm">
                <span className="text-gray-400">Novo no futuro? </span>
                <Button
                  type="button"
                  variant="link"
                  className="text-neon-purple hover:text-neon-pink p-0"
                  onClick={onSwitchToRegister}
                >
                  Crie sua identidade digital
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
