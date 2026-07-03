export type Nucleotide = 'A' | 'T' | 'C' | 'G';

export enum MutationType {
  POINT = 'POINT',         // Substitution of a single base
  INSERTION = 'INSERTION', // Insertion of a single base (causes frameshift)
  DELETION = 'DELETION',   // Deletion of a single base (causes frameshift)
  DUPLICATION = 'DUPLICATION', // Duplication of a codon
  INVERSION = 'INVERSION'  // Inverting a short sequence of bases
}

export interface CodonTranslation {
  codon: string;
  aminoAcid: string;
  fullName: string;
  property: 'Hydrophobic' | 'Hydrophilic' | 'Acidic' | 'Basic' | 'Start' | 'Stop' | 'Special';
}

export interface Gene {
  id: string;
  name: string;
  description: string;
  defaultSequence: string; // The original wild-type DNA sequence
  activeSequence: string;  // The current mutated DNA sequence
  expressedPhenotype: string; // Describe the visual/gameplay effect
  abilityType: 'thruster' | 'size' | 'shield' | 'magnet' | 'blast';
  tier: number; // E.g., level of the ability
}

export interface PlayerStats {
  score: number;
  distance: number;
  nucleotidesCollected: {
    A: number;
    T: number;
    C: number;
    G: number;
  };
  mutationsEncountered: number;
  maxDistance: number;
}

export type GameZone = 'Cytoplasm' | 'Transcription' | 'Nucleus' | 'Ribosome' | 'Mitochondria' | 'Extracellular';

export interface GameZoneConfig {
  name: GameZone;
  bgGradient: string;
  obstacleTypes: string[];
  description: string;
  requiredDistance: number;
}

export interface EvolutionMutation {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  effectDescription: string;
}

export const EVOLUTION_MUTATIONS: EvolutionMutation[] = [
  {
    id: 'metabolic_speed',
    name: 'Metabolic Accelerant',
    description: 'Enhances ATP catalytic rate to supercharge membrane motors. Accelerates vertical thruster speed and overall cell agility.',
    cost: 15,
    maxLevel: 3,
    effectDescription: '+20% thruster power and speed responsiveness per level.'
  },
  {
    id: 'glycoprotein_hardening',
    name: 'Glycoprotein Hardening',
    description: 'Forms structural matrix bounds of carbon coat, starting the runner with an extra shield charge that recharges when advancing zones.',
    cost: 20,
    maxLevel: 3,
    effectDescription: 'Grants 1 starting shield charge. Levels II & III reduce shield break stun.'
  },
  {
    id: 'epigenetic_bypass',
    name: 'Epigenetic Desensitization',
    description: 'Insulates the expression pathways from methyl tag silencing and epigenetic lockouts.',
    cost: 12,
    maxLevel: 2,
    effectDescription: 'Reduces methyl-group silencing duration by 60% (Level I) or grants complete immunity (Level II).'
  },
  {
    id: 'magnetic_amp',
    name: 'Ligand Magnetic Super-Amplifier',
    description: 'Synthesizes highly-charged positive receptors that create an electrostatic vacuum pulling nucleotides from afar.',
    cost: 10,
    maxLevel: 3,
    effectDescription: 'Increases attraction area radius by +120px per level.'
  },
  {
    id: 'ribosome_regen',
    name: 'Ribosomal Ribose Regeneration',
    description: 'Channels incoming single nucleotides to rebuild damaged peptide sequences in real-time, restoring cell integrity.',
    cost: 18,
    maxLevel: 2,
    effectDescription: 'Regenerates +2 HP (Level I) or +4 HP (Level II) for every nucleotide base pair collected.'
  },
  {
    id: 'polymerase_shift',
    name: 'Polymerase Phase Shift',
    description: 'Allows temporary molecular phasing through bulky cellular obstacles like heavy transcription complexes.',
    cost: 25,
    maxLevel: 2,
    effectDescription: 'Provides 25% (Level I) or 50% (Level II) passive chance to phase through RNA Polymerase and Restriction Enzyme blocks unharmed.'
  }
];

export const GAME_ZONES: GameZoneConfig[] = [
  {
    name: 'Cytoplasm',
    bgGradient: 'from-slate-900 via-indigo-950 to-blue-950',
    obstacleTypes: ['HISTONE', 'STOP_CODON', 'FREE_RADICAL'],
    description: 'The fluid-filled arena of the cell. Watch out for histone packaging proteins, termination signals, and erratic free radicals!',
    requiredDistance: 1000
  },
  {
    name: 'Transcription',
    bgGradient: 'from-blue-950 via-cyan-950 to-slate-950',
    obstacleTypes: ['RNA_POLYMERASE', 'SPLICING_SPLICEOSOME', 'STOP_CODON', 'FREE_RADICAL'],
    description: 'The gene-copying facility. Watch out for rapid-firing RNA Polymerases transcribing sequences, spliceosome clamps, and free radicals!',
    requiredDistance: 2500
  },
  {
    name: 'Nucleus',
    bgGradient: 'from-indigo-950 via-purple-950 to-violet-950',
    obstacleTypes: ['HISTONE', 'RESTRICTION_ENZYME', 'RESTRICTION_ENDONUCLEASE', 'REPLICATION_FORK', 'DNA_METHYLASE'],
    description: 'The secure storage of the cell. Heavy patrol of restriction endonucleases, active DNA methylases, and splitting replication forks!',
    requiredDistance: 4500
  },
  {
    name: 'Ribosome',
    bgGradient: 'from-violet-950 via-fuchsia-950 to-pink-950',
    obstacleTypes: ['TRNA_CODON_BLOCK', 'METHYL_GROUP', 'DNA_METHYLASE', 'STOP_CODON'],
    description: 'The protein synthesis factory. High density of tRNA amino-acid blocks, static methyl tags, and DNA methylase enzymes!',
    requiredDistance: 6000
  },
  {
    name: 'Mitochondria',
    bgGradient: 'from-pink-950 via-red-950 to-orange-950',
    obstacleTypes: ['RESTRICTION_ENDONUCLEASE', 'DNA_METHYLASE', 'FREE_RADICAL', 'METHYL_GROUP'],
    description: 'The energy powerhouse. Filled with highly dangerous restriction endonucleases, methylating enzymes, and erratic free radicals!',
    requiredDistance: 8000
  }
];

// CODON TABLE
export const CODON_TABLE: Record<string, CodonTranslation> = {
  // Start
  'ATG': { codon: 'ATG', aminoAcid: 'Met', fullName: 'Methionine (START)', property: 'Start' },
  
  // Hydrophobic (Aliphatic/Aromatic)
  'GCT': { codon: 'GCT', aminoAcid: 'Ala', fullName: 'Alanine', property: 'Hydrophobic' },
  'GCC': { codon: 'GCC', aminoAcid: 'Ala', fullName: 'Alanine', property: 'Hydrophobic' },
  'GCA': { codon: 'GCA', aminoAcid: 'Ala', fullName: 'Alanine', property: 'Hydrophobic' },
  'GCG': { codon: 'GCG', aminoAcid: 'Ala', fullName: 'Alanine', property: 'Hydrophobic' },
  'GTT': { codon: 'GTT', aminoAcid: 'Val', fullName: 'Valine', property: 'Hydrophobic' },
  'GTC': { codon: 'GTC', aminoAcid: 'Val', fullName: 'Valine', property: 'Hydrophobic' },
  'GTA': { codon: 'GTA', aminoAcid: 'Val', fullName: 'Valine', property: 'Hydrophobic' },
  'GTG': { codon: 'GTG', aminoAcid: 'Val', fullName: 'Valine', property: 'Hydrophobic' },
  'TTA': { codon: 'TTA', aminoAcid: 'Leu', fullName: 'Leucine', property: 'Hydrophobic' },
  'TTG': { codon: 'TTG', aminoAcid: 'Leu', fullName: 'Leucine', property: 'Hydrophobic' },
  'CTT': { codon: 'CTT', aminoAcid: 'Leu', fullName: 'Leucine', property: 'Hydrophobic' },
  'CTC': { codon: 'CTC', aminoAcid: 'Leu', fullName: 'Leucine', property: 'Hydrophobic' },
  'CTA': { codon: 'CTA', aminoAcid: 'Leu', fullName: 'Leucine', property: 'Hydrophobic' },
  'CTG': { codon: 'CTG', aminoAcid: 'Leu', fullName: 'Leucine', property: 'Hydrophobic' },
  'ATT': { codon: 'ATT', aminoAcid: 'Ile', fullName: 'Isoleucine', property: 'Hydrophobic' },
  'ATC': { codon: 'ATC', aminoAcid: 'Ile', fullName: 'Isoleucine', property: 'Hydrophobic' },
  'ATA': { codon: 'ATA', aminoAcid: 'Ile', fullName: 'Isoleucine', property: 'Hydrophobic' },
  'TTT': { codon: 'TTT', aminoAcid: 'Phe', fullName: 'Phenylalanine', property: 'Hydrophobic' },
  'TTC': { codon: 'TTC', aminoAcid: 'Phe', fullName: 'Phenylalanine', property: 'Hydrophobic' },
  'TGG': { codon: 'TGG', aminoAcid: 'Trp', fullName: 'Tryptophan', property: 'Hydrophobic' },
  
  // Hydrophilic (Polar / Neutral)
  'ACT': { codon: 'ACT', aminoAcid: 'Thr', fullName: 'Threonine', property: 'Hydrophilic' },
  'ACC': { codon: 'ACC', aminoAcid: 'Thr', fullName: 'Threonine', property: 'Hydrophilic' },
  'ACA': { codon: 'ACA', aminoAcid: 'Thr', fullName: 'Threonine', property: 'Hydrophilic' },
  'ACG': { codon: 'ACG', aminoAcid: 'Thr', fullName: 'Threonine', property: 'Hydrophilic' },
  'TCT': { codon: 'TCT', aminoAcid: 'Ser', fullName: 'Serine', property: 'Hydrophilic' },
  'TCC': { codon: 'TCC', aminoAcid: 'Ser', fullName: 'Serine', property: 'Hydrophilic' },
  'TCA': { codon: 'TCA', aminoAcid: 'Ser', fullName: 'Serine', property: 'Hydrophilic' },
  'TCG': { codon: 'TCG', aminoAcid: 'Ser', fullName: 'Serine', property: 'Hydrophilic' },
  'AGT': { codon: 'AGT', aminoAcid: 'Ser', fullName: 'Serine', property: 'Hydrophilic' },
  'AGC': { codon: 'AGC', aminoAcid: 'Ser', fullName: 'Serine', property: 'Hydrophilic' },
  'TAT': { codon: 'TAT', aminoAcid: 'Tyr', fullName: 'Tyrosine', property: 'Hydrophilic' },
  'TAC': { codon: 'TAC', aminoAcid: 'Tyr', fullName: 'Tyrosine', property: 'Hydrophilic' },
  'CCT': { codon: 'CCT', aminoAcid: 'Pro', fullName: 'Proline', property: 'Special' },
  'CCC': { codon: 'CCC', aminoAcid: 'Pro', fullName: 'Proline', property: 'Special' },
  'CCA': { codon: 'CCA', aminoAcid: 'Pro', fullName: 'Proline', property: 'Special' },
  'CCG': { codon: 'CCG', aminoAcid: 'Pro', fullName: 'Proline', property: 'Special' },
  'GGT': { codon: 'GGT', aminoAcid: 'Gly', fullName: 'Glycine', property: 'Special' },
  'GGC': { codon: 'GGC', aminoAcid: 'Gly', fullName: 'Glycine', property: 'Special' },
  'GGA': { codon: 'GGA', aminoAcid: 'Gly', fullName: 'Glycine', property: 'Special' },
  'GGG': { codon: 'GGG', aminoAcid: 'Gly', fullName: 'Glycine', property: 'Special' },
  'TGT': { codon: 'TGT', aminoAcid: 'Cys', fullName: 'Cysteine', property: 'Special' },
  'TGC': { codon: 'TGC', aminoAcid: 'Cys', fullName: 'Cysteine', property: 'Special' },
  'AAT': { codon: 'AAT', aminoAcid: 'Asn', fullName: 'Asparagine', property: 'Hydrophilic' },
  'AAC': { codon: 'AAC', aminoAcid: 'Asn', fullName: 'Asparagine', property: 'Hydrophilic' },
  'CAA': { codon: 'CAA', aminoAcid: 'Gln', fullName: 'Glutamine', property: 'Hydrophilic' },
  'CAG': { codon: 'CAG', aminoAcid: 'Gln', fullName: 'Glutamine', property: 'Hydrophilic' },

  // Acidic (Negative Charge)
  'GAT': { codon: 'GAT', aminoAcid: 'Asp', fullName: 'Aspartic Acid', property: 'Acidic' },
  'GAC': { codon: 'GAC', aminoAcid: 'Asp', fullName: 'Aspartic Acid', property: 'Acidic' },
  'GAA': { codon: 'GAA', aminoAcid: 'Glu', fullName: 'Glutamic Acid', property: 'Acidic' },
  'GAG': { codon: 'GAG', aminoAcid: 'Glu', fullName: 'Glutamic Acid', property: 'Acidic' },

  // Basic (Positive Charge)
  'AAA': { codon: 'AAA', aminoAcid: 'Lys', fullName: 'Lysine', property: 'Basic' },
  'AAG': { codon: 'AAG', aminoAcid: 'Lys', fullName: 'Lysine', property: 'Basic' },
  'CGT': { codon: 'CGT', aminoAcid: 'Arg', fullName: 'Arginine', property: 'Basic' },
  'CGC': { codon: 'CGC', aminoAcid: 'Arg', fullName: 'Arginine', property: 'Basic' },
  'CGA': { codon: 'CGA', aminoAcid: 'Arg', fullName: 'Arginine', property: 'Basic' },
  'CGG': { codon: 'CGG', aminoAcid: 'Arg', fullName: 'Arginine', property: 'Basic' },
  'AGA': { codon: 'AGA', aminoAcid: 'Arg', fullName: 'Arginine', property: 'Basic' },
  'AGG': { codon: 'AGG', aminoAcid: 'Arg', fullName: 'Arginine', property: 'Basic' },
  'CAT': { codon: 'CAT', aminoAcid: 'His', fullName: 'Histidine', property: 'Basic' },
  'CAC': { codon: 'CAC', aminoAcid: 'His', fullName: 'Histidine', property: 'Basic' },

  // Stop Codons
  'TAA': { codon: 'TAA', aminoAcid: 'STOP', fullName: 'Ochre (STOP)', property: 'Stop' },
  'TAG': { codon: 'TAG', aminoAcid: 'STOP', fullName: 'Amber (STOP)', property: 'Stop' },
  'TGA': { codon: 'TGA', aminoAcid: 'STOP', fullName: 'Opal (STOP)', property: 'Stop' }
};

// Returns amino acid from 3-letter DNA codon. Default to '?' if sequence is cut short.
export function translateCodon(codon: string): CodonTranslation {
  const normalized = codon.toUpperCase();
  if (normalized.length < 3) {
    return { codon, aminoAcid: '?', fullName: 'Incomplete Codon', property: 'Special' };
  }
  return CODON_TABLE[normalized] || { codon, aminoAcid: 'X', fullName: 'Unknown / Scrambled', property: 'Special' };
}

// Converts a full DNA sequence into an array of amino acids
export function translateDNA(sequence: string): Array<CodonTranslation & { index: number }> {
  const result: Array<CodonTranslation & { index: number }> = [];
  for (let i = 0; i < sequence.length; i += 3) {
    const segment = sequence.slice(i, i + 3);
    const translation = translateCodon(segment);
    result.push({
      ...translation,
      index: i
    });
    // Stop translation if we hit a stop codon
    if (translation.property === 'Stop') {
      // Continue translating to show full mutation effects, but we will tag them as 'silenced' visually
    }
  }
  return result;
}

// Default genes for our character (Wild-Type)
export const WILD_TYPE_GENES: Gene[] = [
  {
    id: 'gene_thruster',
    name: 'ATPase Thruster (Energy)',
    description: 'Governs energy output and flight speed. Rich in hydrophobic residues for lipid-membrane integration.',
    defaultSequence: 'ATGGCTGTTGTCGTG', // Met-Ala-Val-Val-Val
    activeSequence: 'ATGGCTGTTGTCGTG',
    expressedPhenotype: 'Basic Nucleotide Stream: Standard upward thrust and speed.',
    abilityType: 'thruster',
    tier: 1
  },
  {
    id: 'gene_size',
    name: 'Somatotropin (Growth)',
    description: 'Regulates overall cellular volume and shell thickness.',
    defaultSequence: 'ATGGCTAAAAGAAGA', // Met-Ala-Lys-Arg-Arg (highly basic, binding)
    activeSequence: 'ATGGCTAAAAGAAGA',
    expressedPhenotype: 'Standard Scale: Normal hit box size (medium agility).',
    abilityType: 'size',
    tier: 1
  },
  {
    id: 'gene_shield',
    name: 'Glycoprotein Capsid (Armor)',
    description: 'Forms a protective outer coat of glycoproteins to absorb structural cuts.',
    defaultSequence: 'ATGGCTGGTTGTTGT', // Met-Ala-Gly-Cys-Cys (disulfide bonds)
    activeSequence: 'ATGGCTGGTTGTTGT',
    expressedPhenotype: 'Unshielded: Vulnerable to restriction enzyme cuts.',
    abilityType: 'shield',
    tier: 0
  },
  {
    id: 'gene_magnet',
    name: 'Nucleotide Ligand (Magnet)',
    description: 'Expresses positive receptors that attract negative nucleotide bases.',
    defaultSequence: 'ATGGCTCAACAACAA', // Met-Ala-Gln-Gln-Gln
    activeSequence: 'ATGGCTCAACAACAA',
    expressedPhenotype: 'Manual Collection: Must touch nucleotides directly.',
    abilityType: 'magnet',
    tier: 0
  }
];

// Determine phenotypes and tiers from sequences
export function analyzeGenome(genes: Gene[]): {
  thrusterTier: number;
  sizeTier: number; // 1 = Standard, 0 = Tiny (good!), 2 = Giant (bad!)
  shieldTier: number; // 0 = None, 1 = Shielded!
  magnetTier: number; // 0 = None, 1 = Magnetic attraction!
  phenotypes: {
    thruster: string;
    size: string;
    shield: string;
    magnet: string;
  };
} {
  let thrusterTier = 1;
  let sizeTier = 1;
  let shieldTier = 0;
  let magnetTier = 0;

  let thrusterText = 'Standard ATP Jetpack: Steady propulsion.';
  let sizeText = 'Standard Form: Normal collision radius.';
  let shieldText = 'Unshielded: Cell membrane vulnerable to cuts.';
  let magnetText = 'Inactive Magnet: Standard collection range.';

  // Helper to check translation of a sequence
  const getAminoAcids = (seq: string) => translateDNA(seq).map(c => c.aminoAcid);

  genes.forEach(gene => {
    const aa = getAminoAcids(gene.activeSequence);
    const isSilenced = aa.slice(0, -1).includes('STOP') || aa[0] !== 'Met';

    if (gene.abilityType === 'thruster') {
      if (isSilenced) {
        thrusterTier = 0.5;
        thrusterText = 'Silenced Promoter: Flight efficiency severely decreased!';
      } else {
        // Count valine/leucine (hydrophobic residues for lipid thrust)
        const hydrophobicCount = aa.filter(a => ['Val', 'Leu', 'Ile', 'Phe'].includes(a)).length;
        if (hydrophobicCount >= 4) {
          thrusterTier = 2;
          thrusterText = 'Hyper-Hydrophobic Thruster: Instant double-acceleration flight!';
        } else if (aa.includes('STOP')) {
          thrusterTier = 0.8;
          thrusterText = 'Truncated ATP Thruster: Reduced speed and power.';
        }
      }
    }

    if (gene.abilityType === 'size') {
      if (isSilenced || aa.length < 4) {
        // Deletion/silence means no growth factor -> tiny size!
        sizeTier = 0;
        sizeText = 'Miniature Somatotropin: 35% smaller size! Easier to dodge obstacles (phenotypic advantage!).';
      } else {
        const basicCount = aa.filter(a => ['Lys', 'Arg', 'His'].includes(a)).length;
        if (basicCount >= 4) {
          sizeTier = 2; // giant
          sizeText = 'Hyper-Growth Gigantism: Extra large collider size (harder to dodge).';
        } else {
          sizeTier = 1;
          sizeText = 'Standard Form: Balanced physical frame.';
        }
      }
    }

    if (gene.abilityType === 'shield') {
      if (isSilenced || aa.length < 3) {
        shieldTier = 0;
        shieldText = 'Lacking Capsid: No defensive barrier.';
      } else {
        // High sulfur amino acids (Cysteine) forming robust disulfide shields
        const cysteineCount = aa.filter(a => a === 'Cys').length;
        if (cysteineCount >= 2) {
          shieldTier = 1;
          shieldText = 'Disulfide Glycoprotein Shield: Active! Absorbs one obstacle impact.';
        } else if (aa.length >= 5) {
          shieldTier = 0.5;
          shieldText = 'Partial Capsid: Shorter invincibility duration after being hit.';
        }
      }
    }

    if (gene.abilityType === 'magnet') {
      if (isSilenced) {
        magnetTier = 0;
        magnetText = 'Inactive Receptor: Standard collecting.';
      } else {
        // Highly polar/charged binding pocket (Gln/Asn/Glu)
        const polarCount = aa.filter(a => ['Gln', 'Asn', 'Glu', 'Asp'].includes(a)).length;
        if (polarCount >= 3) {
          magnetTier = 1;
          magnetText = 'Electrostatically Charged Ligand: Automatically magnetizes DNA bases from afar!';
        }
      }
    }
  });

  return {
    thrusterTier,
    sizeTier,
    shieldTier,
    magnetTier,
    phenotypes: {
      thruster: thrusterText,
      size: sizeText,
      shield: shieldText,
      magnet: magnetText
    }
  };
}
