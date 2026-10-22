export interface HackerSentence {
  id: string;
  order: number;
  rawRole: string;
  sentence: string;
  highlightWord: string;
  yearsLabel: string;
  shortSpec: string;
  isCulmination?: boolean;
}

export const SENTENCE_ANIMATION_DURATION_MS = 1000;
export const VIDEO_LOOP_START_SECONDS = 2.0;

export const HACKER_SENTENCES: HackerSentence[] = [
  {
    id: 'scripter',
    order: 1,
    rawRole: 'Scripter',
    sentence: 'I am a Scripter.',
    highlightWord: 'Scripter',
    yearsLabel: '3+ Years of Scripting',
    shortSpec: 'Luau · Server-Client Frameworks · DataStores · Gameplay Systems',
  },
  {
    id: 'ui-designer',
    order: 2,
    rawRole: 'UI Designer',
    sentence: 'I am a UI Designer.',
    highlightWord: 'UI Designer',
    yearsLabel: '2+ Years in UI Design',
    shortSpec: 'Responsive Scale Layouts · TweenService Motion · Custom HUDs',
  },
  {
    id: 'animator',
    order: 3,
    rawRole: 'Animator',
    sentence: 'I am an Animator.',
    highlightWord: 'Animator',
    yearsLabel: '1+ Year of Animating',
    shortSpec: 'Moon Animator 2 & Blender · R6 & R15 Combat · Smooth Movement',
  },
  {
    id: 'modeler',
    order: 4,
    rawRole: 'Modeler',
    sentence: 'I am a Modeler.',
    highlightWord: 'Modeler',
    yearsLabel: '2+ Years of Modeling',
    shortSpec: 'Blender 3D · Low & Mid-Poly Game Meshes · Clean Topology & UVs',
  },
  {
    id: 'all-rounder',
    order: 5,
    rawRole: 'All-Rounder',
    sentence: 'I am an All-Rounder.',
    highlightWord: 'All-Rounder',
    yearsLabel: 'Complete Roblox Production',
    shortSpec: 'Scripting + UI + Modeling + Animation · Unified Studio Workflow',
    isCulmination: true,
  },
];

export interface DisciplineExperience {
  id: string;
  index: string;
  title: string;
  yearsNumeric: number;
  yearsDisplay: string;
  headline: string;
  description: string;
  deliverables: string[];
  tools: string;
}

export const DISCIPLINE_EXPERIENCES: DisciplineExperience[] = [
  {
    id: 'scripting',
    index: '01',
    title: 'Scripting',
    yearsNumeric: 3,
    yearsDisplay: '3+ Years',
    headline: '3+ years of Luau scripting and server-authoritative game systems.',
    description:
      'Building modular client-server frameworks, responsive gameplay and ability mechanics, secure DataStore/ProfileService persistence, and exploit-resistant sanity checks.',
    deliverables: [
      'Modular Luau Frameworks',
      'Gameplay & Ability Mechanics',
      'ProfileService DataStores',
      'Server Sanity Validation',
    ],
    tools: 'Roblox Studio · Luau · Rojo · ProfileService',
  },
  {
    id: 'ui-design',
    index: '02',
    title: 'UI Design',
    yearsNumeric: 2,
    yearsDisplay: '2+ Years',
    headline: '2+ years of experience in UI design and scripted interface motion.',
    description:
      'Crafting clean, high-contrast interfaces scaled properly across Desktop, Mobile, and Console screens with smooth TweenService and spring animations.',
    deliverables: [
      'Scale & AspectRatio Layouts',
      'Inventory, Shop & HUD Menus',
      'TweenService Micro-Interactions',
      'Clean Vector Iconography',
    ],
    tools: 'Figma · Roblox UI Editor · TweenService · Fusion',
  },
  {
    id: 'modeling',
    index: '03',
    title: '3D Modeling',
    yearsNumeric: 2,
    yearsDisplay: '2+ Years',
    headline: '2+ years of 3D modeling optimized for smooth Roblox frame rates.',
    description:
      'Modeling stylized and hard-surface weapons, environment props, modular map kits, and accessories with clean topology and optimized UV maps.',
    deliverables: [
      'Weapons & Interactive Props',
      'Modular Map Assets',
      'Clean Topology & UV Unwrapping',
      'Optimized Collision Geometry',
    ],
    tools: 'Blender 4.0 · Substance Painter · Roblox Mesh Importer',
  },
  {
    id: 'animating',
    index: '04',
    title: 'Animating',
    yearsNumeric: 1,
    yearsDisplay: '1+ Year',
    headline: '1+ year of animating R6, R15, and custom weapon rigs.',
    description:
      'Creating snappy melee combos, weighty movement cycles, equip/idle sequences, and keyframe-synced animations ready for immediate game integration.',
    deliverables: [
      'R6 & R15 Action Combos',
      'Movement, Dash & Idle Loops',
      'Custom Motor6D Weapon Rigs',
      'KeyframeMarker Event Syncing',
    ],
    tools: 'Moon Animator 2 · Blender Rigging · Roblox Animation Editor',
  },
];

export type DisciplineId = 'scripting' | 'ui-design' | 'modeling' | 'animating' | 'all-rounder';
export type ContractType = 'commission' | 'short-term' | 'long-term';
export type CurrencyMode = 'USD' | 'ROBUX';

export interface CommissionInput {
  disciplineId: DisciplineId;
  contractType: ContractType;
  currency: CurrencyMode;
}

export interface ContractPricingTier {
  id: ContractType;
  label: string;
  subtitle: string;
  delivery: string;
  usdTotal: number;
  robuxTotal: number;
}

export const CONTRACT_META: Record<
  ContractType,
  { id: ContractType; label: string; subtitle: string; delivery: string }
> = {
  commission: {
    id: 'commission',
    label: 'Single Commission',
    subtitle: 'One-off task, asset, UI, animation, or script',
    delivery: '1–3 Days',
  },
  'short-term': {
    id: 'short-term',
    label: 'Short-Term Project',
    subtitle: 'Focused short-term sprint or multi-asset pack',
    delivery: '1–2 Weeks',
  },
  'long-term': {
    id: 'long-term',
    label: 'Long-Term Contract',
    subtitle: 'Full ongoing development & studio commitment',
    delivery: 'Long-Term Milestone',
  },
};

export const DISCIPLINE_PRICING_TABLE: Record<
  DisciplineId,
  Record<ContractType, { usdTotal: number; robuxTotal: number }>
> = {
  'all-rounder': {
    commission: { usdTotal: 20, robuxTotal: 5000 },
    'short-term': { usdTotal: 70, robuxTotal: 20000 },
    'long-term': { usdTotal: 250, robuxTotal: 100000 },
  },
  scripting: {
    commission: { usdTotal: 15, robuxTotal: 5000 },
    'short-term': { usdTotal: 75, robuxTotal: 15000 },
    'long-term': { usdTotal: 140, robuxTotal: 65000 },
  },
  animating: {
    commission: { usdTotal: 10, robuxTotal: 2000 },
    'short-term': { usdTotal: 37, robuxTotal: 8000 },
    'long-term': { usdTotal: 120, robuxTotal: 13000 },
  },
  'ui-design': {
    commission: { usdTotal: 10, robuxTotal: 1500 },
    'short-term': { usdTotal: 34, robuxTotal: 7000 },
    'long-term': { usdTotal: 95, robuxTotal: 12000 },
  },
  modeling: {
    commission: { usdTotal: 35, robuxTotal: 15000 },
    'short-term': { usdTotal: 75, robuxTotal: 20000 },
    'long-term': { usdTotal: 130, robuxTotal: 80000 },
  },
};

export function getPricingTiersForDiscipline(
  disciplineId: DisciplineId
): Record<ContractType, ContractPricingTier> {
  const prices = DISCIPLINE_PRICING_TABLE[disciplineId] ?? DISCIPLINE_PRICING_TABLE['all-rounder'];
  return {
    commission: {
      ...CONTRACT_META.commission,
      ...prices.commission,
    },
    'short-term': {
      ...CONTRACT_META['short-term'],
      ...prices['short-term'],
    },
    'long-term': {
      ...CONTRACT_META['long-term'],
      ...prices['long-term'],
    },
  };
}

export const CONTRACT_PRICING_TIERS: Record<ContractType, ContractPricingTier> =
  getPricingTiersForDiscipline('all-rounder');

export interface CommissionEstimate {
  totalAmount: number;
  upfrontAmount: number;
  completionAmount: number;
  usdEquivalent: number;
  robuxEquivalent: number;
  upfrontPercentage: 40;
  completionPercentage: 60;
  revenueShareAccepted: false;
  currencySymbol: string;
  currencyLabel: string;
  contractLabel: string;
  estimatedDelivery: string;
  summaryText: string;
}

const CLEAN_HACKER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Full-width hacker-green decode generator for a 1-second (1000ms) sentence transition.
 * Preserves full sentence length while resolving characters left-to-right.
 */
export function scrambleText(target: string, progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped >= 1) return target;

  const totalLen = target.length;
  const lockedCount = Math.floor(clamped * totalLen);

  let result = '';
  for (let i = 0; i < totalLen; i++) {
    const ch = target[i];
    if (i < lockedCount || ch === ' ' || ch === '.' || ch === '-') {
      result += ch;
    } else {
      const idx = (i * 7 + Math.floor(clamped * 24)) % CLEAN_HACKER_CHARS.length;
      result += CLEAN_HACKER_CHARS[idx];
    }
  }
  return result;
}

export function calculateCommissionBreakdown(input: CommissionInput): CommissionEstimate {
  const tiers = getPricingTiersForDiscipline(input.disciplineId);
  const tier = tiers[input.contractType] ?? tiers.commission;

  const totalAmount = input.currency === 'USD' ? tier.usdTotal : tier.robuxTotal;
  const upfrontAmount = Math.round(totalAmount * 0.4);
  const completionAmount = totalAmount - upfrontAmount;

  const currencySymbol = input.currency === 'USD' ? '$' : 'R$ ';
  const currencyLabel = input.currency === 'USD' ? 'USD' : 'Robux';

  const summaryText = [
    `Developer: balo_xio (16+ Roblox All-Rounder)`,
    `Specialization: ${input.disciplineId.toUpperCase()}`,
    `Engagement: ${tier.label} ($${tier.usdTotal} USD / R$ ${tier.robuxTotal.toLocaleString('en-US')} Robux)`,
    `Selected Currency Total: ${currencySymbol}${totalAmount.toLocaleString('en-US')} ${currencyLabel}`,
    `40% Upfront Deposit (Required): ${currencySymbol}${upfrontAmount.toLocaleString('en-US')} ${currencyLabel}`,
    `60% Completion Balance: ${currencySymbol}${completionAmount.toLocaleString('en-US')} ${currencyLabel}`,
    `Revenue Share Policy: Strictly No Revenue Share (0%)`,
  ].join('\n');

  return {
    totalAmount,
    upfrontAmount,
    completionAmount,
    usdEquivalent: tier.usdTotal,
    robuxEquivalent: tier.robuxTotal,
    upfrontPercentage: 40,
    completionPercentage: 60,
    revenueShareAccepted: false,
    currencySymbol,
    currencyLabel,
    contractLabel: tier.label,
    estimatedDelivery: tier.delivery,
    summaryText,
  };
}

export type PreviousWorkCategory = 'scripting' | 'animating' | 'ui-design' | 'modeling';

export interface PreviousWorkDemo {
  id: string;
  index: string;
  category: PreviousWorkCategory;
  categoryLabel: string;
  disciplineId: DisciplineId;
  rateLabel: string;
  title: string;
  author: string;
  craftTag: string;
  description: string;
  mediaType: 'video' | 'image';
  videoUrl?: string;
  imageUrl?: string;
  tryAssetUrl?: string;
  assetId?: string;
  systemsIncluded: string[];
  technicalHighlights: { label: string; detail: string }[];
}

export const COMBAT_SYSTEM_ASSET_URL =
  'https://create.roblox.com/store/asset/113210150229519?viewFromStudio=true&keyword=&searchId=18788722-cf9d-4565-9e61-ae99826d0e18';

export const WALK_ANIMATION_VIDEO_URL =
  '/assets/aistudio/Roblox_Studio_2026.10.17_-_00.32.45.06_d4d05cec.mp4';

export const VIRAL_GAME_UI_IMAGE_URL =
  '/assets/aistudio/Gemini_Generated_Image_tmic7xtmic7xtmic_f9b1a615.jpg';

export const PREVIOUS_WORK_DEMOS: PreviousWorkDemo[] = [
  {
    id: 'combat-system-balo-xio',
    index: '01',
    category: 'scripting',
    categoryLabel: 'Scripting Work',
    disciplineId: 'scripting',
    rateLabel: 'Scripting Rate: $15 USD / 5,000 R$ (Commission) · 40% Upfront',
    title: 'The Combat System By Balo_xio',
    author: 'Balo_xio',
    craftTag: 'Luau Framework',
    description:
      'A well-designed Combat System made by Balo_xio that includes a Headshot System, Hit Markers, Recoil System, Raycasting System, Custom Animations, Reloading GUI System, Grenade Physics & Timer System, and more.',
    mediaType: 'video',
    videoUrl: '/assets/aistudio/1023_0f48f1c9.mp4',
    tryAssetUrl: COMBAT_SYSTEM_ASSET_URL,
    assetId: '113210150229519',
    systemsIncluded: [
      'Headshot System',
      'Hit Markers',
      'Recoil System',
      'Raycasting System',
      'Animations',
      'Reloading GUI System',
    ],
    technicalHighlights: [
      {
        label: 'Headshot & Limb Detection',
        detail: 'Multiplier-based damage calculation with floating damage indicators (-20 Headshot / -10 Body).',
      },
      {
        label: 'Raycasting & Hit Markers',
        detail: 'Instant client-responsive crosshair hit markers backed by server-side raycast validation.',
      },
      {
        label: 'Recoil & Camera Kick',
        detail: 'Procedural camera & weapon recoil recovery synced with firing cadence.',
      },
      {
        label: 'Reloading GUI & Animations',
        detail: 'Live ammo counter (15/15), weapon equip HUD icon, custom R6/R15 reload sequences, and timed explosive physics.',
      },
    ],
  },
  {
    id: 'walk-animation-balo-xio',
    index: '02',
    category: 'animating',
    categoryLabel: 'Animation Work',
    disciplineId: 'animating',
    rateLabel: 'Animation Rate: $10 USD / 2,000 R$ (Commission) · 40% Upfront',
    title: 'A Walk Animation Made By Balo_xio',
    author: 'Balo_xio',
    craftTag: 'Cinematic Walk & Camera Track',
    description:
      'A cinematic walk animation made by Balo_xio featuring synchronized cinematic camera animation, weighty R6 stride pacing, natural upper-torso counter-rotation, and smooth keyframe easing crafted for cutscenes and character entrances.',
    mediaType: 'video',
    videoUrl: WALK_ANIMATION_VIDEO_URL,
    systemsIncluded: [
      'Cinematic Walk Cycle',
      'Cinematic Camera Animation',
      'R6 Rig Keyframing',
      'UpperTorso & Limb Arcs',
      'Smooth Easing Curves',
      'Cutscene-Ready Framing',
    ],
    technicalHighlights: [
      {
        label: 'Synchronized Cinematic Camera Track',
        detail: 'Dedicated camera keyframe track animated in lockstep with the character stride for dramatic pullback and immersive cutscene framing.',
      },
      {
        label: 'Weighty Stride & Pacing',
        detail: 'Natural foot plant timing, subtle hip shift, and balanced arm swing that give the R6 rig grounded physical presence.',
      },
      {
        label: 'UpperTorso & Head Attitude',
        detail: 'Controlled torso sway and confident head posture tailored for boss intros, story cutscenes, and stylized walk cycles.',
      },
      {
        label: 'Clean Roblox Studio Timeline Export',
        detail: 'Keyframed cleanly with separated Camera, UpperTorso, and limb tracks ready for immediate in-game playback.',
      },
    ],
  },
  {
    id: 'viral-game-ui-balo-xio',
    index: '03',
    category: 'ui-design',
    categoryLabel: 'UI Design',
    disciplineId: 'ui-design',
    rateLabel: 'UI Design Rate: $10 USD / 1,500 R$ (Commission) · 40% Upfront',
    title: 'Viral Game UI',
    author: 'Balo_xio',
    craftTag: 'Front-Page Shop & Inventory Frame',
    description:
      'A polished Viral Game UI made by Balo_xio—featuring a glossy sky-blue beveled shop header with custom 3D basket iconography, a high-contrast tactile close button, dual cyan-glow inset grid containers for gamepasses and item bundles, and responsive Scale layouts built for Desktop, Mobile, and Console.',
    mediaType: 'image',
    imageUrl: VIRAL_GAME_UI_IMAGE_URL,
    systemsIncluded: [
      'Glossy Beveled Header',
      'Dual Cyan-Glow Item Grids',
      'Custom 3D Shop Iconography',
      'Tactile Close Button',
      'Responsive Scale & AspectRatio',
      'TweenService Motion Ready',
    ],
    technicalHighlights: [
      {
        label: 'Front-Page Simulator & Shop Aesthetic',
        detail: 'High-retention sky-blue glossy header with specular highlights, 3D red shopping basket emblem, and bold red close button.',
      },
      {
        label: 'Dual Cyan-Glow Inset Grid Containers',
        detail: 'Two-tier dark grid sections engineered for featured Gamepass banners on top and scrolling item or pet slots below.',
      },
      {
        label: 'Cross-Device Scale & AspectRatio',
        detail: 'Structured for UIScale, UIStroke, and UIAspectRatioConstraint hierarchy so menus remain crisp across PC, Mobile, and Console.',
      },
      {
        label: 'TweenService Pop-In & Hover Ready',
        detail: 'Cleanly separated frame layers ready for spring-based menu opening, button press feedback, and purchase animations.',
      },
    ],
  },
];

export function getDemosByCategory(category: PreviousWorkCategory | 'all'): PreviousWorkDemo[] {
  if (category === 'all') return PREVIOUS_WORK_DEMOS;
  return PREVIOUS_WORK_DEMOS.filter((demo) => demo.category === category);
}



