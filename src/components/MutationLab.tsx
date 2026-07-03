import React, { useState } from 'react';
import { Gene, analyzeGenome, Nucleotide, EVOLUTION_MUTATIONS, EvolutionMutation } from '../types';
import DNAVisualizer from './DNAVisualizer';
import { 
  Sparkles, 
  RefreshCw, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  HelpCircle, 
  AlertCircle, 
  PlayCircle, 
  Star, 
  BookOpen, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Dna, 
  Lock, 
  Activity, 
  Eye, 
  Shield, 
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';

interface MutationLabProps {
  genes: Gene[];
  onUpdateGenes: (newGenes: Gene[]) => void;
  onLaunchGame: () => void;
  dnaFragments: number;
  mutationLevels: Record<string, number>;
  onBuyMutationLevel: (mutationId: string, cost: number) => boolean;
}

interface EngineeringGoal {
  title: string;
  description: string;
  targetAbility: string;
  recipe: string;
  completed: boolean;
}

export default function MutationLab({ 
  genes, 
  onUpdateGenes, 
  onLaunchGame,
  dnaFragments,
  mutationLevels,
  onBuyMutationLevel
}: MutationLabProps) {
  const [workbenchTab, setWorkbenchTab] = useState<'crispr' | 'evolution'>('crispr');
  const [selectedGeneId, setSelectedGeneId] = useState<string>(genes[0].id);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'point' | 'insert' | 'delete' | null>(null);
  const [selectedBase, setSelectedBase] = useState<Nucleotide>('A');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const selectedGene = genes.find(g => g.id === selectedGeneId) || genes[0];

  // Analyze the active genome to see what abilities are unlocked
  const genomeAnalysis = analyzeGenome(genes);

  // Biological recipes / engineering targets for players
  const engineeringGoals: EngineeringGoal[] = [
    {
      title: 'Disulfide Armor (Shield)',
      description: 'The Capsid gene holds structural cysteine (Cys) residues. Form robust disulfide covalent bonds to absorb restriction enzyme slices.',
      targetAbility: 'shield',
      recipe: 'Translate the Armor gene so it contains at least 2 "Cys" residues (codons TGT, TGC).',
      completed: genomeAnalysis.shieldTier >= 1
    },
    {
      title: 'Miniature Adaptation (Tiny Hitbox)',
      description: 'Delete growth receptors or introduce a Stop codon to stunt growth, decreasing collision radius by 35%—a major advantage!',
      targetAbility: 'size',
      recipe: 'Cause a frameshift (length not multiple of 3) or a premature STOP codon (TAA, TAG, TGA) early in the Growth gene.',
      completed: genomeAnalysis.sizeTier === 0
    },
    {
      title: 'Charged Base Affinity (Magnet)',
      description: 'Create an electrostatic receptor with polar residues (Gln, Asn, Glu) to pull negative nucleotides directly from afar.',
      targetAbility: 'magnet',
      recipe: 'Translate the Magnet gene to contain 3 or more polar amino acids like Glutamine (Gln: CAA, CAG) or Asparagine (Asn: AAT, AAC).',
      completed: genomeAnalysis.magnetTier >= 1
    },
    {
      title: 'Hyper-Lipid Thruster (Super Jetpack)',
      description: 'Upgrade the ATPase propulsion gene with hydrophobic amino acids to integrate deep into cellular membranes for 2x power.',
      targetAbility: 'thruster',
      recipe: 'Translate the Energy gene with 4 or more hydrophobic residues (Val: GTT/GTC/GTA/GTG or Leu: TTA/TTG/CTT/CTC).',
      completed: genomeAnalysis.thrusterTier >= 2
    }
  ];

  // Reset current gene to original Wild-Type sequence
  const handleResetGene = (geneId: string) => {
    const updated = genes.map(g => {
      if (g.id === geneId) {
        // Find default phenotype description
        let wtPheno = 'Wild Type';
        if (g.abilityType === 'thruster') wtPheno = 'Basic Nucleotide Stream: Standard upward thrust and speed.';
        else if (g.abilityType === 'size') wtPheno = 'Standard Scale: Normal hit box size (medium agility).';
        else if (g.abilityType === 'shield') wtPheno = 'Unshielded: Vulnerable to restriction enzyme cuts.';
        else if (g.abilityType === 'magnet') wtPheno = 'Manual Collection: Must touch nucleotides directly.';

        return {
          ...g,
          activeSequence: g.defaultSequence,
          expressedPhenotype: wtPheno
        };
      }
      return g;
    });
    onUpdateGenes(updated);
    setEditingIndex(null);
    setActionType(null);
    setErrorMsg(null);
  };

  // Reset the ENTIRE genome
  const handleResetAll = () => {
    const updated = genes.map(g => {
      let wtPheno = 'Wild Type';
      if (g.abilityType === 'thruster') wtPheno = 'Basic Nucleotide Stream: Standard upward thrust and speed.';
      else if (g.abilityType === 'size') wtPheno = 'Standard Scale: Normal hit box size (medium agility).';
      else if (g.abilityType === 'shield') wtPheno = 'Unshielded: Vulnerable to restriction enzyme cuts.';
      else if (g.abilityType === 'magnet') wtPheno = 'Manual Collection: Must touch nucleotides directly.';

      return {
        ...g,
        activeSequence: g.defaultSequence,
        expressedPhenotype: wtPheno
      };
    });
    onUpdateGenes(updated);
    setEditingIndex(null);
    setActionType(null);
    setErrorMsg(null);
  };

  // Apply manual mutation
  const applyMutation = () => {
    if (editingIndex === null) return;
    if (editingIndex < 0 || editingIndex > selectedGene.activeSequence.length) return;

    let newSeq = selectedGene.activeSequence;

    if (actionType === 'point') {
      if (editingIndex >= selectedGene.activeSequence.length) {
        setErrorMsg('Invalid index for point mutation.');
        return;
      }
      newSeq =
        selectedGene.activeSequence.slice(0, editingIndex) +
        selectedBase +
        selectedGene.activeSequence.slice(editingIndex + 1);
    } else if (actionType === 'insert') {
      newSeq =
        selectedGene.activeSequence.slice(0, editingIndex) +
        selectedBase +
        selectedGene.activeSequence.slice(editingIndex);
    } else if (actionType === 'delete') {
      if (editingIndex >= selectedGene.activeSequence.length) {
        setErrorMsg('Invalid index for deletion.');
        return;
      }
      newSeq =
        selectedGene.activeSequence.slice(0, editingIndex) +
        selectedGene.activeSequence.slice(editingIndex + 1);
    }

    if (newSeq.length === 0) {
      setErrorMsg('Genome cannot be fully deleted!');
      return;
    }

    // Update genes list
    const updatedGenes = genes.map(g => {
      if (g.id === selectedGene.id) {
        return {
          ...g,
          activeSequence: newSeq
        };
      }
      return g;
    });

    // Re-analyze immediately to populate the mutated phenotype string for the updated gene
    const testAnalysis = analyzeGenome(updatedGenes);
    let updatedPhenotype = '';
    if (selectedGene.abilityType === 'thruster') updatedPhenotype = testAnalysis.phenotypes.thruster;
    else if (selectedGene.abilityType === 'size') updatedPhenotype = testAnalysis.phenotypes.size;
    else if (selectedGene.abilityType === 'shield') updatedPhenotype = testAnalysis.phenotypes.shield;
    else if (selectedGene.abilityType === 'magnet') updatedPhenotype = testAnalysis.phenotypes.magnet;

    const finalGenes = updatedGenes.map(g => {
      if (g.id === selectedGene.id) {
        return {
          ...g,
          expressedPhenotype: updatedPhenotype
        };
      }
      return g;
    });

    onUpdateGenes(finalGenes);
    setEditingIndex(null);
    setActionType(null);
    setErrorMsg(null);
  };

  // Helper to resolve icon for evolution passive
  const getMutationIcon = (id: string) => {
    switch (id) {
      case 'metabolic_speed': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'glycoprotein_hardening': return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'epigenetic_bypass': return <Lock className="w-5 h-5 text-purple-400" />;
      case 'magnetic_amp': return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'ribosome_regen': return <Activity className="w-5 h-5 text-pink-400" />;
      case 'polymerase_shift': return <Cpu className="w-5 h-5 text-blue-400" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleEvolveMutation = (mutation: EvolutionMutation, currentLevel: number) => {
    const cost = mutation.cost * (currentLevel + 1);
    const success = onBuyMutationLevel(mutation.id, cost);
    if (success) {
      setPurchaseSuccess(`Successfully evolved ${mutation.name} to Tier ${currentLevel + 1}!`);
      setTimeout(() => setPurchaseSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Intro Banner */}
      <div className="bg-slate-950/80 p-6 rounded-xl border border-cyan-500/15 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden geometric-corner-box">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/5 to-transparent pointer-events-none rounded-bl-full" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            Genomic Assembly & Evolution Lab
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Engineer raw nucleotide sequences manually using the CRISPR workbench, or harvest cellular <strong>DNA fragments</strong> from active runs to catalyze permanent macromolecular mutations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={handleResetAll}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-bold rounded-lg border border-cyan-500/10 hover:border-cyan-500/25 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reset Genome
          </button>
          <button
            onClick={onLaunchGame}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-black rounded-lg shadow-lg glow-cyan border border-cyan-400/20 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 animate-pulse" /> Launch Intracellular Run
          </button>
        </div>
      </div>

      {/* Lab Tabs Nav */}
      <div className="flex border-b border-cyan-500/10 gap-2">
        <button
          onClick={() => setWorkbenchTab('crispr')}
          className={`px-5 py-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            workbenchTab === 'crispr'
              ? 'border-cyan-400 text-white font-black bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" /> CRISPR Sandbox Workbench
        </button>
        <button
          onClick={() => setWorkbenchTab('evolution')}
          className={`px-5 py-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            workbenchTab === 'evolution'
              ? 'border-cyan-400 text-white font-black bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" /> Macromolecular Evolution Vault
          {dnaFragments > 0 && (
            <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-400/20 animate-pulse">
              {dnaFragments} DNA Available
            </span>
          )}
        </button>
      </div>

      {workbenchTab === 'crispr' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Left Column: Mutation Controls & Select Gene */}
          <div className="space-y-6 lg:col-span-1">
            {/* Active Mutant Phenotypes */}
            <div className="bg-slate-950/50 border border-cyan-500/10 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none rounded-bl-full" />
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display relative z-10">
                <Star className="w-5 h-5 text-amber-400" />
                Active Expression State
              </h3>
              <div className="space-y-3 relative z-10">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-cyan-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Jetpack Thruster</span>
                    <span className="text-xs font-bold text-slate-200">
                      {genomeAnalysis.thrusterTier === 2 ? '⚡ Hyper-Hydrophobic (2.0x)' : genomeAnalysis.thrusterTier === 0.5 ? '⚠️ Silenced Promoter (0.5x)' : 'Standard ATP (1.0x)'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${genomeAnalysis.thrusterTier >= 2 ? 'bg-green-500/10 text-green-300 border border-green-500/25' : 'bg-slate-800 text-slate-400'}`}>
                    T{genomeAnalysis.thrusterTier >= 2 ? '2' : '1'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-cyan-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Cell Size Phenotype</span>
                    <span className="text-xs font-bold text-slate-200">
                      {genomeAnalysis.sizeTier === 0 ? '🟢 Miniature (35% Smaller)' : genomeAnalysis.sizeTier === 2 ? '🔴 Giant (Harder to Dodge)' : 'Standard (Normal)'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${genomeAnalysis.sizeTier === 0 ? 'bg-green-500/10 text-green-300 border border-green-500/25' : 'bg-slate-800 text-slate-400'}`}>
                    {genomeAnalysis.sizeTier === 0 ? 'Tiny' : 'Standard'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-cyan-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Outer Protein Capsid</span>
                    <span className="text-xs font-bold text-slate-200">
                      {genomeAnalysis.shieldTier >= 1 ? '🛡️ Disulfide Shield Active' : '❌ Vulnerable / Unshielded'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${genomeAnalysis.shieldTier >= 1 ? 'bg-green-500/10 text-green-300 border border-green-500/25' : 'bg-slate-800 text-slate-400'}`}>
                    {genomeAnalysis.shieldTier >= 1 ? 'Protected' : 'Offline'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-cyan-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Base Receptor Magnet</span>
                    <span className="text-xs font-bold text-slate-200">
                      {genomeAnalysis.magnetTier >= 1 ? '🧲 Electrostatic Pull Active' : '❌ Standard Attraction'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${genomeAnalysis.magnetTier >= 1 ? 'bg-green-500/10 text-green-300 border border-green-500/25' : 'bg-slate-800 text-slate-400'}`}>
                    {genomeAnalysis.magnetTier >= 1 ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Gene Selector */}
            <div className="bg-slate-950/50 border border-cyan-500/10 rounded-xl p-5 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-3 font-display">Select Target Gene</h3>
              <div className="space-y-2">
                {genes.map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGeneId(g.id);
                      setEditingIndex(null);
                      setActionType(null);
                      setErrorMsg(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedGeneId === g.id
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white glow-cyan'
                        : 'bg-slate-900/30 border-cyan-500/5 text-slate-300 hover:bg-cyan-500/5 hover:border-cyan-500/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm block">{g.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-500/10">{g.activeSequence.length} bp</span>
                    </div>
                    <span className="text-xs text-slate-400 line-clamp-1 mt-1">{g.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Gene Sandbox Visualizer & Mutation Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* DNA Viewer / Sandbox */}
            <div className="bg-slate-950/50 border border-cyan-500/10 rounded-xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-bl-full" />
              <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4 mb-4 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Interactive CRISPR Target</h3>
                  <p className="text-xs text-slate-400">Perform selective molecular slicing and substitution.</p>
                </div>
                <button
                  onClick={() => handleResetGene(selectedGene.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-cyan-500/15 hover:border-cyan-500/35 rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restore WT Gene
                </button>
              </div>

              {/* Render the DNA sequence */}
              <div className="relative z-10">
                <DNAVisualizer genes={[selectedGene]} highlightGeneId={selectedGene.id} />
              </div>

              {/* Interactive Mutation Editor Controls */}
              <div className="mt-6 border-t border-cyan-500/10 pt-6 space-y-4 relative z-10">
                <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 font-display">
                  <Edit3 className="w-4 h-4" /> Real-time Editing Console
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Select Mutation Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium block">Mutation Category</label>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          setActionType('point');
                          setEditingIndex(0);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg border font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          actionType === 'point'
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-md'
                            : 'bg-slate-900/60 border-cyan-500/5 text-slate-400 hover:bg-cyan-500/5'
                        }`}
                      >
                        <span>Point Swap (Substitution)</span>
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      </button>
                      <button
                        onClick={() => {
                          setActionType('insert');
                          setEditingIndex(0);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg border font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          actionType === 'insert'
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-md'
                            : 'bg-slate-900/60 border-cyan-500/5 text-slate-400 hover:bg-cyan-500/5'
                        }`}
                      >
                        <span>Insertion (Add Base)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </button>
                      <button
                        onClick={() => {
                          setActionType('delete');
                          setEditingIndex(0);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg border font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          actionType === 'delete'
                            ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-md'
                            : 'bg-slate-900/60 border-cyan-500/5 text-slate-400 hover:bg-cyan-500/5'
                        }`}
                      >
                        <span>Deletion (Remove Base)</span>
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Select Base Index and Base */}
                  {actionType && (
                    <>
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
                        <label className="text-xs text-slate-400 font-medium block">Target Locus (BP Index)</label>
                        <select
                          value={editingIndex !== null ? editingIndex : 0}
                          onChange={(e) => setEditingIndex(parseInt(e.target.value))}
                          className="w-full bg-slate-950 border border-cyan-500/15 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/45"
                        >
                          {Array.from(selectedGene.activeSequence).map((_, idx) => (
                            <option key={idx} value={idx}>
                              BP #{idx + 1} ({selectedGene.activeSequence[idx]})
                            </option>
                          ))}
                          {actionType === 'insert' && (
                            <option value={selectedGene.activeSequence.length}>
                              Post-BP #{selectedGene.activeSequence.length}
                            </option>
                          )}
                        </select>

                        {actionType !== 'delete' && (
                          <div className="pt-2">
                            <label className="text-xs text-slate-400 font-medium block mb-1">Injected Nucleotide</label>
                            <div className="grid grid-cols-4 gap-1 font-mono">
                              {(['A', 'T', 'C', 'G'] as Nucleotide[]).map(base => (
                                <button
                                  key={base}
                                  onClick={() => setSelectedBase(base)}
                                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                    selectedBase === base
                                      ? 'bg-cyan-600 border-cyan-500 text-white shadow-md glow-cyan'
                                      : 'bg-slate-950 border-cyan-500/10 text-slate-400 hover:text-white hover:bg-slate-900'
                                  }`}
                                >
                                  {base}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Action and educational explanation */}
                      <div className="flex flex-col justify-between space-y-2 animate-in fade-in slide-in-from-left-2 duration-150">
                        <div className="text-[11px] text-slate-400 bg-slate-950/90 p-3 rounded-lg border border-cyan-500/10">
                          {actionType === 'point' && (
                            <p>
                              Swaps Base #{editingIndex !== null ? editingIndex + 1 : 1} with <strong>{selectedBase}</strong>. 
                              This is a Point Mutation which affects only 1 amino acid. Can be silent or missense.
                            </p>
                          )}
                          {actionType === 'insert' && (
                            <p>
                              Inserts <strong>{selectedBase}</strong> before Base #{editingIndex !== null ? editingIndex + 1 : 1}. 
                              This shifts the downstream genetic reading frame, causing a <strong>frameshift mutation</strong>.
                            </p>
                          )}
                          {actionType === 'delete' && (
                            <p>
                              Deletes Base #{editingIndex !== null ? editingIndex + 1 : 1}. This pulls all subsequent bases back 
                              and causes a <strong>frameshift mutation</strong>, fully scrambling protein synthesis.
                            </p>
                          )}
                        </div>

                        {errorMsg && (
                          <p className="text-rose-400 text-[11px] font-mono flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            {errorMsg}
                          </p>
                        )}

                        <button
                          onClick={applyMutation}
                          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-lg transition-all shadow-md shadow-cyan-600/15 cursor-pointer glow-cyan"
                        >
                          Apply Mutation to DNA
                        </button>
                      </div>
                    </>
                  )}

                  {!actionType && (
                    <div className="md:col-span-2 flex flex-col items-center justify-center border border-dashed border-cyan-500/10 rounded-lg p-6 text-center text-slate-500 bg-slate-950/20">
                      <HelpCircle className="w-8 h-8 text-cyan-500/20 mb-2 animate-pulse" />
                      <p className="text-xs font-sans">Choose a Mutation Category on the left to activate the gene-editing workbench console.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Biological Engineering Recipes / Goals */}
            <div className="bg-slate-950/50 border border-cyan-500/10 rounded-xl p-6 shadow-lg relative overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Genetic Engineering Blueprint Goals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {engineeringGoals.map((goal, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border transition-all relative ${
                      goal.completed
                        ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-100 glow-indigo'
                        : 'bg-slate-900/40 border-cyan-500/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5 font-display">
                        <span>{goal.title}</span>
                        {goal.completed && (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded uppercase tracking-wider">
                            completed
                          </span>
                        )}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{goal.description}</p>
                    <div className="mt-2.5 bg-slate-950 p-2 rounded border border-cyan-500/5 text-[10px] font-sans">
                      <strong className="text-cyan-400 font-mono">Recipe:</strong> {goal.recipe}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EVOLUTIONARY MUTATIONS PASSIVES TAB */
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Description of store */}
          <div className="p-5 bg-cyan-950/20 border border-cyan-500/15 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none rounded-bl-full" />
            <div className="flex items-center gap-3 relative z-10">
              <TrendingUp className="w-8 h-8 text-cyan-400 animate-pulse flex-shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white font-display">Intracellular Evolutionary Engine</h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                  Harvest biological DNA fragments from active runs to catalyze permanent evolutionary improvements in your cell. These mutations provide critical passive advantages to navigate higher-difficulty genomic environments.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/20 px-4 py-2 rounded-lg glow-cyan relative z-10">
              <Dna className="w-5 h-5 text-cyan-400 animate-spin" />
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">DNA Fragments Balance</span>
                <span className="text-base font-black text-cyan-200 font-mono">{dnaFragments} helixes</span>
              </div>
            </div>
          </div>

          {purchaseSuccess && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold font-sans animate-bounce flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {purchaseSuccess}
            </div>
          )}

          {/* Grid of evolution upgrades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVOLUTION_MUTATIONS.map(m => {
              const currentLvl = mutationLevels[m.id] || 0;
              const isMaxed = currentLvl >= m.maxLevel;
              const nextUpgradeCost = m.cost * (currentLvl + 1);
              const canAfford = dnaFragments >= nextUpgradeCost;

              return (
                <div 
                  key={m.id} 
                  className={`bg-slate-950/50 border rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between transition-all geometric-corner-box ${
                    currentLvl > 0 ? 'border-cyan-500/20 bg-slate-950/70 glow-indigo' : 'border-cyan-500/10'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none rounded-bl-full" />
                  
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between mb-3 relative z-10">
                      <div className="p-2 bg-slate-900 border border-cyan-500/15 rounded-lg">
                        {getMutationIcon(m.id)}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase">
                          Tier Progress
                        </span>
                        <div className="flex gap-1 mt-1 justify-end">
                          {Array.from({ length: m.maxLevel }).map((_, i) => (
                            <span 
                              key={i} 
                              className={`w-3.5 h-1.5 rounded-sm transition-all ${
                                i < currentLvl 
                                  ? 'bg-cyan-500 shadow-sm shadow-cyan-400/40' 
                                  : 'bg-slate-800 border border-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white font-display mb-1 relative z-10">
                      {m.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed relative z-10">
                      {m.description}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="mt-4 border-t border-cyan-500/10 pt-4 relative z-10">
                    <div className="bg-slate-900/60 p-2.5 rounded border border-cyan-500/5 text-[11px] mb-4">
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px] mb-0.5">Active Bonus Effect</span>
                      <span className="text-cyan-200 font-mono">
                        {m.effectDescription} 
                        {currentLvl > 0 ? (
                          <span className="text-emerald-400 font-bold ml-1.5">(Currently Level {currentLvl})</span>
                        ) : (
                          <span className="text-slate-500 font-medium ml-1.5">(Unpurchased)</span>
                        )}
                      </span>
                    </div>

                    {isMaxed ? (
                      <div className="w-full py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-lg flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                        MAX EVOLUTION UNLOCKED
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEvolveMutation(m, currentLvl)}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg glow-cyan border border-cyan-400/20 active:scale-95'
                            : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <Dna className="w-3.5 h-3.5" />
                        Evolve to Tier {currentLvl + 1}
                        <span className="font-mono text-[10px] ml-1 bg-black/20 px-2 py-0.5 rounded text-cyan-300">
                          Cost: {nextUpgradeCost} DNA
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
