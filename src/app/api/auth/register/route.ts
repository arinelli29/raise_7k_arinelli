import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  // Evitar execução durante build
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validações básicas
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    // Verificar se o username já existe
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Este nome de usuário já existe" },
        { status: 400 }
      );
    }

    // Verificar se é o primeiro usuário
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`,
        role: isFirstUser ? "ADMIN" : "USER",
      },
    });

    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: isFirstUser
        ? "Conta criada com sucesso! Você é o primeiro usuário e será administrador."
        : "Conta criada com sucesso!",
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
