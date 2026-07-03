import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Compass, 
  BookOpen, 
  HelpCircle, 
  Zap, 
  Shield, 
  Dna, 
  Target, 
  MousePointer, 
  Award 
} from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'lab' | 'run' | 'library') => void;
}

export default function TutorialModal({ isOpen, onClose, onNavigateToTab }: TutorialModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Explore the Microscopic Frontier!",
      icon: <Dna className="w-12 h-12 text-cyan-400" />,
      tagline: "Cellular Flight & Objectives",
      gradient: "from-cyan-950/40 via-slate-900/80 to-slate-950",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Welcome to <span className="text-cyan-300 font-extrabold">Genomic Joyride</span>! 
            You are a <strong className="text-white">Muton</strong>—an engineered, microscopic organism on a high-speed cellular run. 
            Your goal is to fly as far as possible through hostile organelle environments while maintaining genetic integrity.
          </p>
          
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Core Missions
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span><strong>Maximize Distance:</strong> Float through the Cytoplasm, Nucleus, Ribosomes, and Mitochondria.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span><strong>Collect Nucleotides:</strong> Grab floating <strong className="text-cyan-300">A, T, C, G bases</strong> to score and trigger mutations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold mt-0.5">•</span>
                <span><strong>ATP Hyper-Charge:</strong> Find gold glowing capsules to activate an invincible 2.8x speed boost.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Master Genetic Flight Controls",
      icon: <MousePointer className="w-12 h-12 text-amber-400" />,
      tagline: "Thrusters & Dangerous Threats",
      gradient: "from-amber-950/30 via-slate-900/80 to-slate-950",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Controlling your cell requires micro-precision navigation. Learn the physical laws of the cell:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
              <kbd className="inline-block px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono font-bold text-amber-300 mb-1.5 shadow">Spacebar</kbd>
              <span className="block text-[11px] font-bold text-slate-300">Keyboard Fly</span>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Hold to fire thrusters and gain altitude; release to drop.</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center">
              <span className="inline-block text-xs font-bold text-amber-300 mb-2 border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/5">Mouse Click / Touch</span>
              <span className="block text-[11px] font-bold text-slate-300">Interactive Click</span>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">Tap or click and hold on the game canvas to hover upward.</p>
            </div>
          </div>

          <div className="bg-rose-950/20 p-3 rounded-xl border border-rose-500/20 space-y-2">
            <h4 className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Molecular Obstacles</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Watch out! Slicing <strong className="text-rose-300">Restriction Enzymes</strong> will target your altitude. 
              Drifting <strong className="text-purple-300">DNA Methylase</strong> drops methyl locks that silence your thruster energy. 
              Wild <strong className="text-cyan-300">Free Radicals</strong> jump erratically causing chromosomal breaks.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "CRISPR Workbench Evolution",
      icon: <Compass className="w-12 h-12 text-emerald-400" />,
      tagline: "Gene Editing & codon engineering",
      gradient: "from-emerald-950/30 via-slate-900/80 to-slate-950",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            In the <span className="text-emerald-300 font-extrabold">CRISPR Workbench</span> tab, you can actively reprogram your DNA sequence to express powerful physiological traits:
          </p>

          <div className="space-y-2.5">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Unlock Protective Protein Shield</span>
                <p className="text-[11px] text-slate-400 leading-snug">Edit bases of the Glycoprotein Hardening gene to include <strong>Cysteine (TGT, TGC)</strong>. S-S bonds grant structural damage defense!</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Configure Molecular Size</span>
                <p className="text-[11px] text-slate-400 leading-snug">High presence of basic charge amino acids like <strong>Arginine or Lysine</strong> expands cell size. High acid presence shrinks your size to slide through tight spots!</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">Upgrade Mutation Levels</span>
                <p className="text-[11px] text-slate-400 leading-snug">Use DNA fragments earned in runs to upgrade permanent abilities: Metabolic Speed, Ribosome Regen, Epigenetic Bypass, and Magnet Amps.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Interactive Genetic Science",
      icon: <BookOpen className="w-12 h-12 text-indigo-400" />,
      tagline: "Learn actual molecular biology",
      gradient: "from-indigo-950/30 via-slate-900/80 to-slate-950",
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            The <span className="text-indigo-300 font-extrabold">Genetic Wiki</span> contains a fully detailed cellular textbook detailing the true mechanisms of genomic translation:
          </p>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex gap-2 items-center text-xs font-bold text-indigo-300">
              <Dna className="w-4 h-4 text-indigo-400" />
              <span>Real Science Highlights Included:</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <strong className="text-indigo-200">The Central Dogma:</strong> Learn how information is systematically copied from DNA to mRNA transcript, and translated into folded proteins.
              </li>
              <li>
                <strong className="text-indigo-200">Triplet Codon Coding:</strong> Discover why bases are translated in 3-letter combinations, giving 64 potential genomic sequences for 20 amino acids.
              </li>
              <li>
                <strong className="text-indigo-200">Wobble Base pairing:</strong> Visualize how spatial flexibility on the 3rd position of the mRNA codon allows non-canonical bonding, letting cells use fewer tRNA types!
              </li>
            </ul>
          </div>

          <div className="p-3 bg-indigo-950/15 border border-indigo-500/25 rounded-lg text-center text-[11px] text-indigo-300">
            Read, learn, and apply biochemistry straight to your active gameplay loop!
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleQuickNavigate = (tab: 'lab' | 'run' | 'library') => {
    onNavigateToTab(tab);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header element with background gradient matching slide */}
          <div className={`p-6 bg-gradient-to-b ${slides[currentSlide].gradient} border-b border-slate-800 flex justify-between items-start relative overflow-hidden transition-all duration-300`}>
            {/* Ambient visual pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

            <div className="flex gap-4 items-center relative z-10">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 shadow-md">
                {slides[currentSlide].icon}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">{slides[currentSlide].tagline}</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5 tracking-tight">{slides[currentSlide].title}</h3>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-white p-1 bg-slate-900/60 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors relative z-10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Slide Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-grow custom-scrollbar">
            {slides[currentSlide].content}

            {/* Quick jump navigation options */}
            {currentSlide === 0 && (
              <div className="pt-4 border-t border-slate-900 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Or jump straight to workspace tabs:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleQuickNavigate('lab')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/30 border border-slate-800/80 rounded-lg text-[10px] font-bold text-emerald-400 transition-all cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" /> Workbench
                  </button>
                  <button 
                    onClick={() => handleQuickNavigate('run')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-900/60 hover:bg-slate-900 hover:border-cyan-500/30 border border-slate-800/80 rounded-lg text-[10px] font-bold text-cyan-400 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Play Game
                  </button>
                  <button 
                    onClick={() => handleQuickNavigate('library')}
                    className="flex items-center justify-center gap-1.5 p-2 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/30 border border-slate-800/80 rounded-lg text-[10px] font-bold text-indigo-400 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Science Wiki
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-slate-950 border-t border-slate-900 flex items-center justify-between">
            {/* Dots Pagination */}
            <div className="flex gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx 
                      ? 'bg-cyan-500 w-5' 
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Next/Prev buttons */}
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  currentSlide === 0
                    ? 'text-slate-600 border-slate-900/50 cursor-not-allowed bg-slate-950'
                    : 'text-slate-300 border-slate-800 hover:bg-slate-900 hover:text-white cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md glow-cyan border border-cyan-400/20 cursor-pointer transition-all"
              >
                {currentSlide === slides.length - 1 ? (
                  <>Get Started <Play className="w-3 h-3 ml-1" /></>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
