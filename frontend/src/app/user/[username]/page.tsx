"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, ArrowLeft, Trophy, CheckCircle2, ChevronDown, CalendarDays, ArrowDown, Info } from "lucide-react";
import { Palpite, PalpiteExtra, fetchUserPalpites, fetchUserPalpitesGrupos } from "@/lib/api";
import { MatchCard } from "@/components/MatchCard";
import { BracketMatchCard } from "@/components/BracketMatchCard";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { UserAvatar } from "@/components/UserAvatar";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const username = decodeURIComponent(params.username as string);

  const [palpites, setPalpites] = useState<Palpite[]>([]);
  const [palpitesExtras, setPalpitesExtras] = useState<PalpiteExtra[]>([]);
  const [activeTab, setActiveTab] = useState<"jogos" | "bonus">("jogos");
  const [posicao, setPosicao] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const MATA_MATA_PHASES = [
    { id: 'LAST_32', label: '16-Avos de Final', count: 16 },
    { id: 'LAST_16', label: 'Oitavas de Final', count: 8 },
    { id: 'QUARTER_FINALS', label: 'Quartas de Final', count: 4 },
    { id: 'SEMI_FINALS', label: 'Semifinais', count: 2 },
    { id: 'FINAL', label: 'Final', count: 1 }
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const [teamSearch, setTeamSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedFase, setSelectedFase] = useState<"mata-mata" | "grupos">("mata-mata");
  const itemsPerPage = 24;

  useEffect(() => {
    const loadPalpites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = selectedFase === "mata-mata" 
          ? await fetchUserPalpites(username) 
          : await fetchUserPalpitesGrupos(username);
        setPalpites(data.palpites);
        setPalpitesExtras(data.palpitesExtras || []);
        setPosicao(data.posicao ?? null);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar palpites.");
        setPalpites([]);
        setPalpitesExtras([]);
        setPosicao(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadPalpites();
  }, [username, selectedFase]);

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
  let basePalpites = palpites;

  // No round filtering needed for Mata-Mata

  // Filtrar por busca
  let filteredPalpites = basePalpites.filter(p => {
    if (!teamSearch.trim()) return true;
    const term = teamSearch.toLowerCase();
    return p.time_a.toLowerCase().includes(term) || p.time_b.toLowerCase().includes(term);
  });

  // Ordenar
  if (sortOrder === "desc") {
    filteredPalpites = [...filteredPalpites].reverse();
  }

  const totalPages = Math.ceil(filteredPalpites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPalpites = filteredPalpites.slice(startIndex, startIndex + itemsPerPage);

  const totalPontosJogos = palpites.reduce((acc: number, p: Palpite) => acc + (p.pontos_ganhos || 0), 0);
  const totalPontosBonus = palpitesExtras.reduce((acc: number, p: PalpiteExtra) => acc + (p.pontos_ganhos || 0), 0);
  const totalPontos = totalPontosJogos + totalPontosBonus;
  
  const acertosJogos = palpites.filter((p: Palpite) => (p.pontos_ganhos || 0) > 0).length;

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
              <UserAvatar username={username} className="h-20 w-20 sm:h-24 sm:w-24 text-3xl sm:text-4xl border-4 border-white/10 shadow-xl" />
              <div className="text-left">
                <h2 className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Palpites de:</h2>
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{username}</p>
                {posicao !== null && (
                  <div className="mt-3 flex items-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs sm:text-sm font-bold tracking-wide ${
                      posicao === 1 
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]' 
                        : posicao === 2 
                        ? 'bg-slate-300/10 text-slate-300 border-slate-300/20'
                        : posicao === 3
                        ? 'bg-orange-400/10 text-orange-400 border-orange-400/20'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}>
                      <Trophy className="w-3.5 h-3.5" />
                      {posicao}º no Ranking Geral
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col">
              <span className="text-sm text-slate-400 mb-2 flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Pontuação atual</span>
              <span className="text-4xl sm:text-5xl font-black text-white">{totalPontos} <span className="text-lg sm:text-xl font-medium text-slate-500">pts</span></span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Máximo possível: {palpites.length * 5} pts</span>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col">
              <span className="text-sm text-slate-400 mb-2 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#10B981]" /> Acertos (Jogos)</span>
              <span className="text-4xl sm:text-5xl font-black text-white">{acertosJogos} <span className="text-lg sm:text-xl font-medium text-slate-500">/ {palpites.length}</span></span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Bônus: {palpitesExtras.filter(p => (p.pontos_ganhos || 0) > 0).length} acertos</span>
            </div>
          </div>
        </motion.div>


        <div className="flex flex-col sm:flex-row gap-4 mt-12 mb-8 border-b border-white/10 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("jogos")}
              className={`text-lg font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-xl cursor-pointer select-none focus:outline-none [-webkit-tap-highlight-color:transparent] ${
                activeTab === "jogos"
                  ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                  : "border border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Jogos
            </button>
            {/* 
            <button
              onClick={() => setActiveTab("bonus")}
              className={`text-lg font-bold uppercase tracking-wider transition-all px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer select-none focus:outline-none [-webkit-tap-highlight-color:transparent] ${
                activeTab === "bonus"
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  : "border border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Perguntas Bônus
              {palpitesExtras.length > 0 && (
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full">{palpitesExtras.length}</span>
              )}
            </button>
            */}
          </div>
          
          <div className="flex gap-2 sm:ml-auto">
            <button
              onClick={() => setSelectedFase("mata-mata")}
              className={`text-sm font-bold uppercase tracking-wider transition-all px-3 py-1.5 rounded-lg border ${
                selectedFase === "mata-mata"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-transparent border-slate-700/50 text-slate-500 hover:text-slate-300"
              }`}
            >
              Mata-Mata
            </button>
            <button
              onClick={() => setSelectedFase("grupos")}
              className={`text-sm font-bold uppercase tracking-wider transition-all px-3 py-1.5 rounded-lg border ${
                selectedFase === "grupos"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-transparent border-slate-700/50 text-slate-500 hover:text-slate-300"
              }`}
            >
              Fase de Grupos
            </button>
          </div>
        </div>

        {activeTab === "jogos" && (
          <>
            {/* Busca e Lista */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-8 gap-4">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">
                Palpites {selectedFase === 'mata-mata' ? 'do Mata-Mata' : 'da Fase de Grupos'}
              </h3>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">


                {/* Ordenação */}
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    setCurrentPage(1);
                  }}
                  className="flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] border border-slate-700/50 hover:border-slate-600 focus:border-[#10B981] text-white text-sm font-medium rounded-xl px-5 py-3 transition-all whitespace-nowrap shadow-sm group w-full sm:w-auto"
                >
                  <ArrowDown className={`w-4 h-4 text-slate-400 group-hover:text-[#10B981] transition-all duration-300 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                  {sortOrder === "asc" ? "Mais Próximos" : "Mais Distantes"}
                </button>

                {/* Busca */}
                <div className="relative flex items-center bg-[#0f172a] rounded-xl border border-slate-700/50 hover:border-slate-600 px-4 py-3 focus-within:border-[#10B981] focus-within:bg-[#1e293b] w-full sm:w-64 transition-all shadow-sm">
                  <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Pesquisar seleção..."
                    value={teamSearch}
                    onChange={(e) => {
                      setTeamSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent border-none text-white text-sm outline-none w-full placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {filteredPalpites.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center text-center py-16 px-4 bg-white/[0.02] rounded-3xl border border-white/5">
                <AlertCircle className="w-12 h-12 text-slate-500 mb-4 opacity-50" />
                <h4 className="text-lg font-bold text-slate-300 mb-2">Nada encontrado</h4>
                <p className="text-slate-500 max-w-md">
                  {teamSearch.trim() 
                    ? `Não encontramos nenhum jogo para a seleção "${teamSearch}". Verifique se o nome está correto.`
                    : selectedFase === 'mata-mata' 
                      ? "Ainda não existem palpites registrados para o mata-mata."
                      : "Ainda não existem palpites registrados para esta rodada específica."}
                </p>
              </div>
            ) : selectedFase === 'mata-mata' ? (
              <div className="flex flex-col gap-16 w-full mt-4">
                {MATA_MATA_PHASES.map((phase) => {
                  // Pega todos os palpites daquela fase ignorando paginação
                  const phasePalpites = filteredPalpites.filter(p => p.fase === phase.id);
                  
                  // Se não houver nenhum jogo programado e nem palpites, e for a primeira renderização
                  // podemos preencher com slots vazios para simular as brackets
                  const slots = Array.from({ length: phase.count }).map((_, i) => {
                    return phasePalpites[i] || {
                      jogo_id: -10000 - (phase.count * 100) - i, // fake unique id
                      time_a: 'A Definir',
                      time_b: 'A Definir',
                      palpite_a: null,
                      palpite_b: null,
                      pontos_ganhos: null,
                      data_jogo: 'Em breve',
                      status: 'SCHEDULED',
                      fase: phase.id,
                      bandeira_a: '',
                      bandeira_b: ''
                    };
                  });

                  return (
                    <div key={phase.id} className="flex flex-col gap-6">
                      {/* Título da fase */}
                      <div className="flex items-center gap-4 px-2">
                        <h4 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24] uppercase tracking-widest drop-shadow-md">
                          {phase.label}
                        </h4>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#10B981]/50 to-transparent"></div>
                      </div>

                      {/* Grade de Jogos */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 relative">
                        {slots.map((palpite, idx) => (
                          <div key={palpite.jogo_id} className="relative">
                            <BracketMatchCard palpite={palpite as any} index={idx} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPalpites.map((palpite, index) => (
                  <MatchCard key={palpite.jogo_id} palpite={palpite} index={startIndex + index} />
                ))}
              </div>
            )}

            {selectedFase !== 'mata-mata' && totalPages > 1 && (
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
          </>
        )}

        {activeTab === "bonus" && (
          <div className="w-full">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6">Suas Respostas Bônus</h3>
            {palpitesExtras.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center text-center py-16 px-4 bg-white/[0.02] rounded-3xl border border-white/5">
                <Trophy className="w-12 h-12 text-yellow-500/50 mb-4" />
                <h4 className="text-lg font-bold text-slate-300 mb-2">Nenhuma resposta bônus</h4>
                <p className="text-slate-500 max-w-md">
                  Este usuário ainda não respondeu nenhuma pergunta extra do bolão.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {palpitesExtras.map((extra) => (
                  <div key={extra.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        Vale {extra.pontos_valendo} pontos
                      </span>
                      {extra.processada && (
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                          (extra.pontos_ganhos || 0) > 0 
                            ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {(extra.pontos_ganhos || 0) > 0 ? `+${extra.pontos_ganhos} Pontos` : "0 Pontos"}
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed">
                      {extra.descricao}
                    </h4>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Resposta escolhida:</span>
                        <span className="font-bold text-white px-3 py-1 bg-white/10 rounded-lg">{extra.resposta_escolhida}</span>
                      </div>
                      
                      {extra.processada && extra.resposta_correta && (
                        <div className="flex items-center justify-between text-sm mt-2 pt-3 border-t border-white/5">
                          <span className="text-slate-400">Resposta Oficial:</span>
                          <span className="font-bold text-yellow-400">{extra.resposta_correta}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Info FAB */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <div className="bg-[#10B981] text-black p-3.5 rounded-full shadow-lg cursor-help shadow-[#10B981]/20 hover:scale-110 transition-transform flex items-center justify-center border border-[#10B981]/50 relative">
          <Info className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </div>
        <div className="absolute bottom-full right-0 mb-4 w-72 bg-[#051020] border border-[#10B981]/30 rounded-2xl p-5 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none scale-95 group-hover:scale-100 origin-bottom-right backdrop-blur-xl">
          <h4 className="text-white font-black mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Atenção às Regras
          </h4>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Todos os palpites consideram apenas o resultado do <strong>tempo regulamentar (90 min + acréscimos)</strong>.
            Gols na prorrogação e decisões por pênaltis <span className="text-red-400 font-bold">não contam</span> para o placar final do bolão!
          </p>
        </div>
      </div>
    </main>
  );
}
