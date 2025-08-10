import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("admin_id");

    if (!adminId) {
      return NextResponse.json(
        { error: "ID do admin é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário é admin
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem listar usuários" },
        { status: 403 }
      );
    }

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
