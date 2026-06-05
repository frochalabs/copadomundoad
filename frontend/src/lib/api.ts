export interface Palpite {
  jogo_id: number;
  time_a: string;
  time_b: string;
  palpite_a: number;
  palpite_b: number;
  pontos_ganhos: number | null;
  data_jogo: string;
}

export interface ApiResponse {
  username: string;
  palpites: Palpite[];
}

export interface TrendingGame {
  id: number;
  time_a: string;
  time_b: string;
  data_jogo: string;
  total_palpites: number;
  votos_time_a: number;
  votos_time_b: number;
  votos_empate: number;
}

export interface ContrarianBet {
  jogo_id: number;
  time_a: string;
  time_b: string;
  data_jogo: string;
  username: string;
  placar_zebra: string;
  main_placar: string;
  resultado_zebra: string;
  main_votos: number;
  placar_votos: number;
}

const baseURL = 'http://localhost:3001/api';

export async function fetchUserPalpites(username: string): Promise<ApiResponse> {
  const res = await fetch(`${baseURL}/palpites/${username}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Usuário não encontrado');
    }
    throw new Error('Erro ao buscar palpites');
  }

  return res.json();
}

export async function fetchTrendingGames(): Promise<{ trendingGames: TrendingGame[] }> {
  const res = await fetch(`${baseURL}/stats/trending-games`);

  if (!res.ok) {
    throw new Error('Erro ao buscar trending games');
  }

  return res.json();
}

export async function fetchContrarianBets(): Promise<{ contrarianBets: ContrarianBet[] }> {
  const res = await fetch(`${baseURL}/stats/contrarian-bets`);

  if (!res.ok) {
    throw new Error('Erro ao buscar palpites contrários');
  }

  return res.json();
}
