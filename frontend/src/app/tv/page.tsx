"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Star } from "lucide-react";
import { RankingItem } from "@/lib/api";

// MOCK DE DADOS PARA TESTE VISUAL DA TV
const MOCK_RANKING: RankingItem[] = [
  { posicao: 1, username: "fabiano.sales", total_pontos: 145, cravadas: 8 },
  { posicao: 2, username: "joao.silva", total_pontos: 130, cravadas: 6 },
  { posicao: 3, username: "maria.souza", total_pontos: 125, cravadas: 5 },
  { posicao: 4, username: "pedro.almeida", total_pontos: 110, cravadas: 4 },
  { posicao: 5, username: "ana.costa", total_pontos: 105, cravadas: 4 },
  { posicao: 6, username: "lucas.pereira", total_pontos: 95, cravadas: 3 },
  { posicao: 7, username: "julia.lima", total_pontos: 90, cravadas: 2 },
  { posicao: 8, username: "carlos.mendes", total_pontos: 85, cravadas: 2 },
  { posicao: 9, username: "fernanda.gomes", total_pontos: 80, cravadas: 1 },
  { posicao: 10, username: "rafael.martins", total_pontos: 75, cravadas: 1 },
];

export default function TVRankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);

  useEffect(() => {
    // Carrega o mock (No futuro: fetchRanking da API)
    setRanking(MOCK_RANKING);
    
    // Refresh super leve a cada hora caso a TV fique ligada direto
    const interval = setInterval(() => {
      window.location.reload();
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const getAvatarUrl = (username: string) => {
    const baseUrl = "https://res.cloudinary.com/dhj0lwxgq/image/upload/";
    const transformations = "w_300,h_300,c_scale,f_auto,q_auto/";
    return `${baseUrl}${transformations}${encodeURIComponent(
      username.trim().toLowerCase().replace(/\s+/g, ".")
    )}.jpg`;
  };

  if (ranking.length === 0) return null;

  const top3 = ranking.slice(0, 3);
  const others = ranking.slice(3, 10); // Limita a 7 pessoas para não precisar rolar na TV (Fixo e Lindo)

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#051020] text-white flex p-8 gap-8 relative font-sans">
      {/* Background Decorativo Estático (Super Leve para GPU de TV) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#10B981] rounded-full blur-[200px] opacity-[0.03]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#FBBF24] rounded-full blur-[150px] opacity-[0.03]"></div>
      </div>

      {/* =========================================
          COLUNA ESQUERDA: O PÓDIO (45%)
      ========================================= */}
      <section className="w-[45%] h-full flex flex-col justify-between relative z-10">
        <div className="mb-6 flex flex-col gap-2">
          <img
            src="https://adpromotora.com.br/src/img/logos/AD.png"
            alt="AD Promotora"
            className="h-16 object-contain brightness-0 invert opacity-60 w-max"
          />
          <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24]">
            Top Ranking
          </h1>
          <p className="text-xl lg:text-2xl text-slate-400 font-medium">Os melhores do Bolão da Copa</p>
        </div>

        {/* Pódio Layout */}
        <div className="flex-1 flex items-end justify-center gap-4 pb-8">
          
          {/* Segundo Lugar (Prata) */}
          {top3[1] && (
            <div className="flex flex-col items-center justify-end w-1/3 mb-10">
              <div className="relative mb-4">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-black px-4 py-1 rounded-full text-xl z-20 shadow-lg border-4 border-[#051020]">
                  2º
                </div>
                <img src={getAvatarUrl(top3[1].username)} alt={top3[1].username} className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-[6px] border-slate-300 object-cover bg-slate-800" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white text-center break-all line-clamp-1">{top3[1].username.split('.')[0]}</h2>
              <div className="mt-3 bg-white/5 rounded-2xl px-4 py-3 text-center border border-white/10 w-full">
                <p className="text-3xl lg:text-4xl font-black text-slate-300">{top3[1].total_pontos}</p>
                <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">Pontos</p>
              </div>
            </div>
          )}

          {/* Primeiro Lugar (Ouro) */}
          {top3[0] && (
            <div className="flex flex-col items-center justify-end w-1/3 z-10">
              <div className="relative mb-6">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#051020] font-black px-5 py-2 rounded-full text-3xl z-20 shadow-xl border-4 border-[#051020]">
                  1º
                </div>
                <img src={getAvatarUrl(top3[0].username)} alt={top3[0].username} className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-[8px] border-yellow-500 object-cover bg-slate-800" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 text-center break-all line-clamp-1">{top3[0].username.split('.')[0]}</h2>
              <div className="mt-4 bg-gradient-to-b from-yellow-500/20 to-transparent rounded-3xl px-6 py-5 text-center border border-yellow-500/30 w-full">
                <p className="text-5xl lg:text-6xl font-black text-yellow-400">{top3[0].total_pontos}</p>
                <p className="text-sm lg:text-base text-yellow-500/80 uppercase tracking-widest font-bold mt-2">Pontos</p>
              </div>
            </div>
          )}

          {/* Terceiro Lugar (Bronze) */}
          {top3[2] && (
            <div className="flex flex-col items-center justify-end w-1/3 mb-4">
              <div className="relative mb-4">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black px-4 py-1 rounded-full text-xl z-20 shadow-lg border-4 border-[#051020]">
                  3º
                </div>
                <img src={getAvatarUrl(top3[2].username)} alt={top3[2].username} className="w-28 h-28 lg:w-36 lg:h-36 rounded-full border-[6px] border-amber-700 object-cover bg-slate-800" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center break-all line-clamp-1">{top3[2].username.split('.')[0]}</h2>
              <div className="mt-3 bg-white/5 rounded-2xl px-4 py-3 text-center border border-white/10 w-full">
                <p className="text-2xl lg:text-3xl font-black text-amber-600">{top3[2].total_pontos}</p>
                <p className="text-xs lg:text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">Pontos</p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* =========================================
          COLUNA DIREITA: O PELOTÃO (55%)
      ========================================= */}
      <section className="w-[55%] h-full relative z-10 flex flex-col bg-slate-900/40 border border-white/5 rounded-[40px] p-8">
        
        {/* Cabeçalho da Tabela */}
        <div className="flex items-center text-slate-400 text-sm lg:text-base font-bold uppercase tracking-widest pb-4 border-b border-white/5 mb-6 px-6">
          <div className="w-20 text-center">Pos</div>
          <div className="flex-1">Usuário</div>
          <div className="w-32 text-center" title="Quantidade de placares exatos">Cravadas</div>
          <div className="w-32 text-right">Pontos</div>
        </div>

        {/* Linhas Estáticas (Muito performático) */}
        <div className="flex-1 flex flex-col justify-between">
          {others.map((item) => (
            <div key={item.username} className="flex items-center bg-white/[0.02] border border-white/[0.05] rounded-3xl p-3 px-6 transition-colors">
              <div className="w-20 text-center text-3xl font-black text-slate-600">
                {item.posicao}º
              </div>
              <div className="flex-1 flex items-center gap-6">
                <img src={getAvatarUrl(item.username)} className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-white/10 bg-slate-800" alt="" />
                <span className="text-3xl font-bold text-slate-200">{item.username}</span>
              </div>
              <div className="w-32 flex items-center justify-center gap-3">
                <span className="text-3xl font-bold text-slate-400">{item.cravadas}</span>
                <Trophy className="w-6 h-6 text-emerald-500 opacity-60" />
              </div>
              <div className="w-32 text-right text-4xl font-black text-emerald-400">
                {item.total_pontos}
              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
}
