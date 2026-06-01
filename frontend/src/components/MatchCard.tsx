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
    badgeStyle = "bg-[#79f7fa]/10 text-[#79f7fa] border-l border-b border-[#79f7fa]/30 shadow-[0_0_10px_rgba(121,247,250,0.5)]";
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
      className={`relative rounded-xl border p-5 flex flex-col items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#79f7fa]/30 ${containerStyle}`}
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
      
      {/* Footer Info (optional, can be used for extra status) */}
      {palpite.pontos_ganhos === null && (
        <div className="mt-4 pt-4 border-t border-white/5 w-full text-center text-xs text-slate-600 font-mono uppercase tracking-widest">
          Aguardando Resultado
        </div>
      )}
    </motion.div>
  );
}
