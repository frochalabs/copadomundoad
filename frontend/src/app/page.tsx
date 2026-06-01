"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, ArrowRight, Trophy, CheckCircle2 } from "lucide-react";
import { Palpite, fetchUserPalpites } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { motion } from "framer-motion";

export default function Home() {
  const [username, setUsername] = useState("");
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<string | null>(null);

  const executeSearch = async (targetUser: string) => {
    if (!targetUser.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchedUser(null);
    setPalpites([]);

    try {
      const data = await fetchUserPalpites(targetUser);
      setPalpites(data.palpites);
      setSearchedUser(data.username);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao buscar palpites");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(username);
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#051020]">
      {/* Dynamic Background (Gradient Mesh) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500 rounded-full blur-[120px] opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-yellow-500 rounded-full blur-[120px] opacity-[0.12] pointer-events-none translate-x-1/3"></div>

      <div className="relative z-10 w-full p-6 md:p-12 max-w-6xl mx-auto flex flex-col items-center">
        {/* Header Section with Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full text-center mb-12 mt-8 md:mt-16 flex flex-col items-center gap-8"
        >
          {/* Logo AD Promotora */}
          <div className="relative flex items-center justify-center mb-2">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.20)_0%,transparent_70%)] rounded-full scale-150"></div>
            <img
              src="https://adpromotora.com.br/src/img/logos/AD.png"
              alt="AD Promotora"
              className="relative z-10 h-16 md:h-20 object-contain brightness-0 invert opacity-75 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] transition-all hover:opacity-100"
            />
          </div>

          {/* Tag Glassmorphism */}
          <div className="bg-white/[0.05] border border-white/10 backdrop-blur-[10px] rounded-full px-5 py-2 inline-flex items-center justify-center">
            <span className="text-[0.75rem] text-slate-100 font-semibold uppercase tracking-[0.15em]">
              Evento Exclusivo
            </span>
          </div>

          {/* Title and Subtitle Container */}
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24]">
              VAMOS BRASIL
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Consulte seus palpites e acompanhe sua pontuação no bolão.
            </p>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-2xl mx-auto pt-6 flex flex-col gap-2">
            <label className="text-left text-sm font-semibold text-slate-300 flex items-center gap-2 ml-1">
              <Search className="h-4 w-4 text-[#10B981]" /> Buscar por usuário:
            </label>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full">
              {/* search-container */}
              <div className="relative flex-1 flex items-center bg-white/10 rounded-[5px] p-[10px] border border-white/5 focus-within:border-[#10B981]/50 transition-colors">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: fabiano.sales"
                  className="border-none bg-transparent text-white p-[5px] pl-2 w-full outline-none placeholder-slate-400 text-lg"
                />
              </div>

              {/* buttons */}
              <div className="flex gap-2 shrink-0">
                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#047857] text-white border-none rounded-[5px] px-[24px] py-[10px] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed font-bold text-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('fabiano.sales'); executeSearch('fabiano.sales'); }}
                  className="flex items-center justify-center px-[16px] py-[10px] rounded-[5px] bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/10"
                >
                  Meus palpites
                </button>
              </div>
            </form>
            <p className="text-left text-xs text-slate-500 ml-1">
              &gt; Exemplo de busca alternativa: joaosilva, maria123
            </p>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="w-full">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-green-400">
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
              <p className="font-medium animate-pulse uppercase tracking-widest text-sm">Carregando dados...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
              <div className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">Ops! Alguma coisa deu errado.</h3>
              <p className="text-slate-400">{error}</p>
            </div>
          )}

          {!isLoading && !error && searchedUser && palpites.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Nenhum palpite encontrado</h3>
              <p className="text-slate-500">O usuário <strong className="text-white">{searchedUser}</strong> não registrou nenhum palpite ainda.</p>
            </div>
          )}

          {!isLoading && !error && palpites.length > 0 && (
            <div className="space-y-8 mt-4">

              {/* Resumo do Usuário */}
              <div className="flex flex-col gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-[#10B981] to-[#047857] rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg border border-white/10 shrink-0 text-white">
                      {searchedUser?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <h2 className="text-xs sm:text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Resultados para:</h2>
                      <p className="text-xl sm:text-2xl font-bold text-white break-all">{searchedUser}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col text-left">
                    <span className="text-sm text-slate-400 mb-2 flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-500" /> Pontuação atual</span>
                    <span className="text-3xl sm:text-4xl font-black text-white">0 <span className="text-base sm:text-lg font-medium text-slate-500">pts</span></span>
                    <span className="text-xs text-slate-500 mt-2 font-medium">Máximo possível: {palpites.length * 5} pts</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 flex flex-col text-left">
                    <span className="text-sm text-slate-400 mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Acertos possíveis</span>
                    <span className="text-3xl sm:text-4xl font-black text-white">0 <span className="text-base sm:text-lg font-medium text-slate-500">/ {palpites.length}</span></span>
                    <span className="text-xs text-slate-500 mt-2 font-medium">Total de jogos no bolão</span>
                  </div>
                </div>
              </div>

              {/* ALERTA DE INÍCIO */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-4 text-blue-300 text-sm sm:text-base text-left font-medium">
                <span className="text-2xl">⚽</span>
                Nenhum jogo iniciado ainda. Volte após o primeiro jogo para ver a pontuação real.
              </div>

              <div className="text-left w-full mt-8">
                <h3 className="text-xl font-bold text-white mb-6">Seus palpites:</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {palpites.map((palpite, index) => (
                  <MatchCard key={palpite.jogo_id} palpite={palpite} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
