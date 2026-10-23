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

export interface PreviousWorkGalleryImage {
  url: string;
  label: string;
  subtitle: string;
}

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
  galleryImages?: PreviousWorkGalleryImage[];
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

export const MODELING_CHAIR_IMAGE_URL =
  '/assets/aistudio/Screenshot_2026-10-23_003728_a3e711d6.png';

export const MODELING_SEA_BEAST_IMAGE_URL =
  '/assets/aistudio/Screenshot_2026-10-23_003801_e1c7aec3.png';

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
  {
    id: 'modeling-chair-and-sea-beast-balo-xio',
    index: '04',
    category: 'modeling',
    categoryLabel: '3D Modeling',
    disciplineId: 'modeling',
    rateLabel: '3D Modeling Rate: $35 USD / 15,000 R$ (Commission) · 40% Upfront',
    title: 'Highly Polished Chair & Sea Beast',
    author: 'Balo_xio',
    craftTag: 'Hard-Surface Props & Organic Creature Sculpting',
    description:
      'A dual 3D modeling showcase by Balo_xio demonstrating versatility across both detailed environment props and organic boss creatures—featuring a Highly Polished Chair with warm hand-painted wood grain and slatted joinery, alongside a menacing Sea Beast leviathan sculpted with glowing crimson eyes, jagged multi-row fangs, and optimized Roblox Studio mesh topology.',
    mediaType: 'image',
    imageUrl: MODELING_SEA_BEAST_IMAGE_URL,
    galleryImages: [
      {
        url: MODELING_CHAIR_IMAGE_URL,
        label: 'Highly Polished Chair',
        subtitle: 'Detailed Slatted Hardwood Prop · Custom Wood Grain Texture',
      },
      {
        url: MODELING_SEA_BEAST_IMAGE_URL,
        label: 'Sea Beast',
        subtitle: 'Organic Boss Leviathan · Sculpted Scales, Fangs & Glowing Eyes',
      },
    ],
    systemsIncluded: [
      'Highly Polished Chair',
      'Sea Beast Boss Model',
      'Clean Mesh Topology',
      'UV Unwrapping & Texturing',
      'Optimized Triangle Budget',
      'Roblox Studio Import Ready',
    ],
    technicalHighlights: [
      {
        label: 'Highly Polished Chair (Environment Prop)',
        detail: 'Crisp slatted backrest and seat geometry with warm, worn wood-grain texturing and smooth edge bevels for detailed interiors and exteriors.',
      },
      {
        label: 'Sea Beast (Organic Boss Creature)',
        detail: 'Sculpted serpentine sea monster featuring glowing crimson eyes, layered dorsal fin ridges, razor-sharp teeth, and an intimidating boss silhouette.',
      },
      {
        label: 'Optimized Low & Mid-Poly Topology',
        detail: 'Engineered in Blender for smooth Roblox client frame rates without sacrificing silhouette detail or surface shading.',
      },
      {
        label: 'Clean UVs & Surface Appearance',
        detail: 'Baked textures and surface maps imported cleanly into Roblox Studio with accurate scale and collision geometry.',
      },
    ],
  },
];

export function getDemosByCategory(category: PreviousWorkCategory | 'all'): PreviousWorkDemo[] {
  if (category === 'all') return PREVIOUS_WORK_DEMOS;
  return PREVIOUS_WORK_DEMOS.filter((demo) => demo.category === category);
}

export interface SfxTrimmedProfile {
  id: 'click' | 'page-change';
  youtubeUrl: string;
  videoId: string;
  title: string;
  originalDurationSec: number;
  activeStartSec: number;
  activeEndSec: number;
  trimmedDurationSec: number;
  localTrimmedUrl: string;
}

export const SFX_AUDIO_CONFIG: Record<'click' | 'page-change', SfxTrimmedProfile> = {
  click: {
    id: 'click',
    youtubeUrl: 'https://youtu.be/nUsHboYC5zc',
    videoId: 'nUsHboYC5zc',
    title: 'Click Sound Effect',
    originalDurationSec: 6.0,
    activeStartSec: 0.85,
    activeEndSec: 0.922,
    trimmedDurationSec: 0.072,
    localTrimmedUrl: '/assets/sfx/click_trimmed.wav',
  },
  'page-change': {
    id: 'page-change',
    youtubeUrl: 'https://youtu.be/y8BpZl32S-Q',
    videoId: 'y8BpZl32S-Q',
    title: 'Camera Flash Sound Effect | Cinematic Photo Flash SFX',
    originalDurationSec: 5.0,
    activeStartSec: 0.45,
    activeEndSec: 1.1,
    trimmedDurationSec: 0.65,
    localTrimmedUrl: '/assets/sfx/camera_flash_trimmed.wav',
  },
};

export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqppkrdd';
export const COMMISSION_RECIPIENT_EMAIL = 'xamch@gmail.com';
export const COMMISSION_COOLDOWN_MS = 60 * 60 * 1000; // 1 Hour (3,600,000 ms)
export const COMMISSION_COOLDOWN_STORAGE_KEY = 'balo_xio_last_commission_ts';

export interface CooldownStatus {
  isOnCooldown: boolean;
  remainingMs: number;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedRemaining: string;
}

export function getCommissionCooldownStatus(
  lastSubmittedTimestampMs: number | null | undefined,
  nowMs: number = Date.now()
): CooldownStatus {
  if (
    lastSubmittedTimestampMs === null ||
    lastSubmittedTimestampMs === undefined ||
    !Number.isFinite(lastSubmittedTimestampMs) ||
    lastSubmittedTimestampMs <= 0
  ) {
    return {
      isOnCooldown: false,
      remainingMs: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedRemaining: '0m 00s',
    };
  }

  const elapsed = nowMs - lastSubmittedTimestampMs;
  if (elapsed >= COMMISSION_COOLDOWN_MS) {
    return {
      isOnCooldown: false,
      remainingMs: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedRemaining: '0m 00s',
    };
  }

  const remainingMs = Math.max(0, COMMISSION_COOLDOWN_MS - elapsed);
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const remainingMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const formattedRemaining = `${remainingMinutes}m ${String(remainingSeconds).padStart(2, '0')}s`;

  return {
    isOnCooldown: true,
    remainingMs,
    remainingMinutes,
    remainingSeconds,
    formattedRemaining,
  };
}

export const DISCIPLINE_LABELS: Record<DisciplineId, string> = {
  'all-rounder': 'All-Rounder (Full Pack — Scripting, UI, Modeling, Animation)',
  scripting: 'Scripting Work (3+ Years Experience)',
  'ui-design': 'UI Design Work (2+ Years Experience)',
  modeling: '3D Modeling Work (2+ Years Experience)',
  animating: 'Animation Work (1+ Year Experience)',
};

export interface CommissionEmailPayloadInput {
  commissionId: string;
  clientEmail: string;
  robloxUsername: string;
  robloxDisplayName?: string;
  robloxUserId?: string;
  robloxProfileUrl?: string;
  discordTag?: string;
  disciplineId: DisciplineId;
  contractType: ContractType;
  currency: CurrencyMode;
  projectDetails: string;
  screenshotCount?: number;
  submittedAtIso?: string;
}

export function formatCommissionEmailPayload(
  input: CommissionEmailPayloadInput
): Record<string, string> {
  const estimate = calculateCommissionBreakdown({
    disciplineId: input.disciplineId,
    contractType: input.contractType,
    currency: input.currency,
  });

  const workLabel = DISCIPLINE_LABELS[input.disciplineId] ?? DISCIPLINE_LABELS['all-rounder'];
  const cleanRobloxUser = input.robloxUsername.trim().replace(/^@/, '');
  const displayName = (input.robloxDisplayName || cleanRobloxUser).trim();
  const userId = (input.robloxUserId || '156').trim();
  const profileUrl =
    input.robloxProfileUrl ||
    `https://www.roblox.com/users/${encodeURIComponent(userId)}/profile`;
  const discord = (input.discordTag || '').trim() || 'Not provided';
  const submittedAt = input.submittedAtIso || new Date().toISOString();
  const screenshotCount = input.screenshotCount ?? 0;

  const totalFormatted = `${estimate.currencySymbol}${estimate.totalAmount.toLocaleString('en-US')} ${estimate.currencyLabel}`;
  const upfrontFormatted = `${estimate.currencySymbol}${estimate.upfrontAmount.toLocaleString('en-US')} ${estimate.currencyLabel}`;
  const completionFormatted = `${estimate.currencySymbol}${estimate.completionAmount.toLocaleString('en-US')} ${estimate.currencyLabel}`;
  const dualCurrencyEquivalent = `$${estimate.usdEquivalent.toLocaleString('en-US')} USD / ${estimate.robuxEquivalent.toLocaleString('en-US')} R$`;

  const alignedSummaryBlock = [
    '====================================================================',
    '               BALO_XIO ROBLOX COMMISSION APPLICATION               ',
    '====================================================================',
    '',
    '[01. CLIENT & CONTACT DETAILS]',
    `  • Recipient Gmail       : ${COMMISSION_RECIPIENT_EMAIL}`,
    `  • Client Gmail          : ${input.clientEmail.trim()}`,
    `  • Roblox Username       : @${cleanRobloxUser} (${displayName})`,
    `  • Roblox User ID        : ${userId}`,
    `  • Roblox Profile URL    : ${profileUrl}`,
    `  • Discord Username      : ${discord}`,
    `  • Attached Screenshots  : ${screenshotCount} / 4`,
    `  • Submitted Timestamp   : ${submittedAt}`,
    `  • Reference ID          : ${input.commissionId}`,
    '',
    '[02. COMMISSION PACKAGE & PRICING BREAKDOWN]',
    `  • Selected Work Type    : ${workLabel}`,
    `  • Engagement Term       : ${estimate.contractLabel} (${estimate.estimatedDelivery})`,
    `  • Preferred Currency    : ${estimate.currencyLabel}`,
    `  • Total Package Rate    : ${totalFormatted} (${dualCurrencyEquivalent})`,
    `  • 40% Upfront Deposit   : ${upfrontFormatted} (MANDATORY BEFORE START)`,
    `  • 60% Completion Balance: ${completionFormatted} (PAID ON COMPLETION)`,
    `  • Revenue Share Policy  : 0% Revenue Share (Strictly Fixed Rate)`,
    '',
    '====================================================================',
    '[03. PROJECT SCOPE & DESCRIPTION]',
    '--------------------------------------------------------------------',
    input.projectDetails.trim(),
    '====================================================================',
  ].join('\n');

  return {
    _subject: `[balo_xio Commission] ${workLabel} — @${cleanRobloxUser} (${totalFormatted})`,
    _replyto: input.clientEmail.trim(),
    email: input.clientEmail.trim(),
    recipient_gmail: COMMISSION_RECIPIENT_EMAIL,
    '01_Recipient_Gmail': COMMISSION_RECIPIENT_EMAIL,
    '02_Client_Gmail': input.clientEmail.trim(),
    '03_Roblox_Username': `@${cleanRobloxUser} (${displayName})`,
    '04_Roblox_User_ID': userId,
    '05_Roblox_Profile_Link': profileUrl,
    '06_Discord_Username': discord,
    '07_Selected_Work_Type': workLabel,
    '08_Engagement_Term': `${estimate.contractLabel} (${estimate.estimatedDelivery})`,
    '09_Selected_Currency': estimate.currencyLabel,
    '10_Total_Commission_Rate': `${totalFormatted} (${dualCurrencyEquivalent})`,
    '11_Mandatory_40_Percent_Upfront': upfrontFormatted,
    '12_Completion_60_Percent_Balance': completionFormatted,
    '13_Revenue_Share_Policy': 'Strictly No Revenue Share (0% Rev-Share)',
    '14_Attached_Screenshots': `${screenshotCount} image(s) attached`,
    '15_Project_Description': input.projectDetails.trim(),
    message: alignedSummaryBlock,
  };
}






