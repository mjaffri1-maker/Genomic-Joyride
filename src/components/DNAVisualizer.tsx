import React, { useState } from 'react';
import { translateDNA, Gene } from '../types';
import { Sparkles, AlertTriangle, ArrowRight, BookOpen, Info } from 'lucide-react';

interface DNAVisualizerProps {
  genes: Gene[];
  highlightGeneId?: string;
  className?: string;
  isTranslatingAnimated?: boolean;
}

export default function DNAVisualizer({
  genes,
  highlightGeneId,
  className = '',
  isTranslatingAnimated = false
}: DNAVisualizerProps) {

  // Color mapping for nucleotides
  const getBaseColor = (base: string) => {
    switch (base.toUpperCase()) {
      case 'A': return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300';
      case 'T': return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      case 'C': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
      case 'G': return 'bg-rose-500/20 border-rose-500/50 text-rose-300';
      default: return 'bg-slate-700/20 border-slate-700/50 text-slate-400';
    }
  };

  const getBaseDotColor = (base: string) => {
    switch (base.toUpperCase()) {
      case 'A': return 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]';
      case 'T': return 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
      case 'C': return 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
      case 'G': return 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
      default: return 'bg-slate-500';
    }
  };

  // Complementary DNA base pairing
  const getComplement = (base: string) => {
    switch (base.toUpperCase()) {
      case 'A': return 'T';
      case 'T': return 'A';
      case 'C': return 'G';
      case 'G': return 'C';
      default: return 'N';
    }
  };

  // Complementary RNA base pairing for transcription
  const getRNAComplement = (base: string) => {
    switch (base.toUpperCase()) {
      case 'A': return 'U'; // Adenine transcribed to Uracil
      case 'T': return 'A'; // Thymine transcribed to Adenine
      case 'C': return 'G'; // Cytosine transcribed to Guanine
      case 'G': return 'C'; // Guanine transcribed to Cytosine
      default: return 'N';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {genes.map(gene => {
        const codons = translateDNA(gene.activeSequence);
        const originalCodons = translateDNA(gene.defaultSequence);
        const isGeneMutated = gene.activeSequence !== gene.defaultSequence;
        const isFocused = highlightGeneId === gene.id;

        // Check if gene has stop codon before the end
        const firstStopIndex = codons.findIndex(c => c.property === 'Stop');
        const isTruncated = firstStopIndex !== -1 && firstStopIndex < codons.length - 1;

        // Check for frameshift: length not a multiple of 3
        const isFrameshift = gene.activeSequence.length % 3 !== 0;

        return (
          <div
            key={gene.id}
            className={`p-4 rounded-xl border transition-all ${
              isFocused
                ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-[1.01]'
                : isGeneMutated
                ? 'bg-slate-900/80 border-slate-700/60'
                : 'bg-slate-950/40 border-slate-800/80'
            }`}
          >
            {/* Header: Name, Mutation Tag */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>{gene.name}</span>
                  {isGeneMutated && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> mutated
                    </span>
                  )}
                  {isFrameshift && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> frameshift
                    </span>
                  )}
                  {isTruncated && (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-red-500/10 text-red-300 border border-red-500/20 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> premature stop
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">{gene.description}</p>
              </div>
              <div className="text-[11px] font-mono text-gray-500">
                Size: {gene.activeSequence.length} bp
              </div>
            </div>

            {/* The Molecular DNA Helix Visualizer */}
            <div className="relative py-4 px-2 my-3 overflow-x-auto bg-slate-950/60 rounded-xl border border-slate-800 scrollbar-thin">
              <div className="flex gap-4 min-w-[max-content] select-none">
                {Array.from(gene.activeSequence).map((base, idx) => {
                  const baseNum = idx + 1;
                  const codonIndex = Math.floor(idx / 3);
                  const baseInCodonPos = idx % 3;
                  const originalBase = gene.defaultSequence[idx];
                  const isBaseMutated = originalBase !== undefined && originalBase !== base;

                  const colorClass = getBaseColor(base);
                  const dotColor = getBaseDotColor(base);

                  return (
                    <div key={idx} className="flex flex-col items-center relative">
                      {/* Base ID number */}
                      <span className="text-[9px] font-mono text-slate-500 mb-1">{baseNum}</span>

                      {/* Coding Strand (DNA 5' -> 3') */}
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold font-mono text-xs transition-all ${colorClass} ${
                          isBaseMutated ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-900 scale-105' : ''
                        }`}
                        title={`Base ${baseNum}: ${base}`}
                      >
                        {base}
                      </div>

                      {/* Hydrogen bonds lines (vertical connecting line) */}
                      <div className="h-4 w-0.5 bg-slate-700/60 flex items-center justify-center my-0.5 relative">
                        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                      </div>

                      {/* Template Strand (DNA 3' -> 5' Complement) */}
                      <div className="w-8 h-8 rounded-lg border border-dashed border-slate-800 bg-slate-900/40 text-slate-500 flex items-center justify-center font-mono text-xs select-none">
                        {getComplement(base)}
                      </div>

                      {/* Transcriptional mRNA indicator line (below) */}
                      <div className="h-3 w-0.5 bg-indigo-500/10 my-0.5"></div>
                      <div className={`w-8 h-5 bg-indigo-950/20 border rounded flex items-center justify-center font-mono text-[10px] relative ${
                        baseInCodonPos === 2 
                          ? 'border-purple-500/40 text-purple-300 shadow-[0_0_6px_rgba(168,85,247,0.25)] font-bold' 
                          : 'border-indigo-500/10 text-indigo-400'
                      }`} title={baseInCodonPos === 2 ? 'Wobble Position (3rd Base of Codon)' : undefined}>
                        {getRNAComplement(base)}
                        {baseInCodonPos === 2 && (
                          <span className="absolute top-0 right-0 w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
                        )}
                      </div>

                      {/* Codon boundary line */}
                      {baseInCodonPos === 2 && idx < gene.activeSequence.length - 1 && (
                        <div className="absolute right-[-9px] top-4 bottom-5 border-r border-dashed border-slate-800"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Translation (mRNA -> Ribosome -> Polypeptide) */}
            <div className="mt-3 flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">Ribosome Translation</span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {codons.map((c, idx) => {
                  const isMutatedCodon =
                    originalCodons[idx] === undefined ||
                    originalCodons[idx].codon !== c.codon;

                  const isSilenced = idx > firstStopIndex && firstStopIndex !== -1;

                  let propertyColor = 'text-cyan-300';
                  if (c.property === 'Stop') propertyColor = 'text-red-400 font-bold bg-red-500/10 px-1 rounded';
                  else if (c.property === 'Start') propertyColor = 'text-green-400 font-bold bg-green-500/10 px-1 rounded';
                  else if (c.property === 'Acidic') propertyColor = 'text-rose-400';
                  else if (c.property === 'Basic') propertyColor = 'text-sky-400';

                  return (
                    <React.Fragment key={idx}>
                      <div
                        className={`flex flex-col items-center px-1.5 py-1 rounded border font-mono text-[11px] ${
                          isSilenced
                            ? 'bg-slate-950/20 border-slate-900 text-slate-600 line-through'
                            : isMutatedCodon
                            ? 'bg-amber-500/5 border-amber-500/20 text-amber-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-[9px] text-slate-500 font-bold">{c.codon}</span>
                        <span className={isSilenced ? 'text-slate-600' : propertyColor} title={c.fullName}>
                          {c.aminoAcid}
                        </span>
                      </div>
                      {idx < codons.length - 1 && <ArrowRight className="w-3 h-3 text-slate-700" />}
                    </React.Fragment>
                  );
                })}

                {isFrameshift && (
                  <>
                    <ArrowRight className="w-3 h-3 text-red-700" />
                    <span className="text-[11px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded">
                      [FRAMESHIFT]
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Codon & Wobble Hypothesis Diagram */}
            <div className="mt-4 bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between mb-3 border-b border-indigo-500/15 pb-2">
                <span className="font-extrabold text-indigo-300 font-sans tracking-wide uppercase flex items-center gap-1.5 text-[10px]">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Codon Wobble Hypothesis Guide
                </span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/10">
                  Molecular Mechanism
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Visual schematic of codon tRNA binding */}
                <div className="md:col-span-5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative min-h-[160px]">
                  
                  {/* tRNA block */}
                  <div className="bg-pink-950/30 border border-pink-500/30 px-3 py-1.5 rounded-lg text-center text-pink-300 font-bold mb-3 shadow-lg shadow-pink-500/5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
                    <span>tRNA (Phenylalanine)</span>
                  </div>

                  {/* tRNA Anticodon strand (3' to 5') */}
                  <div className="flex gap-2 font-mono font-black text-xs text-pink-400">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-pink-500 font-bold">3'</span>
                      <div className="w-7 h-7 bg-pink-900/20 border border-pink-500/30 rounded flex items-center justify-center">A</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-pink-500 font-bold">Base 2</span>
                      <div className="w-7 h-7 bg-pink-900/20 border border-pink-500/30 rounded flex items-center justify-center">A</div>
                    </div>
                    <div className="flex flex-col items-center ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-950 rounded-lg">
                      <span className="text-[8px] text-purple-400 font-bold">5' (Wobble)</span>
                      <div className="w-7 h-7 bg-purple-950/40 border border-purple-500/50 rounded flex items-center justify-center text-purple-300">G</div>
                    </div>
                  </div>

                  {/* Hydrogen bonds lines (vertical connecting line) */}
                  <div className="flex gap-2 my-1 font-mono font-bold text-gray-500 tracking-widest text-[9px]">
                    <div className="w-7 text-center">⋮</div>
                    <div className="w-7 text-center">⋮</div>
                    <div className="w-7 text-center text-purple-400 animate-bounce">≈</div>
                  </div>

                  {/* mRNA Codon (5' to 3') */}
                  <div className="flex gap-2 font-mono font-black text-xs text-cyan-400">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 bg-cyan-950/40 border border-cyan-500/30 rounded flex items-center justify-center">U</div>
                      <span className="text-[8px] text-cyan-500 font-bold">5'</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 bg-cyan-950/40 border border-cyan-500/30 rounded flex items-center justify-center">U</div>
                      <span className="text-[8px] text-cyan-500 font-bold">Base 2</span>
                    </div>
                    <div className="flex flex-col items-center ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-950 rounded-lg bg-purple-950/20">
                      <div className="w-7 h-7 bg-purple-900/20 border border-purple-500/40 rounded flex items-center justify-center text-purple-300">C / U</div>
                      <span className="text-[8px] text-purple-400 font-bold">3' (Wobble)</span>
                    </div>
                  </div>

                  {/* mRNA line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mt-2"></div>
                  <span className="text-[9px] text-cyan-500 font-bold font-mono mt-0.5">mRNA Strand</span>

                </div>

                {/* Definition and Biochemical rules */}
                <div className="md:col-span-7 space-y-2 text-slate-300">
                  <h5 className="font-extrabold text-slate-200 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    What is a Codon & the Wobble Hypothesis?
                  </h5>
                  <p className="leading-relaxed text-[11px] text-slate-400">
                    A <strong>Codon</strong> is a triplet sequence of nucleotides on mRNA that encodes a single amino acid. 
                    Because there are 64 possible codon combinations but only 20 amino acids, the genetic code is <em>degenerate</em> (multiple codons code for the same amino acid).
                  </p>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[10.5px]">
                    <span className="font-bold text-purple-400 font-mono block mb-0.5">The Wobble Position (3rd Base)</span>
                    The <strong>Wobble Hypothesis</strong> (proposed by Francis Crick in 1966) states that base-pairing rules between the 3rd nucleotide of an mRNA codon and the 1st nucleotide of a tRNA anticodon are flexible or "loose". 
                    This allows a single tRNA anticodon (like GAA) to recognize and bind multiple mRNA codons (both <strong className="text-white">UUU</strong> and <strong className="text-white">UUC</strong>), speeding up translation and protecting the cell against point mutations in the third base.
                  </div>
                </div>
              </div>
            </div>

            {/* Phenotypic Effect Banner */}
            <div className="mt-3 flex items-start gap-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60 text-xs">
              <span className="font-bold text-gray-400 font-mono text-[10px] uppercase mt-0.5 tracking-wider bg-slate-800 px-1.5 py-0.5 rounded">Phenotype</span>
              <p className="text-gray-300 leading-relaxed font-sans">
                {gene.activeSequence === gene.defaultSequence ? (
                  <span className="text-gray-400 font-medium">{gene.expressedPhenotype}</span>
                ) : (
                  <span className="text-amber-300 font-medium">{gene.expressedPhenotype}</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
