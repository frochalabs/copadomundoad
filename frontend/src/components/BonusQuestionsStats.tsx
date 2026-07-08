"use client";

import { PerguntaAtivaStats } from "@/lib/api";
import { Users, Star, Crown } from "lucide-react";
import { motion, Variants } from "framer-motion";
interface BonusQuestionsStatsProps {
  stats: PerguntaAtivaStats[];
}
//
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export function BonusQuestionsStats({ stats }: BonusQuestionsStatsProps) {
  if (!stats || stats.length === 0) return null;

  // Pega a primeira pergunta ativa retornada pelo backend
  const activeStat = stats[0];
  if (!activeStat) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full relative my-16"
    >
      {/* Fundo Full Width inspirado no WinnersDashboard */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1320] via-[#051020] to-[#061c16] -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[150px] bg-[#10B981]/10 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Cabeçalho */}
        <div className="text-center mb-12 relative z-10 pt-8">
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24] uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-[#FBBF24]" />
            {activeStat.descricao}
          </h2>
          <p className="text-[#10B981]/70 text-base md:text-lg mt-2 font-semibold tracking-wide flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            {activeStat.total_respostas} {activeStat.total_respostas === 1 ? 'voto registrado' : 'votos registrados'}
          </p>
        </div>

        {/* Lista de jogadores com animação stagger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-6 md:gap-8 relative z-10 pb-8"
        >
          {activeStat.ranking.map((item, index) => {
            const { opcao, votos, percentage } = item;
            const isFirst = index === 0 && votos > 0;

            let bgCard = "bg-white/[0.02] hover:bg-white/5";
            let borderCard = "border-white/5 hover:border-white/15";
            let shadowCard = "shadow-lg shadow-black/20";
            let scaleCard = "scale-100";
            let ringColor = "ring-1 ring-white/10";
            let nameColor = "text-slate-100";
            let statsBg = "bg-black/30 text-white";

            if (isFirst) {
              bgCard = "bg-[#FBBF24]/5 hover:bg-[#FBBF24]/10";
              borderCard = "border-[#FBBF24]/40 hover:border-[#FBBF24]/60";
              shadowCard = "shadow-xl shadow-[#FBBF24]/10";
              scaleCard = "md:scale-110";
              ringColor = "ring-2 ring-[#FBBF24]/50 ring-offset-2 ring-offset-[#0B1320] shadow-[0_0_15px_rgba(250,204,21,0.2)]";
              nameColor = "text-[#FBBF24]";
              statsBg = "bg-[#FBBF24]/10 text-[#FBBF24]";
            }

            // Converter o nome do jogador para a URL do cloudinary
            const playerUrlName = opcao.toLowerCase().trim().replace(/\s+/g, '.');
            const playerImgUrl = `https://res.cloudinary.com/dhj0lwxgq/image/upload/${playerUrlName}.jpg`;

            return (
              <motion.div
                key={opcao}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`
                  relative flex flex-col items-center p-5 rounded-2xl w-40 md:w-48
                  border ${borderCard} ${bgCard} ${shadowCard}
                  transition-all duration-300
                  ${scaleCard}
                  backdrop-blur-md
                `}
              >
                {/* Ranking do jogador */}
                <div className={`absolute -top-3 -right-2 text-xs font-black px-2 py-0.5 rounded-full bg-[#051020] border ${isFirst ? 'text-[#FBBF24] border-[#FBBF24]/30' : 'text-slate-400 border-white/5'} shadow-md`}>
                  #{index + 1}
                </div>

                {isFirst && (
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] z-20"
                  >
                    <Crown className="w-8 h-8 fill-[#FBBF24] text-[#FBBF24]" />
                  </motion.div>
                )}

                {/* Foto do Jogador */}
                <div className={`w-20 h-20 md:w-24 md:h-24 mb-4 rounded-full overflow-hidden shrink-0 ${ringColor} bg-[#051020] relative flex items-center justify-center`}>
                  <img
                    src={playerImgUrl}
                    alt={opcao}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(opcao)}&background=10B981&color=fff&bold=true`;
                    }}
                  />
                </div>

                {/* Nome do jogador */}
                <h3 className={`font-bold text-sm truncate w-full text-center mb-3 ${nameColor}`}>
                  {opcao}
                </h3>

                {/* Estatísticas (Votos e Porcentagem) */}
                <div className={`w-full rounded-lg px-3 py-2 flex flex-col items-center justify-center gap-1 backdrop-blur-sm ${statsBg}`}>
                  <span className="text-xl font-black leading-none">
                    {votos} <span className="text-[10px] font-medium opacity-60">votos</span>
                  </span>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${isFirst ? 'bg-[#FBBF24]' : 'bg-[#10B981]'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold opacity-80 mt-0.5">{percentage}%</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Linhas decorativas */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent z-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#10B981]/10 to-transparent z-20" />
    </motion.section>
  );
}
