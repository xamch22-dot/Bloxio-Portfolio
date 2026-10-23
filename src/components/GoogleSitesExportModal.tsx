import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download, Globe, Code2 } from 'lucide-react';
import { COMBAT_SYSTEM_ASSET_URL } from '../utils/portfolioLogic';

interface GoogleSitesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SHARED_LIVE_APP_URL =
  'https://ais-pre-v6zjkdlg7eiyq53s4ydr52-726802962771.asia-northeast1.run.app';

export function buildStandaloneGoogleSitesHtml(baseUrl: string = SHARED_LIVE_APP_URL): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>balo_xio portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { background:#070908; color:#f4f4f5; font-family:'DM Sans',sans-serif; margin:0; overflow-x:hidden; }
  .font-display { font-family:'Syne',sans-serif; }
  .font-mono { font-family:'JetBrains Mono',monospace; }
  .hacker-shadow { text-shadow: 0 0 18px rgba(34,197,94,0.35); }
  .selective-blur {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.15) 78%, rgba(0,0,0,0) 100%);
    -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.15) 78%, rgba(0,0,0,0) 100%);
  }
</style>
</head>
<body class="bg-[#070908] text-zinc-100">
  <!-- Top Bar -->
  <header class="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 lg:px-12 py-4 bg-[#070908]/90 backdrop-blur-md border-b border-white/10">
    <a href="#" onclick="switchPage('home');return false;" class="font-display text-lg font-bold tracking-tight text-white hover:text-emerald-400">balo_xio</a>
    <nav class="flex flex-wrap items-center gap-6 text-sm font-medium text-zinc-400">
      <a href="#overview" onclick="switchPage('home')" class="hover:text-white">Overview</a>
      <button type="button" onclick="switchPage('demos')" id="nav-demos" class="hover:text-emerald-400 cursor-pointer">Previous Work (Demo)</button>
      <a href="#experience" onclick="switchPage('home')" class="hover:text-white">Experience</a>
      <a href="#estimator" onclick="switchPage('home')" class="hover:text-white">Estimator</a>
      <a href="${baseUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-400">Owner Inbox ↗</a>
    </nav>
    <a href="${baseUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300">Commission Me</a>
  </header>

  <!-- HOME PAGE -->
  <div id="page-home">
    <section id="overview" class="relative min-h-[82vh] flex flex-col justify-between overflow-hidden border-b border-white/10">
      <div class="absolute inset-0 z-0 bg-[#070908]">
        <video id="bg-video" src="${baseUrl}/assets/aistudio/1022_bd4c00dc.mp4#t=2" autoplay muted playsinline class="w-full h-full object-cover blur-[1.5px] opacity-90"></video>
        <div class="absolute inset-0 selective-blur bg-[#070908]/40 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#070908]/95 via-[#070908]/75 to-transparent pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-[#070908] via-transparent to-[#070908]/50 pointer-events-none"></div>
      </div>

      <div class="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-12 pt-16 pb-12 flex-1 flex items-center">
        <div class="max-w-3xl space-y-6">
          <div class="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-300">
            <span class="text-emerald-400">balo_xio portfolio</span> · <span>Roblox Developer</span> · <span>16+ Years Old</span> · <span>40% Upfront Deposit</span>
          </div>
          <p class="font-display text-5xl sm:text-7xl font-bold tracking-tight text-white">balo_xio</p>
          <div class="min-h-[3.5rem] flex items-center">
            <h1 class="font-mono font-bold text-2xl sm:text-4xl lg:text-5xl text-[#22c55e] hacker-shadow">
              <span class="text-emerald-500/80 mr-2">&gt;</span><span id="hacker-text">I am a Scripter.</span><span class="inline-block w-3 h-8 ml-2 align-middle bg-[#22c55e] animate-pulse"></span>
            </h1>
          </div>
          <p class="text-base sm:text-lg text-zinc-200 leading-relaxed max-w-2xl">
            I bring <strong class="text-white">3+ years of scripting</strong>, <strong class="text-white">2+ years of UI design</strong>, <strong class="text-white">2+ years of 3D modeling</strong>, and <strong class="text-white">1+ year of animating</strong> into one cohesive workflow. I am <strong class="text-white">16+ years old</strong> and work on short-term tasks, long-term contracts, and single Roblox commissions. I do <strong class="text-white">not</strong> work for revenue share—I always take a <strong class="text-emerald-400">40% upfront payment</strong>.
          </p>
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <a href="${baseUrl}" target="_blank" rel="noopener noreferrer" class="px-6 py-3.5 text-sm font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300">Start a Commission ↗</a>
            <button type="button" onclick="switchPage('demos')" class="px-6 py-3.5 text-sm font-medium text-zinc-100 border border-emerald-500/40 bg-emerald-500/10 rounded-md hover:border-emerald-400 cursor-pointer">Previous Work (Demo) →</button>
          </div>
        </div>
      </div>

      <div class="relative z-10 bg-[#070908]/90 border-t border-white/10">
        <div class="max-w-[1200px] mx-auto px-6 lg:px-12 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div><div class="font-display text-3xl font-bold text-white">3+ Years</div><div class="text-sm text-emerald-400">Scripting Experience</div></div>
          <div><div class="font-display text-3xl font-bold text-white">2+ Years</div><div class="text-sm text-emerald-400">UI Design Experience</div></div>
          <div><div class="font-display text-3xl font-bold text-white">2+ Years</div><div class="text-sm text-emerald-400">3D Modeling Experience</div></div>
          <div><div class="font-display text-3xl font-bold text-white">1+ Year</div><div class="text-sm text-emerald-400">Animating Experience</div></div>
        </div>
      </div>
    </section>

    <!-- Rates Section -->
    <section id="estimator" class="py-16 px-6 lg:px-12 max-w-[1200px] mx-auto border-b border-white/10">
      <p class="text-xs font-mono text-emerald-400 mb-2">Commission Policy &amp; Rates</p>
      <h2 class="font-display text-3xl sm:text-4xl font-bold text-white mb-8">Fixed Rates. 40% Upfront. Zero Revenue Share.</h2>
      <div class="divide-y divide-white/10 border-t border-b border-white/10">
        <div class="py-4 flex flex-wrap justify-between gap-2"><strong class="text-white">01. Full Pack (All-Rounder)</strong><span class="font-mono text-sm text-emerald-400">Commission: $20 / 5,000 R$ · Short-Term: $70 / 20,000 R$ · Long-Term: $250 / 100,000 R$</span></div>
        <div class="py-4 flex flex-wrap justify-between gap-2"><strong class="text-white">02. Scripting (3+ Yrs)</strong><span class="font-mono text-sm text-emerald-400">Commission: $15 / 5,000 R$ · Short-Term: $75 / 15,000 R$ · Long-Term: $140 / 65,000 R$</span></div>
        <div class="py-4 flex flex-wrap justify-between gap-2"><strong class="text-white">03. 3D Modeling (2+ Yrs)</strong><span class="font-mono text-sm text-emerald-400">Commission: $35 / 15,000 R$ · Short-Term: $75 / 20,000 R$ · Long-Term: $130 / 80,000 R$</span></div>
        <div class="py-4 flex flex-wrap justify-between gap-2"><strong class="text-white">04. Animation (1+ Yr)</strong><span class="font-mono text-sm text-emerald-400">Commission: $10 / 2,000 R$ · Short-Term: $37 / 8,000 R$ · Long-Term: $120 / 13,000 R$</span></div>
        <div class="py-4 flex flex-wrap justify-between gap-2"><strong class="text-white">05. UI Design (2+ Yrs)</strong><span class="font-mono text-sm text-emerald-400">Commission: $10 / 1,500 R$ · Short-Term: $34 / 7,000 R$ · Long-Term: $95 / 12,000 R$</span></div>
      </div>
    </section>
  </div>

  <!-- PREVIOUS WORK (DEMO) PAGE -->
  <div id="page-demos" style="display:none;" class="py-14 px-6 lg:px-12 max-w-[1200px] mx-auto space-y-16">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
      <div>
        <p class="text-xs font-mono text-emerald-400">Previous Work (Demo) · Scripting, Animation &amp; UI Showcase</p>
        <h1 class="font-display text-3xl sm:text-5xl font-bold text-white mt-1">Previous Work (Demo)</h1>
      </div>
      <button type="button" onclick="switchPage('home')" class="px-4 py-2 text-xs font-mono text-zinc-200 bg-zinc-900 border border-white/15 rounded cursor-pointer">← Back to Home</button>
    </div>

    <!-- 01. Scripting Work -->
    <article class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-white/10 pb-12">
      <div class="lg:col-span-7">
        <video src="${baseUrl}/assets/aistudio/1023_0f48f1c9.mp4" controls autoplay loop muted playsinline class="w-full rounded-lg border border-white/15 bg-black"></video>
      </div>
      <div class="lg:col-span-5 space-y-4">
        <div class="text-xs font-mono text-emerald-400">01. Scripting Work · Created by Balo_xio</div>
        <h2 class="font-display text-3xl font-bold text-white">The Combat System By Balo_xio</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">A well-designed Combat System made by Balo_xio that includes a Headshot System, Hit Markers, Recoil System, Raycasting System, Custom Animations, Reloading GUI System, and more.</p>
        <div class="text-xs font-mono text-emerald-400">Headshot System · Hit Markers · Recoil System · Raycasting System · Animations · Reloading GUI System</div>
        <div class="pt-2">
          <a href="${COMBAT_SYSTEM_ASSET_URL}" target="_blank" rel="noopener noreferrer" class="inline-block px-5 py-3 text-sm font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300">Try Combat System on Roblox ↗</a>
        </div>
      </div>
    </article>

    <!-- 02. Animation Work -->
    <article class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-white/10 pb-12">
      <div class="lg:col-span-7">
        <video src="${baseUrl}/assets/aistudio/Roblox_Studio_2026.10.17_-_00.32.45.06_d4d05cec.mp4" controls autoplay loop muted playsinline class="w-full rounded-lg border border-white/15 bg-black"></video>
      </div>
      <div class="lg:col-span-5 space-y-4">
        <div class="text-xs font-mono text-emerald-400">02. Animation Work · Created by Balo_xio</div>
        <h2 class="font-display text-3xl font-bold text-white">A Walk Animation Made By Balo_xio</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">A cinematic walk animation made by Balo_xio featuring synchronized cinematic camera animation, weighty R6 stride pacing, natural upper-torso counter-rotation, and smooth keyframe easing crafted for cutscenes and character entrances.</p>
        <div class="text-xs font-mono text-emerald-400">Cinematic Walk Cycle · Cinematic Camera Animation · R6 Rig Keyframing · Smooth Easing Curves</div>
      </div>
    </article>

    <!-- 03. UI Design -->
    <article class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8">
      <div class="lg:col-span-7">
        <img src="${baseUrl}/assets/aistudio/Gemini_Generated_Image_tmic7xtmic7xtmic_f9b1a615.jpg" alt="Viral Game UI by Balo_xio" class="w-full rounded-lg border border-white/15 bg-zinc-950" />
      </div>
      <div class="lg:col-span-5 space-y-4">
        <div class="text-xs font-mono text-emerald-400">03. UI Design · Created by Balo_xio</div>
        <h2 class="font-display text-3xl font-bold text-white">Viral Game UI</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">A polished Viral Game UI made by Balo_xio—featuring a glossy sky-blue beveled shop header with custom 3D basket iconography, a high-contrast tactile close button, dual cyan-glow inset grid containers for gamepasses and item bundles, and responsive Scale layouts.</p>
        <div class="text-xs font-mono text-emerald-400">Glossy Beveled Header · Dual Cyan-Glow Item Grids · Custom 3D Shop Iconography · Responsive Scale</div>
      </div>
    </article>
  </div>

  <script>
    // Skip first 2 seconds of background video
    const bgVid = document.getElementById('bg-video');
    if (bgVid) {
      bgVid.addEventListener('timeupdate', () => {
        if (bgVid.currentTime < 2) bgVid.currentTime = 2;
        if (bgVid.duration && bgVid.currentTime >= bgVid.duration - 0.15) {
          bgVid.currentTime = 2;
          bgVid.play().catch(()=>{});
        }
      });
    }

    // 5-Sentence Hacker Green Sequence (1s per sentence)
    const sentences = [
      'I am a Scripter.',
      'I am a UI Designer.',
      'I am an Animator.',
      'I am a Modeler.',
      'I am an All-Rounder.'
    ];
    let sIdx = 0;
    const el = document.getElementById('hacker-text');
    setInterval(() => {
      sIdx = (sIdx + 1) % sentences.length;
      if (el) el.textContent = sentences[sIdx];
    }, 1000);

    function switchPage(page) {
      document.getElementById('page-home').style.display = page === 'home' ? 'block' : 'none';
      document.getElementById('page-demos').style.display = page === 'demos' ? 'block' : 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  </script>
</body>
</html>`;
}

export const GoogleSitesExportModal: React.FC<GoogleSitesExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedMode, setCopiedMode] = useState<'standalone' | 'iframe' | 'url' | null>(null);

  if (!isOpen) return null;

  const standaloneHtml = buildStandaloneGoogleSitesHtml(SHARED_LIVE_APP_URL);
  const iframeCode = `<iframe src="${SHARED_LIVE_APP_URL}" style="width:100%; height:100vh; min-height:920px; border:none; background:#070908;" allow="autoplay; clipboard-write; fullscreen" title="balo_xio portfolio"></iframe>`;

  const copyText = async (mode: 'standalone' | 'iframe' | 'url', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMode(mode);
      setTimeout(() => setCopiedMode(null), 2500);
    } catch {
      setCopiedMode(mode);
      setTimeout(() => setCopiedMode(null), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-sites-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-white/15 rounded-xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div>
            <p className="text-xs font-mono text-emerald-400">Google Sites &amp; Live Website Export</p>
            <h2 id="google-sites-export-title" className="font-display text-xl font-bold text-white">
              Put Your Portfolio on Google Sites (In 30 Seconds)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Google Sites export modal"
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-md border border-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Option 1: Whole Standalone HTML Code for Google Sites */}
          <div className="p-5 rounded-lg bg-zinc-900/70 border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Code2 className="w-4 h-4" />
                  <span>METHOD 1 · PASTE WHOLE HTML CODE INTO GOOGLE SITES</span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  All-In-One Google Sites HTML Code (Home + Previous Work Demos + Videos + UI)
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Google Sites only accepts a single <code className="text-emerald-400">&lt;!DOCTYPE html&gt;</code> block. Click the green button below, then in Google Sites go to <strong>Insert → Embed → Embed code</strong> and press <strong>Ctrl+V</strong>!
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyText('standalone', standaloneHtml)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-mono font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedMode === 'standalone' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied Whole HTML!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Whole HTML Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 rounded bg-black/80 border border-white/10 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-36">
              {standaloneHtml}
            </pre>
          </div>

          {/* Option 2: Full-Page URL Embed in Google Sites */}
          <div className="p-5 rounded-lg bg-zinc-900/50 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Globe className="w-4 h-4" />
                  <span>METHOD 2 · FULL-PAGE EMBED BY URL (INCLUDES LIVE ROBLOX BOT &amp; INBOX)</span>
                </div>
                <h3 className="font-display text-base font-bold text-white mt-1">
                  Your Website Is Already Live on the Web
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  In Google Sites, click <strong>Pages → + → Full page embed → By URL</strong> and paste this link so the Roblox Avatar Bot and Commission Inbox also work live:
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copyText('url', SHARED_LIVE_APP_URL)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-white/15 rounded-md cursor-pointer"
                >
                  {copiedMode === 'url' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>URL Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Live URL</span>
                    </>
                  )}
                </button>
                <a
                  href={SHARED_LIVE_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md"
                >
                  <span>Open Live Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-2.5 rounded bg-black/70 border border-white/10 text-xs font-mono text-emerald-400 truncate">
              {SHARED_LIVE_APP_URL}
            </div>
          </div>

          {/* Option 3: Download ZIP or Standalone HTML file */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
            <span className="text-zinc-400">
              Want the files on your PC instead? Download the standalone HTML or the full project ZIP:
            </span>
            <div className="flex items-center gap-3">
              <a
                href="/api/google-sites-html"
                download="balo_xio-google-sites.html"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/15 rounded-md"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download Single .HTML</span>
              </a>
              <a
                href="/api/download-zip"
                download="balo_xio-portfolio.zip"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-mono font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Full .ZIP</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
