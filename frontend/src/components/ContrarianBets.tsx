"use client";

import { motion } from "framer-motion";
import { ContrarianBet } from "@/lib/api";
import { Flame, Target, Users, Zap } from "lucide-react";

interface ContrarianBetsProps {
  bets: ContrarianBet[];
}

export function ContrarianBets({ bets }: ContrarianBetsProps) {
  const baseUrl = "https://res.cloudinary.com/dhj0lwxgq/image/upload/";
  const transformations = "w_200,h_200,c_scale,f_auto,q_auto/";

  const getAvatarUrl = (username: string) => {
    return `${baseUrl}${transformations}${encodeURIComponent(
      username.trim().toLowerCase().replace(/\s+/g, ".")
    )}.jpg`;
  };

  if (bets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* Cabeçalho Integrado com o Tema Principal */}
      <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] shadow-[0_4px_15px_rgba(16,185,129,0.2)]">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24]">
            Palpites Zebra
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Quem está indo contra a maré na rodada
          </p>
        </div>
      </div>

      {/* Grid de Cards Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bets.map((bet, index) => (
          <motion.div
            key={`${bet.jogo_id}-${bet.username}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm p-6 hover:border-[#FBBF24]/30 transition-all duration-300"
          >
            {/* Efeito sutil de hover no fundo */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#FBBF24] blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

            {/* Topo: Usuário e Jogo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full overflow-hidden border border-white/10 shadow-lg shrink-0 bg-slate-900">
                    <img
                      src={getAvatarUrl(bet.username)}
                      alt={bet.username}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Ícone sobreposto */}
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FBBF24] text-slate-900 shadow-sm">
                    <Zap className="h-3 w-3 fill-current" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                    Ousadia de
                  </p>
                  <p className="text-base font-bold text-white leading-none">
                    {bet.username}
                  </p>
                </div>
              </div>

              <div className="sm:text-right bg-white/[0.03] sm:bg-transparent p-3 sm:p-0 rounded-lg border border-white/5 sm:border-none">
                <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1 sm:mb-0">
                  Confronto
                </p>
                <p className="text-sm font-bold text-white">
                  {bet.time_a} x {bet.time_b}
                </p>
              </div>
            </div>

            {/* Placar Comparativo */}
            <div className="flex items-stretch justify-between rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
              
              {/* Lado da Maioria */}
              <div className="flex-1 text-center p-3 sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Maioria</span>
                </div>
                <p className="text-2xl font-black text-slate-300">
                  {bet.main_placar}
                </p>
                <p className="text-[10px] font-medium text-slate-500 mt-1">
                  {bet.main_votos} votos
                </p>
              </div>

              {/* Divisor */}
              <div className="flex flex-col items-center justify-center bg-white/[0.02] px-2 sm:px-4 border-l border-r border-white/5">
                <span className="text-xs font-black text-slate-500 italic">VS</span>
              </div>

              {/* Lado do Palpite Zebra */}
              <div className="flex-1 text-center p-3 sm:p-4 relative overflow-hidden">
                {/* Gradiente de fundo sutil no lado da zebra */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FBBF24]/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1.5 text-[#FBBF24] mb-2">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Zebra</span>
                  </div>
                  <p className="text-3xl font-black text-[#FBBF24] drop-shadow-[0_0_12px_rgba(251,191,36,0.2)]">
                    {bet.placar_zebra}
                  </p>
                  <p className="text-[10px] font-bold text-[#FBBF24]/70 mt-1 uppercase tracking-widest">
                    Diferenciado
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}