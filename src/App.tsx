import React, { useState, useEffect } from 'react';
import { Gene, WILD_TYPE_GENES, PlayerStats } from './types';
import MutationLab from './components/MutationLab';
import GameCanvas from './components/GameCanvas';
import EducationalWiki from './components/EducationalWiki';
import { Dna, Award, BookOpen, Settings, Zap, Compass, RefreshCw, BarChart2, Star, Shield, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RunHistoryEntry {
  id: string;
  timestamp: string;
  score: number;
  distance: number;
  mutationsCount: number;
  unlockedShield: boolean;
  isTiny: boolean;
  isGiant: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'lab' | 'run' | 'library'>('lab');
  
  // Genome state shared between the sandbox/mutation workbench and active runner gameplay
  const [genes, setGenes] = useState<Gene[]>(() => {
    const saved = localStorage.getItem('genomic_joyride_genome');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return WILD_TYPE_GENES;
      }
    }
    return WILD_TYPE_GENES;
  });

  // DNA fragments currency
  const [dnaFragments, setDnaFragments] = useState<number>(() => {
    const saved = localStorage.getItem('genomic_joyride_dna_fragments');
    return saved ? parseInt(saved) : 10; // Start with 10 DNA Fragments so they can test upgrades
  });

  // Mutation upgrades/levels
  const [mutationLevels, setMutationLevels] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('genomic_joyride_mutation_levels');
    return saved ? JSON.parse(saved) : {
      metabolic_speed: 0,
      glycoprotein_hardening: 0,
      epigenetic_bypass: 0,
      magnetic_amp: 0,
      ribosome_regen: 0,
      polymerase_shift: 0
    };
  });

  // Track the user high score and run history log
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>(() => {
    const saved = localStorage.getItem('genomic_joyride_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('genomic_joyride_highscore');
    return saved ? parseInt(saved) : 0;
  });

  // Save genome modifications locally
  useEffect(() => {
    localStorage.setItem('genomic_joyride_genome', JSON.stringify(genes));
  }, [genes]);

  // Save DNA and mutation upgrades
  useEffect(() => {
    localStorage.setItem('genomic_joyride_dna_fragments', dnaFragments.toString());
  }, [dnaFragments]);

  useEffect(() => {
    localStorage.setItem('genomic_joyride_mutation_levels', JSON.stringify(mutationLevels));
  }, [mutationLevels]);

  const handleCollectDnaFragment = () => {
    setDnaFragments(prev => prev + 1);
  };

  const handleBuyMutationLevel = (mutationId: string, cost: number) => {
    if (dnaFragments >= cost) {
      setDnaFragments(prev => prev - cost);
      setMutationLevels(prev => ({
        ...prev,
        [mutationId]: (prev[mutationId] || 0) + 1
      }));
      return true;
    }
    return false;
  };

  // Handle run results from the game physics loop
  const handleRunFinished = (stats: { score: number; distance: number; mutationsCount: number; dnaCollected: number }) => {
    // Record details about current phenotype expressions
    const currentStats = savedPhenotypeSummary();

    if (stats.dnaCollected > 0) {
      setDnaFragments(prev => prev + stats.dnaCollected);
    }
    
    const newEntry: RunHistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: stats.score,
      distance: stats.distance,
      mutationsCount: stats.mutationsCount,
      unlockedShield: currentStats.shieldActive,
      isTiny: currentStats.isTiny,
      isGiant: currentStats.isGiant
    };

    const updatedHistory = [newEntry, ...runHistory].slice(0, 10); // keep last 10
    setRunHistory(updatedHistory);
    localStorage.setItem('genomic_joyride_history', JSON.stringify(updatedHistory));

    if (stats.score > highScore) {
      setHighScore(stats.score);
      localStorage.setItem('genomic_joyride_highscore', stats.score.toString());
    }
  };

  const savedPhenotypeSummary = () => {
    // Re-evaluate quickly to summarize features used during that run
    let shieldActive = false;
    let isTiny = false;
    let isGiant = false;

    genes.forEach(g => {
      // Very fast amino check
      const coding = g.activeSequence;
      const firstStopIdx = coding.indexOf('TAA') !== -1 ? coding.indexOf('TAA') : coding.indexOf('TAG') !== -1 ? coding.indexOf('TAG') : coding.indexOf('TGA');
      const isSilenced = (firstStopIdx !== -1 && firstStopIdx < coding.length - 3) || !coding.startsWith('ATG');

      if (g.abilityType === 'shield' && !isSilenced) {
        // Cysteine check
        const hasCys = coding.includes('TGT') || coding.includes('TGC');
        if (hasCys) shieldActive = true;
      }
      if (g.abilityType === 'size') {
        if (isSilenced || coding.length < 12) {
          isTiny = true;
        } else {
          // high basic charge -> gigantism
          const basicCount = (coding.match(/AAA|AAG|CGT|CGC|CGA|CGG|AGA|AGG|CAT|CAC/g) || []).length;
          if (basicCount >= 4) isGiant = true;
        }
      }
    });

    return { shieldActive, isTiny, isGiant };
  };

  const handleLaunchFromLab = () => {
    setActiveTab('run');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 geometric-grid relative overflow-x-hidden">
      
      {/* Decorative top header glow */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-cyan-950/20 via-indigo-950/10 to-transparent pointer-events-none" />

      {/* Primary Header/Navbar */}
      <header className="relative z-10 border-b border-cyan-500/10 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg glow-cyan border border-cyan-400/20 animate-pulse">
              <Dna className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
                Genomic Joyride
              </h1>
              <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase block">
                Intracellular Mutation Runner
              </span>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-cyan-500/15 shadow-inner">
            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'lab'
                  ? 'bg-cyan-600 text-white shadow-md glow-cyan border border-cyan-400/20'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5'
              }`}
            >
              <Compass className="w-4 h-4" /> CRISPR Workbench
            </button>
            <button
              onClick={() => setActiveTab('run')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'run'
                  ? 'bg-cyan-600 text-white shadow-md glow-cyan border border-cyan-400/20'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5'
              }`}
            >
              <Play className="w-4 h-4" /> Play Runner
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-cyan-600 text-white shadow-md glow-cyan border border-cyan-400/20'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Genetic Wiki
            </button>
          </nav>

          {/* High Score & DNA HUD */}
          <div className="flex items-center gap-3">
            {/* DNA Fragments Badge */}
            <div className="flex items-center gap-3 bg-slate-900/85 px-4 py-2 rounded-lg border border-cyan-500/20 glow-cyan">
              <Dna className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-slate-400 block font-bold font-display uppercase tracking-wider text-[9px]">DNA Fragments</span>
                <span className="font-extrabold text-cyan-300 font-mono">{dnaFragments} helixes</span>
              </div>
            </div>

            {/* High Score HUD */}
            <div className="hidden md:flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-lg border border-cyan-500/15 glow-indigo">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-xs">
                <span className="text-slate-400 block font-bold font-display uppercase tracking-wider text-[9px]">Record Highscore</span>
                <span className="font-extrabold text-cyan-200 font-mono">{highScore} pts</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'lab' && (
              <MutationLab
                genes={genes}
                onUpdateGenes={setGenes}
                onLaunchGame={handleLaunchFromLab}
                dnaFragments={dnaFragments}
                mutationLevels={mutationLevels}
                onBuyMutationLevel={handleBuyMutationLevel}
              />
            )}

            {activeTab === 'run' && (
              <div className="space-y-6">
                {/* Visual warning of genome currently applied */}
                <div className="bg-cyan-950/20 border border-cyan-500/15 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none rounded-bl-full" />
                  <div className="flex items-center gap-3 relative z-10">
                    <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <p className="text-xs text-slate-300">
                      Genome configured! Your engineered gene phenotypes are active. Pass through <strong>CRISPR Portals</strong> to trigger spontaneous mutations in mid-air.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('lab')}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer transition-colors relative z-10"
                  >
                    Configure genes in DNA Workbench &rarr;
                  </button>
                </div>

                <GameCanvas
                  genes={genes}
                  onUpdateGenes={setGenes}
                  onRunFinished={handleRunFinished}
                  onCollectDnaFragment={handleCollectDnaFragment}
                  mutationLevels={mutationLevels}
                />
              </div>
            )}

            {activeTab === 'library' && (
              <EducationalWiki />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Sidebar / Footer Logs: Run History log & leaderboard stats */}
        {activeTab !== 'library' && (
          <section className="mt-12 bg-slate-950/70 border border-cyan-500/15 rounded-xl p-6 relative overflow-hidden geometric-corner-box shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none rounded-bl-full" />
            
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display relative z-10">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              Recent Intracellular Exploration Log
            </h3>
            
            {runHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-cyan-500/10 rounded-lg text-xs relative z-10">
                No runs recorded in current session yet. Launch the runner game and test your mutations to populate the evolutionary fitness logs!
              </div>
            ) : (
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left text-xs text-slate-400 border-collapse">
                  <thead>
                    <tr className="border-b border-cyan-500/15 text-slate-300 font-mono">
                      <th className="py-3 px-4 font-bold tracking-wider uppercase text-[10px]">Time</th>
                      <th className="py-3 px-4 font-bold tracking-wider uppercase text-[10px]">Exploration Score</th>
                      <th className="py-3 px-4 font-bold tracking-wider uppercase text-[10px]">Distance</th>
                      <th className="py-3 px-4 font-bold tracking-wider uppercase text-[10px]">Mutations Suffered</th>
                      <th className="py-3 px-4 font-bold tracking-wider uppercase text-[10px]">Run Phenotypes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runHistory.map((run, idx) => (
                      <tr key={run.id} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">{run.timestamp}</td>
                        <td className="py-3 px-4 font-bold text-cyan-200 font-mono">{run.score} pts</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{run.distance}m</td>
                        <td className="py-3 px-4 text-purple-400 font-mono font-medium">{run.mutationsCount} mutations</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {run.unlockedShield && (
                              <span className="text-[9px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/25 px-2 py-0.5 rounded flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Shielded
                              </span>
                            )}
                            {run.isTiny && (
                              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded">
                                Miniature Form
                              </span>
                            )}
                            {run.isGiant && (
                              <span className="text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded">
                                Gigantism (Heavy)
                              </span>
                            )}
                            {!run.unlockedShield && !run.isTiny && !run.isGiant && (
                              <span className="text-[9px] font-mono text-slate-500">
                                Wild Type Traits
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Humble educational footer */}
      <footer className="mt-16 border-t border-cyan-500/10 py-10 bg-slate-950/60 text-center text-xs text-slate-500 select-none relative z-10">
        <p className="font-display">&copy; 2026 Genomic Joyride. Built with React, Tailwind CSS, and HTML5 Canvas for biology exploration.</p>
        <p className="mt-1.5 text-slate-600 font-mono text-[10px] tracking-wider">
          Central Dogma: DNA &rarr; Transcription &rarr; mRNA &rarr; Translation &rarr; Polypeptides / Phenotypes
        </p>
      </footer>
    </div>
  );
}
