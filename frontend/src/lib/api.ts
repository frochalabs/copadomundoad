export interface Palpite {
  jogo_id: number;
  time_a: string;
  time_b: string;
  palpite_a: number;
  palpite_b: number;
  pontos_ganhos: number | null;
  data_jogo: string;
  gols_a?: number | null;
  gols_b?: number | null;
  status?: string;
  fase?: string;
  bandeira_a?: string;
  bandeira_b?: string;
}

export interface PalpiteExtra {
  id: number;
  pergunta_id: number;
  resposta_escolhida: string;
  pontos_ganhos: number | null;
  processada: boolean;
  descricao: string;
  resposta_correta: string | null;
  pontos_valendo: number;
  status: string;
}

export interface ApiResponse {
  username: string;
  posicao?: number | null;
  palpites: Palpite[];
  palpitesExtras?: PalpiteExtra[];
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

export interface RankingItem {
  posicao: number;
  username: string;
  total_pontos: number;
  cravadas: number;
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

const baseURL = 'https://copadomundoad.onrender.com/api';

export interface PerguntaExtraStats {
  id: number;
  descricao: string;
  status: string;
  resposta_correta: string | null;
  opcoes: string[];
  total_respostas: number;
  distribuicao: Record<string, number>;
}

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

export async function fetchUserPalpitesGrupos(username: string): Promise<ApiResponse> {
  const res = await fetch(`${baseURL}/palpites/${username}/grupos`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Nenhum palpite na fase de grupos para este usuário');
    }
    throw new Error('Erro ao buscar palpites da fase de grupos');
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

export async function fetchRanking(): Promise<{ ranking: RankingItem[] }> {
  const res = await fetch(`${baseURL}/ranking`);

  if (!res.ok) {
    throw new Error('Erro ao buscar ranking');
  }

  return res.json();
}

export async function fetchRankingGrupos(): Promise<{ ranking: RankingItem[] }> {
  const res = await fetch(`${baseURL}/ranking/grupos`);

  if (!res.ok) {
    throw new Error('Erro ao buscar ranking da fase de grupos');
  }

  return res.json();
}

export async function fetchPerguntasExtrasStats(): Promise<{ perguntasExtrasStats: PerguntaExtraStats[] }> {
  const res = await fetch(`${baseURL}/stats/perguntas-extras`);

  if (!res.ok) {
    throw new Error('Erro ao buscar estatísticas de perguntas extras');
  }

  return res.json();
}
