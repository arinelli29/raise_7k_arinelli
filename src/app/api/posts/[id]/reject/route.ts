import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("admin_id");
    const reason = searchParams.get("reason");

    if (!adminId) {
      return NextResponse.json(
        { error: "ID do admin é obrigatório" },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: "Motivo da rejeição é obrigatório" },
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
      data: {
        status: "REJECTED",
        rejectedReason: reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Post rejeitado com sucesso",
      reason,
    });
  } catch (error) {
    console.error("Erro ao rejeitar post:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
