import { v2 as cloudinary } from "cloudinary";

// Verificar se estamos no servidor
if (typeof window === "undefined") {
  // Configurar Cloudinary apenas no servidor
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  // Verificar se estamos no servidor
  if (typeof window !== "undefined") {
    return {
      success: false,
      error: "Upload deve ser feito no servidor",
    };
  }

  try {
    // Converter File para base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString(
      "base64"
    )}`;

    // Upload para Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "dash-7k",
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
      resource_type: "image",
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Erro no upload do Cloudinary:", error);
    return {
      success: false,
      error: "Erro ao fazer upload da imagem",
    };
  }
};

export const deleteImage = async (publicId: string): Promise<boolean> => {
  // Verificar se estamos no servidor
  if (typeof window !== "undefined") {
    return false;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    return false;
  }
};
