"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Palpite, fetchUserPalpites } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { motion } from "framer-motion";

export default function Home() {
  const [username, setUsername] = useState("");
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchedUser(null);
    setPalpites([]);

    try {
      const data = await fetchUserPalpites(username);
      setPalpites(data.palpites);
      setSearchedUser(data.username);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao buscar palpites");
    } finally {
      setIsLoading(false);
    }
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
          className="w-full text-center space-y-6 mb-12 mt-8 md:mt-16 flex flex-col items-center"
        >
          {/* Corporate Badge */}
          <div className="animate-pulse bg-[#79f7fa]/10 border border-[#79f7fa]/30 rounded-full px-5 py-1.5 inline-flex items-center justify-center">
            <span className="text-[10px] md:text-xs text-[#79f7fa] font-bold uppercase tracking-[0.25em]">
              Evento Exclusivo • AD Promotora
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-green-500 drop-shadow-[0_4px_15px_rgba(74,222,128,0.25)]">
            VAMOS BRASIL
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Consulte seus palpites e acompanhe sua pontuação no bolão.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto pt-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu username..."
                className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#79f7fa]/50 focus:border-[#79f7fa]/50 transition-all text-lg shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="flex items-center justify-center gap-3 py-4 px-8 rounded-xl text-base bg-[#79f7fa] text-[#051020] font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shadow-[0_0_15px_rgba(121,247,250,0.3)] hover:shadow-[0_0_25px_rgba(121,247,250,0.5)] shrink-0"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <>
                  Buscar <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Main Content Area */}
        <div className="w-full">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-[#79f7fa]">
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
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-semibold text-slate-200">
                  Palpites de <span className="text-[#79f7fa]">{searchedUser}</span>
                </h2>
                <div className="text-sm text-slate-500 font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  {palpites.length} jogos
                </div>
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
