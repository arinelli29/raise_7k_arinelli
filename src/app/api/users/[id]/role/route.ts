import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { role, adminId } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: "ID do admin é obrigatório" },
        { status: 400 }
      );
    }

    if (!role || !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json({ error: "Role inválida" }, { status: 400 });
    }

    const { id: userId } = await params;

    // Verificar se o usuário que está fazendo a alteração é admin
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem alterar roles" },
        { status: 403 }
      );
    }

    // Verificar se o usuário alvo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Não permitir rebaixar o próprio usuário se for o único admin
    if (adminId === userId && role === "USER") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Não é possível rebaixar o único administrador" },
          { status: 400 }
        );
      }
    }

    // Atualizar role do usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as "ADMIN" | "USER" },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Usuário ${
        role === "ADMIN" ? "promovido" : "rebaixado"
      } com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao alterar role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
