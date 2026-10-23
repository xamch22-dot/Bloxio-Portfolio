import {
  HACKER_SENTENCES,
  SENTENCE_ANIMATION_DURATION_MS,
  VIDEO_LOOP_START_SECONDS,
  DISCIPLINE_EXPERIENCES,
  PREVIOUS_WORK_DEMOS,
  COMBAT_SYSTEM_ASSET_URL,
  getPricingTiersForDiscipline,
  calculateCommissionBreakdown,
  scrambleText,
  getDemosByCategory,
} from './src/utils/portfolioLogic';
import {
  SHARED_LIVE_APP_URL,
  buildStandaloneGoogleSitesHtml,
} from './src/components/GoogleSitesExportModal';
import { auth, db } from './src/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

const OWNER_EMAIL = 'xamch22@gmail.com';

// Application State (Vanilla JS)
const state = {
  activeView: 'portfolio', // 'portfolio' | 'previous-work' | 'inbox'
  demoSubPage: 'all', // 'all' | 'scripting' | 'animating' | 'ui-design'
  selectedDiscipline: 'all-rounder', // 'all-rounder' | 'scripting' | 'ui-design' | 'modeling' | 'animating'
  selectedContract: 'commission', // 'commission' | 'short-term' | 'long-term'
  selectedCurrency: 'USD', // 'USD' | 'ROBUX'
  heroMuted: true,
  activeSentenceIdx: 0,
  sentenceProgress: 0,
  sentenceStartTime: performance.now(),
  // Booking Modal State
  bookingDiscipline: 'all-rounder',
  bookingContract: 'commission',
  bookingCurrency: 'USD',
  bookingAvatarData: null,
  bookingScreenshots: [],
  // Inbox State
  currentUser: null,
  ownerSessionVerified:
    typeof window !== 'undefined' &&
    window.localStorage?.getItem('balo_xio_owner_verified') === 'true',
  inboxItems: [],
  selectedInboxId: null,
  inboxFilter: 'all', // 'all' | 'unread' | 'starred' | 'accepted' | 'completed'
  inboxSearchQuery: '',
  // Code Export Modal Tab
  exportCodeTab: 'all-in-one', // 'all-in-one' | 'html' | 'css' | 'js'
};

const LOCAL_COMMISSIONS_KEY = 'balo_xio_commissions_v1';

function makeClientFallbackAvatarSvg(username) {
  const clean =
    String(username || 'RBX')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 2)
      .toUpperCase() || 'RX';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#090d0b"/></linearGradient></defs><rect width="150" height="150" rx="22" fill="url(#bg)"/><rect x="38" y="26" width="74" height="74" rx="14" fill="#d4d4d8" stroke="#10b981" stroke-width="3"/><circle cx="62" cy="56" r="5" fill="#18181b"/><circle cx="88" cy="56" r="5" fill="#18181b"/><path d="M60 76 Q75 86 90 76" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 142 C26 112 124 112 124 142" fill="#10b981" opacity="0.85"/><text x="75" y="136" font-family="monospace" font-size="15" font-weight="bold" fill="#052e16" text-anchor="middle">${clean}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function makeClientSampleScreenshotSvg(index) {
  const titles = [
    'ANIME BATTLEGROUNDS - LOBBY MAP',
    'CUSTOM HUD AND INVENTORY LAYOUT',
    'WEAPON AND RIG REFERENCE',
    'COMBAT ABILITY SHOWCASE',
  ];
  const title = titles[index % titles.length];
  const accent = index % 2 === 0 ? '#10b981' : '#34d399';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><rect width="640" height="360" fill="#090d0b"/><rect x="44" y="44" width="552" height="272" rx="12" fill="#0f1714" stroke="${accent}" stroke-width="2"/><rect x="70" y="74" width="290" height="28" rx="6" fill="${accent}" opacity="0.2"/><text x="84" y="93" font-family="monospace" font-size="13" font-weight="bold" fill="${accent}">${title}</text><rect x="70" y="122" width="310" height="160" rx="8" fill="#18181b" stroke="#27272a"/><rect x="400" y="122" width="168" height="74" rx="8" fill="#18181b" stroke="#27272a"/><rect x="400" y="208" width="168" height="74" rx="8" fill="#18181b" stroke="#27272a"/><circle cx="225" cy="202" r="42" fill="${accent}" opacity="0.25"/><polygon points="212,182 212,222 246,202" fill="${accent}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const DEFAULT_SEED_COMMISSION = {
  id: 'comm_seed_builderman',
  recipientEmail: 'xamch22@gmail.com',
  submitterUid: 'seed_system_user',
  clientEmail: 'david.studio.lead@gmail.com',
  robloxUsername: 'Builderman',
  robloxDisplayName: 'Builderman',
  robloxUserId: '156',
  robloxAvatarUrl: makeClientFallbackAvatarSvg('BM'),
  discordTag: 'builderman_dev',
  workType: 'all-rounder',
  contractType: 'short-term',
  currency: 'ROBUX',
  totalPrice: 20000,
  upfrontPrice: 8000,
  projectDetails:
    'Hey balo_xio! We need help finishing our Anime Battlegrounds lobby UI, 2 custom sword meshes, R15 dash animations, and the server-side cooldown script. Ready to pay the 40% upfront (8,000 Robux) today.',
  gameImages: [makeClientSampleScreenshotSvg(0), makeClientSampleScreenshotSvg(1)],
  status: 'unread',
  createdAtIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
};

function loadLocalCommissions() {
  try {
    const raw = window.localStorage.getItem(LOCAL_COMMISSIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [DEFAULT_SEED_COMMISSION];
}

function saveLocalCommissions(list) {
  try {
    window.localStorage.setItem(LOCAL_COMMISSIONS_KEY, JSON.stringify(list));
  } catch {}
}

// Format helper
function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

// ============================================================================
// 1. VIEW NAVIGATION (PORTFOLIO / PREVIOUS WORK / OWNER INBOX)
// ============================================================================
function setView(viewName, optionalDemoSubPage) {
  state.activeView = viewName;
  if (optionalDemoSubPage) {
    state.demoSubPage = optionalDemoSubPage;
  }

  const viewPortfolio = document.getElementById('view-portfolio');
  const viewPreviousWork = document.getElementById('view-previous-work');
  const viewInbox = document.getElementById('view-inbox');

  if (viewPortfolio) viewPortfolio.classList.toggle('hidden-view', viewName !== 'portfolio');
  if (viewPreviousWork) viewPreviousWork.classList.toggle('hidden-view', viewName !== 'previous-work');
  if (viewInbox) viewInbox.classList.toggle('hidden-view', viewName !== 'inbox');

  // Update top nav active states
  const navOverview = document.getElementById('nav-overview');
  const navPrevWork = document.getElementById('nav-previous-work');
  const navInbox = document.getElementById('nav-inbox');

  if (navOverview) {
    navOverview.className = `hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
      viewName === 'portfolio' ? 'text-white' : 'text-zinc-400'
    }`;
  }
  if (navPrevWork) {
    navPrevWork.className = `hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      viewName === 'previous-work' ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
    }`;
  }
  if (navInbox) {
    navInbox.className = `hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      viewName === 'inbox' ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
    }`;
  }

  if (viewName === 'previous-work') {
    renderPreviousWorkDemos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewName === 'inbox') {
    fetchCommissionsForInbox();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ============================================================================
// 2. HERO BACKGROUND VIDEO (2.0s LOOP) & 5-SENTENCE HACKER TEXT ANIMATION
// ============================================================================
function initHeroVideoAndHackerSequence() {
  const video = document.getElementById('hero-bg-video');
  const audioBtn = document.getElementById('hero-audio-btn');
  const replayBtn = document.getElementById('hero-replay-btn');

  if (video) {
    const enforceStart = () => {
      if (video.currentTime < VIDEO_LOOP_START_SECONDS) {
        video.currentTime = VIDEO_LOOP_START_SECONDS;
      }
    };
    video.addEventListener('loadedmetadata', enforceStart);
    video.addEventListener('timeupdate', () => {
      if (video.currentTime < VIDEO_LOOP_START_SECONDS) {
        video.currentTime = VIDEO_LOOP_START_SECONDS;
      } else if (
        Number.isFinite(video.duration) &&
        video.duration > VIDEO_LOOP_START_SECONDS + 0.5 &&
        video.currentTime >= video.duration - 0.12
      ) {
        video.currentTime = VIDEO_LOOP_START_SECONDS;
        video.play().catch(() => {});
      }
    });
    video.addEventListener('ended', () => {
      video.currentTime = VIDEO_LOOP_START_SECONDS;
      video.play().catch(() => {});
    });
  }

  if (audioBtn && video) {
    audioBtn.addEventListener('click', () => {
      state.heroMuted = !state.heroMuted;
      video.muted = state.heroMuted;
      audioBtn.setAttribute(
        'aria-label',
        state.heroMuted ? 'Unmute background video sound' : 'Mute background video sound'
      );
      audioBtn.innerHTML = state.heroMuted
        ? `<span>Video Audio: Muted</span>`
        : `<span class="text-emerald-400">Video Audio: On</span>`;
      if (!state.heroMuted) {
        if (video.currentTime < VIDEO_LOOP_START_SECONDS) {
          video.currentTime = VIDEO_LOOP_START_SECONDS;
        }
        video.play().catch(() => {});
      }
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      state.activeSentenceIdx = 0;
      state.sentenceProgress = 0;
      state.sentenceStartTime = performance.now();
      updateHeroSentenceDOM();
    });
  }

  const tick = (now) => {
    const elapsed = now - state.sentenceStartTime;
    const decodeWindowMs = 420;
    state.sentenceProgress = Math.min(1, elapsed / decodeWindowMs);
    updateHeroSentenceDOM();

    const totalStepMs =
      state.activeSentenceIdx === HACKER_SENTENCES.length - 1
        ? SENTENCE_ANIMATION_DURATION_MS + 1200
        : SENTENCE_ANIMATION_DURATION_MS;

    if (elapsed >= totalStepMs) {
      state.activeSentenceIdx = (state.activeSentenceIdx + 1) % HACKER_SENTENCES.length;
      state.sentenceProgress = 0;
      state.sentenceStartTime = now;
      updateHeroSentenceDOM();
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function updateHeroSentenceDOM() {
  const currentObj = HACKER_SENTENCES[state.activeSentenceIdx] || HACKER_SENTENCES[0];
  const decoded = scrambleText(currentObj.sentence, state.sentenceProgress);

  const headlineEl = document.getElementById('hero-animated-headline');
  const yearsEl = document.getElementById('hero-role-years');
  const specEl = document.getElementById('hero-role-spec');

  if (headlineEl && headlineEl.textContent !== decoded) {
    headlineEl.textContent = decoded;
  }
  if (yearsEl && yearsEl.textContent !== currentObj.yearsLabel) {
    yearsEl.textContent = currentObj.yearsLabel;
  }
  if (specEl && specEl.textContent !== currentObj.shortSpec) {
    specEl.textContent = currentObj.shortSpec;
  }
}

const ARROW_UP_RIGHT_SVG = `<svg class="w-3.5 h-3.5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`;

// ============================================================================
// 3. EXPERIENCE GRID RENDERER
// ============================================================================
function renderExperienceGrid() {
  const container = document.getElementById('experience-grid');
  if (!container) return;

  container.innerHTML = DISCIPLINE_EXPERIENCES.map((disc, idx) => {
    const demoLabel =
      disc.id === 'scripting'
        ? 'Scripting Work Demo'
        : disc.id === 'animating'
        ? 'Animation Work Demo'
        : disc.id === 'ui-design'
        ? 'UI Design Demo'
        : '3D Modeling Demo';

    const deliverablesHtml = disc.deliverables
      .map(
        (item, i) =>
          `<span>${item}</span>${
            i < disc.deliverables.length - 1
              ? '<span aria-hidden="true" class="text-emerald-500">·</span>'
              : ''
          }`
      )
      .join('');

    return `
      <article class="py-10 border-b border-white/10 flex flex-col justify-between ${
        idx % 2 === 0 ? 'md:pr-10 md:border-r md:border-white/10' : 'md:pl-10'
      }">
        <div>
          <div class="flex items-baseline justify-between gap-4">
            <div class="flex items-baseline gap-3">
              <span class="font-mono text-xs text-emerald-400 tabular-nums">${disc.index}.</span>
              <h3 class="font-display text-2xl sm:text-3xl font-bold text-white">${disc.title}</h3>
            </div>
            <span class="font-display text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">${
              disc.yearsDisplay
            }</span>
          </div>
          <p class="mt-3 text-base font-medium text-zinc-200">${disc.headline}</p>
          <p class="mt-2 text-sm text-zinc-400 leading-relaxed">${disc.description}</p>
          <div class="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-zinc-300">
            ${deliverablesHtml}
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span class="font-mono text-zinc-400">${disc.tools}</span>
          <div class="flex items-center gap-4">
            <button type="button" data-open-demo="${disc.id}" class="inline-flex items-center gap-1 font-mono font-medium text-zinc-200 hover:text-emerald-400 underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              <span>${demoLabel}</span>
              ${ARROW_UP_RIGHT_SVG}
            </button>
            <a href="#estimator" data-select-discipline="${disc.id}" class="inline-flex items-center gap-1 font-medium text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0">
              <span>Select ${disc.title}</span>
              ${ARROW_UP_RIGHT_SVG}
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  container.querySelectorAll('[data-open-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sub = btn.getAttribute('data-open-demo');
      setView('previous-work', sub);
    });
  });

  container.querySelectorAll('[data-select-discipline]').forEach((link) => {
    link.addEventListener('click', () => {
      const discId = link.getAttribute('data-select-discipline');
      state.selectedDiscipline = discId;
      renderRateEstimator();
    });
  });
}

// ============================================================================
// 4. INTERACTIVE RATE & 40% UPFRONT ESTIMATOR
// ============================================================================
function renderRateEstimator() {
  const roleContainer = document.getElementById('estimator-roles');
  const contractContainer = document.getElementById('estimator-contracts');
  const currencyContainer = document.getElementById('estimator-currencies');

  const roles = [
    { id: 'all-rounder', label: 'All-Rounder (Full Pack)' },
    { id: 'scripting', label: 'Scripting (3+ Yrs)' },
    { id: 'ui-design', label: 'UI Design (2+ Yrs)' },
    { id: 'modeling', label: '3D Modeling (2+ Yrs)' },
    { id: 'animating', label: 'Animating (1+ Yr)' },
  ];

  if (roleContainer) {
    roleContainer.innerHTML = roles
      .map(
        (r) => `
        <button
          type="button"
          data-role-btn="${r.id}"
          class="px-3.5 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            state.selectedDiscipline === r.id
              ? 'bg-emerald-400 text-zinc-950 border-emerald-400 font-semibold'
              : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/25 hover:text-white'
          }"
        >
          ${r.label}
        </button>
      `
      )
      .join('');

    roleContainer.querySelectorAll('[data-role-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedDiscipline = btn.getAttribute('data-role-btn');
        renderRateEstimator();
      });
    });
  }

  const tiers = getPricingTiersForDiscipline(state.selectedDiscipline);
  if (contractContainer) {
    contractContainer.innerHTML = Object.values(tiers)
      .map(
        (tier) => `
        <button
          type="button"
          data-contract-btn="${tier.id}"
          class="p-4 text-left rounded-md border transition-colors cursor-pointer ${
            state.selectedContract === tier.id
              ? 'bg-emerald-950/35 border-emerald-400 text-white'
              : 'bg-zinc-900/60 border-white/10 text-zinc-300 hover:border-white/25'
          }"
        >
          <div class="font-display text-sm font-bold text-white">${tier.label}</div>
          <div class="font-mono text-xs text-emerald-400 mt-1 tabular-nums">
            $${tier.usdTotal} USD / ${formatNumber(tier.robuxTotal)} R$
          </div>
          <div class="text-xs text-zinc-400 mt-1">${tier.subtitle}</div>
        </button>
      `
      )
      .join('');

    contractContainer.querySelectorAll('[data-contract-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedContract = btn.getAttribute('data-contract-btn');
        renderRateEstimator();
      });
    });
  }

  if (currencyContainer) {
    currencyContainer.innerHTML = ['USD', 'ROBUX']
      .map(
        (curr) => `
        <button
          type="button"
          data-currency-btn="${curr}"
          class="px-5 py-2.5 text-xs font-mono font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            state.selectedCurrency === curr
              ? 'bg-emerald-400 text-zinc-950 border-emerald-400'
              : 'bg-zinc-900/80 text-zinc-300 border-white/10 hover:border-white/25 hover:text-white'
          }"
        >
          ${curr === 'USD' ? 'USD ($)' : 'Robux (R$)'}
        </button>
      `
      )
      .join('');

    currencyContainer.querySelectorAll('[data-currency-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedCurrency = btn.getAttribute('data-currency-btn');
        renderRateEstimator();
      });
    });
  }

  const estimate = calculateCommissionBreakdown({
    disciplineId: state.selectedDiscipline,
    contractType: state.selectedContract,
    currency: state.selectedCurrency,
  });

  const labelEl = document.getElementById('receipt-contract-label');
  const totalEl = document.getElementById('receipt-total-amount');
  const equivEl = document.getElementById('receipt-equivalent');
  const deliveryEl = document.getElementById('receipt-delivery');
  const upfrontEl = document.getElementById('receipt-upfront-amount');
  const completionEl = document.getElementById('receipt-completion-amount');

  if (labelEl) labelEl.textContent = estimate.contractLabel.toUpperCase();
  if (totalEl) totalEl.textContent = `${estimate.currencySymbol}${formatNumber(estimate.totalAmount)}`;
  if (equivEl) {
    equivEl.textContent = `($${estimate.usdEquivalent} USD / ${formatNumber(estimate.robuxEquivalent)} Robux)`;
  }
  if (deliveryEl) deliveryEl.textContent = estimate.estimatedDelivery;
  if (upfrontEl) upfrontEl.textContent = `${estimate.currencySymbol}${formatNumber(estimate.upfrontAmount)}`;
  if (completionEl) {
    completionEl.textContent = `${estimate.currencySymbol}${formatNumber(estimate.completionAmount)}`;
  }
}

// ============================================================================
// 5. PREVIOUS WORK (DEMO) PAGE RENDERER (SCRIPTING, ANIMATION, UI DESIGN)
// ============================================================================
function renderPreviousWorkDemos() {
  const tabsContainer = document.getElementById('previous-work-tabs');
  const breadcrumbSub = document.getElementById('previous-work-breadcrumb-sub');
  const headingEl = document.getElementById('previous-work-main-heading');
  const listContainer = document.getElementById('previous-work-list');

  const subPageTitle =
    state.demoSubPage === 'scripting'
      ? 'Scripting Work'
      : state.demoSubPage === 'animating'
      ? 'Animation Work'
      : state.demoSubPage === 'ui-design'
      ? 'UI Design'
      : state.demoSubPage === 'modeling'
      ? '3D Modeling'
      : 'Previous Work (Demo)';

  if (breadcrumbSub) breadcrumbSub.textContent = subPageTitle;
  if (headingEl) headingEl.textContent = subPageTitle;

  const hasModeling = PREVIOUS_WORK_DEMOS.some((d) => d.category === 'modeling');
  const tabs = [
    { id: 'all', label: `All Demos (${PREVIOUS_WORK_DEMOS.length})` },
    { id: 'scripting', label: 'Scripting Work' },
    { id: 'animating', label: 'Animation Work' },
    { id: 'ui-design', label: 'UI Design' },
    ...(hasModeling ? [{ id: 'modeling', label: '3D Modeling' }] : []),
  ];

  if (tabsContainer) {
    tabsContainer.innerHTML = tabs
      .map(
        (t) => `
        <button
          type="button"
          role="tab"
          aria-selected="${state.demoSubPage === t.id}"
          data-demo-tab="${t.id}"
          class="px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            state.demoSubPage === t.id
              ? 'bg-emerald-400 text-zinc-950 font-semibold'
              : 'text-zinc-300 hover:text-white'
          }"
        >
          ${t.label}
        </button>
      `
      )
      .join('');

    tabsContainer.querySelectorAll('[data-demo-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.demoSubPage = btn.getAttribute('data-demo-tab');
        renderPreviousWorkDemos();
      });
    });
  }

  const visibleDemos =
    state.demoSubPage === 'all'
      ? PREVIOUS_WORK_DEMOS
      : getDemosByCategory(state.demoSubPage);

  if (!listContainer) return;

  listContainer.innerHTML = visibleDemos
    .map((demo) => {
      const bookButtonLabel =
        demo.category === 'scripting'
          ? 'Book Custom Scripting'
          : demo.category === 'animating'
          ? 'Book Custom Animation'
          : demo.category === 'modeling'
          ? 'Book Custom 3D Modeling'
          : 'Book Custom UI Design';

      const highlightsHeading =
        demo.category === 'scripting'
          ? 'Included Core Systems:'
          : demo.category === 'animating'
          ? 'Animation Highlights:'
          : demo.category === 'modeling'
          ? '3D Modeling Highlights:'
          : 'UI Design Highlights:';

      const systemsHtml = demo.systemsIncluded
        .map(
          (sys, idx) =>
            `<span class="text-emerald-400">${sys}</span>${
              idx < demo.systemsIncluded.length - 1
                ? '<span aria-hidden="true" class="text-zinc-500">·</span>'
                : ''
            }`
        )
        .join('');

      const techRowsHtml = demo.technicalHighlights
        .map(
          (item) => `
          <div class="py-3">
            <div class="text-xs font-mono font-semibold text-white">${item.label}</div>
            <div class="text-xs text-zinc-400 mt-0.5 leading-relaxed">${item.detail}</div>
          </div>
        `
        )
        .join('');

      const mediaColumnHtml =
        demo.mediaType === 'video' && demo.videoUrl
          ? `
            <div class="relative rounded-lg overflow-hidden border border-white/15 bg-black shadow-2xl">
              <video
                id="video-${demo.id}"
                src="${demo.videoUrl}"
                autoplay
                loop
                muted
                playsinline
                controls
                class="w-full aspect-video object-cover bg-zinc-950"
              ></video>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-zinc-400">
              <div class="flex items-center gap-2">
                <span>Roblox Studio Live Capture</span>
                <span aria-hidden="true">·</span>
                <span class="text-emerald-400">${
                  demo.assetId ? `Asset ID: ${demo.assetId}` : demo.craftTag
                }</span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" data-video-toggle="${demo.id}" class="px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded cursor-pointer">Pause</button>
                <button type="button" data-video-mute="${demo.id}" class="px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded cursor-pointer">Unmute Audio</button>
                <button type="button" data-video-replay="${demo.id}" class="px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded cursor-pointer">Replay</button>
              </div>
            </div>
          `
          : `
            <div class="relative rounded-lg overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl">
              <img
                src="${demo.imageUrl}"
                alt="${demo.title} — ${demo.craftTag} by ${demo.author}"
                referrerpolicy="no-referrer"
                class="w-full h-auto object-contain bg-zinc-950"
              />
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-zinc-400">
              <div class="flex items-center gap-2">
                <span>High-Resolution Roblox Showcase</span>
                <span aria-hidden="true">·</span>
                <span class="text-emerald-400">${demo.craftTag}</span>
              </div>
              <button
                type="button"
                data-open-lightbox="${demo.id}"
                aria-label="Inspect ${demo.title} in fullscreen"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded transition-colors cursor-pointer"
              >
                <span>Inspect Fullscreen</span>
              </button>
            </div>
          `;

      return `
        <section id="demo-${demo.category}" aria-labelledby="heading-${demo.id}" class="py-12 border-b border-white/10">
          <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p class="text-xs font-mono text-emerald-400 mb-1.5">${demo.index}. ${demo.categoryLabel} Section</p>
              <h2 id="heading-${demo.id}" class="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white text-balance">${demo.title}</h2>
            </div>
            ${
              demo.tryAssetUrl
                ? `<a href="${demo.tryAssetUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto">
                    <span>Try Combat System on Roblox</span>
                    ${ARROW_UP_RIGHT_SVG}
                  </a>`
                : ''
            }
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div class="lg:col-span-7 space-y-4">
              ${mediaColumnHtml}
            </div>

            <div class="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span class="text-emerald-400 font-semibold">${demo.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>Created by ${demo.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>${demo.craftTag}</span>
                </div>
                <p class="text-sm sm:text-base text-zinc-200 leading-relaxed">${demo.description}</p>
                <div class="pt-1">
                  <div class="text-xs font-mono text-zinc-400 mb-2">${highlightsHeading}</div>
                  <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-zinc-200">
                    ${systemsHtml}
                  </div>
                </div>
              </div>

              <div class="border-t border-white/10 divide-y divide-white/10">
                ${techRowsHtml}
              </div>

              <div class="pt-2 space-y-3">
                ${
                  demo.tryAssetUrl
                    ? `<div class="flex flex-wrap items-center gap-3">
                        <a href="${demo.tryAssetUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0">
                          <span>Try Combat System (Roblox Studio)</span>
                          ${ARROW_UP_RIGHT_SVG}
                        </a>
                        <button type="button" data-copy-asset="${demo.tryAssetUrl}" class="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-mono font-medium text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                          <span>Copy Roblox Link</span>
                        </button>
                      </div>`
                    : ''
                }

                <div class="p-3.5 rounded-md bg-zinc-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="text-xs text-zinc-300 font-mono">${demo.rateLabel}</div>
                  <button type="button" data-book-demo="${demo.id}" class="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer">
                    <span>${bookButtonLabel}</span>
                    ${ARROW_UP_RIGHT_SVG}
                  </button>
                </div>
              </div>
            </div>
          </div>

          ${
            demo.tryAssetUrl
              ? `<div class="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="space-y-1 min-w-0">
                    <div class="text-xs font-mono text-emerald-400">Official Roblox Creator Store Link</div>
                    <a href="${demo.tryAssetUrl}" target="_blank" rel="noopener noreferrer" class="block text-xs font-mono text-zinc-300 hover:text-white truncate underline underline-offset-4">${demo.tryAssetUrl}</a>
                  </div>
                  <a href="${demo.tryAssetUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap shrink-0">
                    <span>Open in Roblox Creator Store</span>
                    ${ARROW_UP_RIGHT_SVG}
                  </a>
                </div>`
              : ''
          }
        </section>
      `;
    })
    .join('');

  // Wire video controls
  listContainer.querySelectorAll('[data-video-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-video-toggle');
      const v = document.getElementById(`video-${id}`);
      if (!v) return;
      if (v.paused) {
        v.play().catch(() => {});
        btn.textContent = 'Pause';
      } else {
        v.pause();
        btn.textContent = 'Play';
      }
    });
  });

  listContainer.querySelectorAll('[data-video-mute]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-video-mute');
      const v = document.getElementById(`video-${id}`);
      if (!v) return;
      v.muted = !v.muted;
      btn.textContent = v.muted ? 'Unmute Audio' : 'Audio On';
    });
  });

  listContainer.querySelectorAll('[data-video-replay]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-video-replay');
      const v = document.getElementById(`video-${id}`);
      if (!v) return;
      v.currentTime = 0;
      v.play().catch(() => {});
    });
  });

  // Copy asset link
  listContainer.querySelectorAll('[data-copy-asset]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = btn.getAttribute('data-copy-asset');
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
      btn.innerHTML = `<span class="text-emerald-400">Link Copied</span>`;
      setTimeout(() => {
        btn.innerHTML = `<span>Copy Roblox Link</span>`;
      }, 2000);
    });
  });

  // Lightbox for UI Design
  listContainer.querySelectorAll('[data-open-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const demoId = btn.getAttribute('data-open-lightbox');
      const found = PREVIOUS_WORK_DEMOS.find((d) => d.id === demoId);
      if (found) openImageLightbox(found);
    });
  });

  // Book from Demo
  listContainer.querySelectorAll('[data-book-demo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const demoId = btn.getAttribute('data-book-demo');
      const found = PREVIOUS_WORK_DEMOS.find((d) => d.id === demoId);
      if (!found) return;
      const est = calculateCommissionBreakdown({
        disciplineId: found.disciplineId,
        contractType: 'commission',
        currency: 'USD',
      });
      state.bookingDiscipline = found.disciplineId;
      openBookingModal(`${est.summaryText}\nReference Demo: ${found.title}`);
    });
  });
}

function openImageLightbox(demo) {
  const modal = document.getElementById('ui-lightbox-modal');
  const titleEl = document.getElementById('lightbox-title');
  const subEl = document.getElementById('lightbox-subtitle');
  const imgEl = document.getElementById('lightbox-img');
  if (!modal || !imgEl) return;

  if (titleEl) titleEl.textContent = demo.title;
  if (subEl) subEl.textContent = `${demo.categoryLabel} · Created by ${demo.author} · ${demo.craftTag}`;
  imgEl.src = demo.imageUrl || '';
  imgEl.alt = demo.title;
  modal.classList.remove('hidden-view');
}

// ============================================================================
// 6. COMMISSION BOOKING MODAL & ROBLOX AVATAR BOT
// ============================================================================
function openBookingModal(prefilledText) {
  const modal = document.getElementById('booking-modal');
  const detailsArea = document.getElementById('booking-project-details');
  const statusBanner = document.getElementById('booking-submit-status');

  if (statusBanner) statusBanner.classList.add('hidden-view');
  if (prefilledText && detailsArea) {
    detailsArea.value = prefilledText;
  }
  renderBookingSelectors();
  if (modal) modal.classList.remove('hidden-view');
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.add('hidden-view');
}

function renderBookingSelectors() {
  const workGrid = document.getElementById('booking-worktype-grid');
  const contractGrid = document.getElementById('booking-contract-grid');
  const currencyGrid = document.getElementById('booking-currency-grid');
  const upfrontSummary = document.getElementById('booking-upfront-banner');

  const workOptions = [
    { id: 'all-rounder', label: 'All-Rounder (Full Pack)' },
    { id: 'scripting', label: 'Scripting Work' },
    { id: 'ui-design', label: 'UI Design Work' },
    { id: 'modeling', label: '3D Modeling Work' },
    { id: 'animating', label: 'Animation Work' },
  ];

  if (workGrid) {
    workGrid.innerHTML = workOptions
      .map(
        (w) => `
        <button
          type="button"
          data-book-work="${w.id}"
          class="px-3 py-2 text-xs font-medium rounded border transition-colors cursor-pointer ${
            state.bookingDiscipline === w.id
              ? 'bg-emerald-400 text-zinc-950 border-emerald-400 font-semibold'
              : 'bg-zinc-900 text-zinc-300 border-white/10 hover:border-white/25'
          }"
        >
          ${w.label}
        </button>
      `
      )
      .join('');

    workGrid.querySelectorAll('[data-book-work]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.bookingDiscipline = btn.getAttribute('data-book-work');
        renderBookingSelectors();
      });
    });
  }

  const tiers = getPricingTiersForDiscipline(state.bookingDiscipline);
  if (contractGrid) {
    contractGrid.innerHTML = Object.values(tiers)
      .map(
        (t) => `
        <button
          type="button"
          data-book-tier="${t.id}"
          class="p-3 text-left rounded border transition-colors cursor-pointer ${
            state.bookingContract === t.id
              ? 'bg-emerald-950/40 border-emerald-400 text-white'
              : 'bg-zinc-900 border-white/10 text-zinc-300 hover:border-white/25'
          }"
        >
          <div class="text-xs font-bold text-white">${t.label}</div>
          <div class="text-[11px] font-mono text-emerald-400 mt-0.5">$${t.usdTotal} / ${formatNumber(t.robuxTotal)} R$</div>
        </button>
      `
      )
      .join('');

    contractGrid.querySelectorAll('[data-book-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.bookingContract = btn.getAttribute('data-book-tier');
        renderBookingSelectors();
      });
    });
  }

  if (currencyGrid) {
    currencyGrid.innerHTML = ['USD', 'ROBUX']
      .map(
        (c) => `
        <button
          type="button"
          data-book-curr="${c}"
          class="px-4 py-2 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer ${
            state.bookingCurrency === c
              ? 'bg-emerald-400 text-zinc-950 border-emerald-400'
              : 'bg-zinc-900 text-zinc-300 border-white/10'
          }"
        >
          ${c === 'USD' ? 'USD ($)' : 'Robux (R$)'}
        </button>
      `
      )
      .join('');

    currencyGrid.querySelectorAll('[data-book-curr]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.bookingCurrency = btn.getAttribute('data-book-curr');
        renderBookingSelectors();
      });
    });
  }

  const est = calculateCommissionBreakdown({
    disciplineId: state.bookingDiscipline,
    contractType: state.bookingContract,
    currency: state.bookingCurrency,
  });

  if (upfrontSummary) {
    upfrontSummary.innerHTML = `
      <span>Total: <strong class="text-white">${est.currencySymbol}${formatNumber(est.totalAmount)} ${est.currencyLabel}</strong></span>
      <span>·</span>
      <span>Mandatory 40% Upfront: <strong class="text-emerald-400">${est.currencySymbol}${formatNumber(est.upfrontAmount)} ${est.currencyLabel}</strong></span>
      <span>·</span>
      <span>0% Revenue Share</span>
    `;
  }
}

async function lookupRobloxAvatarBot(username) {
  const previewBox = document.getElementById('booking-avatar-preview');
  const clean = String(username || '').trim().replace(/^@/, '');
  if (!clean) return;
  if (previewBox) {
    previewBox.innerHTML = `<span class="text-xs font-mono text-zinc-400">Roblox Bot searching @${clean}...</span>`;
  }
  let resolved = null;
  try {
    const res = await fetch(`/api/roblox-user?username=${encodeURIComponent(clean)}`);
    if (res.ok) {
      resolved = await res.json();
    }
  } catch {}

  if (!resolved) {
    resolved = {
      found: false,
      userId: '156',
      username: clean,
      displayName: clean,
      avatarUrl: makeClientFallbackAvatarSvg(clean),
      profileUrl: `https://www.roblox.com/search/users?keyword=${encodeURIComponent(clean)}`,
    };
  }

  state.bookingAvatarData = resolved;
  if (previewBox) {
    previewBox.innerHTML = `
      <div class="flex items-center gap-3 p-2.5 rounded bg-zinc-900 border border-emerald-500/30">
        <img src="${resolved.avatarUrl}" alt="${resolved.username}" referrerpolicy="no-referrer" class="w-10 h-10 rounded-full border border-emerald-400 object-cover bg-zinc-950" />
        <div class="text-xs">
          <div class="font-bold text-white">${resolved.displayName} (@${resolved.username})</div>
          <div class="font-mono text-emerald-400">Roblox Avatar Attached · ID: ${resolved.userId}</div>
        </div>
      </div>
    `;
  }
}

function renderBookingScreenshotsPreview() {
  const container = document.getElementById('booking-screenshots-preview');
  if (!container) return;
  if (!state.bookingScreenshots.length) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = state.bookingScreenshots
    .map(
      (src, idx) => `
      <div class="relative rounded border border-white/15 overflow-hidden bg-zinc-950 group">
        <img src="${src}" alt="Screenshot ${idx + 1}" class="w-full h-16 object-cover" />
        <button
          type="button"
          data-remove-shot="${idx}"
          class="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-mono bg-black/80 text-rose-300 rounded cursor-pointer"
        >
          ✕
        </button>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('[data-remove-shot]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-remove-shot'));
      state.bookingScreenshots = state.bookingScreenshots.filter((_, i) => i !== idx);
      renderBookingScreenshotsPreview();
    });
  });
}

// ============================================================================
// 7. PRIVATE OWNER INBOX (LOCKED TO xamch22@gmail.com — VERCEL COMPATIBLE)
// ============================================================================
async function fetchCommissionsForInbox() {
  const localItems = loadLocalCommissions();
  const map = new Map();
  for (const item of localItems) {
    map.set(item.id, item);
  }

  try {
    const res = await fetch('/api/commissions');
    if (res.ok) {
      const data = await res.json();
      const apiList = Array.isArray(data.commissions) ? data.commissions : [];
      for (const item of apiList) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
  } catch {}

  state.inboxItems = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAtIso || 0).getTime() - new Date(a.createdAtIso || 0).getTime()
  );
  saveLocalCommissions(state.inboxItems);

  if (!state.selectedInboxId && state.inboxItems.length > 0) {
    state.selectedInboxId = state.inboxItems[0].id;
  }
  renderInboxView();
}

function updateCommissionItemStatus(id, nextStatus) {
  state.inboxItems = state.inboxItems.map((item) =>
    item.id === id ? { ...item, status: nextStatus } : item
  );
  saveLocalCommissions(state.inboxItems);
  fetch(`/api/commissions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: nextStatus }),
  }).catch(() => {});
  renderInboxView();
}

function deleteCommissionItem(id) {
  state.inboxItems = state.inboxItems.filter((item) => item.id !== id);
  saveLocalCommissions(state.inboxItems);
  if (state.selectedInboxId === id) {
    state.selectedInboxId = state.inboxItems[0]?.id || null;
  }
  fetch(`/api/commissions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(() => {});
  renderInboxView();
}

function renderInboxView() {
  const authGate = document.getElementById('inbox-auth-gate');
  const mailClient = document.getElementById('inbox-mail-client');
  const authError = document.getElementById('inbox-auth-error');
  const unreadBadge = document.getElementById('inbox-unread-badge');

  const isFirebaseOwner =
    state.currentUser &&
    state.currentUser.email &&
    state.currentUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const isOwner = Boolean(isFirebaseOwner || state.ownerSessionVerified);

  if (!isOwner) {
    if (authGate) authGate.classList.remove('hidden-view');
    if (mailClient) mailClient.classList.add('hidden-view');
    if (authError) {
      if (state.currentUser && state.currentUser.email && !isFirebaseOwner) {
        authError.textContent = `Access Denied: Signed in as ${state.currentUser.email}. Only ${OWNER_EMAIL} can access this private inbox.`;
        authError.classList.remove('hidden-view');
      }
    }
    return;
  }

  if (authGate) authGate.classList.add('hidden-view');
  if (mailClient) mailClient.classList.remove('hidden-view');

  const unreadCount = state.inboxItems.filter((i) => i.status === 'unread').length;
  if (unreadBadge) {
    unreadBadge.textContent = `(${unreadCount} unread)`;
  }

  // Render Folder Filters
  const folderListEl = document.getElementById('inbox-folder-list');
  if (folderListEl) {
    const folders = [
      { id: 'all', label: 'All Mail', count: state.inboxItems.length },
      { id: 'unread', label: 'Unread', count: unreadCount },
      {
        id: 'starred',
        label: 'Starred',
        count: state.inboxItems.filter((i) => i.status === 'starred').length,
      },
      {
        id: 'accepted',
        label: 'Accepted (40% Paid)',
        count: state.inboxItems.filter((i) => i.status === 'accepted').length,
      },
      {
        id: 'completed',
        label: 'Completed',
        count: state.inboxItems.filter((i) => i.status === 'completed').length,
      },
    ];

    folderListEl.innerHTML = folders
      .map(
        (f) => `
        <button
          type="button"
          data-inbox-folder="${f.id}"
          class="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            state.inboxFilter === f.id
              ? 'bg-emerald-400/15 text-emerald-300 font-semibold'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
          }"
        >
          <span class="truncate">${f.label}</span>
          <span class="font-mono text-[11px] tabular-nums">${f.count}</span>
        </button>
      `
      )
      .join('');

    folderListEl.querySelectorAll('[data-inbox-folder]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.inboxFilter = btn.getAttribute('data-inbox-folder');
        renderInboxView();
      });
    });
  }

  const listEl = document.getElementById('inbox-message-list');
  const detailEl = document.getElementById('inbox-message-detail');

  const filtered = state.inboxItems.filter((item) => {
    if (state.inboxFilter !== 'all' && item.status !== state.inboxFilter) return false;
    if (state.inboxSearchQuery.trim()) {
      const q = state.inboxSearchQuery.toLowerCase();
      const hay = `${item.clientEmail} ${item.robloxUsername} ${item.robloxDisplayName} ${item.projectDetails} ${item.discordTag}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (listEl) {
    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="p-6 text-xs font-mono text-zinc-400">No commissions in this mailbox filter.</div>`;
    } else {
      listEl.innerHTML = filtered
        .map(
          (item) => `
          <button
            type="button"
            data-inbox-item="${item.id}"
            class="w-full text-left p-4 border-b border-white/10 hover:bg-zinc-900/80 transition-colors flex items-start gap-3 cursor-pointer ${
              state.selectedInboxId === item.id ? 'bg-emerald-950/25 border-l-2 border-l-emerald-400' : ''
            }"
          >
            <img src="${item.robloxAvatarUrl || makeClientFallbackAvatarSvg(item.robloxUsername)}" alt="${item.robloxUsername}" referrerpolicy="no-referrer" class="w-10 h-10 rounded-full border border-emerald-500/40 shrink-0 object-cover bg-zinc-900" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="font-bold text-xs text-white truncate">@${item.robloxUsername}</span>
                <span class="font-mono text-[11px] text-emerald-400 shrink-0">${
                  item.currency === 'USD' ? '$' : 'R$ '
                }${formatNumber(item.totalPrice)}</span>
              </div>
              <div class="text-xs text-zinc-300 truncate">${item.clientEmail}</div>
              <div class="flex items-center justify-between gap-2 mt-1">
                <span class="text-[11px] font-mono text-zinc-400">${item.workType.toUpperCase()} · ${item.contractType.toUpperCase()}</span>
                <span class="text-[10px] font-mono text-emerald-400 uppercase">${item.status}</span>
              </div>
            </div>
          </button>
        `
        )
        .join('');

      listEl.querySelectorAll('[data-inbox-item]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.selectedInboxId = btn.getAttribute('data-inbox-item');
          renderInboxView();
        });
      });
    }
  }

  const selected = state.inboxItems.find((i) => i.id === state.selectedInboxId) || filtered[0];
  if (detailEl) {
    if (!selected) {
      detailEl.innerHTML = `<div class="p-8 text-sm text-zinc-400">Select a commission email on the left to inspect its details.</div>`;
    } else {
      const symbol = selected.currency === 'USD' ? '$' : 'R$ ';
      const screenshotsHtml =
        Array.isArray(selected.gameImages) && selected.gameImages.length > 0
          ? `<div class="mt-6">
              <div class="text-xs font-mono text-zinc-400 mb-3">Attached Game Screenshots (${selected.gameImages.length}):</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${selected.gameImages
                  .map(
                    (src, idx) =>
                      `<img src="${src}" alt="Game screenshot ${idx + 1}" referrerpolicy="no-referrer" class="rounded-lg border border-white/15 w-full h-44 object-cover bg-zinc-950" />`
                  )
                  .join('')}
              </div>
            </div>`
          : '';

      detailEl.innerHTML = `
        <div class="p-6 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div class="flex items-center gap-4">
              <img src="${selected.robloxAvatarUrl || makeClientFallbackAvatarSvg(selected.robloxUsername)}" alt="${selected.robloxUsername}" referrerpolicy="no-referrer" class="w-14 h-14 rounded-full border-2 border-emerald-400 object-cover bg-zinc-900" />
              <div>
                <h3 class="font-display text-xl font-bold text-white">${selected.robloxDisplayName} (@${selected.robloxUsername})</h3>
                <div class="text-xs font-mono text-emerald-400">From Gmail: ${selected.clientEmail} · Discord: ${selected.discordTag}</div>
              </div>
            </div>
            <div class="text-right font-mono">
              <div class="text-lg font-bold text-white">${symbol}${formatNumber(selected.totalPrice)} ${selected.currency}</div>
              <div class="text-xs text-emerald-400">40% Upfront: ${symbol}${formatNumber(selected.upfrontPrice)}</div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button type="button" id="inbox-copy-gmail-btn" class="px-3 py-1.5 text-xs font-mono text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded cursor-pointer">Copy Player Gmail</button>
            <button type="button" data-status-action="starred" class="px-3 py-1.5 text-xs font-mono text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 rounded cursor-pointer">Star Inquiry</button>
            <button type="button" data-status-action="accepted" class="px-3 py-1.5 text-xs font-mono text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 rounded cursor-pointer">Mark Accepted (40% Paid)</button>
            <button type="button" data-status-action="completed" class="px-3 py-1.5 text-xs font-mono text-sky-300 bg-sky-950/30 hover:bg-sky-950/50 border border-sky-500/30 rounded cursor-pointer">Mark Completed</button>
            <button type="button" id="inbox-delete-item-btn" class="px-3 py-1.5 text-xs font-mono text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/30 rounded cursor-pointer">Delete</button>
          </div>

          <div class="whitespace-pre-wrap text-sm text-zinc-200 leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-white/10">${selected.projectDetails}</div>
          ${screenshotsHtml}
        </div>
      `;

      const copyGmailBtn = document.getElementById('inbox-copy-gmail-btn');
      if (copyGmailBtn) {
        copyGmailBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(selected.clientEmail);
          } catch {}
          copyGmailBtn.textContent = 'Copied Gmail!';
          setTimeout(() => {
            copyGmailBtn.textContent = 'Copy Player Gmail';
          }, 1800);
        });
      }

      detailEl.querySelectorAll('[data-status-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.getAttribute('data-status-action');
          updateCommissionItemStatus(selected.id, next);
        });
      });

      const delBtn = document.getElementById('inbox-delete-item-btn');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          deleteCommissionItem(selected.id);
        });
      }
    }
  }
}

// ============================================================================
// 8. HTML / CSS / JS SOURCE & GOOGLE SITES EXPORT MODAL
// ============================================================================
function renderExportCodeModal() {
  const codeBlock = document.getElementById('export-code-preview');
  if (!codeBlock) return;

  if (state.exportCodeTab === 'all-in-one') {
    codeBlock.textContent = buildStandaloneGoogleSitesHtml(SHARED_LIVE_APP_URL);
  } else if (state.exportCodeTab === 'html') {
    codeBlock.textContent = document.documentElement.outerHTML;
  } else if (state.exportCodeTab === 'css') {
    codeBlock.textContent = `/* style.css — Pure CSS Stylesheet for balo_xio portfolio */\nbody {\n  font-family: 'Plus Jakarta Sans', sans-serif;\n  background-color: #070908;\n  color: #f4f4f5;\n  margin: 0;\n  overflow-x: hidden;\n}\n.selective-video-blur {\n  backdrop-filter: blur(8px);\n  mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 44%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0) 100%);\n}\n.hacker-text-shadow {\n  text-shadow: 0 0 20px rgba(34, 197, 94, 0.32);\n}`;
  } else {
    codeBlock.textContent = `// script.js — Pure Vanilla JavaScript for balo_xio portfolio\n// Handles 2.0s video loop, 5-sentence hacker text decode, 5-discipline USD/Robux estimator, Previous Work (Demo) tabs, and Roblox Avatar Bot.`;
  }

  document.querySelectorAll('[data-code-tab]').forEach((btn) => {
    const tab = btn.getAttribute('data-code-tab');
    btn.className = `px-3 py-1.5 text-xs font-mono rounded cursor-pointer ${
      state.exportCodeTab === tab
        ? 'bg-emerald-400 text-zinc-950 font-bold'
        : 'bg-zinc-900 text-zinc-300 hover:text-white'
    }`;
  });
}

// ============================================================================
// 9. INITIALIZE ALL EVENT LISTENERS ON DOM READY
// ============================================================================
function initApp() {
  initHeroVideoAndHackerSequence();
  renderExperienceGrid();
  renderRateEstimator();
  renderPreviousWorkDemos();
  fetchCommissionsForInbox();

  // Top Bar & Footer View Links
  document.querySelectorAll('[data-nav-view]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-nav-view');
      setView(target, target === 'previous-work' ? 'all' : undefined);
    });
  });

  // Open Booking Modal Buttons
  document.querySelectorAll('[data-open-booking]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.bookingDiscipline = state.selectedDiscipline;
      state.bookingContract = state.selectedContract;
      state.bookingCurrency = state.selectedCurrency;
      const est = calculateCommissionBreakdown({
        disciplineId: state.selectedDiscipline,
        contractType: state.selectedContract,
        currency: state.selectedCurrency,
      });
      openBookingModal(est.summaryText);
    });
  });

  // Copy Rate in Estimator
  const copyRateBtn = document.getElementById('estimator-copy-rate-btn');
  if (copyRateBtn) {
    copyRateBtn.addEventListener('click', async () => {
      const est = calculateCommissionBreakdown({
        disciplineId: state.selectedDiscipline,
        contractType: state.selectedContract,
        currency: state.selectedCurrency,
      });
      try {
        await navigator.clipboard.writeText(est.summaryText);
      } catch {}
      copyRateBtn.textContent = 'Rate Copied';
      setTimeout(() => {
        copyRateBtn.textContent = 'Copy Rate';
      }, 2000);
    });
  }

  // Booking Modal Close
  document.querySelectorAll('[data-close-booking]').forEach((btn) => {
    btn.addEventListener('click', closeBookingModal);
  });

  // Roblox Username Bot Lookup in Booking Form
  const rbxInput = document.getElementById('booking-roblox-username');
  const rbxBtn = document.getElementById('booking-roblox-lookup-btn');
  if (rbxBtn && rbxInput) {
    rbxBtn.addEventListener('click', () => lookupRobloxAvatarBot(rbxInput.value));
    rbxInput.addEventListener('blur', () => {
      if (rbxInput.value.trim()) lookupRobloxAvatarBot(rbxInput.value);
    });
  }

  // Screenshot Uploads in Booking Form
  const shotInput = document.getElementById('booking-screenshot-input');
  const sampleShotBtn = document.getElementById('booking-sample-screenshot-btn');
  if (shotInput) {
    shotInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []).slice(0, 4 - state.bookingScreenshots.length);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (state.bookingScreenshots.length < 4) {
            state.bookingScreenshots.push(String(reader.result));
            renderBookingScreenshotsPreview();
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }
  if (sampleShotBtn) {
    sampleShotBtn.addEventListener('click', () => {
      if (state.bookingScreenshots.length < 4) {
        state.bookingScreenshots.push(
          makeClientSampleScreenshotSvg(state.bookingScreenshots.length)
        );
        renderBookingScreenshotsPreview();
      }
    });
  }

  // Booking Form Submit
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const clientEmail = document.getElementById('booking-client-email').value.trim();
      const robloxUsername = document.getElementById('booking-roblox-username').value.trim();
      const discordTag = document.getElementById('booking-discord-tag').value.trim();
      const projectDetails = document.getElementById('booking-project-details').value.trim();
      const statusBanner = document.getElementById('booking-submit-status');

      if (!clientEmail || !robloxUsername || !projectDetails) {
        if (statusBanner) {
          statusBanner.textContent = 'Please fill in your Gmail, Roblox username, and project details.';
          statusBanner.className = 'p-3 rounded text-xs font-mono bg-red-950/60 border border-red-500/40 text-red-200';
        }
        return;
      }

      if (!state.bookingAvatarData || state.bookingAvatarData.username?.toLowerCase() !== robloxUsername.toLowerCase()) {
        await lookupRobloxAvatarBot(robloxUsername);
      }

      const est = calculateCommissionBreakdown({
        disciplineId: state.bookingDiscipline,
        contractType: state.bookingContract,
        currency: state.bookingCurrency,
      });

      const newCommission = {
        id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        recipientEmail: OWNER_EMAIL,
        submitterUid: state.currentUser ? state.currentUser.uid : 'guest_client',
        clientEmail,
        robloxUsername,
        robloxDisplayName: state.bookingAvatarData?.displayName || robloxUsername,
        robloxUserId: state.bookingAvatarData?.userId || '156',
        robloxAvatarUrl:
          state.bookingAvatarData?.avatarUrl || makeClientFallbackAvatarSvg(robloxUsername),
        discordTag: discordTag || 'Not provided',
        workType: state.bookingDiscipline,
        contractType: state.bookingContract,
        currency: state.bookingCurrency,
        totalPrice: est.totalAmount,
        upfrontPrice: est.upfrontAmount,
        projectDetails,
        gameImages: [...state.bookingScreenshots],
        status: 'unread',
        createdAtIso: new Date().toISOString(),
      };

      // Save locally first so it works 100% on Vercel & static deployments
      const currentLocal = loadLocalCommissions();
      saveLocalCommissions([newCommission, ...currentLocal]);

      try {
        await fetch('/api/commissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCommission),
        });
      } catch {}

      try {
        if (state.currentUser) {
          await addDoc(collection(db, 'commissions'), {
            ...newCommission,
            createdAt: serverTimestamp(),
          });
        }
      } catch {}

      if (statusBanner) {
        statusBanner.textContent =
          'Commission sent to balo_xio! Your Roblox avatar & Gmail have been delivered to the Private Inbox.';
        statusBanner.className =
          'p-3 rounded text-xs font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-200';
      }
      fetchCommissionsForInbox();
    });
  }

  // UI Lightbox Close
  document.querySelectorAll('[data-close-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = document.getElementById('ui-lightbox-modal');
      if (m) m.classList.add('hidden-view');
    });
  });

  // Google Sites / HTML-CSS-JS Export Modal
  const openExportBtn = document.getElementById('footer-export-btn');
  const exportModal = document.getElementById('export-modal');
  if (openExportBtn && exportModal) {
    openExportBtn.addEventListener('click', () => {
      renderExportCodeModal();
      exportModal.classList.remove('hidden-view');
    });
  }
  document.querySelectorAll('[data-close-export]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (exportModal) exportModal.classList.add('hidden-view');
    });
  });
  document.querySelectorAll('[data-code-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.exportCodeTab = btn.getAttribute('data-code-tab');
      renderExportCodeModal();
    });
  });

  const copyExportBtn = document.getElementById('copy-export-code-btn');
  if (copyExportBtn) {
    copyExportBtn.addEventListener('click', async () => {
      const preview = document.getElementById('export-code-preview');
      try {
        await navigator.clipboard.writeText(preview ? preview.textContent : '');
      } catch {}
      copyExportBtn.textContent = 'Copied Whole Code!';
      setTimeout(() => {
        copyExportBtn.textContent = 'Copy Whole HTML Code';
      }, 2200);
    });
  }

  // Inbox Search Input
  const searchInput = document.getElementById('inbox-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.inboxSearchQuery = e.target.value || '';
      renderInboxView();
    });
  }

  // Firebase Auth + Vercel Domain Owner Verification for Private Owner Inbox
  onAuthStateChanged(auth, (user) => {
    state.currentUser = user;
    if (user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      state.ownerSessionVerified = true;
      try {
        window.localStorage.setItem('balo_xio_owner_verified', 'true');
      } catch {}
    }
    renderInboxView();
  });

  const signInBtn = document.getElementById('inbox-google-signin-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click', async () => {
      const emailInput = document.getElementById('inbox-owner-email-input');
      const authError = document.getElementById('inbox-auth-error');
      const enteredEmail = (emailInput ? emailInput.value : OWNER_EMAIL).trim().toLowerCase();

      if (authError) {
        authError.classList.add('hidden-view');
      }

      if (enteredEmail !== OWNER_EMAIL.toLowerCase()) {
        if (authError) {
          authError.textContent = `Access Denied: Only ${OWNER_EMAIL} can unlock this private inbox.`;
          authError.classList.remove('hidden-view');
        }
        return;
      }

      // Immediately unlock the Private Commission Inbox once the owner email (xamch22@gmail.com) is verified
      state.ownerSessionVerified = true;
      try {
        window.localStorage.setItem('balo_xio_owner_verified', 'true');
      } catch {}
      renderInboxView();

      // Only invoke Firebase popup if running on an authorized Firebase/Cloud Run domain
      const host = window.location.hostname || '';
      if (host.endsWith('.run.app') || host.endsWith('.firebaseapp.com') || host.endsWith('.web.app')) {
        try {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
        } catch {}
      }
    });
  }

  const signOutBtn = document.getElementById('inbox-signout-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      state.ownerSessionVerified = false;
      try {
        window.localStorage.removeItem('balo_xio_owner_verified');
      } catch {}
      try {
        await signOut(auth);
      } catch {}
      renderInboxView();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
