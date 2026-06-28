"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, ArrowRight, Trophy, Crown } from "lucide-react";
import { fetchUserPalpites, fetchTrendingGames, fetchContrarianBets, fetchPerguntasExtrasStats, fetchRankingGrupos, TrendingGame, ContrarianBet, PerguntaExtraStats, RankingItem } from "@/lib/api";
import { TrendingGames } from "@/components/TrendingGames";
import { WinnersDashboard } from "@/components/WinnersDashboard";
import { ContrarianBets } from "@/components/ContrarianBets";
import { BonusQuestionsStats } from "@/components/BonusQuestionsStats";
import { UserAvatar } from "@/components/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

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
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trendingGames, setTrendingGames] = useState<TrendingGame[]>([]);
  const [contrarianBets, setContrarianBets] = useState<ContrarianBet[]>([]);
  const [bonusStats, setBonusStats] = useState<PerguntaExtraStats[]>([]);
  const [topUsers, setTopUsers] = useState<RankingItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

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
        const [gamesRes, betsRes, bonusRes, rankingRes] = await Promise.all([
          fetchTrendingGames(),
          fetchContrarianBets(),
          fetchPerguntasExtrasStats(),
          fetchRankingGrupos(),
          new Promise(r => setTimeout(r, 1500)) // Garante pelo menos 1.5s de tela de loading
        ]);
        setTrendingGames(gamesRes.trendingGames);
        setContrarianBets(betsRes.contrarianBets);
        setBonusStats(bonusRes.perguntasExtrasStats);
        setTopUsers(rankingRes.ranking.slice(0, 5));
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Efeito de Confete ao carregar os vencedores
  useEffect(() => {
    if (!statsLoading && topUsers.length > 0) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#FBBF24', '#10B981', '#FFFFFF']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#FBBF24', '#10B981', '#FFFFFF']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      // Delay it slightly for the animation of the page to settle
      setTimeout(() => requestAnimationFrame(frame), 500);
    }
  }, [statsLoading, topUsers.length]);

  const executeSearch = async (targetUser: string) => {
    if (!targetUser.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Faz uma busca para validar se o usuário existe.
      // Se não existir, a própria API vai jogar um erro 404 caindo no CATCH.
      await fetchUserPalpites(targetUser);

      // Se passou direto, o usuário existe! Vai para a página dele.
      router.push(`/user/${encodeURIComponent(targetUser.trim().toLowerCase())}`);
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

      <div className="relative z-10 w-full p-6 md:p-12 max-w-6xl mx-auto flex flex-col items-center pb-24">
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
              Consulte seus palpites e acompanhe o panorama da Copa do Mundo.
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
                  placeholder="ex: joao.silva"
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
                <button
                  type="button"
                  onClick={() => router.push('/ranking')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 text-slate-300 border border-white/10 rounded-[5px] px-[24px] py-[10px] cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:bg-white/10 hover:border-yellow-500/50 hover:text-white font-bold text-base"
                >
                  <Trophy className="w-5 h-5 text-yellow-500" /> Ranking
                </button>
              </div>
            </form>

            {/* Error Message na Busca */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-left bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-left"
            >
              <div className="bg-purple-500/20 p-2 rounded-full shrink-0">
                <Trophy className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-purple-200 mb-1">O MATA-MATA COMEÇOU!</span>
                <p className="text-purple-300/80 mb-2">
                  A fase de grupos acabou, mas a emoção continua. Preencha seus palpites para a próxima fase!
                </p>
                <a
                  href="https://forms.gle/ekP3j6fEA1aWSTzq5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#10B981] hover:text-[#34d399] font-semibold transition-colors w-fit"
                >
                  Fazer Palpites do Mata-mata <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Section: Vencedores da Fase de Grupos */}
        <WinnersDashboard topUsers={topUsers} />

        {/* Stats Section - Visible always */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full mt-16 space-y-12"
        >
          {trendingGames.length > 0 && <TrendingGames games={trendingGames} />}
          {/* {bonusStats.length > 0 && <BonusQuestionsStats stats={bonusStats} />} */}
          {contrarianBets.length > 0 && <ContrarianBets bets={contrarianBets} />}
        </motion.div>

      </div>
    </main>
  );
}
