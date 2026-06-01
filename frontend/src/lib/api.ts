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

export async function fetchUserPalpites(username: string): Promise<ApiResponse> {
  const res = await fetch(`https://copadomundoad.onrender.com/api/palpites/${username}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Usuário não encontrado');
    }
    throw new Error('Erro ao buscar palpites');
  }

  return res.json();
}
