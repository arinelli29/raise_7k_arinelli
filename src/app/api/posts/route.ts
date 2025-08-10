import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = status ? { status: status as any } : {};

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const content = formData.get("content") as string;
    const author_id = formData.get("author_id") as string;
    const author_username = formData.get("author_username") as string;
    const author_email = formData.get("author_email") as string;
    const author_role = formData.get("author_role") as string;
    const image = formData.get("image") as File | null;

    // Validações básicas
    if (!title || !content || !author_id) {
      return NextResponse.json(
        { error: "Título, conteúdo e autor são obrigatórios" },
        { status: 400 }
      );
    }

    // Processar imagem se fornecida
    let imageUrl = null;
    let imagePublicId = null;

    if (image) {
      // Validar tipo de arquivo
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Arquivo deve ser uma imagem" },
          { status: 400 }
        );
      }

      // Validar tamanho (máximo 5MB)
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Imagem deve ter menos de 5MB" },
          { status: 400 }
        );
      }

      // Verificar se o Cloudinary está configurado
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        // Fallback: usar URL simulada
        imageUrl = `https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop`;
        imagePublicId = `temp_${Date.now()}`;
      } else {
        // Fazer upload para Cloudinary
        const uploadResult = await uploadImage(image);

        if (!uploadResult.success) {
          return NextResponse.json(
            { error: uploadResult.error || "Erro no upload da imagem" },
            { status: 500 }
          );
        }

        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      }
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        subtitle,
        content,
        imageUrl,
        imagePublicId,
        status: author_role === "ADMIN" ? "APPROVED" : "PENDING",
        authorId: author_id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...newPost,
      imagePublicId,
    });
  } catch (error) {
    console.error("Erro ao criar post:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
