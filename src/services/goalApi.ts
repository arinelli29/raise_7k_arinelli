// Serviço para comunicação com a API FastAPI do medidor de metas

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ProgressData {
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

export interface Milestone {
  date: string;
  title: string;
  description: string;
  percentage: number;
}

export interface MilestonesResponse {
  milestones: Milestone[];
}

export interface DetailedStats {
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
}

class GoalApiService {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Busca o progresso atual da meta
   */
  async getProgress(): Promise<ProgressData> {
    return this.makeRequest<ProgressData>("/api/progress");
  }

  /**
   * Busca os marcos da jornada
   */
  async getMilestones(): Promise<Milestone[]> {
    const response = await this.makeRequest<MilestonesResponse>(
      "/api/milestones"
    );
    return response.milestones;
  }

  /**
   * Busca estatísticas detalhadas
   */
  async getDetailedStats(): Promise<DetailedStats> {
    return this.makeRequest<DetailedStats>("/api/stats");
  }

  /**
   * Verifica se a API está online
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Busca todos os dados necessários para o medidor
   */
  async getAllData(): Promise<{
    progress: ProgressData;
    milestones: Milestone[];
    stats: DetailedStats;
  }> {
    const [progress, milestones, stats] = await Promise.all([
      this.getProgress(),
      this.getMilestones(),
      this.getDetailedStats(),
    ]);

    return { progress, milestones, stats };
  }
}

// Instância singleton do serviço
export const goalApiService = new GoalApiService();

// Hook personalizado para React
export const useGoalApi = () => {
  return {
    getProgress: () => goalApiService.getProgress(),
    getMilestones: () => goalApiService.getMilestones(),
    getDetailedStats: () => goalApiService.getDetailedStats(),
    getAllData: () => goalApiService.getAllData(),
    healthCheck: () => goalApiService.healthCheck(),
  };
};
