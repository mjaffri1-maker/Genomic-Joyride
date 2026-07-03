import React, { useState } from 'react';
import { BookOpen, Dna, Settings, Sparkles, HelpCircle, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WikiSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function EducationalWiki() {
  const [activeTab, setActiveTab] = useState('central_dogma');

  const sections: WikiSection[] = [
    {
      id: 'central_dogma',
      title: 'The Central Dogma',
      icon: <Dna className="w-5 h-5 text-indigo-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            The flow of genetic information in cells moves from <strong>DNA</strong> to <strong>RNA</strong> to <strong>Protein</strong>. This fundamental process is known as the <strong>Central Dogma of Molecular Biology</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-indigo-500/20">
              <span className="text-xs font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">Step 1</span>
              <h4 className="text-lg font-bold text-indigo-300 mt-2">Replication & DNA</h4>
              <p className="text-sm text-gray-400 mt-1">
                DNA holds the master blueprint using four chemical bases: Adenine (A), Thymine (T), Cytosine (C), and Guanine (G).
              </p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-purple-500/20">
              <span className="text-xs font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">Step 2</span>
              <h4 className="text-lg font-bold text-purple-300 mt-2">Transcription</h4>
              <p className="text-sm text-gray-400 mt-1">
                The DNA sequence is copied (transcribed) into mobile single-stranded Messenger RNA (mRNA) templates in the nucleus.
              </p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-pink-500/20">
              <span className="text-xs font-mono px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded">Step 3</span>
              <h4 className="text-lg font-bold text-pink-300 mt-2">Translation</h4>
              <p className="text-sm text-gray-400 mt-1">
                Ribosomes read mRNA in groups of three letters (called <strong>codons</strong>) to assemble amino acids into active protein molecules.
              </p>
            </div>
          </div>
          <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30">
            <h4 className="font-bold text-indigo-200 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              What are Codons?
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Because there are 4 genetic bases (A,T,C,G) and proteins use 20 different amino acids, bases are read in triplets. A 3-letter codon offers 4 × 4 × 4 = <strong>64 possible combinations</strong>, which is more than enough to encode all 20 amino acids. This creates a degenerate genetic code—multiple codons can translate into the same amino acid.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'mutation_types',
      title: 'Types of DNA Mutation',
      icon: <Settings className="w-5 h-5 text-amber-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            Mutations are permanent alterations in the nucleotide sequence of an organism's genome. In our game, you encounter these direct mutagenic processes in real-time:
          </p>
          <div className="space-y-3 mt-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-amber-500/30 transition-all">
              <h4 className="font-bold text-amber-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                1. Substitution (Point Mutation)
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                A single base is swapped for another (e.g., swapping C for T). This changes exactly one codon without affecting the rest of the genetic sequence.
              </p>
              <div className="mt-2 bg-slate-900/60 p-2 rounded text-xs font-mono text-gray-400 flex items-center gap-3">
                <span>Before: ATG <span className="text-blue-400 font-bold">C</span>CC AAA</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
                <span>After: ATG <span className="text-amber-400 font-bold">T</span>CC AAA</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-emerald-500/30 transition-all">
              <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                2. Insertion (Frameshift Mutation)
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                Adding an extra nucleotide shifts the entire downstream reading frame. Every single codon downstream of this point is shifted, creating completely different amino acids and often leading to early termination.
              </p>
              <div className="mt-2 bg-slate-900/60 p-2 rounded text-xs font-mono text-gray-400 flex items-center gap-3">
                <span>Before: ATG CCC AAA (Met - Pro - Lys)</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span>After: ATG C<span className="text-emerald-400 font-bold">A</span>C CCA AA... (Met - His - Pro...)</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-rose-500/30 transition-all">
              <h4 className="font-bold text-rose-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                3. Deletion (Frameshift Mutation)
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                Removing a single nucleotide deletes a base and pulls all subsequent bases back. This is another form of a <strong>frameshift</strong>, which scrambled proteins and typically turns downstream genes completely non-functional.
              </p>
              <div className="mt-2 bg-slate-900/60 p-2 rounded text-xs font-mono text-gray-400 flex items-center gap-3">
                <span>Before: ATG CCC AAA (Met - Pro - Lys)</span>
                <ArrowRight className="w-3 h-3 text-rose-400" />
                <span>After: ATG CCA AA... (Met - Pro - ??)</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-violet-500/30 transition-all">
              <h4 className="font-bold text-violet-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
                4. Duplication
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                An entire codon or set of bases is copied twice. This inserts duplicate amino acids without breaking the reading frame. In evolution, duplication allows organisms to keep a backup gene while mutating the duplicate to find new traits!
              </p>
              <div className="mt-2 bg-slate-900/60 p-2 rounded text-xs font-mono text-gray-400 flex items-center gap-3">
                <span>Before: ATG CCC AAA</span>
                <ArrowRight className="w-3 h-3 text-violet-400" />
                <span>After: ATG CCC <span className="text-violet-400 font-bold">CCC</span> AAA</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'mutation_consequences',
      title: 'Consequences of Mutation',
      icon: <HelpCircle className="w-5 h-5 text-rose-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            The phenotypic effect of a mutation depends on how it modifies the translated polypeptide sequence:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-emerald-500/20">
              <h5 className="font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Silent Mutation
              </h5>
              <p className="text-xs text-gray-400 mt-1">
                Due to codon degeneracy, the mutated codon still codes for the <strong>same amino acid</strong>. No visible change in the resulting protein or gameplay phenotype!
              </p>
              <p className="text-xs font-mono text-gray-500 mt-2 bg-slate-950/40 p-1 rounded">
                GCT (Ala) ➔ GCC (Ala)
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-blue-500/20">
              <h5 className="font-bold text-blue-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Missense Mutation
              </h5>
              <p className="text-xs text-gray-400 mt-1">
                The single base change results in a <strong>different amino acid</strong>. This may slightly modify or drastically change the protein structure, upgrading/downgrading your jetpack speed or magnet range!
              </p>
              <p className="text-xs font-mono text-gray-500 mt-2 bg-slate-950/40 p-1 rounded">
                GCT (Ala) ➔ GTT (Val)
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-red-500/20">
              <h5 className="font-bold text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Nonsense Mutation
              </h5>
              <p className="text-xs text-gray-400 mt-1">
                The mutation swaps a base and creates an early <strong>Stop Codon</strong> (TAA, TAG, or TGA). This halts transcription, cutting off the protein, often rendering active biological traits fully inactive!
              </p>
              <p className="text-xs font-mono text-gray-500 mt-2 bg-slate-950/40 p-1 rounded">
                AAG (Lys) ➔ TAG (STOP)
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-orange-500/20">
              <h5 className="font-bold text-orange-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" /> Frameshift
              </h5>
              <p className="text-xs text-gray-400 mt-1">
                Caused by additions or deletions not divisible by three. It fully scrambles the genetic downstream reading frame. Every subsequent amino acid is translated incorrectly, often causing absolute loss of function.
              </p>
              <p className="text-xs font-mono text-gray-500 mt-2 bg-slate-950/40 p-1 rounded">
                ATG CCC AAA ➔ ATG CCA AA...
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'genomic_obstacles',
      title: 'Genomic Threats',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-400" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-300 leading-relaxed text-sm">
            While navigating through the cell environments, your engineered genome faces molecular obstacles inspired by actual intracellular defense and mutation mechanisms. Review their structures below to understand their biochemical effects:
          </p>
          <div className="space-y-4 mt-4">
            {/* 1. Restriction Enzymes */}
            <div className="bg-slate-800/25 border border-slate-700/40 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Info Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-slate-900 rounded-lg">✂️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-100 text-sm">Restriction Enzymes (Endonucleases)</h5>
                      <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-mono font-bold">DNA Double-Strand Cutters</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Proteins that bind to highly specific palindromic DNA sequences (e.g., EcoRI targets 5'-GAATTC-3') and catalyze phosphodiester bond cleavage on both strands.
                  </p>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-red-400">
                      <span className="font-bold">⚠️ IN-GAME EFFECT</span>
                      <span className="bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 font-mono">-25% Health</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      If these fast-moving red scissor probes touch your sequence, they slice the backbone. Build a <strong>Glycoprotein Shield</strong> to block cuts!
                    </p>
                  </div>
                </div>

                {/* Diagram Column */}
                <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between font-mono text-[10px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-slate-400 font-bold text-[9px]">MOLECULAR SCHEMATIC: Double-Strand Cleavage</span>
                    <span className="text-red-400 font-bold text-[9px] animate-pulse">CLEAVED BACKBONE</span>
                  </div>

                  <div className="space-y-3 py-1.5 select-none overflow-x-auto">
                    {/* Top Strand with Cut indicator */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-indigo-400 font-bold text-[9px] w-6">5'--</span>
                        <span className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 font-bold text-slate-200">G</span>
                        <span className="text-red-400 font-bold font-sans animate-pulse">✂️</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">A</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">A</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">T</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">T</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">C</span>
                        <span className="text-indigo-400 font-bold text-[9px] ml-1">--3'</span>
                        <span className="text-slate-500 text-[8px] italic ml-auto">(EcoRI Site)</span>
                      </div>
                      <div className="flex pl-10 text-slate-600 gap-1 text-[8px] h-3">
                        <span>|</span>
                        <span className="ml-5">|</span>
                        <span className="ml-3">|</span>
                        <span className="ml-3">|</span>
                        <span className="ml-3">|</span>
                      </div>
                    </div>

                    {/* Cleavage line */}
                    <div className="h-px bg-dashed bg-gradient-to-r from-indigo-500/5 via-red-500/40 to-indigo-500/5 my-1" />

                    {/* Bottom Strand with Cut indicator */}
                    <div className="flex flex-col">
                      <div className="flex pl-10 text-slate-600 gap-1 text-[8px] h-3">
                        <span>|</span>
                        <span className="ml-5">|</span>
                        <span className="ml-3">|</span>
                        <span className="ml-3">|</span>
                        <span className="ml-3">|</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-indigo-400 font-bold text-[9px] w-6">3'--</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">C</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">T</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">T</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">A</span>
                        <span className="text-slate-500">-</span>
                        <span className="bg-red-950/40 px-1 py-0.5 rounded border border-red-500/30 font-bold text-red-300">A</span>
                        <span className="text-red-400 font-bold font-sans animate-pulse">✂️</span>
                        <span className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 font-bold text-slate-200">G</span>
                        <span className="text-indigo-400 font-bold text-[9px] ml-1">--5'</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800/80 rounded p-1.5 text-[9px] text-slate-400">
                    <span className="text-red-300 font-bold block mb-0.5">Mechanistic Cleavage Result: "Sticky Ends"</span>
                    Staggered cutting results in short single-stranded overhangs ready for hydrogen bond annealing. Extremely dangerous to genomic integrity of running DNA strands!
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Stop Codons */}
            <div className="bg-slate-800/25 border border-slate-700/40 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Info Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-slate-900 rounded-lg">🛑</span>
                    <div>
                      <h5 className="font-extrabold text-slate-100 text-sm">Stop Codons (Terminators)</h5>
                      <span className="text-[10px] uppercase tracking-wider text-rose-400 font-mono font-bold">Translation Termination Signals</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Specific triplet combinations (UAA, UAG, UGA) that do not code for any amino acid. They recruit <strong>Release Factors</strong> to dissolve the active translation complex.
                  </p>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-rose-400">
                      <span className="font-bold">⚠️ IN-GAME EFFECT</span>
                      <span className="bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">Immediate Stun & Speed Reduction</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Large amber/red molecular stop-signs (TAA, TAG, TGA). Collision instantly stops protein synthesis, causing a massive propulsion penalty.
                    </p>
                  </div>
                </div>

                {/* Diagram Column */}
                <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between font-mono text-[10px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-slate-400 font-bold text-[9px]">MOLECULAR SCHEMATIC: Translation Halt</span>
                    <span className="text-rose-400 font-bold text-[9px]">RELEASE FACTOR DISSOCIATION</span>
                  </div>

                  <div className="py-2 flex flex-col items-center justify-center relative bg-slate-900/20 rounded-lg border border-slate-900">
                    {/* Ribosome Body */}
                    <div className="bg-slate-900/80 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-center font-bold text-indigo-300 text-[9px] w-48 mb-2 flex flex-col gap-0.5 shadow-md">
                      <span className="text-indigo-400 font-sans">Ribosomal Subunit (60S)</span>
                      <div className="flex justify-around border-t border-indigo-500/15 pt-1 mt-1 font-mono text-[8px] text-slate-400">
                        <span>P-Site [tRNA-Protein]</span>
                        <span className="text-rose-400 font-extrabold bg-rose-950/30 px-1 rounded animate-pulse">A-Site [RELEASE FACTOR]</span>
                      </div>
                    </div>

                    {/* Hydrolyzed polypeptide chain */}
                    <div className="absolute top-[-5px] right-[20%] flex flex-col items-center">
                      <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      </div>
                      <span className="text-[7px] text-cyan-400 font-bold font-sans">Polypeptide Released! ➔</span>
                    </div>

                    {/* mRNA layout */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[8px] text-slate-500">mRNA:</span>
                      <span className="text-slate-500">...-AAG-</span>
                      <span className="bg-rose-950/50 text-rose-400 font-extrabold border border-rose-500/30 px-1.5 py-0.5 rounded relative">
                        UAG
                        <span className="absolute top-[-3px] right-[-3px] w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      </span>
                      <span className="text-slate-500">-GCC-...</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800/80 rounded p-1.5 text-[9px] text-slate-400 mt-2">
                    <span className="text-rose-300 font-bold block mb-0.5">Biochemical Action: Termination Cascade</span>
                    Instead of incorporating an amino acid, the Release Factor (RF) promotes the transfer of the polypeptide to a water molecule rather than another tRNA, collapsing the ribosome.
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Methyl Groups */}
            <div className="bg-slate-800/25 border border-slate-700/40 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Info Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-slate-900 rounded-lg">🧪</span>
                    <div>
                      <h5 className="font-extrabold text-slate-100 text-sm">Methyl Groups (Epigenetic Tags)</h5>
                      <span className="text-[10px] uppercase tracking-wider text-purple-400 font-mono font-bold">DNA Methylation (5mC)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Chemical markers (primarily methyl groups, -CH₃) attached to CpG site Cytosines that recruit transcription blockers to tightly package DNA.
                  </p>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-purple-400">
                      <span className="font-bold">⚠️ IN-GAME EFFECT</span>
                      <span className="bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">Temporary Trait Lock</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Small purple biochemical clusters. Hitting them seals/locks your active adaptations (like shields or magnetic attraction) for 8 seconds.
                    </p>
                  </div>
                </div>

                {/* Diagram Column */}
                <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between font-mono text-[10px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-slate-400 font-bold text-[9px]">MOLECULAR SCHEMATIC: Chromatin Condensation</span>
                    <span className="text-purple-400 font-bold text-[9px]">TRANSCRIPTIONAL SILENCING</span>
                  </div>

                  <div className="py-2 flex flex-col items-center justify-center space-y-2">
                    {/* Methyl tag on DNA base */}
                    <div className="flex items-center gap-2">
                      {/* Methyl tag */}
                      <div className="bg-purple-950/60 border border-purple-500/50 rounded-lg px-2 py-0.5 text-purple-300 font-extrabold text-[8px] animate-bounce">
                        Epigenetic Tag: -CH₃ (Methyl)
                      </div>
                    </div>

                    {/* DNA sequence showing methylation at C base */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex gap-1 items-center bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[9px]">
                        <span className="text-slate-500">5'-A-T-G-</span>
                        <span className="bg-purple-950/40 text-purple-300 font-bold px-1.5 rounded ring-1 ring-purple-500/40 relative">
                          C
                          <span className="absolute bottom-[-1px] right-[1px] w-1 h-1 rounded-full bg-purple-400" />
                        </span>
                        <span className="text-slate-500">-G-A-3'</span>
                      </div>
                      <div className="text-slate-600 text-[8px]">CpG Island Methylation Blocked</div>
                      <div className="text-red-400 font-extrabold text-[8px] bg-red-950/20 border border-red-500/20 px-2 py-0.5 rounded font-sans">
                        🚫 RNA Polymerase Cannot Bind
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800/80 rounded p-1.5 text-[9px] text-slate-400 mt-2">
                    <span className="text-purple-300 font-bold block mb-0.5">Biochemical Action: Steric Hindrance</span>
                    Methyl groups project into the major groove of the DNA double helix. This physically blocks transcription factor proteins and silences the underlying gene.
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Free Radicals / UV Rays */}
            <div className="bg-slate-800/25 border border-slate-700/40 rounded-xl overflow-hidden shadow-lg hover:border-indigo-500/30 transition-all p-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Info Column */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 bg-slate-900 rounded-lg">⚛️</span>
                    <div>
                      <h5 className="font-extrabold text-slate-100 text-sm">Free Radicals & UV Radiation</h5>
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-mono font-bold">Environmental Mutagens</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Electromagnetic UV photons excite adjacent Thymines, inducing direct covalent linkages that warp the structural integrity of the DNA helix.
                  </p>
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-amber-400">
                      <span className="font-bold">⚠️ IN-GAME EFFECT</span>
                      <span className="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">Spontaneous Mutation Event</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      High-energy blue/purple zones. Entering them triggers instant base changes (point mutations, insertions, or deletions), forcing quick survival maneuvers!
                    </p>
                  </div>
                </div>

                {/* Diagram Column */}
                <div className="lg:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between font-mono text-[10px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-slate-400 font-bold text-[9px]">MOLECULAR SCHEMATIC: Pyrimidine Dimerization</span>
                    <span className="text-amber-400 font-bold text-[9px] animate-pulse">PHOTOPRODUCT BULGE</span>
                  </div>

                  <div className="py-2 flex flex-col items-center justify-center space-y-2">
                    {/* UV Rays Incoming */}
                    <div className="flex gap-2 items-center text-[8px] font-bold text-amber-400 animate-pulse font-sans">
                      <span>⚡ UV Photon (hν)</span>
                      <span>➔</span>
                      <span className="bg-amber-950/50 border border-amber-500/30 px-1.5 py-0.2 rounded">Excitation</span>
                    </div>

                    {/* Dimer DNA visual */}
                    <div className="flex flex-col items-center bg-slate-900 p-2 rounded border border-slate-800 text-[9px] space-y-1">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-slate-500">5'-G-</span>
                        <span className="bg-amber-950/40 text-amber-300 font-extrabold px-1.5 rounded border border-amber-500/40 flex gap-0.5 ring-1 ring-amber-500/30">
                          T <span className="text-amber-500 animate-ping">═</span> T
                        </span>
                        <span className="text-slate-500">-C-G-3'</span>
                        <span className="text-[7.5px] text-red-400 font-bold font-sans italic pl-1">(Backbone Kink!)</span>
                      </div>
                      <div className="text-[7px] text-slate-600">   |   x x   |   |</div>
                      <div className="text-[8px] text-slate-500">3'-C-  A  A  -G-C-5'</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800/80 rounded p-1.5 text-[9px] text-slate-400 mt-2">
                    <span className="text-amber-300 font-bold block mb-0.5">Biochemical Action: Cyclobutane Ring</span>
                    UV light creates covalent bonds between adjacent Thymines. This forms a cyclobutane ring, distorting the double helix, causing DNA Polymerase errors.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const activeSection = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-2xl max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <BookOpen className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-2xl font-bold font-sans text-white tracking-tight">Genomic Library</h2>
          <p className="text-xs text-gray-400">Discover the biology behind mutations, proteins, and molecular genetics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Tab Buttons */}
        <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none border-b md:border-b-0 border-slate-800">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap min-w-[150px] md:min-w-0 ${
                activeTab === sec.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
              }`}
            >
              {sec.icon}
              <span className="truncate">{sec.title}</span>
            </button>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="md:col-span-3 min-h-[350px] bg-slate-950/40 border border-slate-800/80 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                {activeSection.icon}
                {activeSection.title}
              </h3>
              {activeSection.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
