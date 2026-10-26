import {
  VIDEO_LOOP_START_SECONDS,
  DISCIPLINE_EXPERIENCES,
  PREVIOUS_WORK_DEMOS,
  UNLOCKED_CREATIONS_STORAGE_KEY,
  getRobloxGamepassCheckoutUrl,
  getPricingTiersForDiscipline,
  calculateCommissionBreakdown,
  getDemosByCategory,
} from './src/utils/portfolioLogic';

function loadUnlockedCreationsMap() {
  try {
    const raw = localStorage.getItem(UNLOCKED_CREATIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveUnlockedCreationsMap(map) {
  try {
    localStorage.setItem(UNLOCKED_CREATIONS_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

// Application State (Vanilla JS)
const state = {
  activeView: 'portfolio', // 'portfolio' | 'previous-work'
  demoSubPage: 'all', // 'all' | 'scripting' | 'animating' | 'ui-design' | 'modeling'
  selectedDiscipline: 'all-rounder', // 'all-rounder' | 'scripting' | 'ui-design' | 'modeling' | 'animating'
  selectedContract: 'commission', // 'commission' | 'short-term' | 'long-term'
  selectedCurrency: 'USD', // 'USD' | 'ROBUX'
  heroMuted: true,
  unlockedCreations: loadUnlockedCreationsMap(),
  activeGamepassDemo: null,
  awaitingRobloxTabReturn: false,
  lookedUpRobloxUser: null,
};

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

  const navOverview = document.getElementById('nav-overview');
  const navPrevWork = document.getElementById('nav-previous-work');

  if (navOverview) {
    navOverview.className = `hover:text-[#DFC08A] transition-colors whitespace-nowrap shrink-0 ${
      state.activeView === 'portfolio'
        ? 'text-white font-semibold underline underline-offset-8 decoration-[#DFC08A]'
        : 'text-zinc-400'
    }`;
  }
  if (navPrevWork) {
    navPrevWork.className = `hover:text-[#DFC08A] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
      state.activeView === 'previous-work'
        ? 'text-[#DFC08A] font-semibold underline underline-offset-8 decoration-[#DFC08A]'
        : 'text-zinc-400'
    }`;
  }

  if (state.activeView === 'previous-work') {
    renderPreviousWorkDemos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ============================================================================
// 2. HERO BACKGROUND VIDEO (2.0s LOOP) & AUDIO TOGGLE
// ============================================================================
function initHeroVideoControls() {
  const video = document.getElementById('hero-bg-video');
  const audioBtn = document.getElementById('hero-audio-btn');

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
        ? `<span>Reel Audio // Muted</span>`
        : `<span class="text-[#DFC08A]">Reel Audio // Active</span>`;
      if (!state.heroMuted) {
        if (video.currentTime < VIDEO_LOOP_START_SECONDS) {
          video.currentTime = VIDEO_LOOP_START_SECONDS;
        }
        video.play().catch(() => {});
      }
    });
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
              ? '<span aria-hidden="true" class="text-[#DFC08A]">/</span>'
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
              <span class="font-mono text-xs text-[#DFC08A] tabular-nums">${disc.index} /</span>
              <h3 class="font-display text-2xl sm:text-3xl font-bold text-white">${disc.title}</h3>
            </div>
            <span class="font-display text-xl sm:text-2xl font-bold pro-gradient-text tabular-nums">${
              disc.yearsDisplay
            }</span>
          </div>
          <p class="mt-3 text-base font-medium text-zinc-200">${disc.headline}</p>
          <p class="mt-2 text-sm text-zinc-400 leading-relaxed">${disc.description}</p>
          <div class="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-zinc-300">
            ${deliverablesHtml}
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <span class="font-mono text-zinc-500 uppercase tracking-wider">${disc.tools}</span>
          <div class="flex items-center gap-5">
            <button type="button" data-open-demo="${disc.id}" class="inline-flex items-center gap-1 font-mono uppercase tracking-wider font-medium text-zinc-200 hover:text-[#DFC08A] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer">
              <span>${demoLabel}</span>
              ${ARROW_UP_RIGHT_SVG}
            </button>
            <a href="#estimator" data-select-discipline="${disc.id}" class="inline-flex items-center gap-1 font-mono uppercase tracking-wider font-medium text-[#DFC08A] hover:text-white transition-colors whitespace-nowrap shrink-0">
              <span>Select Track</span>
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
// 4. ARCHITECTURAL SPECIFICATION MATRIX & 40% UPFRONT LEDGER ESTIMATOR
// ============================================================================
function renderRateEstimator() {
  const roleContainer = document.getElementById('estimator-roles');
  const contractContainer = document.getElementById('estimator-contracts');
  const currencyContainer = document.getElementById('estimator-currencies');

  const roles = [
    { id: 'all-rounder', index: '01', label: 'Full Pack (All-Rounder)', sub: 'Scripting + UI + 3D + Animation', tenure: 'Complete Studio Pipeline' },
    { id: 'scripting', index: '02', label: 'Scripting Systems', sub: 'Luau Frameworks, Combat & DataStores', tenure: '3+ Years Experience' },
    { id: 'ui-design', index: '03', label: 'UI Design & HUDs', sub: 'Responsive Scale Layouts & Motion', tenure: '2+ Years Experience' },
    { id: 'modeling', index: '04', label: '3D Modeling', sub: 'Hard-Surface Weapons & Environment Assets', tenure: '2+ Years Experience' },
    { id: 'animating', index: '05', label: 'Keyframe Animation', sub: 'Moon Animator 2 R6 & R15 Combat Rigs', tenure: '1+ Year Experience' },
  ];

  if (roleContainer) {
    roleContainer.innerHTML = roles
      .map((r) => {
        const isActive = state.selectedDiscipline === r.id;
        return `
        <button
          type="button"
          data-role-btn="${r.id}"
          class="w-full px-6 py-4 text-left transition-all cursor-pointer flex items-center justify-between gap-4 border-l-2 ${
            isActive
              ? 'border-[#DFC08A] studio-active-row text-white'
              : 'border-transparent bg-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
          }"
        >
          <div class="flex items-baseline gap-4 min-w-0">
            <span class="font-mono text-xs tabular-nums ${isActive ? 'text-[#DFC08A] font-semibold' : 'text-zinc-500'}">${r.index}</span>
            <div class="min-w-0">
              <div class="font-display text-base font-bold ${isActive ? 'text-white' : 'text-zinc-200'}">${r.label}</div>
              <div class="text-xs font-mono ${isActive ? 'text-zinc-300' : 'text-zinc-500'} mt-0.5 truncate">${r.sub}</div>
            </div>
          </div>
          <div class="text-right shrink-0 flex items-center gap-4">
            <span class="hidden sm:inline-block text-[11px] font-mono text-zinc-500">${r.tenure}</span>
            <span class="font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 border ${
              isActive
                ? 'border-[#DFC08A] text-[#DFC08A] bg-[#DFC08A]/10 font-semibold'
                : 'border-white/10 text-zinc-500'
            }">
              ${isActive ? 'Selected' : 'Select'}
            </span>
          </div>
        </button>
      `;
      })
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
      .map((tier, idx) => {
        const isActive = state.selectedContract === tier.id;
        return `
        <button
          type="button"
          data-contract-btn="${tier.id}"
          class="relative p-5 text-left transition-all cursor-pointer flex flex-col justify-between ${
            isActive
              ? 'studio-active-cell text-white'
              : 'bg-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
          }"
        >
          ${
            isActive
              ? '<div class="absolute top-0 inset-x-0 h-[2px] studio-btn-gradient"></div>'
              : ''
          }
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-[11px] uppercase tracking-widest ${isActive ? 'text-[#DFC08A]' : 'text-zinc-500'}">Scope 0${idx + 1}</span>
              ${isActive ? '<span class="font-mono text-[10px] uppercase tracking-widest text-[#DFC08A]">Active</span>' : ''}
            </div>
            <div class="font-display text-base font-bold text-white mt-1.5">${tier.label}</div>
            <div class="text-xs text-zinc-400 mt-1 leading-relaxed">${tier.subtitle}</div>
          </div>
          <div class="font-mono text-xs font-semibold ${
            isActive ? 'text-[#DFC08A]' : 'text-zinc-300'
          } mt-5 pt-3 border-t border-white/10 tabular-nums">
            $${tier.usdTotal} USD / ${formatNumber(tier.robuxTotal)} R$
          </div>
        </button>
      `;
      })
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
      .map((curr) => {
        const isActive = state.selectedCurrency === curr;
        return `
        <button
          type="button"
          data-currency-btn="${curr}"
          class="px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            isActive
              ? 'studio-btn-gradient'
              : 'text-zinc-400 hover:text-white'
          }"
        >
          ${curr === 'USD' ? 'USD ($)' : 'Robux (R$)'}
        </button>
      `;
      })
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
// 5. PREVIOUS WORK (DEMO) PAGE RENDERER (SCRIPTING, ANIMATION, UI DESIGN, MODELING)
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
          class="px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer border-r border-white/10 last:border-r-0 ${
            state.demoSubPage === t.id
              ? 'studio-btn-gradient font-semibold'
              : 'text-zinc-400 hover:text-white'
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
            `<span class="text-[#DFC08A]">${sys}</span>${
              idx < demo.systemsIncluded.length - 1
                ? '<span aria-hidden="true" class="text-zinc-600">/</span>'
                : ''
            }`
        )
        .join('');

      const techRowsHtml = demo.technicalHighlights
        .map(
          (item) => `
          <div class="py-3.5">
            <div class="text-xs font-mono font-semibold text-white uppercase tracking-wider">${item.label}</div>
            <div class="text-xs text-zinc-400 mt-1 leading-relaxed">${item.detail}</div>
          </div>
        `
        )
        .join('');

      const mediaColumnHtml =
        demo.mediaType === 'video' && demo.videoUrl
          ? `
            <div class="relative overflow-hidden border border-white/15 bg-black">
              <video
                id="video-${demo.id}"
                src="${demo.videoUrl}"
                autoplay
                loop
                muted
                playsinline
                controls
                class="w-full aspect-video object-cover bg-[#09090B]"
              ></video>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-zinc-400">
              <div class="flex items-center gap-2">
                <span>Roblox Studio Live Capture</span>
                <span aria-hidden="true">/</span>
                <span class="text-[#DFC08A]">${
                  demo.assetId ? `Asset ID: ${demo.assetId}` : demo.craftTag
                }</span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" data-video-toggle="${demo.id}" class="px-3 py-1.5 text-xs text-zinc-200 bg-[#121216] hover:bg-[#1A1A20] border border-white/15 cursor-pointer">Pause</button>
                <button type="button" data-video-mute="${demo.id}" class="px-3 py-1.5 text-xs text-zinc-200 bg-[#121216] hover:bg-[#1A1A20] border border-white/15 cursor-pointer">Unmute Audio</button>
                <button type="button" data-video-replay="${demo.id}" class="px-3 py-1.5 text-xs text-zinc-200 bg-[#121216] hover:bg-[#1A1A20] border border-white/15 cursor-pointer">Replay</button>
              </div>
            </div>
          `
          : demo.galleryImages && demo.galleryImages.length > 0
          ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${demo.galleryImages
                .map(
                  (imgItem, gIdx) => `
                  <div class="overflow-hidden border border-white/15 bg-[#0C0C0E] flex flex-col justify-between">
                    <div class="aspect-square overflow-hidden bg-[#121216]">
                      <img
                        src="${imgItem.url}"
                        alt="${imgItem.label} — 3D Model by ${demo.author}"
                        referrerpolicy="no-referrer"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="p-3.5 border-t border-white/10 flex items-center justify-between gap-2 bg-[#0C0C0E]">
                      <div class="min-w-0">
                        <div class="font-display text-sm font-bold text-white truncate">${imgItem.label}</div>
                        <div class="text-xs font-mono text-zinc-400 truncate mt-0.5">${imgItem.subtitle}</div>
                      </div>
                      <button
                        type="button"
                        data-open-gallery="${demo.id}:${gIdx}"
                        class="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-zinc-200 bg-[#141418] hover:bg-[#1C1C22] border border-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span class="text-[#DFC08A]">Inspect</span>
                      </button>
                    </div>
                  </div>
                `
                )
                .join('')}
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-zinc-400">
              <div class="flex items-center gap-2">
                <span>Roblox Studio Viewport Renders (2 Models)</span>
                <span aria-hidden="true">/</span>
                <span class="text-[#DFC08A]">${demo.craftTag}</span>
              </div>
            </div>
          `
          : `
            <div class="relative overflow-hidden border border-white/15 bg-[#0C0C0E]">
              <img
                src="${demo.imageUrl}"
                alt="${demo.title} — ${demo.craftTag} by ${demo.author}"
                referrerpolicy="no-referrer"
                class="w-full h-auto object-contain bg-[#0C0C0E]"
              />
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-zinc-400">
              <div class="flex items-center gap-2">
                <span>High-Resolution Studio Capture</span>
                <span aria-hidden="true">/</span>
                <span class="text-[#DFC08A]">${demo.craftTag}</span>
              </div>
              <button
                type="button"
                data-open-lightbox="${demo.id}"
                aria-label="Inspect ${demo.title} in fullscreen"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-200 bg-[#121216] hover:bg-[#1A1A20] border border-white/15 transition-colors cursor-pointer"
              >
                <span>Inspect Fullscreen</span>
              </button>
            </div>
          `;

      const unlockRecord = state.unlockedCreations[demo.id] || null;
      const isUnlocked = Boolean(unlockRecord);
      const targetUnlockUrl =
        demo.unlockLinkUrl ||
        demo.tryAssetUrl ||
        'https://create.roblox.com/store/asset/113210150229519?viewFromStudio=true&keyword=&searchId=18788722-cf9d-4565-9e61-ae99826d0e18';

      return `
        <section id="demo-${demo.category}" aria-labelledby="heading-${demo.id}" class="py-12 border-b border-white/10">
          <div class="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p class="text-xs font-mono uppercase tracking-widest text-[#DFC08A] mb-1.5">${demo.index} // ${demo.categoryLabel}</p>
              <h2 id="heading-${demo.id}" class="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white text-balance">${demo.title}</h2>
            </div>
            <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              ${
                isUnlocked
                  ? `<a
                      href="${targetUnlockUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold studio-btn-gradient transition-all whitespace-nowrap shrink-0"
                    >
                      <span>Unlocked · Open Roblox Asset Link</span>
                      ${ARROW_UP_RIGHT_SVG}
                    </a>`
                  : `<button
                      type="button"
                      data-open-gamepass="${demo.id}"
                      class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider font-semibold studio-btn-gradient transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Locked Link · Buy Gamepass (${formatNumber(demo.gamePassPriceRobux || 3500)} R$)</span>
                      ${ARROW_UP_RIGHT_SVG}
                    </button>`
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div class="lg:col-span-7 space-y-4">
              ${mediaColumnHtml}
            </div>

            <div class="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span class="text-[#DFC08A] font-semibold uppercase">${demo.categoryLabel}</span>
                  <span aria-hidden="true">/</span>
                  <span>By ${demo.author}</span>
                  <span aria-hidden="true">/</span>
                  <span>${demo.craftTag}</span>
                </div>
                <p class="text-sm sm:text-base text-zinc-200 leading-relaxed">${demo.description}</p>
                <div class="pt-1">
                  <div class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">${highlightsHeading}</div>
                  <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-zinc-200">
                    ${systemsHtml}
                  </div>
                </div>
              </div>

              <div class="border-t border-white/10 divide-y divide-white/10">
                ${techRowsHtml}
              </div>

              <div class="pt-2 space-y-3">
                <div
                  id="unlocked-link-box-${demo.id}"
                  class="p-5 border ${
                    isUnlocked
                      ? 'studio-active-cell border-[#DFC08A]/60'
                      : 'bg-[#0C0C0E] border-white/15'
                  } space-y-3"
                >
                  <div class="flex items-center justify-between gap-2 text-xs font-mono">
                    <span class="text-[#DFC08A] font-semibold uppercase tracking-wider">
                      ${
                        isUnlocked
                          ? `[UNLOCKED] ASSET LINK READY · @${unlockRecord.robloxUsername || 'VERIFIED'}`
                          : `[LOCKED LINK] GAMEPASS #${demo.gamePassId || '2053169441'}`
                      }
                    </span>
                    <span class="text-white font-bold tabular-nums">${formatNumber(demo.gamePassPriceRobux || 3500)} R$</span>
                  </div>

                  ${
                    isUnlocked
                      ? `
                        <p class="text-xs text-zinc-200 leading-relaxed">
                          Gamepass verified. Your official Roblox Creator Store link is unlocked below:
                        </p>
                        <div class="p-3 bg-[#09090B] border border-[#DFC08A]/40">
                          <div class="text-[11px] font-mono text-[#DFC08A] mb-1">Unlocked Roblox Creator Store Asset URL:</div>
                          <a
                            href="${targetUnlockUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="block text-xs font-mono text-white hover:text-[#DFC08A] break-all underline underline-offset-4"
                          >${targetUnlockUrl}</a>
                        </div>
                        <div class="flex flex-wrap items-center gap-2.5">
                          <a
                            href="${targetUnlockUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold studio-btn-gradient transition-all whitespace-nowrap"
                          >
                            <span>Open Unlocked Asset Link</span>
                            ${ARROW_UP_RIGHT_SVG}
                          </a>
                          <button
                            type="button"
                            data-copy-asset="${targetUnlockUrl}"
                            class="inline-flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-mono uppercase tracking-wider font-medium text-zinc-200 hover:text-white bg-[#141418] hover:bg-[#1C1C22] border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>Copy Link</span>
                          </button>
                        </div>
                      `
                      : `
                        <p class="text-xs text-zinc-300 leading-relaxed">
                          This Roblox Creator Store asset link is <strong class="text-white">locked</strong>. Purchase the Gamepass on Roblox and verify ownership—the buying menu will automatically close and unlock the link right here.
                        </p>
                        <div class="p-3 bg-[#09090B] border border-white/10 flex items-center justify-between gap-2 text-xs font-mono text-zinc-500 select-none">
                          <span class="truncate">https://create.roblox.com/store/asset/••••••••••••••• (Locked)</span>
                          <span class="text-[#DFC08A] shrink-0">LOCKED</span>
                        </div>
                        <button
                          type="button"
                          data-open-gamepass="${demo.id}"
                          class="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-mono uppercase tracking-wider font-semibold studio-btn-gradient transition-all cursor-pointer"
                        >
                          <span>Buy Gamepass (${formatNumber(demo.gamePassPriceRobux || 3500)} R$) to Unlock Link</span>
                          ${ARROW_UP_RIGHT_SVG}
                        </button>
                      `
                  }
                </div>

                <div class="p-3.5 bg-[#0C0C0E] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="text-xs text-zinc-400 font-mono">${demo.rateLabel}</div>
                </div>
              </div>
            </div>
          </div>

          ${
            demo.tryAssetUrl
              ? isUnlocked
                ? `<div class="mt-8 p-4 studio-active-cell border border-[#DFC08A]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="space-y-1 min-w-0">
                      <div class="text-xs font-mono text-[#DFC08A]">[UNLOCKED] Official Roblox Creator Store Link</div>
                      <a href="${targetUnlockUrl}" target="_blank" rel="noopener noreferrer" class="block text-xs font-mono text-zinc-200 hover:text-white truncate underline underline-offset-4">${targetUnlockUrl}</a>
                    </div>
                    <a href="${targetUnlockUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold text-[#DFC08A] hover:text-white whitespace-nowrap shrink-0">
                      <span>Open in Roblox Creator Store</span>
                      ${ARROW_UP_RIGHT_SVG}
                    </a>
                  </div>`
                : `<div class="mt-8 p-4 bg-[#0C0C0E] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="space-y-1 min-w-0">
                      <div class="text-xs font-mono text-[#DFC08A]">[LOCKED] Official Roblox Creator Store Link</div>
                      <div class="text-xs font-mono text-zinc-400 truncate">Link is locked — Buy &amp; verify Gamepass #${demo.gamePassId || '2053169441'} (${formatNumber(demo.gamePassPriceRobux || 3500)} R$) to unlock link</div>
                    </div>
                    <button type="button" data-open-gamepass="${demo.id}" class="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold text-[#DFC08A] hover:text-white whitespace-nowrap shrink-0 cursor-pointer">
                      <span>Unlock Link (${formatNumber(demo.gamePassPriceRobux || 3500)} R$ Gamepass)</span>
                      ${ARROW_UP_RIGHT_SVG}
                    </button>
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

  // Copy unlocked asset link
  listContainer.querySelectorAll('[data-copy-asset]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = btn.getAttribute('data-copy-asset');
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
      btn.innerHTML = `<span class="text-[#DFC08A]">Link Copied!</span>`;
      setTimeout(() => {
        btn.innerHTML = `<span>Copy Link</span>`;
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

  // Lightbox for 3D Modeling gallery images
  listContainer.querySelectorAll('[data-open-gallery]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const raw = btn.getAttribute('data-open-gallery') || '';
      const [demoId, idxStr] = raw.split(':');
      const found = PREVIOUS_WORK_DEMOS.find((d) => d.id === demoId);
      const item = found?.galleryImages?.[Number(idxStr)];
      if (found && item) {
        openImageLightbox({
          title: item.label,
          categoryLabel: found.categoryLabel,
          author: found.author,
          craftTag: item.subtitle,
          imageUrl: item.url,
        });
      }
    });
  });

  // Open Roblox Gamepass Unlock Bot modal
  listContainer.querySelectorAll('[data-open-gamepass]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const demoId = btn.getAttribute('data-open-gamepass');
      const found = PREVIOUS_WORK_DEMOS.find((d) => d.id === demoId);
      if (found) openGamepassModal(found);
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
// 6. ROBLOX GAMEPASS CREATION UNLOCK BOT MODAL & AUTO-REDIRECT CHECKER
// ============================================================================
function setBotStatusBanner(type, message) {
  const banner = document.getElementById('gp-bot-status');
  if (!banner) return;
  if (!message) {
    banner.classList.add('hidden-view');
    banner.innerHTML = '';
    return;
  }
  banner.classList.remove('hidden-view');
  const colorClasses =
    type === 'success'
      ? 'studio-active-cell border-[#DFC08A] text-[#DFC08A]'
      : type === 'error'
      ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
      : 'bg-[#121216] border-white/15 text-zinc-200';
  banner.className = `p-3.5 border text-xs font-mono leading-relaxed ${colorClasses}`;
  banner.textContent = message;
}

function openGamepassModal(demo) {
  state.activeGamepassDemo = demo;
  state.awaitingRobloxTabReturn = false;

  const modal = document.getElementById('gamepass-unlock-modal');
  const catEl = document.getElementById('gp-creation-category');
  const titleEl = document.getElementById('gp-creation-title');
  const passIdEl = document.getElementById('gp-pass-id-label');
  const priceEl = document.getElementById('gp-creation-price');
  const buyLink = document.getElementById('gp-buy-redirect-link');
  const buyBtnText = document.getElementById('gp-buy-btn-text');
  const autoBadge = document.getElementById('gp-auto-listen-badge');

  const gamePassId = demo.gamePassId || '2053169441';
  const priceRobux = demo.gamePassPriceRobux || 3500;
  const checkoutUrl = demo.gamePassUrl || getRobloxGamepassCheckoutUrl(gamePassId);

  if (catEl) catEl.textContent = `${demo.categoryLabel.toUpperCase()} // ROBLOX GAMEPASS LINK UNLOCK`;
  if (titleEl) titleEl.textContent = demo.title;
  if (passIdEl) {
    passIdEl.textContent = `Roblox Gamepass ID: #${gamePassId} · Unlocks Official Roblox Creator Store Link`;
  }
  if (priceEl) priceEl.textContent = `${formatNumber(priceRobux)} R$`;
  if (buyLink) buyLink.href = checkoutUrl;
  if (buyBtnText) buyBtnText.textContent = `1. Buy Gamepass (${formatNumber(priceRobux)} R$)`;
  if (autoBadge) autoBadge.textContent = 'Auto-Check on Tab Return: Ready';

  setBotStatusBanner('', '');

  if (modal) modal.classList.remove('hidden-view');
}

function closeGamepassModal() {
  const modal = document.getElementById('gamepass-unlock-modal');
  if (modal) modal.classList.add('hidden-view');
  state.awaitingRobloxTabReturn = false;
}

async function lookupGamepassRobloxUser() {
  const inputEl = document.getElementById('gp-roblox-username');
  const previewEl = document.getElementById('gp-avatar-preview');
  const lookupBtn = document.getElementById('gp-lookup-btn');
  if (!inputEl || !previewEl) return null;

  const username = inputEl.value.trim();
  if (!username) {
    setBotStatusBanner('error', 'Please enter your Roblox username first so the bot can find your account.');
    inputEl.focus();
    return null;
  }

  if (lookupBtn) lookupBtn.textContent = 'Checking...';
  setBotStatusBanner('info', `[Bot]: Looking up Roblox profile @${username}...`);

  try {
    const res = await fetch(`/api/roblox-user?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    const resolvedId = data?.id || data?.userId;
    const resolvedName = data?.name || data?.username;
    if (!res.ok || !data || !resolvedId) {
      setBotStatusBanner('error', data?.error || `Could not find Roblox user "${username}".`);
      previewEl.innerHTML = '';
      return null;
    }

    const normalizedUser = {
      ...data,
      id: String(resolvedId),
      userId: String(resolvedId),
      name: String(resolvedName || username),
      username: String(resolvedName || username),
      displayName: String(data.displayName || resolvedName || username),
    };
    state.lookedUpRobloxUser = normalizedUser;
    previewEl.innerHTML = `
      <div class="mt-2 p-2.5 bg-[#121216] border border-[#DFC08A]/40 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          ${
            normalizedUser.avatarUrl
              ? `<img src="${normalizedUser.avatarUrl}" alt="${normalizedUser.name}" class="w-9 h-9 bg-zinc-800 border border-[#DFC08A]/40 object-cover" />`
              : `<div class="w-9 h-9 bg-zinc-900 border border-[#DFC08A]/40 flex items-center justify-center text-xs font-mono text-[#DFC08A]">R$</div>`
          }
          <div>
            <div class="text-xs font-semibold text-white">${normalizedUser.displayName} (@${normalizedUser.name})</div>
            <div class="text-[11px] font-mono text-[#DFC08A]">Roblox User ID: ${normalizedUser.id} · Connected to Bot</div>
          </div>
        </div>
        <a href="${normalizedUser.profileUrl}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-mono text-zinc-400 hover:text-white underline">Profile -></a>
      </div>
    `;
    setBotStatusBanner(
      'info',
      `[Bot Connected]: Found @${normalizedUser.name} (ID: ${normalizedUser.id}). Now click "1. Buy Gamepass" or "2. Verify & Unlock Link".`
    );
    return normalizedUser;
  } catch {
    setBotStatusBanner('error', 'Network error while contacting Roblox lookup API.');
    return null;
  } finally {
    if (lookupBtn) lookupBtn.textContent = 'Connect Account';
  }
}

async function verifyGamepassOwnership(isAutoFocusCheck = false) {
  const demo = state.activeGamepassDemo;
  if (!demo) return;

  const inputEl = document.getElementById('gp-roblox-username');
  const claimEl = document.getElementById('gp-claim-code');
  const verifyBtn = document.getElementById('gp-verify-btn');

  const username = inputEl ? inputEl.value.trim() : '';
  const claimCode = claimEl ? claimEl.value.trim() : '';

  if (!username) {
    if (!isAutoFocusCheck) {
      setBotStatusBanner(
        'error',
        'Please enter your Roblox username in Step 01 before verifying Gamepass ownership.'
      );
      if (inputEl) inputEl.focus();
    }
    return;
  }

  const gamePassId = demo.gamePassId || '2053169441';
  if (verifyBtn) verifyBtn.innerHTML = `<span>Bot Checking Inventory...</span>`;
  setBotStatusBanner(
    'info',
    `[Bot Verifying]: Checking Roblox Inventory of @${username} for Gamepass #${gamePassId}...`
  );

  try {
    const res = await fetch('/api/verify-gamepass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        userId:
          state.lookedUpRobloxUser &&
          (state.lookedUpRobloxUser.name || '').toLowerCase() === username.toLowerCase()
            ? state.lookedUpRobloxUser.id
            : undefined,
        gamePassId,
        claimCode,
      }),
    });

    const data = await res.json();
    if (data && (data.user || data.userId)) {
      state.lookedUpRobloxUser = data.user || {
        id: data.userId,
        userId: data.userId,
        name: data.username || username,
        username: data.username || username,
        displayName: data.displayName || data.username || username,
        avatarUrl: data.avatarUrl,
      };
    }

    if (res.ok && data && data.verified) {
      const unlockRecord = {
        demoId: demo.id,
        gamePassId,
        robloxUsername: data.username || data.user?.name || username,
        robloxUserId: data.userId || data.user?.id || '',
        verificationMethod: data.verificationMethod || 'Roblox Inventory API',
        unlockedAt: data.verifiedAt || new Date().toISOString(),
      };
      state.unlockedCreations[demo.id] = unlockRecord;
      saveUnlockedCreationsMap(state.unlockedCreations);
      state.awaitingRobloxTabReturn = false;

      // Shut the buying menu immediately and unlock the link on the page
      closeGamepassModal();
      renderPreviousWorkDemos();

      const unlockedBox = document.getElementById(`unlocked-link-box-${demo.id}`);
      if (unlockedBox) {
        unlockedBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setBotStatusBanner(
        'error',
        data?.message ||
          data?.error ||
          `Gamepass #${gamePassId} was not detected in @${username}'s public inventory yet.`
      );
    }
  } catch {
    setBotStatusBanner('error', 'Could not reach /api/verify-gamepass. Please try again.');
  } finally {
    if (verifyBtn) verifyBtn.innerHTML = `<span>2. Verify & Unlock Link</span>`;
  }
}

// ============================================================================
// 7. INITIALIZE ALL EVENT LISTENERS ON DOM READY
// ============================================================================
function initApp() {
  initHeroVideoControls();
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

  // Quick discipline links in Experience section header
  document.querySelectorAll('[data-select-discipline]').forEach((el) => {
    el.addEventListener('click', () => {
      const disc = el.getAttribute('data-select-discipline');
      if (disc) {
        state.selectedDiscipline = disc;
        renderRateEstimator();
      }
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
      copyRateBtn.textContent = 'Official Quote Summary Copied!';
      setTimeout(() => {
        copyRateBtn.textContent = 'Copy Official Quote Summary';
      }, 2000);
    });
  }

  // UI Lightbox Close
  document.querySelectorAll('[data-close-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = document.getElementById('ui-lightbox-modal');
      if (m) m.classList.add('hidden-view');
    });
  });

  // Gamepass Modal Controls
  document.querySelectorAll('[data-close-gamepass]').forEach((btn) => {
    btn.addEventListener('click', closeGamepassModal);
  });

  const gpLookupBtn = document.getElementById('gp-lookup-btn');
  if (gpLookupBtn) {
    gpLookupBtn.addEventListener('click', () => {
      lookupGamepassRobloxUser();
    });
  }

  const gpBuyLink = document.getElementById('gp-buy-redirect-link');
  if (gpBuyLink) {
    gpBuyLink.addEventListener('click', () => {
      state.awaitingRobloxTabReturn = true;
      const autoBadge = document.getElementById('gp-auto-listen-badge');
      if (autoBadge) {
        autoBadge.textContent = 'Listening for Tab Return from Roblox...';
      }
      setBotStatusBanner(
        'info',
        '[Redirected to Roblox Gamepass Page]: Complete your purchase on Roblox. When you switch back to this tab, the bot will automatically check your inventory and unlock the link!'
      );
    });
  }

  const gpVerifyBtn = document.getElementById('gp-verify-btn');
  if (gpVerifyBtn) {
    gpVerifyBtn.addEventListener('click', () => {
      verifyGamepassOwnership(false);
    });
  }

  // Auto-verify when user returns from the Roblox Gamepass tab
  window.addEventListener('focus', () => {
    if (state.awaitingRobloxTabReturn && state.activeGamepassDemo) {
      const autoBadge = document.getElementById('gp-auto-listen-badge');
      if (autoBadge) {
        autoBadge.textContent = 'Returned from Roblox · Auto-Checking...';
      }
      verifyGamepassOwnership(true);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
