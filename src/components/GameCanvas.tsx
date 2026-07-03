import React, { useRef, useEffect, useState } from 'react';
import { Gene, analyzeGenome, GAME_ZONES, GameZone, MutationType, translateDNA, Nucleotide } from '../types';
import { Play, RotateCcw, Shield, Zap, Sparkles, Heart, Award, ArrowRight, Dna, Volume2, VolumeX } from 'lucide-react';
import { CellSynthMusic } from '../utils/audio';

interface GameCanvasProps {
  genes: Gene[];
  onUpdateGenes: (newGenes: Gene[]) => void;
  onRunFinished: (stats: { score: number; distance: number; mutationsCount: number; dnaCollected: number }) => void;
  onCollectDnaFragment: () => void;
  mutationLevels: Record<string, number>;
}

// Particle class for jetpack exhaust, nucleotide collection, and explosions
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;

  constructor(x: number, y: number, color: string, vx?: number, vy?: number, size?: number) {
    this.x = x;
    this.y = y;
    this.vx = vx !== undefined ? vx : (Math.random() - 0.5) * 4 - 2; // drift left/right
    this.vy = vy !== undefined ? vy : Math.random() * 3 + 1; // drift down
    this.color = color;
    this.size = size !== undefined ? size : Math.random() * 4 + 2;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.015;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

export default function GameCanvas({ 
  genes, 
  onUpdateGenes, 
  onRunFinished,
  onCollectDnaFragment,
  mutationLevels
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game stats
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [currentZone, setCurrentZone] = useState<GameZone>('Cytoplasm');
  const [activeShield, setActiveShield] = useState<boolean>(false);
  const [dnaCollected, setDnaCollected] = useState<number>(0);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const musicRef = useRef<CellSynthMusic | null>(null);

  // Synced music controller
  useEffect(() => {
    if (!musicRef.current) {
      musicRef.current = new CellSynthMusic();
    }

    if (isPlaying && !isMusicMuted) {
      musicRef.current.start();
    } else {
      musicRef.current.stop();
    }

    return () => {
      if (musicRef.current) {
        musicRef.current.stop();
      }
    };
  }, [isPlaying, isMusicMuted]);

  // Real-time Mutation Event Popup State
  const [mutationAlert, setMutationAlert] = useState<{
    show: boolean;
    geneName: string;
    type: MutationType;
    description: string;
    oldPhenotype: string;
    newPhenotype: string;
  } | null>(null);

  // References to keep game state up to date in requestAnimationFrame without stale state closures
  const stateRef = useRef({
    isPlaying: false,
    isGameOver: false,
    isVictory: false,
    distance: 0,
    score: 0,
    health: 100,
    currentZone: 'Cytoplasm' as GameZone,
    genes: genes,
    activeShield: false,
    shieldCharge: 0, // 0 = inactive, 1+ = charged
    magnetRange: 0, // attraction range
    thrusterPower: 1, // propulsion multiplier
    sizeMultiplier: 1, // sizing for collision circle
    playerY: 200,
    playerVY: 0,
    isAscending: false,
    mutationsEncounteredCount: 0,
    particles: [] as Particle[],
    obstacles: [] as any[],
    nucleotides: [] as any[],
    mutationPortals: [] as any[],
    dnaFragmentsList: [] as any[],
    dnaCollected: 0,
    mutationLevels: mutationLevels,
    frame: 0,
    lastTime: 0,
    methylSilencedTimer: 0, // epigenetic silencing countdown
    isInvincibleTimer: 0,
    playerTrail: [] as Array<{ x: number; y: number; r: number }>,
    superSpeedPowerUps: [] as any[],
    superSpeedTimer: 0,
    backgroundOrganelles: [] as any[]
  });

  // Keep genes and states synced to the ref, applying permanent upgrade levels directly
  useEffect(() => {
    stateRef.current.genes = genes;
    stateRef.current.mutationLevels = mutationLevels;
    const stats = analyzeGenome(genes);

    // 1. Metabolic Accelerant (+20% power per level)
    const speedLvl = mutationLevels.metabolic_speed || 0;
    const speedMultiplier = 1 + (speedLvl * 0.2);
    stateRef.current.thrusterPower = stats.thrusterTier * speedMultiplier;

    // Player cell size
    stateRef.current.sizeMultiplier = stats.sizeTier === 0 ? 0.65 : stats.sizeTier === 2 ? 1.35 : 1.0;

    // 2. Glycoprotein Hardening (gives starting shield charges)
    const armorLvl = mutationLevels.glycoprotein_hardening || 0;
    const baseShieldCharge = stats.shieldTier >= 1 ? 1 : 0;
    stateRef.current.shieldCharge = baseShieldCharge + (armorLvl > 0 ? 1 : 0);

    // 3. Ligand Magnetic Super-Amplifier (+120px range per level)
    const magnetLvl = mutationLevels.magnetic_amp || 0;
    const baseMagnet = stats.magnetTier >= 1 ? 200 : 0;
    stateRef.current.magnetRange = baseMagnet + (magnetLvl * 120);
  }, [genes, mutationLevels]);

  // Nucleotide letters color helper
  const getNucleotideColor = (base: string) => {
    switch (base) {
      case 'A': return '#06b6d4'; // cyan
      case 'T': return '#f59e0b'; // amber
      case 'C': return '#10b981'; // emerald
      case 'G': return '#f43f5e'; // rose
      default: return '#94a3b8';
    }
  };

  const handleStartGame = () => {
    // Reset stats
    setDistance(0);
    setScore(0);
    setHealth(100);
    setIsGameOver(false);
    setIsVictory(false);
    setMutationAlert(null);
    setDnaCollected(0);

    // Setup Ref variables
    stateRef.current.isPlaying = true;
    stateRef.current.isGameOver = false;
    stateRef.current.isVictory = false;
    stateRef.current.distance = 0;
    stateRef.current.score = 0;
    stateRef.current.health = 100;
    stateRef.current.currentZone = 'Cytoplasm';
    stateRef.current.playerY = 200;
    stateRef.current.playerVY = 0;
    stateRef.current.particles = [];
    stateRef.current.obstacles = [];
    stateRef.current.nucleotides = [];
    stateRef.current.mutationPortals = [];
    stateRef.current.dnaFragmentsList = [];
    stateRef.current.dnaCollected = 0;
    stateRef.current.mutationsEncounteredCount = 0;
    stateRef.current.frame = 0;
    stateRef.current.methylSilencedTimer = 0;
    stateRef.current.isInvincibleTimer = 0;
    stateRef.current.playerTrail = [];
    stateRef.current.superSpeedPowerUps = [];
    stateRef.current.superSpeedTimer = 0;
    
    // Generate 18 random background organelles for parallax intracellular aesthetic
    stateRef.current.backgroundOrganelles = [];
    for (let i = 0; i < 18; i++) {
      const types = ['mitochondria', 'ribosome_cluster', 'lysosome', 'er_strand', 'vesicle'];
      const type = types[Math.floor(Math.random() * types.length)];
      stateRef.current.backgroundOrganelles.push({
        x: Math.random() * 1000, // spread across starting space
        y: 50 + Math.random() * 350,
        size: 25 + Math.random() * 45,
        type,
        speedFactor: 0.08 + Math.random() * 0.14, // beautiful slow parallax speed multiplier
        angle: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.015
      });
    }

    // Apply starting genes phenotypes
    const startStats = analyzeGenome(genes);
    const speedLvl = mutationLevels.metabolic_speed || 0;
    const speedMultiplier = 1 + (speedLvl * 0.2);
    stateRef.current.thrusterPower = startStats.thrusterTier * speedMultiplier;
    stateRef.current.sizeMultiplier = startStats.sizeTier === 0 ? 0.65 : startStats.sizeTier === 2 ? 1.35 : 1.0;
    
    const armorLvl = mutationLevels.glycoprotein_hardening || 0;
    stateRef.current.shieldCharge = (startStats.shieldTier >= 1 ? 1 : 0) + (armorLvl > 0 ? 1 : 0);
    
    const magnetLvl = mutationLevels.magnetic_amp || 0;
    stateRef.current.magnetRange = (startStats.magnetTier >= 1 ? 200 : 0) + (magnetLvl * 120);

    setIsPlaying(true);
  };

  const triggerRealTimeMutation = () => {
    const activeGenes = stateRef.current.genes;
    // Choose a random gene to mutate
    const targetGeneIdx = Math.floor(Math.random() * activeGenes.length);
    const gene = activeGenes[targetGeneIdx];

    const mutationTypes = [MutationType.POINT, MutationType.DELETION, MutationType.INSERTION];
    const chosenType = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
    const bases: Nucleotide[] = ['A', 'T', 'C', 'G'];
    const randomBase = bases[Math.floor(Math.random() * bases.length)];
    const randomIdx = Math.floor(Math.random() * gene.activeSequence.length);

    let mutatedSeq = gene.activeSequence;
    let desc = '';

    if (chosenType === MutationType.POINT) {
      mutatedSeq = gene.activeSequence.slice(0, randomIdx) + randomBase + gene.activeSequence.slice(randomIdx + 1);
      desc = `Chemical swap: Base #${randomIdx + 1} substituted with ${randomBase}.`;
    } else if (chosenType === MutationType.DELETION) {
      mutatedSeq = gene.activeSequence.slice(0, randomIdx) + gene.activeSequence.slice(randomIdx + 1);
      desc = `Ribosome frame collapse: Base #${randomIdx + 1} deleted, causing a Frameshift!`;
    } else if (chosenType === MutationType.INSERTION) {
      mutatedSeq = gene.activeSequence.slice(0, randomIdx) + randomBase + gene.activeSequence.slice(randomIdx);
      desc = `Nucleotide insertion: Added ${randomBase} before Base #${randomIdx + 1}, pushing all subsequent codons.`;
    }

    if (mutatedSeq.length < 3) return; // safeguard

    // Get old phenotype description
    const oldStats = analyzeGenome(activeGenes);
    let oldPhenotype = '';
    if (gene.abilityType === 'thruster') oldPhenotype = oldStats.phenotypes.thruster;
    else if (gene.abilityType === 'size') oldPhenotype = oldStats.phenotypes.size;
    else if (gene.abilityType === 'shield') oldPhenotype = oldStats.phenotypes.shield;
    else if (gene.abilityType === 'magnet') oldPhenotype = oldStats.phenotypes.magnet;

    // Apply and recalculate
    const mutatedGenes = activeGenes.map((g, idx) => {
      if (idx === targetGeneIdx) {
        return {
          ...g,
          activeSequence: mutatedSeq
        };
      }
      return g;
    });

    const newStats = analyzeGenome(mutatedGenes);
    let newPhenotype = '';
    if (gene.abilityType === 'thruster') newPhenotype = newStats.phenotypes.thruster;
    else if (gene.abilityType === 'size') newPhenotype = newStats.phenotypes.size;
    else if (gene.abilityType === 'shield') newPhenotype = newStats.phenotypes.shield;
    else if (gene.abilityType === 'magnet') newPhenotype = newStats.phenotypes.magnet;

    // Inject mutated phenotypes text
    const finalGenes = mutatedGenes.map((g, idx) => {
      if (idx === targetGeneIdx) {
        return {
          ...g,
          expressedPhenotype: newPhenotype
        };
      }
      return g;
    });

    // Save back to parent state
    onUpdateGenes(finalGenes);

    // Apply changes locally to physical loop immediately
    stateRef.current.genes = finalGenes;
    stateRef.current.thrusterPower = newStats.thrusterTier;
    stateRef.current.sizeMultiplier = newStats.sizeTier === 0 ? 0.65 : newStats.sizeTier === 2 ? 1.35 : 1.0;
    stateRef.current.shieldCharge = newStats.shieldTier >= 1 ? 1 : 0;
    stateRef.current.magnetRange = newStats.magnetTier >= 1 ? 200 : 0;
    stateRef.current.mutationsEncounteredCount += 1;

    // Show educational popup alert (Pauses game loop)
    stateRef.current.isPlaying = false;
    setMutationAlert({
      show: true,
      geneName: gene.name,
      type: chosenType,
      description: desc,
      oldPhenotype,
      newPhenotype
    });
  };

  const resumeGame = () => {
    setMutationAlert(null);
    stateRef.current.isPlaying = true;
  };

  // Canvas Controller Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        stateRef.current.isAscending = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stateRef.current.isAscending = false;
      }
    };

    const handleTouchStart = () => {
      stateRef.current.isAscending = true;
    };

    const handleTouchEnd = () => {
      stateRef.current.isAscending = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleTouchStart);
    canvas.addEventListener('mouseup', handleTouchEnd);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Setup size of canvas
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = 450; // standard fixed game height
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Main physical and render loop
    const gameLoop = (timestamp: number) => {
      const state = stateRef.current;

      if (!state.isPlaying) {
        // Just draw a static frame if we paused for mutation or start
        renderStatic(ctx, canvas.width, canvas.height);
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      state.frame++;

      // Update distance based on horizontal scrolling speed
      const baseScrollSpeed = 4 + Math.min(state.distance / 1000, 3); // speed increases slowly
      const scrollSpeed = state.superSpeedTimer > 0 ? baseScrollSpeed * 2.8 : baseScrollSpeed;
      state.distance += Math.floor(scrollSpeed * 0.1);
      setDistance(state.distance);

      // Update background organelles parallax position
      if (state.backgroundOrganelles) {
        state.backgroundOrganelles.forEach(org => {
          org.x -= scrollSpeed * org.speedFactor;
          org.angle += org.pulseSpeed;
          if (org.x < -org.size * 2) {
            org.x = canvas.width + org.size * 2;
            org.y = 50 + Math.random() * 350;
          }
        });
      }

      // Update player movement trail (longer trail)
      state.playerTrail = state.playerTrail || [];
      state.playerTrail.forEach(pt => {
        pt.x -= scrollSpeed;
      });
      const pRadius = 24 * state.sizeMultiplier;
      state.playerTrail.push({ x: 100, y: state.playerY, r: pRadius });
      
      const maxTrailLength = state.superSpeedTimer > 0 ? 55 : 40;
      while (state.playerTrail.length > maxTrailLength) {
        state.playerTrail.shift();
      }

      // 1. Check for zone change based on distance
      let nextZone: GameZone = 'Cytoplasm';
      for (const zone of GAME_ZONES) {
        if (state.distance >= zone.requiredDistance) {
          nextZone = zone.name;
        }
      }
      if (state.currentZone !== nextZone) {
        state.currentZone = nextZone;
        setCurrentZone(nextZone);
      }

      // Check for VICTORY: completed mitochondria zone (8000m)
      if (state.distance >= 8000 && !state.isVictory) {
        state.isVictory = true;
        setIsVictory(true);
        state.isPlaying = false;
        setIsPlaying(false);
        onRunFinished({ 
          score: state.score, 
          distance: state.distance, 
          mutationsCount: state.mutationsEncounteredCount,
          dnaCollected: state.dnaCollected 
        });
      }

      // Decrement timers
      if (state.superSpeedTimer > 0) {
        state.superSpeedTimer--;
        state.isInvincibleTimer = Math.max(state.isInvincibleTimer, 16.6); // keep player invincible during boost
      }

      if (state.methylSilencedTimer > 0) {
        state.methylSilencedTimer -= 16.6; // approx 60fps frame delta
        if (state.methylSilencedTimer <= 0) {
          // restore capabilities
          const restoredStats = analyzeGenome(state.genes);
          state.magnetRange = restoredStats.magnetTier >= 1 ? 200 : 0;
          state.thrusterPower = restoredStats.thrusterTier;
        }
      }

      if (state.isInvincibleTimer > 0) {
        state.isInvincibleTimer -= 16.6;
      }

      // 2. Physics: Player Movement (Jetpack Joyride Style)
      const gravity = 0.4;
      const thrust = state.isAscending ? -0.8 * state.thrusterPower : 0;

      // Apply vertical forces
      state.playerVY += gravity + thrust;
      // Cap speed
      state.playerVY = Math.max(Math.min(state.playerVY, 7), -6);
      state.playerY += state.playerVY;

      // Boundaries collision
      const baseRadius = 24 * state.sizeMultiplier;
      if (state.playerY < baseRadius + 10) {
        state.playerY = baseRadius + 10;
        state.playerVY = 0;
      }
      if (state.playerY > canvas.height - baseRadius - 15) {
        state.playerY = canvas.height - baseRadius - 15;
        state.playerVY = 0;
      }

      // Jetpack thrust bubble particles
      if (state.isAscending && state.frame % 3 === 0) {
        // Emit thrust exhaust (A, T, C, G exhaust bubbles!)
        const exhaustBases = ['A', 'T', 'C', 'G'];
        const randomExhaustBase = exhaustBases[Math.floor(Math.random() * exhaustBases.length)];
        const particleColor = getNucleotideColor(randomExhaustBase);
        
        const px = 40; // Player offset x is 100, thruster is near back (40)
        const py = state.playerY + 5;
        // Spew bubbles downwards and slightly left
        const vx = -scrollSpeed - (Math.random() * 2);
        const vy = Math.random() * 3 + 2;
        state.particles.push(new Particle(px, py, particleColor, vx, vy, Math.random() * 3 + 3));
      }

      // 3. Spawn and manage Collectibles (Nucleotides)
      // Spawn groups of base pairs (sine-wave layout)
      if (state.frame % 140 === 0) {
        const bases = ['A', 'T', 'C', 'G'];
        const numBases = 5 + Math.floor(Math.random() * 6);
        const startY = 80 + Math.random() * 220;
        const layoutType = Math.random() > 0.5 ? 'wave' : 'line';

        for (let i = 0; i < numBases; i++) {
          const letter = bases[Math.floor(Math.random() * bases.length)];
          const bx = canvas.width + i * 35;
          const by = startY + (layoutType === 'wave' ? Math.sin(i * 0.7) * 40 : 0);

          state.nucleotides.push({
            x: bx,
            y: by,
            base: letter,
            radius: 12,
            collected: false
          });
        }
      }

      // Update & attract nucleotides (magnetism)
      state.nucleotides.forEach(n => {
        n.x -= scrollSpeed;

        if (state.magnetRange > 0 && state.methylSilencedTimer <= 0) {
          // calculate distance to player
          const dx = n.x - 100; // player fixed x is 100
          const dy = n.y - state.playerY;
          const distToPlayer = Math.sqrt(dx * dx + dy * dy);
          if (distToPlayer < state.magnetRange) {
            // Magnet pull force
            const force = (state.magnetRange - distToPlayer) / state.magnetRange * 5;
            n.x -= (dx / distToPlayer) * force;
            n.y -= (dy / distToPlayer) * force;
          }
        }
      });

      // Remove off-screen nucleotides
      state.nucleotides = state.nucleotides.filter(n => n.x > -30 && !n.collected);

      // Collision nucleotide detection
      state.nucleotides.forEach(n => {
        const dx = n.x - 100;
        const dy = n.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const colRadius = baseRadius + n.radius;

        if (dist < colRadius) {
          n.collected = true;
          state.score += 25;
          setScore(state.score);

          // Ribosome Regen Passive: healing from single base collection
          const regenLvl = state.mutationLevels?.ribosome_regen || 0;
          if (regenLvl > 0) {
            const healAmount = regenLvl * 2;
            state.health = Math.min(100, state.health + healAmount);
            setHealth(state.health);
          }

          // Spawn burst particles
          const baseColor = getNucleotideColor(n.base);
          for (let i = 0; i < 6; i++) {
            state.particles.push(new Particle(
              n.x, n.y, baseColor, 
              (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 
              Math.random() * 2 + 2
            ));
          }
        }
      });

      // 3.5 Spawn and manage DNA Helix Fragments
      if (state.frame % 300 === 0) {
        state.dnaFragmentsList.push({
          x: canvas.width + 50,
          y: 80 + Math.random() * 280,
          radius: 14,
          angle: 0,
          collected: false
        });
      }

      // Update DNA Helix Fragments
      state.dnaFragmentsList.forEach(df => {
        df.x -= scrollSpeed;
        df.angle += 0.04;
      });

      state.dnaFragmentsList = state.dnaFragmentsList.filter(df => df.x > -30 && !df.collected);

      // Collision DNA Helix detection
      state.dnaFragmentsList.forEach(df => {
        const dx = df.x - 100;
        const dy = df.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const colRadius = baseRadius + df.radius;

        if (dist < colRadius) {
          df.collected = true;
          state.dnaCollected += 1;
          setDnaCollected(state.dnaCollected);
          state.score += 150;
          setScore(state.score);
          onCollectDnaFragment(); // update top-level bank

          // Spawn gorgeous double helix neon particles
          for (let i = 0; i < 12; i++) {
            state.particles.push(new Particle(
              df.x, df.y, '#22d3ee', 
              (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 
              Math.random() * 3 + 2
            ));
          }
        }
      });

      // 3.7 Spawn and manage Super-Speed ATP Power-Ups
      if (state.frame % 480 === 0) {
        state.superSpeedPowerUps = state.superSpeedPowerUps || [];
        state.superSpeedPowerUps.push({
          x: canvas.width + 50,
          y: 80 + Math.random() * 280,
          radius: 16,
          angle: 0,
          collected: false
        });
      }

      // Update Super-Speed Power-Ups
      state.superSpeedPowerUps = state.superSpeedPowerUps || [];
      state.superSpeedPowerUps.forEach(ss => {
        ss.x -= scrollSpeed;
        ss.angle += 0.05;
      });

      state.superSpeedPowerUps = state.superSpeedPowerUps.filter(ss => ss.x > -30 && !ss.collected);

      // Collision Super-Speed Power-Up detection
      state.superSpeedPowerUps.forEach(ss => {
        const dx = ss.x - 100;
        const dy = ss.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const colRadius = baseRadius + ss.radius;

        if (dist < colRadius) {
          ss.collected = true;
          state.superSpeedTimer = 180; // approx 3 seconds
          state.score += 250;
          setScore(state.score);

          // Play boost sound
          if (musicRef.current) {
            try {
              musicRef.current.triggerSpeedBoostSound();
            } catch (e) {
              console.warn("Failed to play boost sound", e);
            }
          }

          // Generate huge explosion of gold sparkles
          for (let i = 0; i < 25; i++) {
            state.particles.push(new Particle(
              ss.x, ss.y, '#fbbf24', 
              (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, 
              Math.random() * 4 + 2
            ));
          }
        }
      });

      // 4. Spawn Mutation Portals
      if (state.frame % 380 === 0) {
        state.mutationPortals.push({
          x: canvas.width + 50,
          y: 100 + Math.random() * 250,
          radius: 35,
          active: true
        });
      }

      // Update mutation portals
      state.mutationPortals.forEach(p => {
        p.x -= scrollSpeed;
      });

      // Collision with mutation portals
      state.mutationPortals.forEach(p => {
        const dx = p.x - 100;
        const dy = p.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < baseRadius + p.radius && p.active) {
          p.active = false;
          // Spawn big genetic particle ring
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            state.particles.push(new Particle(
              p.x, p.y, '#c084fc',
              Math.cos(angle) * 5, Math.sin(angle) * 5,
              Math.random() * 3 + 3
            ));
          }
          // Trigger the real-time mutation pause alert
          triggerRealTimeMutation();
        }
      });

      state.mutationPortals = state.mutationPortals.filter(p => p.x > -50 && p.active);

      // 5. Spawn Obstacles based on Active cellular Zone config & Dynamic Difficulty Scaler
      const zoneConfig = GAME_ZONES.find(z => z.name === state.currentZone) || GAME_ZONES[0];
      let baseSpawnRate = 110;
      if (state.currentZone === 'Transcription') baseSpawnRate = 90;
      else if (state.currentZone === 'Nucleus') baseSpawnRate = 95;
      else if (state.currentZone === 'Ribosome') baseSpawnRate = 85;
      else if (state.currentZone === 'Mitochondria') baseSpawnRate = 70;

      // Evolutionary Pressure: density of obstacles scales up as player reaches further distances
      const pressureMultiplier = 1 + (state.distance / 1200) * 0.15; // +15% density increase per 1200 meters
      const adjustedSpawnRate = Math.max(35, Math.round(baseSpawnRate / pressureMultiplier));

      if (state.frame % adjustedSpawnRate === 0) {
        // Pick random allowed obstacle from zone
        const allowedObstacles = zoneConfig.obstacleTypes;
        const chosenObstacleType = allowedObstacles[Math.floor(Math.random() * allowedObstacles.length)];
        const oPhase = Math.random() * Math.PI * 2;

        if (chosenObstacleType === 'REPLICATION_FORK') {
          // Spawn two split nodes (fork) to make a gate!
          state.obstacles.push({
            x: canvas.width + 100,
            y: 70,
            type: 'REPLICATION_FORK',
            width: 40,
            height: 40,
            radius: 24,
            active: true,
            phase: oPhase
          });
          state.obstacles.push({
            x: canvas.width + 100,
            y: 380,
            type: 'REPLICATION_FORK',
            width: 40,
            height: 40,
            radius: 24,
            active: true,
            phase: oPhase
          });
        } else {
          let obs = {
            x: canvas.width + 100,
            y: 60 + Math.random() * 280,
            type: chosenObstacleType,
            width: 30,
            height: 30,
            radius: 18,
            active: true,
            phase: oPhase // for moving obstacles
          };

          if (chosenObstacleType === 'STOP_CODON') {
            obs.width = 45;
            obs.height = 45;
            obs.radius = 24;
          } else if (chosenObstacleType === 'RESTRICTION_ENZYME') {
            obs.width = 35;
            obs.height = 35;
            obs.radius = 20;
          } else if (chosenObstacleType === 'RESTRICTION_ENDONUCLEASE') {
            obs.width = 42;
            obs.height = 42;
            obs.radius = 22;
          } else if (chosenObstacleType === 'DNA_METHYLASE') {
            obs.width = 46;
            obs.height = 46;
            obs.radius = 24;
          } else if (chosenObstacleType === 'METHYL_GROUP') {
            obs.width = 25;
            obs.height = 25;
            obs.radius = 14;
          } else if (chosenObstacleType === 'FREE_RADICAL') {
            obs.width = 22;
            obs.height = 22;
            obs.radius = 13;
          } else if (chosenObstacleType === 'RNA_POLYMERASE') {
            obs.width = 45;
            obs.height = 45;
            obs.radius = 22;
          } else if (chosenObstacleType === 'SPLICING_SPLICEOSOME') {
            obs.width = 50;
            obs.height = 50;
            obs.radius = 26;
          } else if (chosenObstacleType === 'TRNA_CODON_BLOCK') {
            obs.width = 40;
            obs.height = 40;
            obs.radius = 20;
          }

          state.obstacles.push(obs);
        }
      }

      // Update Obstacles
      state.obstacles.forEach(o => {
        // Normal scroll is already subtracted or managed: o.x -= scrollSpeed;
        o.x -= scrollSpeed;
        
        // Restriction enzymes move up/down dynamically
        if (o.type === 'RESTRICTION_ENZYME') {
          o.y += Math.sin(state.frame * 0.05 + o.phase) * 3;
        }
        // Restriction endonucleases track player vertically
        else if (o.type === 'RESTRICTION_ENDONUCLEASE') {
          const dy = state.playerY - o.y;
          o.y += Math.sign(dy) * 1.4 + Math.sin(state.frame * 0.1 + o.phase) * 1.2;
        }
        // DNA methylases move in a wave and spawn trailing methyl tags
        else if (o.type === 'DNA_METHYLASE') {
          o.y += Math.sin(state.frame * 0.04 + o.phase) * 4.5;
          // Spawn a trail of methyl tags
          if (state.frame % 160 === 0 && o.x > 150 && o.x < (canvas?.width || 800) - 100) {
            state.obstacles.push({
              x: o.x - 25,
              y: o.y,
              type: 'METHYL_GROUP',
              width: 25,
              height: 25,
              radius: 14,
              active: true,
              phase: Math.random() * Math.PI * 2
            });
          }
        }
        // Free radicals bounce wildly and drift horizontally (erratic Brownian motion)
        else if (o.type === 'FREE_RADICAL') {
          o.y += Math.cos(state.frame * 0.14 + o.phase) * 5.5;
          o.x += (Math.random() - 0.5) * 4; // horizontal micro-jolt
        }
        // RNA Polymerase slides forward quickly
        else if (o.type === 'RNA_POLYMERASE') {
          o.x -= scrollSpeed * 0.55; // zoom forward!
        }
        // Spliceosome moves up/down in large sweeps
        else if (o.type === 'SPLICING_SPLICEOSOME') {
          o.y += Math.sin(state.frame * 0.08 + o.phase) * 6;
        }
        // tRNA codon block floats slowly
        else if (o.type === 'TRNA_CODON_BLOCK') {
          o.y += Math.cos(state.frame * 0.03 + o.phase) * 1.5;
        }
      });

      // Collision Obstacles detection
      state.obstacles.forEach(o => {
        const dx = o.x - 100;
        const dy = o.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const colRadius = baseRadius + o.radius;

        if (dist < colRadius && o.active) {
          // If in super speed, explode the obstacle and award bonus points!
          if (state.superSpeedTimer > 0) {
            o.active = false;
            state.score += 100; // reward for smash-through
            setScore(state.score);
            
            // Spawn smash particles
            for (let i = 0; i < 15; i++) {
              state.particles.push(new Particle(
                o.x, o.y, '#fbbf24', // golden particles
                (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 
                Math.random() * 3 + 2
              ));
            }
            return;
          }

          if (state.isInvincibleTimer <= 0) {
          
          // Check Polymerase Phase Shift (passive shift bypass chance)
          const shiftLvl = state.mutationLevels?.polymerase_shift || 0;
          const isShiftable = o.type === 'RNA_POLYMERASE' || o.type === 'RESTRICTION_ENZYME' || o.type === 'RESTRICTION_ENDONUCLEASE' || o.type === 'REPLICATION_FORK';
          if (isShiftable && shiftLvl > 0) {
            const chance = shiftLvl === 1 ? 0.25 : 0.50;
            if (Math.random() < chance) {
              // Phased through!
              o.active = false; // deactivate without hurting the player
              for (let i = 0; i < 8; i++) {
                state.particles.push(new Particle(
                  o.x, o.y, '#818cf8', 
                  (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, 
                  Math.random() * 2 + 1
                ));
              }
              return;
            }
          }

          o.active = false;

          // Check if Glycoprotein Shield absorbs the hit!
          if (state.shieldCharge > 0) {
            state.shieldCharge = Math.max(0, state.shieldCharge - 1); // Shield loses 1 charge!
            state.isInvincibleTimer = 1500; // 1.5 seconds invincibility

            // Visual shield break explosion
            for (let i = 0; i < 15; i++) {
              state.particles.push(new Particle(
                o.x, o.y, '#38bdf8', 
                (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 
                Math.random() * 3 + 2
              ));
            }
            return;
          }

          // Apply damage / silencing effects depending on obstacle type
          let damage = 25;
          let particlesColor = '#ef4444'; // Red damage bubbles

          if (o.type === 'STOP_CODON') {
            damage = 35;
            particlesColor = '#f43f5e';
          } else if (o.type === 'RESTRICTION_ENDONUCLEASE') {
            damage = 30;
            particlesColor = '#f97316'; // orange-red splice sparks
          } else if (o.type === 'DNA_METHYLASE') {
            const bypassLvl = state.mutationLevels?.epigenetic_bypass || 0;
            if (bypassLvl === 2) {
              damage = 0;
              particlesColor = '#a855f7';
            } else {
              damage = 20;
              particlesColor = '#c084fc'; // purple epigenetic lockout
              
              // More severe silencing from methylase enzyme
              const duration = bypassLvl === 1 ? 3000 : 8000;
              state.methylSilencedTimer = duration;
              state.magnetRange = 0;
              state.thrusterPower = Math.min(state.thrusterPower, 0.55); // high thruster penalty
            }
          } else if (o.type === 'METHYL_GROUP') {
            // Check Epigenetic Bypass levels
            const bypassLvl = state.mutationLevels?.epigenetic_bypass || 0;
            if (bypassLvl === 2) {
              // Fully immune to methylation!
              damage = 0;
              particlesColor = '#a855f7';
            } else {
              damage = 15;
              particlesColor = '#cbd5e1'; // gray silencing
              
              // Reduce methyl group silence duration by 60% if Level 1
              const duration = bypassLvl === 1 ? 2000 : 5000;
              state.methylSilencedTimer = duration;
              state.magnetRange = 0;
              state.thrusterPower = Math.min(state.thrusterPower, 0.7);
            }
          } else if (o.type === 'FREE_RADICAL') {
            damage = 10;
            particlesColor = '#a855f7'; // purple mutation blast
            // Induces instant sudden mutation!
            triggerRealTimeMutation();
          } else if (o.type === 'RNA_POLYMERASE') {
            damage = 25;
            particlesColor = '#f59e0b'; // orange
          } else if (o.type === 'SPLICING_SPLICEOSOME') {
            damage = 30;
            particlesColor = '#3b82f6'; // blue
          } else if (o.type === 'REPLICATION_FORK') {
            damage = 25;
            particlesColor = '#10b981'; // green
          } else if (o.type === 'TRNA_CODON_BLOCK') {
            damage = 20;
            particlesColor = '#ec4899'; // pink
          }

          state.health = Math.max(state.health - damage, 0);
          setHealth(state.health);

          // Damage particles
          for (let i = 0; i < 12; i++) {
            state.particles.push(new Particle(
              100, state.playerY, particlesColor, 
              -scrollSpeed + (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 
              Math.random() * 4 + 2
            ));
          }

          // Check game over
          if (state.health <= 0) {
            state.isPlaying = false;
            setIsPlaying(false);
            state.isGameOver = true;
            setIsGameOver(true);
            onRunFinished({ 
              score: state.score, 
              distance: state.distance, 
              mutationsCount: state.mutationsEncounteredCount,
              dnaCollected: state.dnaCollected 
            });
          }
        }
      }
    });

      state.obstacles = state.obstacles.filter(o => o.x > -60 && o.active);

      // 6. Update Particles
      state.particles.forEach(p => p.update());
      state.particles = state.particles.filter(p => p.alpha > 0);

      // 7. Render Screen
      draw(ctx, canvas.width, canvas.height, scrollSpeed);

      animId = requestAnimationFrame(gameLoop);
    };

    const draw = (ctx: CanvasRenderingContext2D, width: number, height: number, speed: number) => {
      const state = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      // Dynamic linear gradient matching current cellular zone
      const getZoneCanvasGradient = (z: GameZone) => {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        if (z === 'Cytoplasm') {
          grad.addColorStop(0, '#090d1a');
          grad.addColorStop(0.5, '#0a0d26');
          grad.addColorStop(1, '#051124');
        } else if (z === 'Transcription') {
          grad.addColorStop(0, '#041021');
          grad.addColorStop(0.5, '#041921');
          grad.addColorStop(1, '#020d1c');
        } else if (z === 'Nucleus') {
          grad.addColorStop(0, '#0a0d26');
          grad.addColorStop(0.5, '#190a2c');
          grad.addColorStop(1, '#110424');
        } else if (z === 'Ribosome') {
          grad.addColorStop(0, '#110424');
          grad.addColorStop(0.5, '#2c0429');
          grad.addColorStop(1, '#2c0214');
        } else if (z === 'Mitochondria') {
          grad.addColorStop(0, '#2c0214');
          grad.addColorStop(0.5, '#330308');
          grad.addColorStop(1, '#2c0d02');
        } else {
          grad.addColorStop(0, '#090d1a');
          grad.addColorStop(1, '#051124');
        }
        return grad;
      };

      ctx.fillStyle = getZoneCanvasGradient(state.currentZone);
      ctx.fillRect(0, 0, width, height);

      // Render Parallax Intracellular background organelles deep in the cytosol
      if (state.backgroundOrganelles) {
        state.backgroundOrganelles.forEach(org => {
          ctx.save();
          if (org.type === 'vesicle') {
            ctx.globalAlpha = 0.09;
            ctx.beginPath();
            ctx.arc(org.x, org.y, org.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          } else if (org.type === 'lysosome') {
            ctx.globalAlpha = 0.08;
            ctx.beginPath();
            ctx.arc(org.x, org.y, org.size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Inner particles inside lysosome
            ctx.fillStyle = '#ffffff';
            for (let j = 0; j < 3; j++) {
              const dotX = org.x + Math.sin(org.angle + j) * (org.size * 0.2);
              const dotY = org.y + Math.cos(org.angle + j) * (org.size * 0.2);
              ctx.beginPath();
              ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (org.type === 'mitochondria') {
            ctx.globalAlpha = 0.12;
            ctx.translate(org.x, org.y);
            ctx.rotate(org.angle * 0.2);
            
            const rx = org.size * 0.9;
            const ry = org.size * 0.55;
            
            // Outer membrane
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#f87171';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            
            // Inner cristae
            ctx.beginPath();
            ctx.moveTo(-rx * 0.8, 0);
            for (let px = -rx * 0.7; px <= rx * 0.7; px += rx * 0.2) {
              ctx.lineTo(px, ry * 0.5 * Math.sin(px * 0.4 + org.angle));
              ctx.lineTo(px + rx * 0.1, -ry * 0.5 * Math.sin(px * 0.4 + org.angle));
            }
            ctx.lineTo(rx * 0.8, 0);
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (org.type === 'ribosome_cluster') {
            ctx.globalAlpha = 0.1;
            // mRNA strand
            ctx.beginPath();
            ctx.moveTo(org.x - org.size * 0.5, org.y);
            ctx.bezierCurveTo(
              org.x - org.size * 0.2, org.y - 10 + Math.sin(org.angle) * 8, 
              org.x + org.size * 0.2, org.y + 10 - Math.sin(org.angle) * 8, 
              org.x + org.size * 0.5, org.y
            );
            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Ribosome subunits
            ctx.fillStyle = '#ec4899';
            for (let j = 0; j < 5; j++) {
              const fraction = j / 4;
              const bx = org.x - org.size * 0.5 + org.size * fraction;
              const by = org.y + Math.sin(fraction * Math.PI + org.angle) * 5;
              ctx.beginPath();
              ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (org.type === 'er_strand') {
            ctx.globalAlpha = 0.08;
            const erYOffset = Math.sin(org.angle) * 8;
            for (let offset = -6; offset <= 6; offset += 6) {
              ctx.beginPath();
              ctx.moveTo(org.x - org.size, org.y + offset + erYOffset);
              ctx.bezierCurveTo(
                org.x - org.size * 0.5, org.y + offset - 15 + erYOffset,
                org.x + org.size * 0.5, org.y + offset + 15 + erYOffset,
                org.x + org.size, org.y + offset + erYOffset
              );
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 2.5;
              ctx.stroke();
            }
          }
          ctx.restore();
        });
      }

      // A. Drawing background genomic double-helix scrolling tracks
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)'; // faint indigo
      ctx.lineWidth = 2;
      
      const helixSpacing = 30;
      const waveAmp = 25;
      const waveFreq = 0.01;
      
      // Draw top complementary ribbon
      ctx.beginPath();
      for (let x = 0; x < width; x += 10) {
        const y1 = 40 + Math.sin(x * waveFreq + state.frame * 0.02) * waveAmp;
        const y2 = 40 - Math.sin(x * waveFreq + state.frame * 0.02) * waveAmp;
        
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y1 + 10);
        
        ctx.moveTo(x, y2);
        ctx.lineTo(x, y2 - 10);

        // draw cross rungs periodically
        if (x % 50 === 0) {
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
        }
      }
      ctx.stroke();

      // B. Draw Collectible Nucleotides
      state.nucleotides.forEach(n => {
        const color = getNucleotideColor(n.base);

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;

        // Draw chemical base circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${color}20`; // translucent center
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Draw nucleotide letter (A, T, C, G)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.base, n.x, n.y);
        ctx.restore();
      });

      // C. Draw Mutation Portals (CRISPR genetic portals)
      state.mutationPortals.forEach(p => {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#c084fc'; // purple glow

        // Pulsing portal outer ring
        const pulseRadius = p.radius + Math.sin(state.frame * 0.1) * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Innermost swirling core
        const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#c084fc');
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw DNA molecular core icon in portal
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CRISPR', p.x, p.y);
        ctx.restore();
      });

      // D. Draw Obstacles
      state.obstacles.forEach(o => {
        ctx.save();

        if (o.type === 'RESTRICTION_ENZYME') {
          // Drawn as glowing mechanical/biological cutting shears (scissors)
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ef4444';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 3.5;

          // Draw the hinge
          ctx.beginPath();
          ctx.arc(o.x, o.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.stroke();

          // Scissor shearing animation lines
          const angle = Math.sin(state.frame * 0.15 + o.phase) * 0.5;
          
          // Blade 1
          ctx.beginPath();
          ctx.moveTo(o.x, o.y);
          ctx.lineTo(o.x - Math.cos(angle) * o.radius * 1.5, o.y - Math.sin(angle) * o.radius * 1.5);
          ctx.stroke();

          // Blade 2
          ctx.beginPath();
          ctx.moveTo(o.x, o.y);
          ctx.lineTo(o.x - Math.cos(-angle) * o.radius * 1.5, o.y + Math.sin(-angle) * o.radius * 1.5);
          ctx.stroke();

          // Loops for handle
          ctx.beginPath();
          ctx.arc(o.x + 8, o.y - 8, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(o.x + 8, o.y + 8, 5, 0, Math.PI * 2);
          ctx.stroke();

        } else if (o.type === 'RESTRICTION_ENDONUCLEASE') {
          // Large dual-lobed DNA-binding endonuclease clamp patrol
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#f97316';
          ctx.strokeStyle = '#fdba74';
          ctx.lineWidth = 3;

          // Draw dual lobes of the enzyme clamp
          ctx.beginPath();
          ctx.arc(o.x - 12, o.y, o.radius * 0.75, 0, Math.PI * 2);
          ctx.arc(o.x + 12, o.y, o.radius * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = '#7c2d12ee'; // translucent deep burnt orange
          ctx.fill();
          ctx.stroke();

          // Cleaving site center core
          ctx.beginPath();
          ctx.arc(o.x, o.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();

          // Laser/cutting field line in-between
          ctx.beginPath();
          ctx.moveTo(o.x, o.y - o.radius);
          ctx.lineTo(o.x, o.y + o.radius);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffedd5';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ENDO-R', o.x, o.y);

        } else if (o.type === 'DNA_METHYLASE') {
          // Large methyltransferase complex with orbiting methyl tag groups
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#d8b4fe';
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 3.5;

          // Central enzyme globule
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.radius * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = '#4a044e'; // deep violet/magenta
          ctx.fill();
          ctx.stroke();

          // Orbiting -CH3 methyl markers
          const numOrbits = 3;
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
          for (let i = 0; i < numOrbits; i++) {
            const angle = (state.frame * 0.04) + (i * Math.PI * 2 / numOrbits) + o.phase;
            const ox = o.x + Math.cos(angle) * (o.radius * 1.5);
            const oy = o.y + Math.sin(angle) * (o.radius * 1.5);

            // Orbit path line
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.radius * 1.5, 0, Math.PI * 2);
            ctx.stroke();

            // Methyl node
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(ox, oy, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#cbd5e1';
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Me', ox, oy);
            ctx.restore();
          }

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fdf4ff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('METHYL', o.x, o.y);

        } else if (o.type === 'STOP_CODON') {
          // Drawn as robust octagonal glowing stop chemical barriers with actual letters (TAA/TAG/TGA)
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#f43f5e';
          
          // Outer border octagon
          ctx.beginPath();
          const numSides = 8;
          for (let i = 0; i <= numSides; i++) {
            const angle = (i / numSides) * Math.PI * 2;
            const rx = o.x + Math.cos(angle) * o.radius;
            const ry = o.y + Math.sin(angle) * o.radius;
            if (i === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.fillStyle = '#881337cc'; // deep crimson translucent
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.fill();
          ctx.stroke();

          // Stop Codon Text
          const stopSignals = ['TAA', 'TAG', 'TGA'];
          const signal = stopSignals[Math.floor((o.x + o.y) / 50) % 3]; // stable choice
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('STOP', o.x, o.y - 6);
          ctx.font = 'bold 9px monospace';
          ctx.fillText(signal, o.x, o.y + 6);

        } else if (o.type === 'METHYL_GROUP') {
          // Epigenetic methyl silencing marker (chemical group structure, CH3)
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#94a3b8';
          
          ctx.beginPath();
          ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#334155'; // deep metallic slate
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          // Write "CH3" on the carbon core
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('CH₃', o.x, o.y);

        } else if (o.type === 'FREE_RADICAL') {
          // Bouncing reactive oxygen ion (purple orb with visual energy spikes)
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#a855f7';
          
          // Draw spikes
          ctx.beginPath();
          const spikes = 6;
          for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2 + (state.frame * 0.05);
            const outerR = o.radius * 1.5;
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(o.x + Math.cos(angle) * outerR, o.y + Math.sin(angle) * outerR);
          }
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#581c87';
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Core ion text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('O₂⁻', o.x, o.y);
        } else if (o.type === 'RNA_POLYMERASE') {
          // Large swirling golden transcription bubble complex
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#f59e0b';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#78350fcc'; // translucent deep gold
          ctx.fill();
          ctx.stroke();

          // Swirling RNA transcript strand tail
          ctx.beginPath();
          ctx.moveTo(o.x - o.radius, o.y);
          ctx.bezierCurveTo(
            o.x - o.radius * 2, o.y - 15 + Math.sin(state.frame * 0.1) * 10,
            o.x - o.radius * 3, o.y + 15 - Math.sin(state.frame * 0.1) * 10,
            o.x - o.radius * 4, o.y
          );
          ctx.strokeStyle = '#ef4444'; // red single-stranded RNA transcribing
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('RNA-POL', o.x, o.y);

        } else if (o.type === 'SPLICING_SPLICEOSOME') {
          // Spliceosome loops/clamps
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#3b82f6';
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 3.5;

          const spread = Math.abs(Math.sin(state.frame * 0.08 + o.phase)) * 22 + 4;

          // Top SnRNP clamp
          ctx.beginPath();
          ctx.arc(o.x, o.y - spread, 13, 0, Math.PI * 2);
          ctx.fillStyle = '#1e3a8acc';
          ctx.fill();
          ctx.stroke();

          // Bottom SnRNP clamp
          ctx.beginPath();
          ctx.arc(o.x, o.y + spread, 13, 0, Math.PI * 2);
          ctx.fillStyle = '#1e3a8acc';
          ctx.fill();
          ctx.stroke();

          // Splicing bridge filament
          ctx.beginPath();
          ctx.moveTo(o.x, o.y - spread);
          ctx.lineTo(o.x, o.y + spread);
          ctx.strokeStyle = '#93c5fd';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('SPLICE', o.x, o.y);

        } else if (o.type === 'REPLICATION_FORK') {
          // Glowing split helicase replication fork node
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#10b981';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#064e3b';
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(o.x + o.radius, o.y);
          ctx.lineTo(o.x - o.radius, o.y);
          ctx.moveTo(o.x - o.radius, o.y);
          ctx.lineTo(o.x - o.radius * 2, o.y - 18);
          ctx.moveTo(o.x - o.radius, o.y);
          ctx.lineTo(o.x - o.radius * 2, o.y + 18);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('FORK', o.x, o.y);

        } else if (o.type === 'TRNA_CODON_BLOCK') {
          // Pink translation tRNA block
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ec4899';
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          // Draw rounded rect manually for compatibility
          const r = o.radius;
          ctx.rect(o.x - r, o.y - r, r * 2, r * 2);
          ctx.fillStyle = '#831843cc';
          ctx.fill();
          ctx.stroke();

          // anticodon stems
          ctx.beginPath();
          ctx.moveTo(o.x, o.y + r);
          ctx.lineTo(o.x - 6, o.y + r + 8);
          ctx.moveTo(o.x, o.y + r);
          ctx.lineTo(o.x, o.y + r + 10);
          ctx.moveTo(o.x, o.y + r);
          ctx.lineTo(o.x + 6, o.y + r + 8);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const anticodons = ['UAC', 'AAA', 'CGC', 'UGA'];
          const label = anticodons[Math.floor((o.x + o.y) / 75) % 4];
          ctx.fillText(label, o.x, o.y);
        }

        ctx.restore();
      });

      // E. Draw DNA Helix Fragments
      state.dnaFragmentsList.forEach(df => {
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#22d3ee'; // bright cyan double helix

        const size = df.radius;
        const numNodes = 5;

        for (let i = 0; i < numNodes; i++) {
          const t = (i / numNodes) * Math.PI * 2 + df.angle;
          const nx = df.x + Math.sin(t) * (size * 0.85);
          const ny = df.y + (i - numNodes / 2) * 6;

          const nx2 = df.x - Math.sin(t) * (size * 0.85);
          const ny2 = df.y + (i - numNodes / 2) * 6;

          // strand 1 node
          ctx.beginPath();
          ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#22d3ee';
          ctx.fill();

          // strand 2 node
          ctx.beginPath();
          ctx.arc(nx2, ny2, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#818cf8';
          ctx.fill();

          // complementary bridge ladder rung
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(nx2, ny2);
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      });

      // E1. Draw Super-Speed ATP Power-Ups
      if (state.superSpeedPowerUps) {
        state.superSpeedPowerUps.forEach(ss => {
          ctx.save();
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#fbbf24'; // golden energy glow

          // Move to center of capsule and rotate
          ctx.translate(ss.x, ss.y);
          ctx.rotate(ss.angle);

          // Draw golden capsule pill
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();

          // Draw shiny energy reflection highlight inside
          ctx.beginPath();
          ctx.ellipse(-4, -2, 4, 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();

          // Draw dynamic ATP label
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#1e293b';
          ctx.font = 'black 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ATP', 0, 0.5);

          ctx.restore();
        });
      }

      // E2. Draw Particles
      state.particles.forEach(p => p.draw(ctx));

      // Draw Player Trail (longer fading stream of cellular essence)
      if (state.playerTrail && state.playerTrail.length > 0) {
        state.playerTrail.forEach((pt, idx) => {
          const ratio = idx / state.playerTrail.length;
          const alpha = ratio * 0.45;
          const radius = pt.r * (0.3 + 0.7 * ratio);

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = state.superSpeedTimer > 0 ? 20 : 10;
          const glowColor = state.superSpeedTimer > 0 ? '#fbbf24' : '#4f46e5';
          ctx.shadowColor = glowColor;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          
          // Gradient fill for each trail bubble
          const trailGrad = ctx.createRadialGradient(pt.x, pt.y, radius * 0.1, pt.x, pt.y, radius);
          if (state.superSpeedTimer > 0) {
            trailGrad.addColorStop(0, '#fef08a'); // gold-200
            trailGrad.addColorStop(0.5, '#fbbf24'); // gold-400
            trailGrad.addColorStop(1, '#d97706'); // amber-600
          } else {
            trailGrad.addColorStop(0, '#e0e7ff'); // indigo-100
            trailGrad.addColorStop(0.5, '#6366f1'); // indigo-500
            trailGrad.addColorStop(1, '#312e81'); // indigo-950
          }
          
          ctx.fillStyle = trailGrad;
          ctx.fill();
          
          ctx.strokeStyle = state.superSpeedTimer > 0 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(99, 102, 241, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Add a tiny nucleotide base letter floating in some trail elements for genomic flavor!
          if (idx % 8 === 0 && ratio > 0.3) {
            const letters = ['A', 'T', 'C', 'G'];
            const letter = letters[Math.floor((pt.x + pt.y) / 50) % 4];
            ctx.shadowBlur = 0;
            ctx.fillStyle = state.superSpeedTimer > 0 ? '#ffffff' : '#a5b4fc';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, pt.x, pt.y);
          }

          ctx.restore();
        });
      }

      // F. Draw Player Avatar (The Muton Organism)
      const playerX = 100;
      const playerRadius = 24 * state.sizeMultiplier;

      ctx.save();

      // Flashing damage effect if invincible
      if (state.isInvincibleTimer > 0 && Math.floor(state.frame / 4) % 2 === 0) {
        ctx.globalAlpha = 0.3;
      }

      // Draw jetpack propulsion flame tail if flying up
      if (state.isAscending) {
        const flameGrad = ctx.createLinearGradient(playerX - playerRadius, state.playerY, playerX - playerRadius * 2, state.playerY + 10);
        flameGrad.addColorStop(0, '#f43f5e'); // red
        flameGrad.addColorStop(0.5, '#f59e0b'); // gold
        flameGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(playerX - playerRadius * 0.8, state.playerY);
        ctx.lineTo(playerX - playerRadius * 2.2, state.playerY + 8 + Math.sin(state.frame * 0.3) * 6);
        ctx.lineTo(playerX - playerRadius * 0.8, state.playerY + 16);
        ctx.closePath();
        ctx.fillStyle = flameGrad;
        ctx.fill();
      }

      // Draw Glycoprotein Shield if fully active
      if (state.shieldCharge > 0) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ea5e9'; // cyan shield glow
        ctx.beginPath();
        ctx.arc(playerX, state.playerY, playerRadius * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // Epigenetic Silenced Visual (Methyl group floating around player if locked)
      if (state.methylSilencedTimer > 0) {
        ctx.beginPath();
        ctx.arc(playerX, state.playerY, playerRadius * 1.25, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]); // clear
      }

      // Draw Main Cell Body (Muton Core)
      const bodyGrad = ctx.createRadialGradient(playerX - 4, state.playerY - 4, playerRadius * 0.1, playerX, state.playerY, playerRadius);
      bodyGrad.addColorStop(0, '#a5b4fc'); // glowing central nucleus indigo
      bodyGrad.addColorStop(0.5, '#4f46e5'); // indigo body
      bodyGrad.addColorStop(1, '#312e81');  // deep indigo boundary
      ctx.beginPath();
      ctx.arc(playerX, state.playerY, playerRadius, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.fill();
      ctx.stroke();

      // Draw organelles/lipids inside the player cell
      ctx.beginPath();
      ctx.arc(playerX - playerRadius * 0.3, state.playerY - playerRadius * 0.3, playerRadius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899'; // pink ribosome organelle
      ctx.fill();

      // Nucleolus (DNA Core)
      ctx.beginPath();
      ctx.arc(playerX + playerRadius * 0.1, state.playerY + playerRadius * 0.1, playerRadius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();

      // Draw responsive eyes based on flying state
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      // eye 1
      ctx.arc(playerX + playerRadius * 0.35, state.playerY - 3, 4 * state.sizeMultiplier, 0, Math.PI * 2);
      ctx.fill();
      // pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      const lookY = state.isAscending ? -4.5 : 1.5; // pupil responsive look direction
      ctx.arc(playerX + playerRadius * 0.42, state.playerY - 3 + lookY * 0.3, 2 * state.sizeMultiplier, 0, Math.PI * 2);
      ctx.fill();

      // Draw dynamic appendages based on unlocked phenotypes!
      const currentStats = analyzeGenome(state.genes);
      
      // Render cute little double-helix wings if they have Hyper-Hydrophobic ATPase jetpack
      if (currentStats.thrusterTier >= 2) {
        ctx.strokeStyle = '#f472b6'; // pink wing
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        // wave shape wing
        ctx.moveTo(playerX - 10, state.playerY - 5);
        ctx.bezierCurveTo(playerX - playerRadius * 1.5, state.playerY - playerRadius * 1.4, playerX - playerRadius * 1.2, state.playerY + 5, playerX - 5, state.playerY + 8);
        ctx.stroke();
      }

      ctx.restore();
    };

    const renderStatic = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Just clear and draw a clean empty state or dark base
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0f172a'; // solid dark
      ctx.fillRect(0, 0, width, height);

      // Draw faint double helix track
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handleTouchStart);
      canvas.removeEventListener('mouseup', handleTouchEnd);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPlaying]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Real-time Status Overlay HUD */}
      <div className="bg-slate-950 px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-800 gap-4">
        {/* Distance Indicator */}
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Distance</span>
            <span className="text-xl font-extrabold text-white font-mono">{distance} µm</span>
            <span className="text-xs text-indigo-400 font-bold ml-2">Zone: {currentZone}</span>
          </div>
        </div>

        {/* Evolutionary Pressure Difficulty Scaler */}
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
          <div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Evolutionary Pressure</span>
            <span className="text-sm font-extrabold text-white font-mono bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded">
              +{Math.round(((1 + (distance / 1200) * 0.15) - 1) * 100)}% Density
            </span>
          </div>
        </div>

        {/* Score & Collected Bases */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-right">Amino Score</span>
          <span className="text-xl font-extrabold text-white font-mono block text-right">{score} pts</span>
        </div>

        {/* Health Bar */}
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
          <div className="w-32 md:w-40 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-750">
            <div
              className="bg-rose-500 h-full rounded-full transition-all"
              style={{ width: `${health}%` }}
            ></div>
          </div>
          <span className="text-sm font-extrabold text-rose-400 font-mono w-10">{health}%</span>
        </div>

        {/* Music Controller */}
        <div className="flex items-center">
          <button
            onClick={() => setIsMusicMuted(!isMusicMuted)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${
              isMusicMuted 
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white' 
                : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/60 shadow-lg shadow-indigo-500/5'
            }`}
            title={isMusicMuted ? "Unmute Ambient Music" : "Mute Ambient Music"}
          >
            {isMusicMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
            )}
            <span>{isMusicMuted ? "Muted" : "Music"}</span>
          </button>
        </div>
      </div>

      {/* The main physical Canvas element */}
      <div ref={containerRef} className="relative bg-slate-950 h-[450px]">
        <canvas
          ref={canvasRef}
          className="block w-full h-full cursor-pointer focus:outline-none"
        />

        {/* Pre-game overlay start trigger */}
        {!isPlaying && !isGameOver && !isVictory && !mutationAlert && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Dna className="w-16 h-16 text-indigo-400 animate-spin mb-4" />
            <h3 className="text-2xl font-extrabold text-white">Ready for Genomic Flight?</h3>
            <p className="text-sm text-gray-400 max-w-md mt-2 mb-6">
              Hold the <strong>Spacebar</strong>, or click & hold the screen to fire your cellular thursters and soar up. 
              Release to descend. Dodge restriction cutters and collect nucleotide sequence bases!
            </p>
            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer text-lg"
            >
              <Play className="w-5 h-5" /> Let's Launch!
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <RotateCcw className="w-12 h-12 text-rose-500 mb-4 animate-spin" />
            <h3 className="text-3xl font-extrabold text-white">Genome Disintegrated!</h3>
            <p className="text-sm text-gray-400 max-w-md mt-2">
              Restriction cuts or termination Stop codons fully digested your DNA strands. Use the Mutation Lab to engineer robust defenses like Glycoprotein armor!
            </p>
            <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm inline-block">
              <span className="text-slate-400 block">Final Score: <strong className="text-white">{score}</strong></span>
              <span className="text-slate-400 block mt-1">Distance Reached: <strong className="text-white">{distance} µm</strong></span>
            </div>
            <button
              onClick={handleStartGame}
              className="mt-6 px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> Re-engineer & Retry
            </button>
          </div>
        )}

        {/* Victory Screen */}
        {isVictory && (
          <div className="absolute inset-0 bg-indigo-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
            <h3 className="text-3xl font-extrabold text-white">Evolution Completed!</h3>
            <p className="text-sm text-emerald-300 max-w-md mt-2">
              Phenotype successfully navigated cytoplasm, nucleus, ribosomes, and mitochondria, establishing maximum genomic fitness!
            </p>
            <div className="mt-6 p-4 bg-slate-900 border border-emerald-500/30 rounded-xl font-mono text-sm inline-block text-emerald-100">
              <span className="text-emerald-400 block">Maximum Distance: <strong className="text-white">7000 µm (Success!)</strong></span>
              <span className="text-emerald-400 block mt-1">Grand Score: <strong className="text-white">{score} pts</strong></span>
            </div>
            <button
              onClick={handleStartGame}
              className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> Launch Another Evolved Genotype
            </button>
          </div>
        )}

        {/* Epigenetic Silencing notification badge inside Canvas */}
        {stateRef.current.methylSilencedTimer > 0 && (
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-slate-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></span>
            <span>Epigenetically Silenced by Methyl Tag: Magnet & Thrusters limited!</span>
          </div>
        )}

        {/* ATP Super-Speed Boost active notification badge */}
        {stateRef.current.superSpeedTimer > 0 && (
          <div className="absolute bottom-4 right-4 bg-amber-950/95 border border-amber-500/40 px-3.5 py-2 rounded-xl flex items-center gap-2.5 text-xs text-amber-200 shadow-xl shadow-amber-500/15 animate-pulse z-10">
            <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
            <div>
              <span className="font-extrabold block text-amber-300">ATP HYPER-CHARGE ACTIVE!</span>
              <span className="text-[10px] text-amber-400/80">Smashed through obstacles at 2.8x speed! ({Math.round(stateRef.current.superSpeedTimer / 60 * 10) / 10}s)</span>
            </div>
          </div>
        )}

        {/* Real-time Mutation Event Modal (Pauses game dynamically) */}
        {mutationAlert && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-bold uppercase tracking-wider block w-max mb-3">
                CRISPR Mutation Encountered!
              </span>
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                <span>Mutation Type: {mutationAlert.type}</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">Gene affected: <strong className="text-indigo-300 font-mono">{mutationAlert.geneName}</strong></p>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 my-4 text-xs font-sans text-gray-300 leading-relaxed">
                <span className="font-bold text-indigo-400 font-mono">Molecular Cause:</span> {mutationAlert.description}
              </div>

              <div className="grid grid-cols-1 gap-2.5 my-4">
                <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-500 block font-mono">Old Phenotype</span>
                  <span className="text-gray-400 line-through">{mutationAlert.oldPhenotype}</span>
                </div>
                <div className="p-2.5 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-xs">
                  <span className="text-[10px] text-indigo-400 block font-mono font-bold">New MUTATED Phenotype</span>
                  <span className="text-indigo-200 font-medium">{mutationAlert.newPhenotype}</span>
                </div>
              </div>

              <button
                onClick={resumeGame}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                Accept Phenotype & Resume Run <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guide Bar */}
      <div className="bg-slate-950/80 p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
          <Shield className="w-4 h-4 text-sky-400" />
          Shield active if Glycoprotein gene has at least two Cysteines.
        </span>
        <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
          <Zap className="w-4 h-4 text-amber-400" />
          Magnet active if Ligand gene has polar Glutamine/Asparagine.
        </span>
      </div>

      {/* Molecular Element Legend */}
      <div className="bg-slate-950/45 p-6 border-t border-slate-800/80">
        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Dna className="w-4.5 h-4.5 text-indigo-400" />
          Intracellular Molecular Legend
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Column 1: Core Organism & Collectibles */}
          <div className="space-y-4">
            <h5 className="font-bold text-slate-300 border-b border-slate-800/60 pb-1.5 uppercase text-[10px] tracking-wider">
              Explorer & Resources
            </h5>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/50 flex items-center justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 border border-white/40 shadow" />
                  <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-white" />
                </div>
                <div>
                  <span className="font-extrabold text-white block">Muton Organism (You)</span>
                  <p className="text-slate-400 text-[11px] leading-snug">The engineered player cell. Thrust upward using <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono text-slate-200">Spacebar</kbd> or clicking.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center gap-0.5">
                  <span className="text-[10px] font-extrabold text-cyan-400 font-mono">A</span>
                  <span className="text-[10px] font-extrabold text-yellow-400 font-mono">T</span>
                  <span className="text-[10px] font-extrabold text-pink-400 font-mono">C</span>
                  <span className="text-[10px] font-extrabold text-emerald-400 font-mono">G</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-200 block">Nucleotide Bases</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Floating DNA building blocks. Collect bases to score points and trigger spontaneous CRISPR mutations.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-extrabold text-amber-300 block">ATP Hyper-Charge</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Energy pill granting 2.8x speed boost, invincibility, and power to smash through obstacles.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: New Active Genomic Threats */}
          <div className="space-y-4">
            <h5 className="font-bold text-slate-300 border-b border-slate-800/60 pb-1.5 uppercase text-[10px] tracking-wider">
              Active Genomic Threats
            </h5>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-950 border border-orange-500/40 flex items-center justify-center relative">
                  <div className="w-5 h-2 rounded-full bg-orange-700 absolute rotate-12" />
                  <div className="w-5 h-2 rounded-full bg-orange-700 absolute -rotate-12" />
                  <div className="w-2 h-2 rounded-full bg-white z-10" />
                </div>
                <div>
                  <span className="font-extrabold text-orange-300 block">Restriction Endonuclease</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Dual-lobed DNA shears patrolling secure areas. They actively home in on your altitude to slice your strands.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center relative">
                  <div className="w-4 h-4 rounded-full bg-purple-900 border border-purple-400" />
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-500" />
                  <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
                <div>
                  <span className="font-extrabold text-purple-300 block">DNA Methylase</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Sweeping complexes that rise and fall in waves, dropping methyl silencing groups directly in your path.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-pulse" />
                </div>
                <div>
                  <span className="font-extrabold text-cyan-300 block">Free Radicals</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Highly reactive oxygen species (ROS) moving erratically with horizontal micro-jolts, breaking gene stability.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Secondary Intracellular Elements */}
          <div className="space-y-4">
            <h5 className="font-bold text-slate-300 border-b border-slate-800/60 pb-1.5 uppercase text-[10px] tracking-wider">
              Secondary Barriers
            </h5>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <span className="text-[8px] font-extrabold text-slate-400 font-sans">Me</span>
                </div>
                <div>
                  <span className="font-extrabold text-slate-300 block">Methyl Groups (-CH3)</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Epigenetic tags that block expression. Disables attraction magnet and thwarts thruster speeds.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-950 border border-rose-500/40 flex items-center justify-center">
                  <div className="text-[8px] font-extrabold text-rose-300 font-mono tracking-tighter">STOP</div>
                </div>
                <div>
                  <span className="font-extrabold text-rose-300 block">Stop Codons</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Red octagonal blocks. Termination signals (TAA/TAG/TGA) that heavily fracture sequence on collision.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
                  <div className="w-1.5 h-8 bg-pink-500/30 absolute left-1" />
                  <div className="w-1.5 h-8 bg-pink-500/30 absolute right-1" />
                  <div className="w-3 h-3 rounded-full bg-pink-500/80" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-300 block">Spliceosomes & Histones</span>
                  <p className="text-slate-400 text-[11px] leading-snug">Spliceosome clamps slice introns vertically, while circular Histone packaging blocks obstruct DNA strand passage.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
