import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { LOGISTICS_STEPS } from '../data/summitData';
import { Clock, QrCode, IdCard, DoorOpen, CheckCircle2, ShieldCheck, Coffee } from 'lucide-react';

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const LogisticsSection: React.FC = () => {
  const icons = [
    <Clock className="w-5 h-5 text-[#E50914]" />,
    <QrCode className="w-5 h-5 text-[#E50914]" />,
    <IdCard className="w-5 h-5 text-[#E50914]" />,
    <DoorOpen className="w-5 h-5 text-[#E50914]" />,
  ];

  return (
    <motion.section
      id="credenciamento"
      className="py-20 sm:py-28 bg-[#0D0D0D] border-b border-neutral-900 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div variants={itemVariants} className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#E50914] font-semibold mb-2">
            <IdCard className="w-4 h-4" />
            <span>Fluxo de Acesso & Credenciamento</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            Logística de Chegada & Entrega do Crachá Físico
          </h2>
          <p className="mt-4 text-base text-neutral-300">
            Chegue às 07:30 da manhã para o Welcome Coffee executivo e retire sua credencial oficial nominal com leitura rápida do voucher digital em totens expressos.
          </p>
        </motion.div>

        {/* 4 Steps Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {LOGISTICS_STEPS.map((step, idx) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#141414] border border-neutral-800 flex items-center justify-center shrink-0">
                    {icons[idx]}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#E50914] bg-[#E50914]/10 px-2.5 py-1 rounded-md">
                    {step.time}
                  </span>
                </div>

                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 block mb-1">
                  PASSO {step.step}
                </span>

                <h3 className="text-lg font-bold text-white font-display leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-start gap-2 text-xs text-neutral-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{step.details}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Operational Guidelines Banner */}
        <motion.div
          variants={itemVariants}
          className="mt-12 p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Recomendações Importantes para o Credenciamento
              </h4>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Tenha em mãos seu documento oficial com foto (RG, CNH ou Passaporte) e o Voucher Digital gerado no celular ou impresso. O credenciamento expresso evita filas e libera seu acesso ao Welcome Coffee e auditório principal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-xs text-neutral-400 border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-6">
            <Coffee className="w-4 h-4 text-[#E50914]" />
            <span>Café contínuo até as 08:30</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
