"use client";

import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { RankingItem } from "@/lib/api";

interface WinnersDashboardProps {
  topUsers: RankingItem[];
}

// Variantes para animação de entrada dos cards
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export function WinnersDashboard({ topUsers }: WinnersDashboardProps) {
  const router = useRouter();

  if (!topUsers || topUsers.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full relative my-16"
    >
      {/* Fundo Full Width sem bordas redondas para parecer uma imagem em movimento (Banner) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1320] via-[#051020] to-[#061c16] -z-10 overflow-hidden">
        {/* SVG Texture animada/fixa para dar sensação de movimento */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        {/* Glow verde super sutil espalhado */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[150px] bg-[#10B981]/10 blur-[100px] pointer-events-none"></div>
      </div>

      {/* Container de conteúdo centralizado */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Cabeçalho com as fontes oficiais do site */}
        <div className="text-center mb-12 relative z-10 pt-8">
        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24] uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
          Destaques da Fase de Grupos
        </h2>
        <p className="text-[#10B981]/70 text-base md:text-lg mt-2 font-semibold tracking-wide">
          Os 5 campeões da fase de grupos
        </p>
      </div>

      {/* Lista de usuários com animação stagger */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10 pb-8"
      >
        {topUsers.map((user, index) => {
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;

          // Definição de estilos alinhada ao amarelo oficial (#FBBF24)
          let rankColor = "text-slate-400 border-white/5";
          let bgCard = "bg-white/[0.02] hover:bg-white/5";
          let borderCard = "border-white/5 hover:border-white/15";
          let shadowCard = "shadow-lg shadow-black/20";
          let scaleCard = "scale-100";
          let translateY = "translate-y-0";
          let crownColor = "fill-[#FBBF24]/70";

          if (isFirst) {
            rankColor = "text-[#FBBF24] border-[#FBBF24]/30";
            bgCard = "bg-[#FBBF24]/5 hover:bg-[#FBBF24]/10";
            borderCard = "border-[#FBBF24]/40 hover:border-[#FBBF24]/60";
            shadowCard = "shadow-xl shadow-[#FBBF24]/10";
            scaleCard = "md:scale-105";
            translateY = "-translate-y-4 md:-translate-y-6";
            crownColor = "fill-[#FBBF24]";
          } else if (isSecond) {
            rankColor = "text-slate-300 border-slate-300/20";
            bgCard = "bg-slate-300/5 hover:bg-slate-300/10";
            borderCard = "border-slate-300/20 hover:border-slate-300/40";
          } else if (isThird) {
            rankColor = "text-orange-400 border-orange-400/20";
            bgCard = "bg-orange-500/5 hover:bg-orange-500/10";
            borderCard = "border-orange-500/20 hover:border-orange-500/40";
          }

          return (
            <motion.div
              key={user.username}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => router.push(`/user/${encodeURIComponent(user.username)}`)}
              className={`
                relative flex flex-col items-center p-5 rounded-2xl 
                border ${borderCard} ${bgCard} ${shadowCard}
                cursor-pointer transition-all duration-300
                ${scaleCard} ${translateY}
                backdrop-blur-md
              `}
            >
              {/* Selo de posição */}
              <div className={`absolute -top-3 -right-2 text-xs font-black px-2 py-0.5 rounded-full bg-[#051020] border ${rankColor} shadow-md`}>
                #{index + 1}
              </div>

              {/* Coroa (apenas para o primeiro) */}
              {isFirst && (
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                >
                  <Crown className={`w-8 h-8 ${crownColor} text-[#FBBF24]`} />
                </motion.div>
              )}

              {/* Avatar com anel alinhado */}
              <UserAvatar
                username={user.username}
                className={`
                  w-14 h-14 mb-3
                  ${isFirst ? "ring-2 ring-[#FBBF24]/50 ring-offset-2 ring-offset-[#0B1320] shadow-[0_0_15px_rgba(250,204,21,0.2)]" : "ring-1 ring-white/10"}
                `}
              />

              {/* Nome */}
              <h3 className="font-bold text-sm text-slate-100 truncate w-full text-center mb-2">
                {user.username.split(".")[0]}
              </h3>

              {/* Pontos formatados */}
              <div className={`w-full rounded-lg px-3 py-1.5 text-center backdrop-blur-sm ${isFirst ? 'bg-[#FBBF24]/10 text-[#FBBF24]' : 'bg-black/30 text-white'}`}>
                <span className="text-xl font-black">
                  {user.total_pontos}
                </span>
                <span className="text-[10px] font-medium ml-1 opacity-60">pts</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      </div>
      {/* Linha decorativa inferior re-adaptada com verde */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent z-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#10B981]/10 to-transparent z-20" />
    </motion.section>
  );
}