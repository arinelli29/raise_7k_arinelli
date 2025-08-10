"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { validateImageFile, createImagePreview } from "@/lib/imageUtils";

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  className?: string;
}

export default function ImageUpload({
  onImageSelect,
  selectedImage,
  className = "",
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Arquivo inválido");
      return;
    }

    // Criar preview
    try {
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
      onImageSelect(file);
    } catch (error) {
      setError("Erro ao processar imagem");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setError(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {preview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
        </motion.div>
      ) : (
        <motion.div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-neon-cyan bg-neon-cyan/5"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-gray-600 text-gray-400 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Imagem
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF até 5MB
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
