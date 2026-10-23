import {
  HACKER_SENTENCES,
  SENTENCE_ANIMATION_DURATION_MS,
  VIDEO_LOOP_START_SECONDS,
  DISCIPLINE_EXPERIENCES,
  PREVIOUS_WORK_DEMOS,
  COMBAT_SYSTEM_ASSET_URL,
  FORMSPREE_ENDPOINT,
  COMMISSION_RECIPIENT_EMAIL,
  COMMISSION_COOLDOWN_STORAGE_KEY,
  getCommissionCooldownStatus,
  formatCommissionEmailPayload,
  getPricingTiersForDiscipline,
  calculateCommissionBreakdown,
  scrambleText,
  getDemosByCategory,
} from './src/utils/portfolioLogic';

// Application State (Vanilla JS)
const state = {
  activeView: 'portfolio', // 'portfolio' | 'previous-work'
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
  cooldownTimerId: null,
};

function makeClientFallbackAvatarSvg(username) {
  const clean =
    String(username || 'RBX')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 2)
      .toUpperCase() || 'RX';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="100%" stop-color="#090d0b"/></linearGradient></defs><rect width="150" height="150" rx="22" fill="url(#bg)"/><rect x="38" y="26" width="74" height="74" rx="14" fill="#d4d4d8" stroke="#10b981" stroke-width="3"/><circle cx="62" cy="56" r="5" fill="#18181b"/><circle cx="88" cy="56" r="5" fill="#18181b"/><path d="M60 76 Q75 86 90 76" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 142 C26 112 124 112 124 142" fill="#10b981" opacity="0.85"/><text x="75" y="136" font-family="monospace" font-size="15" font-weight="bold" fill="#052e16" text-anchor="middle">${clean}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Format helper
function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

// ============================================================================
// 1. VIEW NAVIGATION (PORTFOLIO / PREVIOUS WORK)
// ============================================================================
function setView(viewName, optionalDemoSubPage) {
  state.activeView = viewName === 'previous-work' ? 'previous-work' : 'portfolio';
  if (optionalDemoSubPage) {
    state.demoSubPage = optionalDemoSubPage;
  }

  const viewPortfolio = document.getElementById('view-portfolio');
  const viewPreviousWork = document.getElementById('view-previous-work');

  if (viewPortfolio) viewPortfolio.classList.toggle('hidden-view', state.activeView !== 'portfolio');
  if (viewPreviousWork) viewPreviousWork.classList.toggle('hidden-view', state.activeView !== 'previous-work');

  // Update top nav active states
  const navOverview = document.getElementById('nav-overview');
  const navPrevWork = document.getElementById('nav-previous-work');

  if (navOverview) {
    navOverview.className = `hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
      state.activeView === 'portfolio' ? 'text-white' : 'text-zinc-400'
    }`;
  }
  if (navPrevWork) {
    navPrevWork.className = `hover:text-emerald-400 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      state.activeView === 'previous-work' ? 'text-emerald-400 font-semibold' : 'text-zinc-400'
    }`;
  }

  if (state.activeView === 'previous-work') {
    renderPreviousWorkDemos();
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
// 6. COMMISSION BOOKING MODAL, ROBLOX AVATAR BOT & 1-HOUR ANTI-SPAM COOLDOWN
// ============================================================================
function getStoredLastCommissionTimestamp() {
  try {
    const raw = localStorage.getItem(COMMISSION_COOLDOWN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function setStoredLastCommissionTimestamp(ts) {
  try {
    localStorage.setItem(COMMISSION_COOLDOWN_STORAGE_KEY, String(ts));
  } catch {}
}

function updateBookingCooldownUI() {
  const cooldownBanner = document.getElementById('booking-cooldown-banner');
  const submitBtn = document.getElementById('booking-submit-btn');
  const lastTs = getStoredLastCommissionTimestamp();
  const status = getCommissionCooldownStatus(lastTs, Date.now());

  if (status.isOnCooldown) {
    if (cooldownBanner) {
      cooldownBanner.className =
        'p-3 rounded-md text-xs font-mono bg-amber-950/50 border border-amber-500/40 text-amber-200 flex items-center justify-between gap-3';
      cooldownBanner.innerHTML = `
        <span>1-Hour Anti-Spam Cooldown Active: Please wait before sending another commission application.</span>
        <strong class="text-amber-300 whitespace-nowrap shrink-0 tabular-nums">${status.formattedRemaining} left</strong>
      `;
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = `Cooldown Active (${status.formattedRemaining})`;
    }
  } else {
    if (cooldownBanner) {
      cooldownBanner.className = 'hidden-view';
      cooldownBanner.innerHTML = '';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Commission Application';
    }
  }
  return status;
}

function openBookingModal(prefilledText) {
  const modal = document.getElementById('booking-modal');
  const detailsArea = document.getElementById('booking-project-details');
  const statusBanner = document.getElementById('booking-submit-status');

  if (statusBanner) statusBanner.classList.add('hidden-view');
  if (prefilledText && detailsArea) {
    detailsArea.value = prefilledText;
  }
  renderBookingSelectors();
  updateBookingCooldownUI();
  if (state.cooldownTimerId) {
    clearInterval(state.cooldownTimerId);
  }
  state.cooldownTimerId = setInterval(updateBookingCooldownUI, 1000);
  if (modal) modal.classList.remove('hidden-view');
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (state.cooldownTimerId) {
    clearInterval(state.cooldownTimerId);
    state.cooldownTimerId = null;
  }
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
// 7. INITIALIZE ALL EVENT LISTENERS ON DOM READY
// ============================================================================
function initApp() {
  initHeroVideoAndHackerSequence();
  renderExperienceGrid();
  renderRateEstimator();
  renderPreviousWorkDemos();

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

  // Booking Form Submit (Sends perfectly aligned details + description to Formspree -> xamch@gmail.com with 1-hour cooldown)
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const clientEmail = document.getElementById('booking-client-email').value.trim();
      const robloxUsername = document.getElementById('booking-roblox-username').value.trim();
      const discordTag = document.getElementById('booking-discord-tag').value.trim();
      const projectDetails = document.getElementById('booking-project-details').value.trim();
      const statusBanner = document.getElementById('booking-submit-status');
      const submitBtn = document.getElementById('booking-submit-btn');

      // 1. Check 1-Hour Anti-Spam Cooldown
      const currentCooldown = updateBookingCooldownUI();
      if (currentCooldown.isOnCooldown) {
        if (statusBanner) {
          statusBanner.textContent = `Anti-spam cooldown active: You can send another commission application in ${currentCooldown.formattedRemaining}.`;
          statusBanner.className =
            'p-3 rounded text-xs font-mono bg-amber-950/60 border border-amber-500/40 text-amber-200';
        }
        return;
      }

      if (!clientEmail || !robloxUsername || !projectDetails) {
        if (statusBanner) {
          statusBanner.textContent = 'Please fill in your Gmail, Roblox username, and project details.';
          statusBanner.className =
            'p-3 rounded text-xs font-mono bg-red-950/60 border border-red-500/40 text-red-200';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending to Formspree...';
      }

      if (
        !state.bookingAvatarData ||
        state.bookingAvatarData.username?.toLowerCase() !== robloxUsername.toLowerCase()
      ) {
        await lookupRobloxAvatarBot(robloxUsername);
      }

      const est = calculateCommissionBreakdown({
        disciplineId: state.bookingDiscipline,
        contractType: state.bookingContract,
        currency: state.bookingCurrency,
      });

      const commissionId = `comm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const submittedAtIso = new Date().toISOString();

      const formspreePayload = formatCommissionEmailPayload({
        commissionId,
        clientEmail,
        robloxUsername,
        robloxDisplayName: state.bookingAvatarData?.displayName || robloxUsername,
        robloxUserId: state.bookingAvatarData?.userId || '156',
        robloxProfileUrl:
          state.bookingAvatarData?.profileUrl ||
          `https://www.roblox.com/users/${encodeURIComponent(state.bookingAvatarData?.userId || '156')}/profile`,
        discordTag: discordTag || 'Not provided',
        disciplineId: state.bookingDiscipline,
        contractType: state.bookingContract,
        currency: state.bookingCurrency,
        projectDetails,
        screenshotCount: state.bookingScreenshots.length,
        submittedAtIso,
      });

      const newCommission = {
        id: commissionId,
        recipientEmail: COMMISSION_RECIPIENT_EMAIL,
        submitterUid: 'guest_client',
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
        createdAtIso: submittedAtIso,
        formspreePayload,
      };

      // Send directly to Formspree endpoint (https://formspree.io/f/mqppkrdd) and backend relay in parallel
      await Promise.allSettled([
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formspreePayload),
        }),
        fetch('/api/commissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCommission),
        }),
      ]);

      // Activate 1-hour anti-spam cooldown immediately
      setStoredLastCommissionTimestamp(Date.now());
      updateBookingCooldownUI();

      if (statusBanner) {
        statusBanner.innerHTML = `
          <div class="space-y-2">
            <div class="font-semibold text-emerald-300">
              ✓ Commission Application Sent to ${COMMISSION_RECIPIENT_EMAIL} via Formspree!
            </div>
            <div class="text-zinc-300">
              All commission details and your project description have been formatted and aligned. A 1-hour anti-spam cooldown is now active before you can send another application.
            </div>
          </div>
        `;
        statusBanner.className =
          'p-3.5 rounded-md text-xs font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-200';
        bookingForm.scrollTo({ top: bookingForm.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  // UI Lightbox Close
  document.querySelectorAll('[data-close-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = document.getElementById('ui-lightbox-modal');
      if (m) m.classList.add('hidden-view');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
