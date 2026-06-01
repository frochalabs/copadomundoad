"use client";

import { motion } from "framer-motion";
import { Palpite } from "@/lib/api";
import { Trophy, Check, X } from "lucide-react";

interface MatchCardProps {
  palpite: Palpite;
  index: number;
}

export function MatchCard({ palpite, index }: MatchCardProps) {
  // Determine styling based on points
  let containerStyle = "border-white/5 bg-white/[0.02] backdrop-blur-md";
  let badgeStyle = "bg-white/5 text-slate-500 border-l border-b border-white/5";
  let pointsIcon = <X size={14} className="mr-1" />;

  if (palpite.pontos_ganhos && palpite.pontos_ganhos > 0) {
    badgeStyle = "bg-[#10B981]/10 text-[#10B981] border-l border-b border-[#10B981]/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
    pointsIcon = palpite.pontos_ganhos === 3 ? <Trophy size={14} className="mr-1" /> : <Check size={14} className="mr-1" />;
  }

  // Format date
  const dateObj = new Date(palpite.data_jogo);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className={`relative rounded-xl border p-5 flex flex-col items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#10B981]/30 ${containerStyle}`}
    >
      {/* Badge for Points */}
      {palpite.pontos_ganhos !== null && (
        <div className={`absolute top-0 right-0 rounded-bl-xl rounded-tr-xl px-3 py-1 text-xs font-bold flex items-center ${badgeStyle}`}>
          {pointsIcon}
          {palpite.pontos_ganhos} pts
        </div>
      )}

      {/* Date */}
      <div className="w-full text-center text-xs text-slate-500 font-mono tracking-wider mb-4 lowercase mt-2">
        {formattedDate}
      </div>

      {/* Teams and Score Prediction */}
      <div className="flex items-center justify-between w-full mt-4 gap-2">
        {/* Team A */}
        <div className="flex-1 min-w-0 flex justify-end items-center">
          <p className="text-right text-[10px] sm:text-xs md:text-sm text-slate-300 font-semibold uppercase tracking-wide leading-tight line-clamp-2">
            {palpite.time_a}
          </p>
        </div>

        {/* Score Guess */}
        <div className="shrink-0 px-3 sm:px-5 flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-4xl sm:text-5xl font-black text-white whitespace-nowrap">{palpite.palpite_a}</span>
          <span className="text-2xl font-black text-slate-600 whitespace-nowrap">-</span>
          <span className="text-4xl sm:text-5xl font-black text-white whitespace-nowrap">{palpite.palpite_b}</span>
        </div>

        {/* Team B */}
        <div className="flex-1 min-w-0 flex justify-start items-center">
          <p className="text-left text-[10px] sm:text-xs md:text-sm text-slate-300 font-semibold uppercase tracking-wide leading-tight line-clamp-2">
            {palpite.time_b}
          </p>
        </div>
      </div>
      
      {/* Footer Info / Previsão */}
      {palpite.pontos_ganhos === null && (
        <div className="mt-6 w-full flex flex-col gap-2">
          <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-semibold px-3 py-2 bg-[#10B981]/10 text-[#10B981] rounded border border-[#10B981]/20">
            <span className="flex items-center gap-1.5">🟢 5 pts</span>
            <span className="text-[#10B981]/70 font-medium">se exato</span>
          </div>
          <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-semibold px-3 py-2 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
            <span className="flex items-center gap-1.5">🔵 3 pts</span>
            <span className="text-blue-400/70 font-medium">se acertar vencedor</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
