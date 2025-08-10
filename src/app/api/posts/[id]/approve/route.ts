import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("admin_id");

    if (!adminId) {
      return NextResponse.json(
        { error: "ID do admin é obrigatório" },
        { status: 400 }
      );
    }

    const { id: postId } = await params;

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar status do post
    await prisma.post.update({
      where: { id: postId },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({
      success: true,
      message: "Post aprovado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao aprovar post:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
