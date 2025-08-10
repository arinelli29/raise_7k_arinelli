import { NextResponse } from "next/server";

interface Milestone {
  date: string;
  title: string;
  description: string;
  percentage: number;
  achieved?: boolean;
}

export async function GET() {
  try {
    const currentDate = new Date();

    const milestones: Milestone[] = [
      {
        date: "2025-08-10",
        title: "🚀 Início da Jornada",
        description: "O projeto Futuristic 7k começa oficialmente!",
        percentage: 1,
        achieved: currentDate >= new Date(2025, 7, 10),
      },
      {
        date: "2025-09-01",
        title: "📚 Primeiro Mês",
        description: "Estabelecendo as bases sólidas do projeto",
        percentage: 15,
        achieved: currentDate >= new Date(2025, 8, 1),
      },
      {
        date: "2025-10-01",
        title: "⚡ Aceleração",
        description: "Momentum crescente e primeiros resultados",
        percentage: 30,
        achieved: currentDate >= new Date(2025, 9, 1),
      },
      {
        date: "2025-11-01",
        title: "🔥 Intensificação",
        description: "Aumentando o ritmo para a reta final",
        percentage: 60,
        achieved: currentDate >= new Date(2025, 10, 1),
      },
      {
        date: "2025-12-01",
        title: "💎 Reta Final",
        description: "Últimas semanas antes da meta final",
        percentage: 85,
        achieved: currentDate >= new Date(2025, 11, 1),
      },
      {
        date: "2025-12-31",
        title: "🏆 Meta Alcançada",
        description: "7k conquistados! Parabéns pelo sucesso!",
        percentage: 100,
        achieved: currentDate >= new Date(2025, 11, 31),
      },
    ];

    return NextResponse.json(
      { milestones },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao buscar marcos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
