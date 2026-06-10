"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, ArrowRight, Trophy, CheckCircle2 } from "lucide-react";
import { Palpite, fetchUserPalpites, fetchTrendingGames, fetchContrarianBets, TrendingGame, ContrarianBet } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { TrendingGames } from "@/components/TrendingGames";
import { ContrarianBets } from "@/components/ContrarianBets";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_PHRASES = [
  "Aquecendo os jogadores...",
  "Calculando a probabilidade de zebras...",
  "Limpando as chuteiras...",
  "Consultando o VAR...",
  "Desenhando a linha do impedimento...",
  "Buscando as estatísticas do campeonato...",
  "Preparando o gramado...",
  "Ouvindo as reclamações dos técnicos...",
  "Calculando os acréscimos...",
  "Ajeitando a barreira...",
  "Analisando táticas...",
  "Convocando os craques..."
];

export default function Home() {
  const [username, setUsername] = useState("");
  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedUser, setSearchedUser] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [teamSearch, setTeamSearch] = useState("");
  const itemsPerPage = 24;

  const [trendingGames, setTrendingGames] = useState<TrendingGame[]>([]);
  const [contrarianBets, setContrarianBets] = useState<ContrarianBet[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const baseUrl = "https://res.cloudinary.com/dhj0lwxgq/image/upload/";
  const transformations = "w_200,h_200,c_scale,f_auto,q_auto/";
  const avatarUrl = searchedUser
    ? `${baseUrl}${transformations}${encodeURIComponent(
        searchedUser.trim().toLowerCase().replace(/\s+/g, ".")
      )}.jpg`
    : null;

  // Efeito para ciclar as frases divertidas de carregamento
  useEffect(() => {
    let phraseInterval: NodeJS.Timeout;
    if (statsLoading) {
      phraseInterval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 1500); // Muda a frase a cada 1.5s para dar uma sensação frenética/dinâmica
    }
    return () => clearInterval(phraseInterval);
  }, [statsLoading]);

  // Carrega as estatísticas ao montar o componente
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [gamesRes, betsRes] = await Promise.all([
          fetchTrendingGames(),
          fetchContrarianBets()
        ]);
        setTrendingGames(gamesRes.trendingGames);
        setContrarianBets(betsRes.contrarianBets);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  const executeSearch = async (targetUser: string) => {
    if (!targetUser.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchedUser(null);
    setPalpites([]);
    setCurrentPage(1);
    setTeamSearch("");

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

  if (statsLoading) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-[#051020] flex flex-col items-center justify-center p-6">
        {/* Fundo do loading (Mesh estático e leve) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#10B981] rounded-full blur-[150px] opacity-10 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#FBBF24] rounded-full blur-[150px] opacity-[0.05] pointer-events-none translate-x-1/3 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full gap-8">
          
          {/* Animação Circular Central (Bola de Futebol girando) */}
          <div className="relative flex items-center justify-center">
            {/* Círculo pontilhado de loading */}
            <div className="w-28 h-28 rounded-full border-[3px] border-dashed border-[#10B981] animate-[spin_4s_linear_infinite] opacity-60"></div>
            {/* Círculo interno */}
            <div className="absolute w-20 h-20 rounded-full border border-[#FBBF24] animate-[spin_2s_linear_infinite_reverse] opacity-30"></div>
            {/* Bola de Futebol */}
            <div className="absolute text-5xl drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              ⚽
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 min-h-[80px]">
            <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24] tracking-widest uppercase">
              Bolão da Copa AD
            </h2>
            <div className="h-6 relative w-full flex justify-center">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={loadingPhraseIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400 font-medium text-sm absolute text-center w-max"
                >
                  {LOADING_PHRASES[loadingPhraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#051020]">
      {/* Dynamic Background (Gradient Mesh) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-500 rounded-full blur-[120px] opacity-5 pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-yellow-500 rounded-full blur-[120px] opacity-[0.05] pointer-events-none translate-x-1/3"></div>

      <div className="relative z-10 w-full p-6 md:p-12 max-w-6xl mx-auto flex flex-col items-center">
        {/* Header Section with Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full text-center mb-12 mt-8 md:mt-16 flex flex-col items-center gap-8"
        >
          <div className="flex flex-col items-center gap-2">
            {/* Logo AD Promotora */}
            <div className="flex items-center justify-center">
              <img
                src="https://adpromotora.com.br/src/img/logos/AD.png"
                alt="AD Promotora"
                className="h-16 md:h-20 object-contain brightness-0 invert opacity-50 transition-all hover:opacity-80"
              />
            </div>

            {/* Subtitle / Tag */}
            <span className="text-[0.75rem] text-white/40 font-medium uppercase tracking-[0.2em]">
              Evento Exclusivo
            </span>
          </div>

          {/* Title and Subtitle Container */}
          <div className="flex flex-col items-center gap-2 sm:gap-4 mt-4 md:mt-8 px-2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24] text-center">
              VAMOS BRASIL
            </h1>
            <p className="text-slate-400 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto text-center">
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
                  className="border-none bg-transparent text-white p-[5px] pl-2 w-full outline-none placeholder-slate-400 text-lg sm:text-base"
                />
              </div>

              {/* buttons */}
              <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isLoading || !username.trim()}
                  className="w-full sm:w-auto flex items-center justify-center bg-gradient-to-br from-[#10B981] to-[#047857] text-white border-none rounded-[5px] px-[24px] py-[10px] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed font-bold text-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Buscar"}
                </button>
              </div>
            </form>
            {!searchedUser && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-left"
              >
                <div className="bg-blue-500/20 p-2 rounded-full shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-blue-200 mb-1">Ainda não enviou seus palpites?</span>
                  <p className="text-blue-300/80 mb-2">
                    Eles só aparecerão aqui após você preencher o formulário oficial.
                  </p>
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSf_kV497Aonbzxo0-SVJun97lO0CkqvZVSzVDxiTB8vjBCBJg/viewform?usp=dialog" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#10B981] hover:text-[#34d399] font-semibold transition-colors w-fit"
                  >
                    Acessar Formulário <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Section - Visible when no user is searched */}
        {!searchedUser && !statsLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full mt-16 space-y-12"
          >
            {trendingGames.length > 0 && <TrendingGames games={trendingGames} />}
            {contrarianBets.length > 0 && <ContrarianBets bets={contrarianBets} />}
          </motion.div>
        )}

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
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden border border-white/10 shadow-lg shrink-0 bg-slate-900">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={`Avatar de ${searchedUser}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white bg-slate-800">
                          {searchedUser?.charAt(0).toUpperCase()}
                        </div>
                      )}
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mt-8 mb-6 gap-4">
                <h3 className="text-xl font-bold text-white">Seus palpites:</h3>
                
                <div className="relative flex items-center bg-white/5 rounded-lg border border-white/10 px-3 py-2 focus-within:border-[#10B981]/50 w-full sm:w-64 transition-colors">
                  <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar por seleção..."
                    value={teamSearch}
                    onChange={(e) => {
                      setTeamSearch(e.target.value);
                      setCurrentPage(1); // Volta para a primeira página ao pesquisar
                    }}
                    className="bg-transparent border-none text-white text-sm outline-none w-full placeholder-slate-500"
                  />
                </div>
              </div>

              {(() => {
                // Filtra os palpites pelo nome da seleção (time A ou time B)
                const filteredPalpites = palpites.filter(p => {
                  if (!teamSearch.trim()) return true;
                  const term = teamSearch.toLowerCase();
                  return p.time_a.toLowerCase().includes(term) || p.time_b.toLowerCase().includes(term);
                });

                // Calcula os recortes de paginação
                const totalPages = Math.ceil(filteredPalpites.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const currentPalpites = filteredPalpites.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <>
                    {filteredPalpites.length === 0 ? (
                      <div className="w-full text-center py-12 text-slate-400 bg-white/[0.02] rounded-xl border border-white/5">
                        Nenhum palpite encontrado para "{teamSearch}"
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentPalpites.map((palpite, index) => (
                          <MatchCard key={palpite.jogo_id} palpite={palpite} index={startIndex + index} />
                        ))}
                      </div>
                    )}

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 sm:gap-4 mt-10">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                        >
                          Anterior
                        </button>
                        <span className="text-slate-400 text-sm font-medium min-w-[100px] text-center">
                          Página {currentPage} de {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                        >
                          Próxima
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
