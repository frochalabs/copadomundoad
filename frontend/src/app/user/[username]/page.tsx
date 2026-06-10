"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, ArrowLeft, Trophy, CheckCircle2 } from "lucide-react";
import { Palpite, fetchUserPalpites } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const username = decodeURIComponent(params.username as string);

  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [teamSearch, setTeamSearch] = useState("");
  const itemsPerPage = 24;

  const baseUrl = "https://res.cloudinary.com/dhj0lwxgq/image/upload/";
  const transformations = "w_200,h_200,c_scale,f_auto,q_auto/";
  const avatarUrl = `${baseUrl}${transformations}${encodeURIComponent(
    username.replace(/\s+/g, ".")
  )}.jpg`;

  useEffect(() => {
    const loadPalpites = async () => {
      try {
        const data = await fetchUserPalpites(username);
        setPalpites(data.palpites);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar palpites.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPalpites();
  }, [username]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#051020] flex flex-col items-center justify-center p-6 text-[#10B981]">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="font-medium animate-pulse uppercase tracking-widest text-sm">Carregando palpites de {username}...</p>
      </main>
    );
  }

  if (error || palpites.length === 0) {
    return (
      <main className="min-h-screen bg-[#051020] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">Ops! Alguma coisa deu errado.</h3>
        <p className="text-slate-400 mb-8">{error || "Nenhum palpite encontrado para esse usuário."}</p>
        <button 
          onClick={() => router.push("/home")} 
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o início
        </button>
      </main>
    );
  }

  // Lógica de Filtro e Paginação
  const filteredPalpites = palpites.filter(p => {
    if (!teamSearch.trim()) return true;
    const term = teamSearch.toLowerCase();
    return p.time_a.toLowerCase().includes(term) || p.time_b.toLowerCase().includes(term);
  });
  const totalPages = Math.ceil(filteredPalpites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPalpites = filteredPalpites.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="min-h-screen relative bg-[#051020] p-6 md:p-12 pb-24 overflow-hidden">
      {/* Fundo Decorativo Estático */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#10B981]/10 to-transparent pointer-events-none -z-10 blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Header de Navegação */}
        <button 
          onClick={() => router.push("/home")} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-medium w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Dashboard
        </button>

        {/* Resumo do Usuário */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-4 border-white/10 shadow-xl shrink-0 bg-slate-900">
                <img src={avatarUrl} alt={`Avatar de ${username}`} className="h-full w-full object-cover" />
              </div>
              <div className="text-left">
                <h2 className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Palpites de:</h2>
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{username}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col">
              <span className="text-sm text-slate-400 mb-2 flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Pontuação atual</span>
              <span className="text-4xl sm:text-5xl font-black text-white">0 <span className="text-lg sm:text-xl font-medium text-slate-500">pts</span></span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Máximo possível: {palpites.length * 5} pts</span>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col">
              <span className="text-sm text-slate-400 mb-2 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#10B981]" /> Acertos possíveis</span>
              <span className="text-4xl sm:text-5xl font-black text-white">0 <span className="text-lg sm:text-xl font-medium text-slate-500">/ {palpites.length}</span></span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Total de jogos no bolão</span>
            </div>
          </div>
        </motion.div>

        {/* ALERTA DE INÍCIO */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 text-blue-300 text-sm sm:text-base font-medium mt-6 shadow-inner"
        >
          <span className="text-3xl">⚽</span>
          Nenhum jogo iniciado ainda. Volte após o primeiro jogo para ver a pontuação real.
        </motion.div>

        {/* Busca e Lista */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mt-12 mb-8 gap-4">
          <h3 className="text-2xl font-black text-white uppercase tracking-wider">Todos os palpites</h3>
          
          <div className="relative flex items-center bg-white/5 rounded-xl border border-white/10 px-4 py-3 focus-within:border-[#10B981]/50 focus-within:bg-white/10 w-full sm:w-72 transition-all">
            <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar seleção..."
              value={teamSearch}
              onChange={(e) => {
                setTeamSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none text-white text-base outline-none w-full placeholder-slate-500"
            />
          </div>
        </div>

        {filteredPalpites.length === 0 ? (
          <div className="w-full text-center py-16 text-slate-400 bg-white/[0.02] rounded-3xl border border-white/5">
            Nenhum jogo encontrado com o termo "{teamSearch}"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPalpites.map((palpite, index) => (
              <MatchCard key={palpite.jogo_id} palpite={palpite} index={startIndex + index} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors shadow-sm"
            >
              Anterior
            </button>
            <span className="text-slate-400 text-sm font-bold min-w-[120px] text-center bg-slate-900/50 py-2 rounded-lg border border-white/5">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors shadow-sm"
            >
              Próxima
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
