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
    shortSpec: 'Responsive Scale Layouts · Studded & Glossy Menus · Custom HUDs',
    isCulmination: true,
  },
];

export interface DisciplineExperience {
  id: 'scripting' | 'ui-design';
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
      'Building modular client-server frameworks, responsive combat and ability mechanics, secure DataStore/ProfileService persistence, and exploit-resistant sanity checks.',
    deliverables: [
      'Modular Luau Frameworks',
      'Combat & Raycast Systems',
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
    headline: '2+ years of experience in custom Roblox UI design and studded/glossy game menus.',
    description:
      'Crafting high-retention shop menus, studded classic-modern frames, custom glossy buttons, item slot tiles, and responsive Scale layouts across Desktop, Mobile, and Console.',
    deliverables: [
      'Studded & Glossy Shop Frames',
      'Custom Buttons & Item Tiles',
      'Lucky Block & Gamepass Stores',
      'Scale & AspectRatio Layouts',
    ],
    tools: 'Roblox UI Editor · Figma · TweenService · Custom Sprites',
  },
];

export type DisciplineId = 'scripting' | 'ui-design';
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
    label: 'Per Task',
    subtitle: 'Paid per single task only — covers 1 individual task (no multi-task bundles)',
    delivery: '1–3 Days / Task',
  },
  'short-term': {
    id: 'short-term',
    label: 'Short-Term Project',
    subtitle: 'Focused multi-task sprint or complete feature pack',
    delivery: '1–2 Weeks',
  },
  'long-term': {
    id: 'long-term',
    label: 'Long-Term Contract',
    subtitle: 'Full ongoing game production & dedicated studio commitment',
    delivery: 'Ongoing Milestones',
  },
};

export const DISCIPLINE_PRICING_TABLE: Record<
  DisciplineId,
  Record<ContractType, { usdTotal: number; robuxTotal: number }>
> = {
  scripting: {
    commission: { usdTotal: 15, robuxTotal: 5000 },
    'short-term': { usdTotal: 75, robuxTotal: 15000 },
    'long-term': { usdTotal: 140, robuxTotal: 65000 },
  },
  'ui-design': {
    commission: { usdTotal: 10, robuxTotal: 1500 },
    'short-term': { usdTotal: 34, robuxTotal: 7000 },
    'long-term': { usdTotal: 95, robuxTotal: 12000 },
  },
};

export function getPricingTiersForDiscipline(
  disciplineId: DisciplineId
): Record<ContractType, ContractPricingTier> {
  const prices = DISCIPLINE_PRICING_TABLE[disciplineId] ?? DISCIPLINE_PRICING_TABLE.scripting;
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
  getPricingTiersForDiscipline('scripting');

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

  const scopePolicyLine =
    input.contractType === 'commission'
      ? 'Task Scope Policy: Paid Per Task Only (Strictly 1 single task per payment — additional tasks billed separately)'
      : `Task Scope Policy: ${tier.subtitle}`;

  const summaryText = [
    `Developer: balo_xio (16+ Roblox Scripter & UI Designer)`,
    `Specialization: ${input.disciplineId.toUpperCase()}`,
    `Engagement: ${tier.label} ($${tier.usdTotal} USD / R$ ${tier.robuxTotal.toLocaleString('en-US')} Robux)`,
    scopePolicyLine,
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

export type PreviousWorkCategory = 'scripting' | 'ui-design';

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
  unlockLinkUrl: string;
  assetId?: string;
  gamePassId: string;
  gamePassPriceRobux: number;
  gamePassUrl: string;
  unlockFileName: string;
  unlockFileContent: string;
  systemsIncluded: string[];
  technicalHighlights: { label: string; detail: string }[];
}

export const COMBAT_SYSTEM_ASSET_URL =
  'https://create.roblox.com/store/asset/113210150229519?viewFromStudio=true&keyword=&searchId=18788722-cf9d-4565-9e61-ae99826d0e18';

export const UI_GUNS_FRAME_IMAGE_URL =
  '/assets/aistudio/Screenshot_2026-11-04_170408_bce1d72f.png';

export const UI_RAINBOW_STORE_IMAGE_URL =
  '/assets/aistudio/Screenshot_2026-10-31_164703_b9f72a73.png';

export const UI_GREEN_SHOP_HEADER_IMAGE_URL =
  '/assets/aistudio/Screenshot_2026-11-04_182243_9e238062.png';

export const UI_CLOSE_BUTTON_IMAGE_URL =
  '/assets/aistudio/Close_button_49cea447.png';

export const UI_GOLD_SLOT_IMAGE_URL =
  '/assets/aistudio/Screenshot_2026-11-04_160941_25d4441e.png';

export const VIRAL_GAME_UI_IMAGE_URL =
  '/assets/aistudio/Gemini_Generated_Image_tmic7xtmic7xtmic_f9b1a615.jpg';

export const PREVIOUS_WORK_DEMOS: PreviousWorkDemo[] = [
  {
    id: 'combat-system-balo-xio',
    index: '01',
    category: 'scripting',
    categoryLabel: 'Scripting Work',
    disciplineId: 'scripting',
    rateLabel: 'Scripting Rate: $15 USD / 5,000 R$ (Per Task · 1 Task Only) · 40% Upfront',
    title: 'The Combat System By Balo_xio',
    author: 'Balo_xio',
    craftTag: 'Luau Framework',
    description:
      'A well-designed Combat System made by Balo_xio that includes a Headshot System, Hit Markers, Recoil System, Raycasting System, Custom Animations, Reloading GUI System, Grenade Physics & Timer System, and more.',
    mediaType: 'video',
    videoUrl: '/assets/aistudio/1023_0f48f1c9.mp4',
    tryAssetUrl: COMBAT_SYSTEM_ASSET_URL,
    unlockLinkUrl: COMBAT_SYSTEM_ASSET_URL,
    assetId: '113210150229519',
    gamePassId: '2053169441',
    gamePassPriceRobux: 3500,
    gamePassUrl: 'https://www.roblox.com/game-pass/2053169441',
    unlockFileName: 'Roblox Creator Store Asset Link',
    unlockFileContent: COMBAT_SYSTEM_ASSET_URL,
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
    id: 'viral-game-ui-balo-xio',
    index: '02',
    category: 'ui-design',
    categoryLabel: 'UI Design',
    disciplineId: 'ui-design',
    rateLabel: 'UI Design Rate: $10 USD / 1,500 R$ (Per Task · 1 Task Only) · 40% Upfront',
    title: 'Custom Studded & Front-Page Game UI Pack',
    author: 'Balo_xio',
    craftTag: 'Studded Menus, Store Frames & Custom UI Components',
    description:
      'A complete Roblox UI Design showcase by Balo_xio featuring custom studded game frames and front-page store interfaces—including the Studded Sky-Blue "Guns" Inventory Window, the Rainbow Lucky Block & Server Luck x2 Store Menu, the Studded Emerald "Shop" Header Bar in Roblox Studio, the Glossy Studded Gold Item Slot Tile, and the Studded Red [X] Close Button.',
    mediaType: 'image',
    imageUrl: UI_GUNS_FRAME_IMAGE_URL,
    unlockLinkUrl: COMBAT_SYSTEM_ASSET_URL,
    gamePassId: '2053169441',
    gamePassPriceRobux: 1000,
    gamePassUrl: 'https://www.roblox.com/game-pass/2053169441',
    unlockFileName: 'Roblox Creator Store Asset Link',
    unlockFileContent: COMBAT_SYSTEM_ASSET_URL,
    galleryImages: [
      {
        url: UI_GUNS_FRAME_IMAGE_URL,
        label: 'Studded "Guns" Inventory Frame',
        subtitle: 'Sky-Blue Studded Header · Revolver Icon · Translucent Canvas',
      },
      {
        url: UI_RAINBOW_STORE_IMAGE_URL,
        label: 'Rainbow Lucky Block & Server Luck Store',
        subtitle: 'Multi-Tier Robux Purchase Cards · Server Luck x2 Banner',
      },
      {
        url: UI_GREEN_SHOP_HEADER_IMAGE_URL,
        label: 'Studded Green "Shop" Header Bar',
        subtitle: 'Roblox Studio Viewport · 3D Basket Icon & Red Close Button',
      },
      {
        url: UI_GOLD_SLOT_IMAGE_URL,
        label: 'Studded Gold Item Slot Tile',
        subtitle: 'Glossy Beveled Golden Stud Texture · Diagonal Specular Sheen',
      },
      {
        url: UI_CLOSE_BUTTON_IMAGE_URL,
        label: 'Studded Red Close [X] Button',
        subtitle: 'Tactile Pixel-Outlined X · Glossy Studded Crimson Button',
      },
      {
        url: VIRAL_GAME_UI_IMAGE_URL,
        label: 'Viral Simulator Shop Frame',
        subtitle: 'Dual Cyan-Glow Item Grids · High-Contrast Beveled Header',
      },
    ],
    systemsIncluded: [
      'Studded "Guns" Window Frame',
      'Rainbow Lucky Block Store UI',
      'Studded Green "Shop" Header',
      'Studded Gold Item Slot Tile',
      'Studded Red Close [X] Button',
      'Responsive Scale & AspectRatio',
    ],
    technicalHighlights: [
      {
        label: 'Studded "Guns" & "Shop" Header Frames',
        detail: 'Classic-meets-modern Roblox stud-textured headers in sky blue and emerald green with crisp black strokes, custom weapon/basket icons, and translucent dark body frames.',
      },
      {
        label: 'Rainbow Lucky Block & Server Luck Store UI',
        detail: 'High-conversion monetization layout featuring drop-rate percentage previews, Buy 1 / Buy 3 / Buy 8 Robux buttons, and a Server Luck x2 boost banner.',
      },
      {
        label: 'Custom Studded Gold Slot & Red Close [X] Components',
        detail: 'Reusable high-gloss studded square components with diagonal light reflections and beveled bottom edges built for tactile button press feedback.',
      },
      {
        label: 'Cross-Device Scale & AspectRatio Hierarchy',
        detail: 'Engineered in Roblox Studio with UIScale, UIStroke, and UIAspectRatioConstraint so every menu and button stays sharp on PC, Mobile, and Console.',
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
export const COMMISSION_COOLDOWN_MS = 60 * 60 * 1000;
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
  scripting: 'Scripting Work (3+ Years Experience)',
  'ui-design': 'UI Design Work (2+ Years Experience)',
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

  const workLabel = DISCIPLINE_LABELS[input.disciplineId] ?? DISCIPLINE_LABELS.scripting;
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

export const UNLOCKED_CREATIONS_STORAGE_KEY = 'balo_xio_unlocked_creations_v1';

export function getRobloxGamepassCheckoutUrl(gamePassId: string): string {
  const cleanId = String(gamePassId || '').replace(/[^0-9]/g, '');
  return `https://www.roblox.com/game-pass/${cleanId || '2053169441'}`;
}

export function getRobloxInventoryCheckUrl(userId: string, gamePassId: string): string {
  const cleanUser = String(userId || '').replace(/[^0-9]/g, '');
  const cleanPass = String(gamePassId || '').replace(/[^0-9]/g, '');
  return `https://inventory.roblox.com/v1/users/${cleanUser}/items/GamePass/${cleanPass}`;
}

export function evaluateGamepassOwnershipResponse(
  inventoryApiPayload: unknown,
  targetGamePassId: string
): boolean {
  if (!inventoryApiPayload || typeof inventoryApiPayload !== 'object') {
    return false;
  }
  const record = inventoryApiPayload as { data?: Array<{ id?: number | string; instanceId?: number | string }> };
  if (!Array.isArray(record.data) || record.data.length === 0) {
    return false;
  }
  const cleanTarget = String(targetGamePassId || '').trim();
  return record.data.some((item) => String(item.id) === cleanTarget);
}
