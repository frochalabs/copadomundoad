"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Palpite } from "@/lib/api";

interface BracketMatchCardProps {
  palpite: Palpite;
  index: number;
}

export function BracketMatchCard({ palpite, index }: BracketMatchCardProps) {
  const isFinished = palpite.status === 'FINISHED';
  
  // Logic to determine if a team is eliminated
  let teamAEliminated = false;
  let teamBEliminated = false;
  
  if (isFinished && palpite.gols_a !== null && palpite.gols_b !== null && palpite.gols_a !== undefined && palpite.gols_b !== undefined) {
    if (palpite.gols_a < palpite.gols_b) {
      teamAEliminated = true;
    } else if (palpite.gols_b < palpite.gols_a) {
      teamBEliminated = true;
    }
  }

  const isCorrect = (palpite.pontos_ganhos ?? 0) > 0;
  const isCravada = palpite.pontos_ganhos === 5;
  
  let cardBorder = "border-slate-800 hover:border-slate-600";
  let predictionBg = "bg-[#0B1320]";
  let predictionText = "text-slate-400";
  
  if (isFinished) {
    if (isCorrect) {
      cardBorder = "border-[#10B981]/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] ring-1 ring-[#10B981]/30";
      predictionBg = "bg-[#10B981]/10";
      predictionText = "text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]";
    } else {
      cardBorder = "border-red-900/30";
      predictionBg = "bg-red-500/5";
      predictionText = "text-red-500/50 line-through";
    }
  }

  // Format date safely
  let formattedDate = 'A definir';
  try {
    const safeDateString = typeof palpite.data_jogo === 'string' ? palpite.data_jogo.replace(' ', 'T') : palpite.data_jogo;
    const dateObj = new Date(safeDateString);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    }
  } catch (e) {
    // Keep fallback
  }

  // Fallback missing flag
  const fallbackFlag = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Missing_flag.svg/1024px-Missing_flag.svg.png";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: (index % 16) * 0.05, ease: "easeOut" }}
      className={`relative rounded-xl border ${cardBorder} bg-[#0B1320] flex flex-col overflow-hidden w-full transition-all`}
    >
      {isFinished && isCravada && (
        <div className="absolute top-0 right-1/2 translate-x-1/2 bg-yellow-500/20 p-1.5 rounded-b-xl border border-t-0 border-yellow-500/50 z-10 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <Target className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
        </div>
      )}

      {/* MATCH INFO SECTION */}
      <div className="p-4 flex items-center justify-between bg-gradient-to-b from-[#0f172a]/50 to-transparent">
        
        {/* TEAM A */}
        <div className={`flex flex-col items-center flex-1 ${teamAEliminated ? 'opacity-40 grayscale' : ''}`}>
          <div className="w-12 h-8 rounded-sm overflow-hidden border border-white/10 mb-2 shadow-lg">
            <img 
              src={palpite.bandeira_a || fallbackFlag} 
              alt={palpite.time_a} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackFlag; }}
            />
          </div>
          <span className="font-bold text-[10px] sm:text-xs text-white uppercase tracking-wider text-center truncate w-full max-w-[90px]">
            {palpite.time_a}
          </span>
        </div>

        {/* SCORE / MIDDLE */}
        <div className="flex flex-col items-center justify-center px-4 shrink-0">
          <div className="font-black text-2xl text-white tracking-widest flex items-center gap-2">
            {isFinished ? (
              <>
                <span className={teamAEliminated ? 'text-slate-500' : 'text-white'}>{palpite.gols_a}</span>
                <span className="text-slate-600 text-lg">-</span>
                <span className={teamBEliminated ? 'text-slate-500' : 'text-white'}>{palpite.gols_b}</span>
              </>
            ) : (
              <span className="text-slate-600 text-sm font-bold uppercase mx-2">X</span>
            )}
          </div>
          <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
            {formattedDate.split(',')[0]}
          </span>
        </div>

        {/* TEAM B */}
        <div className={`flex flex-col items-center flex-1 ${teamBEliminated ? 'opacity-40 grayscale' : ''}`}>
          <div className="w-12 h-8 rounded-sm overflow-hidden border border-white/10 mb-2 shadow-lg">
            <img 
              src={palpite.bandeira_b || fallbackFlag} 
              alt={palpite.time_b} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackFlag; }}
            />
          </div>
          <span className="font-bold text-[10px] sm:text-xs text-white uppercase tracking-wider text-center truncate w-full max-w-[90px]">
            {palpite.time_b}
          </span>
        </div>

      </div>

      {/* USER PREDICTION SECTION */}
      <div className={`border-t border-slate-800/50 py-2 px-4 flex items-center justify-between ${predictionBg}`}>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Palpite</span>
          <div className={`font-black text-sm ${predictionText} flex items-center gap-1`}>
            {palpite.palpite_a !== null && palpite.palpite_a !== undefined ? (
              <>{palpite.palpite_a} <span className="opacity-50 mx-1">x</span> {palpite.palpite_b}</>
            ) : (
              <span className="text-slate-600/80 text-[10px] tracking-widest uppercase">Aguardando</span>
            )}
          </div>
        </div>
        
        {isFinished && (
          <span className={`text-xs font-black uppercase tracking-wider ${isCorrect ? 'text-[#10B981]' : 'text-slate-600'}`}>
            {isCorrect ? `+${palpite.pontos_ganhos} pts` : '0 pts'}
          </span>
        )}
      </div>

    </motion.div>
  );
}
