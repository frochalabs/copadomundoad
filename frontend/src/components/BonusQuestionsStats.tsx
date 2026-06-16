import { PerguntaExtraStats } from "@/lib/api";
import { HelpCircle, Users, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface BonusQuestionsStatsProps {
  stats: PerguntaExtraStats[];
}

export function BonusQuestionsStats({ stats }: BonusQuestionsStatsProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 relative z-10 px-4">
      {/* Cabeçalho Integrado com o Tema Principal */}
      <div className="mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] shadow-[0_4px_15px_rgba(16,185,129,0.2)]">
          <HelpCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#FBBF24]">
            Perguntas Bônus
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Veja como a galera está apostando nas perguntas extras
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-yellow-500/10 transition-colors"></div>
              
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-white flex-1">{stat.descricao}</h3>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shrink-0 ${
                  stat.status === 'ABERTA' 
                    ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {stat.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 font-medium">
                <Users className="w-4 h-4" />
                {stat.total_respostas} {stat.total_respostas === 1 ? 'resposta' : 'respostas'}
              </div>
              
              <div className="flex flex-col gap-4">
                {stat.opcoes.map(opcao => {
                  const count = stat.distribuicao[opcao] || 0;
                  const percentage = stat.total_respostas > 0 ? Math.round((count / stat.total_respostas) * 100) : 0;
                  const isCorrect = stat.status === 'FECHADA' && stat.resposta_correta === opcao;
                  const isWrong = stat.status === 'FECHADA' && stat.resposta_correta !== null && stat.resposta_correta !== opcao;
                  
                  return (
                    <div key={opcao} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className={`flex items-center gap-1.5 ${isCorrect ? 'text-yellow-400 font-bold' : isWrong ? 'text-slate-500' : 'text-slate-300'}`}>
                          {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                          {isWrong && <XCircle className="w-4 h-4 text-slate-600" />}
                          {opcao}
                        </span>
                        <span className={isCorrect ? 'text-yellow-400 font-bold' : 'text-slate-400'}>
                          {percentage}% <span className="text-slate-500 text-xs ml-1">({count})</span>
                        </span>
                      </div>
                      
                      <div className="w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            isCorrect ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                            : isWrong ? 'bg-slate-700'
                            : 'bg-gradient-to-r from-[#10B981] to-teal-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {stat.status === 'FECHADA' && stat.resposta_correta && (
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Resposta oficial:</span>
                  <span className="font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">{stat.resposta_correta}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
