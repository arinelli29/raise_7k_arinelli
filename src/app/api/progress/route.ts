import { NextResponse } from "next/server";

interface ProgressResponse {
  current_date: string;
  start_date: string;
  end_date: string;
  total_days: number;
  days_elapsed: number;
  days_remaining: number;
  progress_percentage: number;
  is_completed: boolean;
  message: string;
}

export async function GET() {
  try {
    // Datas da meta
    const startDate = new Date(2025, 7, 10); // 10 de agosto de 2025 (mês 7 = agosto)
    const endDate = new Date(2025, 11, 31); // 31 de dezembro de 2025 (mês 11 = dezembro)
    const currentDate = new Date();

    // Calcular dias totais e dias decorridos
    const totalDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let daysElapsed: number;
    let progressPercentage: number;
    let daysRemaining: number;
    let message: string;
    let isCompleted: boolean;

    if (currentDate < startDate) {
      // Se ainda não começou, retorna 1%
      daysElapsed = 0;
      progressPercentage = 1.0;
      daysRemaining = totalDays;
      message = "🚀 A jornada ainda não começou! Prepare-se para decolar!";
      isCompleted = false;
    } else if (currentDate > endDate) {
      // Se já terminou, retorna 100%
      daysElapsed = totalDays;
      progressPercentage = 100.0;
      daysRemaining = 0;
      message = "🎉 Meta concluída! Parabéns, você alcançou os 7k!";
      isCompleted = true;
    } else {
      // Calcular progresso atual
      daysElapsed = Math.floor(
        (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Progresso de 1% a 100% proporcionalmente
      const progressRaw = (daysElapsed / totalDays) * 99; // 99% do range (100% - 1%)
      progressPercentage = Math.round((1 + progressRaw) * 10) / 10; // Adicionar 1% base
      daysRemaining = totalDays - daysElapsed;
      isCompleted = false;

      // Mensagem baseada no progresso
      if (progressPercentage < 25) {
        message = "🚀 Iniciando a jornada rumo aos 7k! Foco e determinação!";
      } else if (progressPercentage < 50) {
        message = "⚡ Progresso consistente! Metade do caminho percorrido!";
      } else if (progressPercentage < 75) {
        message = "🔥 Acelerando! Três quartos da meta alcançados!";
      } else if (progressPercentage < 95) {
        message = "💎 Quase lá! A meta dos 7k está ao alcance!";
      } else {
        message = "🏆 Final de ano chegando! Últimos passos para os 7k!";
      }
    }

    const response: ProgressResponse = {
      current_date: currentDate.toLocaleDateString("pt-BR"),
      start_date: startDate.toLocaleDateString("pt-BR"),
      end_date: endDate.toLocaleDateString("pt-BR"),
      total_days: totalDays,
      days_elapsed: daysElapsed,
      days_remaining: Math.max(0, daysRemaining),
      progress_percentage: progressPercentage,
      is_completed: isCompleted,
      message: message,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Erro ao calcular progresso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
