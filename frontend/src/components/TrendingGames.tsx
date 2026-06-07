"use client";

import { motion } from "framer-motion";
import { TrendingGame } from "@/lib/api";
import { Flame, BarChart3, Clock } from "lucide-react";

interface TrendingGamesProps {
  games: TrendingGame[];
}

export function TrendingGames({ games }: TrendingGamesProps) {
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  if (games.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Cabeçalho Integrado com o Tema */}
      <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] shadow-[0_4px_15px_rgba(16,185,129,0.2)]">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24]">
            Jogos em Destaque
          </h2>
          <p className="text-sm font-medium text-slate-400">
            As partidas mais disputadas da rodada atual
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {games.map((game, index) => {
          const totalVotos = game.votos_time_a + game.votos_time_b + game.votos_empate;
          const percentA = totalVotos > 0 ? Math.round((game.votos_time_a / totalVotos) * 100) : 0;
          const percentB = totalVotos > 0 ? Math.round((game.votos_time_b / totalVotos) * 100) : 0;
          const percentE = totalVotos > 0 ? Math.round((game.votos_empate / totalVotos) * 100) : 0;

          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm p-6 hover:border-[#10B981]/30 transition-all duration-300"
            >
              {/* Efeito sutil de hover no fundo */}
              <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#10B981] blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                {/* Data e Total de Votos */}
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4 text-[#10B981]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {formatDate(game.data_jogo)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
                    <BarChart3 className="h-4 w-4 text-[#FBBF24]" />
                    <span className="text-xs font-bold text-white">{totalVotos}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Votos</span>
                  </div>
                </div>

                {/* Times */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-5">
                  <p className="flex-1 text-sm sm:text-base md:text-lg font-black text-white text-right line-clamp-2 leading-tight break-words">
                    {game.time_a}
                  </p>
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] sm:text-xs font-black text-slate-600 italic">VS</span>
                  </div>
                  <p className="flex-1 text-sm sm:text-base md:text-lg font-black text-white text-left line-clamp-2 leading-tight break-words">
                    {game.time_b}
                  </p>
                </div>

                {/* Barra de Progresso */}
                <div className="flex gap-1 items-center h-8 bg-black/40 rounded-lg overflow-hidden border border-white/5 p-1 mb-4">
                  {game.votos_time_a > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded flex items-center justify-center transition-all duration-500 relative overflow-hidden group/bar"
                      style={{ width: `${percentA}%`, minWidth: percentA > 15 ? 'auto' : '4px' }}
                    >
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/bar:translate-x-full transition-transform duration-700 ease-in-out" />
                      {percentA > 15 && <span className="text-[10px] font-black text-white px-1 z-10">{percentA}%</span>}
                    </div>
                  )}
                  {game.votos_empate > 0 && (
                    <div
                      className="h-full bg-slate-600 rounded flex items-center justify-center transition-all duration-500 relative overflow-hidden group/bar"
                      style={{ width: `${percentE}%`, minWidth: percentE > 15 ? 'auto' : '4px' }}
                    >
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/bar:translate-x-full transition-transform duration-700 ease-in-out" />
                      {percentE > 15 && <span className="text-[10px] font-black text-white px-1 z-10">{percentE}%</span>}
                    </div>
                  )}
                  {game.votos_time_b > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-[#FBBF24] to-[#D97706] rounded flex items-center justify-center transition-all duration-500 relative overflow-hidden group/bar"
                      style={{ width: `${percentB}%`, minWidth: percentB > 15 ? 'auto' : '4px' }}
                    >
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/bar:translate-x-full transition-transform duration-700 ease-in-out" />
                      {percentB > 15 && <span className="text-[10px] font-black text-white px-1 z-10">{percentB}%</span>}
                    </div>
                  )}
                </div>

                {/* Legenda */}
                <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-sm bg-[#10B981]"></span>
                    {game.votos_time_a}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-sm bg-slate-600"></span>
                    {game.votos_empate}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2 h-2 rounded-sm bg-[#FBBF24]"></span>
                    {game.votos_time_b}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}