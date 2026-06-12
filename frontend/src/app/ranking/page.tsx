"use client";

import { useEffect, useState } from "react";
import { Trophy, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Medal } from "lucide-react";
import { RankingItem, fetchRanking } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchRanking().then(data => {
      setRanking(data.ranking);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#051020] flex flex-col items-center justify-center p-6 text-[#10B981]">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="font-medium animate-pulse uppercase tracking-widest text-sm">Carregando ranking...</p>
      </main>
    );
  }

  const totalPages = Math.ceil(ranking.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = ranking.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // O Pódio só aparece na primeira página
  const showPodium = currentPage === 1 && ranking.length > 0;
  const top3 = ranking.slice(0, 3);

  // Se for primeira página, a lista normal mostra do 4º em diante. Senão, mostra todos da página.
  const listItems = showPodium ? currentItems.slice(3) : currentItems;

  return (
    <main className="min-h-screen relative bg-[#051020] p-6 md:p-12 pb-24 overflow-x-hidden">
      {/* Fundo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#10B981]/10 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      <div className="max-w-4xl mx-auto w-full relative z-10">

        {/* Header de Navegação */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24] flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Ranking Geral
          </h1>
        </div>

        {/* PÓDIO PREMIUM */}
        {showPodium && (
          <div className="flex flex-row items-end justify-center gap-2 sm:gap-4 mb-16 mt-20 px-2 h-auto">
            {/* 2º LUGAR */}
            {top3[1] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                onClick={() => router.push(`/user/${encodeURIComponent(top3[1].username)}`)}
                className="relative flex flex-col items-center w-[30%] sm:w-[28%] cursor-pointer group"
              >
                <div className="absolute -top-10 sm:-top-14 z-20">
                  <UserAvatar username={top3[1].username} className="w-16 h-16 sm:w-20 sm:h-20 text-3xl sm:text-4xl border-[3px] border-[#051020] shadow-[0_0_15px_rgba(148,163,184,0.3)] ring-2 ring-slate-300/50 group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="w-full bg-gradient-to-t from-slate-500/[0.05] to-slate-300/[0.1] border border-white/5 border-t-slate-400/50 rounded-t-xl sm:rounded-t-2xl pt-10 sm:pt-14 pb-4 sm:pb-6 flex flex-col items-center group-hover:bg-slate-300/[0.15] transition-colors relative overflow-hidden h-[160px] sm:h-[200px] justify-end">
                  <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-60"></div>
                  <span className="text-6xl sm:text-8xl font-black text-slate-300/[0.08] absolute bottom-0 -z-10 select-none">2</span>
                  <h2 className="text-xs sm:text-base font-bold text-slate-200 text-center line-clamp-1 mb-1">{top3[1].username.split('.')[0]}</h2>
                  <div className="bg-black/30 rounded-lg px-2 py-1 mb-1 border border-white/5 z-10">
                    <p className="text-sm sm:text-xl font-black text-slate-300">{top3[1].total_pontos} <span className="text-[10px] text-slate-500 font-medium">pts</span></p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 font-medium z-10"><Medal className="w-3 h-3" /> {top3[1].cravadas} <span className="hidden sm:inline">cravadas</span></p>
                </div>
              </motion.div>
            )}

            {/* 1º LUGAR */}
            {top3[0] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                onClick={() => router.push(`/user/${encodeURIComponent(top3[0].username)}`)}
                className="relative flex flex-col items-center w-[38%] sm:w-[35%] cursor-pointer group z-10"
              >
                <div className="absolute -top-20 sm:-top-28 z-30 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 sm:w-12 sm:h-12"><path d="m2 4 3 12h14l3-12-6 7-4-11-4 11z" /><path d="M3 21h18v-2H3v2z" /></svg>
                </div>
                <div className="absolute -top-14 sm:-top-20 z-20">
                  <UserAvatar username={top3[0].username} className="w-20 h-20 sm:w-28 sm:h-28 text-4xl sm:text-5xl border-[4px] border-[#051020] shadow-[0_0_20px_rgba(250,204,21,0.4)] ring-[3px] ring-yellow-400/80 group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="w-full bg-gradient-to-t from-yellow-500/[0.05] to-yellow-500/[0.2] border border-yellow-500/20 border-t-yellow-400 rounded-t-xl sm:rounded-t-2xl pt-12 sm:pt-16 pb-6 sm:pb-8 flex flex-col items-center group-hover:bg-yellow-500/[0.25] transition-colors shadow-[0_-5px_30px_rgba(250,204,21,0.15)] relative overflow-hidden h-[190px] sm:h-[240px] justify-end">
                  <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80"></div>
                  <span className="text-7xl sm:text-9xl font-black text-yellow-500/[0.12] absolute bottom-0 -z-10 select-none">1</span>
                  <h2 className="text-sm sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 text-center line-clamp-1 mb-1.5">{top3[0].username.split('.')[0]}</h2>
                  <div className="bg-black/40 rounded-xl px-3 sm:px-4 py-1.5 mb-1.5 border border-yellow-500/30 backdrop-blur-sm shadow-inner z-10">
                    <p className="text-lg sm:text-3xl font-black text-yellow-400">{top3[0].total_pontos} <span className="text-[10px] sm:text-xs text-yellow-500/60 font-bold">pts</span></p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-yellow-500/80 flex items-center gap-1 font-bold z-10"><Medal className="w-3 h-3 sm:w-4 sm:h-4" /> {top3[0].cravadas} <span className="hidden sm:inline">cravadas</span></p>
                </div>
              </motion.div>
            )}

            {/* 3º LUGAR */}
            {top3[2] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => router.push(`/user/${encodeURIComponent(top3[2].username)}`)}
                className="relative flex flex-col items-center w-[30%] sm:w-[28%] cursor-pointer group"
              >
                <div className="absolute -top-8 sm:-top-12 z-20">
                  <UserAvatar username={top3[2].username} className="w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl border-[3px] border-[#051020] shadow-[0_0_15px_rgba(251,146,60,0.2)] ring-2 ring-orange-400/50 group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="w-full bg-gradient-to-t from-orange-400/[0.03] to-orange-400/[0.08] border border-white/5 border-t-orange-400/50 rounded-t-xl sm:rounded-t-2xl pt-8 sm:pt-12 pb-4 sm:pb-5 flex flex-col items-center group-hover:bg-orange-400/[0.12] transition-colors relative overflow-hidden h-[140px] sm:h-[180px] justify-end">
                  <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60"></div>
                  <span className="text-6xl sm:text-8xl font-black text-orange-400/[0.08] absolute bottom-0 -z-10 select-none">3</span>
                  <h2 className="text-xs sm:text-base font-bold text-slate-200 text-center line-clamp-1 mb-1">{top3[2].username.split('.')[0]}</h2>
                  <div className="bg-black/30 rounded-lg px-2 py-1 mb-1 border border-white/5 z-10">
                    <p className="text-sm sm:text-lg font-black text-orange-400">{top3[2].total_pontos} <span className="text-[9px] text-orange-500/60 font-medium">pts</span></p>
                  </div>
                  <p className="text-[9px] sm:text-xs text-orange-400/70 flex items-center gap-1 font-medium z-10"><Medal className="w-3 h-3" /> {top3[2].cravadas} <span className="hidden sm:inline">cravadas</span></p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* LISTA DO RANKING */}
        <div className="flex flex-col gap-3">
          {listItems.map((item, index) => (
            <motion.div
              key={item.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => router.push(`/user/${encodeURIComponent(item.username)}`)}
              className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all cursor-pointer group"
            >
              <div className="w-10 text-center font-black text-xl text-slate-500 group-hover:text-white transition-colors">
                {item.posicao}º
              </div>

              <UserAvatar username={item.username} className="w-12 h-12 text-xl" />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-200 text-lg truncate group-hover:text-[#10B981] transition-colors">{item.username}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                  <Medal className="w-3 h-3" /> {item.cravadas > 1 ? item.cravadas + ' cravadas' : item.cravadas + ' cravada'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-white">{item.total_pontos}</span>
                <span className="text-xs text-slate-400 font-medium ml-1">pts</span>
              </div>
            </motion.div>
          ))}

          {ranking.length === 0 && !isLoading && (
            <div className="text-center p-12 bg-white/[0.02] rounded-3xl border border-white/5">
              <p className="text-slate-400 font-medium">Nenhum palpite foi processado ainda.</p>
            </div>
          )}
        </div>

        {/* PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded-xl border border-white/10 transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-slate-400 font-medium">
              Página <span className="text-white font-bold">{currentPage}</span> de {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded-xl border border-white/10 transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
