import { NextResponse } from "next/server";

interface DetailedStats {
  timeline: {
    total_days: number;
    days_elapsed: number;
    days_remaining: number;
    weeks_total: number;
    weeks_elapsed: number;
    months_total: number;
    months_elapsed: number;
  };
  daily_average_required: number;
  current_pace: string;
  meta_info: {
    target_value: number;
    current_estimate: number;
    success_probability: number;
  };
}

export async function GET() {
  try {
    const startDate = new Date(2025, 7, 10); // 10 de agosto de 2025
    const endDate = new Date(2025, 11, 31); // 31 de dezembro de 2025
    const currentDate = new Date();

    const totalDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.max(
      0,
      Math.floor(
        (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const daysRemaining = Math.max(
      0,
      Math.floor(
        (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // Calcular progresso semanal e mensal
    const weeksTotal = Math.round((totalDays / 7) * 10) / 10;
    const weeksElapsed = Math.round((daysElapsed / 7) * 10) / 10;

    const monthsTotal = Math.round((totalDays / 30.44) * 10) / 10; // Média de dias por mês
    const monthsElapsed = Math.round((daysElapsed / 30.44) * 10) / 10;

    // Meta de 7k
    const targetValue = 7000;
    const dailyAverageRequired =
      Math.round((targetValue / totalDays) * 100) / 100;

    // Estimativa atual baseada no progresso temporal
    const progressPercentage =
      daysElapsed > 0 ? (daysElapsed / totalDays) * 100 : 0;
    const currentEstimate = Math.round(
      (progressPercentage / 100) * targetValue
    );

    // Calcular ritmo atual
    let currentPace: string;
    if (currentDate < startDate) {
      currentPace = "Não iniciado";
    } else if (currentDate > endDate) {
      currentPace = "Concluído";
    } else {
      const expectedProgress = (daysElapsed / totalDays) * 100;
      if (progressPercentage >= expectedProgress) {
        currentPace = "No prazo";
      } else {
        currentPace = "Atrasado";
      }
    }

    // Probabilidade de sucesso (baseada no ritmo atual)
    let successProbability: number;
    if (currentDate < startDate) {
      successProbability = 95; // Otimismo inicial
    } else if (currentDate > endDate) {
      successProbability = 100; // Já terminou
    } else {
      const timeProgress = (daysElapsed / totalDays) * 100;
      successProbability = Math.min(
        100,
        Math.max(10, 100 - Math.abs(timeProgress - progressPercentage))
      );
    }

    const stats: DetailedStats = {
      timeline: {
        total_days: totalDays,
        days_elapsed: daysElapsed,
        days_remaining: daysRemaining,
        weeks_total: weeksTotal,
        weeks_elapsed: weeksElapsed,
        months_total: monthsTotal,
        months_elapsed: monthsElapsed,
      },
      daily_average_required: dailyAverageRequired,
      current_pace: currentPace,
      meta_info: {
        target_value: targetValue,
        current_estimate: currentEstimate,
        success_probability: Math.round(successProbability),
      },
    };

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600", // 30min cache
      },
    });
  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
