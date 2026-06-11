"use client";

import { useEffect, useState } from "react";
import { Trophy, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Medal } from "lucide-react";
import { RankingItem, fetchRanking } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Avatar component with fallback
function UserAvatar({ username, sizeClass }: { username: string, sizeClass: string }) {
  const [imageError, setImageError] = useState(false);
  
  const baseUrl = "https://res.cloudinary.com/dhj0lwxgq/image/upload/";
  const transformations = "w_300,h_300,c_scale,f_auto,q_auto/";
  const avatarUrl = `${baseUrl}${transformations}${encodeURIComponent(
    username.trim().toLowerCase().replace(/\s+/g, ".")
  )}.jpg`;

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center`}>
      {!imageError ? (
        <img 
          src={avatarUrl} 
          alt={username} 
          className="h-full w-full object-cover" 
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-black text-slate-400 uppercase text-opacity-80" style={{ fontSize: '150%' }}>
          {username.charAt(0)}
        </span>
      )}
    </div>
  );
}

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

        {/* PÓDIO */}
        {showPodium && (
          <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 mb-16 mt-12">
            {/* 2º LUGAR */}
            {top3[1] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-full sm:w-1/3 order-2 sm:order-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push(`/user/${encodeURIComponent(top3[1].username)}`)}>
                <div className="relative mb-3">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-black px-3 py-0.5 rounded-full text-xs z-20 shadow-lg border-2 border-[#051020]">2º</div>
                  <UserAvatar username={top3[1].username} sizeClass="w-20 h-20 sm:w-24 sm:h-24 border-[3px] border-slate-300/80" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white text-center line-clamp-1">{top3[1].username.split('.')[0]}</h2>
                <div className="flex flex-col items-center mt-1">
                  <p className="text-xl font-black text-slate-300">{top3[1].total_pontos} <span className="text-xs font-medium text-slate-400">pts</span></p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Medal className="w-3 h-3" /> {top3[1].cravadas} cravadas</p>
                </div>
              </motion.div>
            )}

            {/* 1º LUGAR */}
            {top3[0] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center w-full sm:w-1/3 order-1 sm:order-2 mb-6 sm:mb-8 cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push(`/user/${encodeURIComponent(top3[0].username)}`)}>
                <div className="relative mb-4">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-950 font-black px-4 py-0.5 rounded-full text-sm z-20 shadow-xl border-2 border-[#051020]">1º</div>
                  <UserAvatar username={top3[0].username} sizeClass="w-28 h-28 sm:w-32 sm:h-32 border-[4px] border-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.2)]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 text-center line-clamp-1">{top3[0].username.split('.')[0]}</h2>
                <div className="flex flex-col items-center mt-1">
                  <p className="text-3xl font-black text-yellow-400">{top3[0].total_pontos} <span className="text-sm font-medium text-yellow-500/70">pts</span></p>
                  <p className="text-xs text-yellow-500/60 flex items-center gap-1 mt-1"><Medal className="w-3 h-3" /> {top3[0].cravadas} cravadas</p>
                </div>
              </motion.div>
            )}

            {/* 3º LUGAR */}
            {top3[2] && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center w-full sm:w-1/3 order-3 cursor-pointer hover:scale-105 transition-transform" onClick={() => router.push(`/user/${encodeURIComponent(top3[2].username)}`)}>
                <div className="relative mb-3">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-950 font-black px-3 py-0.5 rounded-full text-xs z-20 shadow-lg border-2 border-[#051020]">3º</div>
                  <UserAvatar username={top3[2].username} sizeClass="w-20 h-20 border-[3px] border-orange-400/80" />
                </div>
                <h2 className="text-base font-bold text-white text-center line-clamp-1">{top3[2].username.split('.')[0]}</h2>
                <div className="flex flex-col items-center mt-1">
                  <p className="text-xl font-black text-orange-400">{top3[2].total_pontos} <span className="text-xs font-medium text-orange-500/70">pts</span></p>
                  <p className="text-xs text-orange-500/60 flex items-center gap-1 mt-0.5"><Medal className="w-3 h-3" /> {top3[2].cravadas} cravadas</p>
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
              
              <UserAvatar username={item.username} sizeClass="w-12 h-12" />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-200 text-lg truncate group-hover:text-[#10B981] transition-colors">{item.username}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                  <Medal className="w-3 h-3" /> {item.cravadas} cravadas
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
