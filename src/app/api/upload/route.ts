import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhuma imagem fornecida" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Arquivo deve ser uma imagem" },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem deve ter menos de 5MB" },
        { status: 400 }
      );
    }

    // Fazer upload para Cloudinary
    const result = await uploadImage(file);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erro no upload" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
