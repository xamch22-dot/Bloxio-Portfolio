import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  X,
} from 'lucide-react';
import {
  PREVIOUS_WORK_DEMOS,
  PreviousWorkDemo,
  UNLOCKED_CREATIONS_STORAGE_KEY,
  getRobloxGamepassCheckoutUrl,
  getDemosByCategory,
} from '../utils/portfolioLogic';
import { playPageChangeSfx } from '../utils/sfxEngine';

export type PreviousWorkSubPage =
  | 'all'
  | 'scripting'
  | 'animating'
  | 'ui-design'
  | 'modeling';

interface LightboxTarget {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface UnlockedCreationRecord {
  demoId: string;
  gamePassId: string;
  robloxUsername: string;
  robloxUserId: string;
  verificationMethod: string;
  unlockedAt: string;
}

interface PreviousWorkPageProps {
  initialSubPage?: PreviousWorkSubPage;
  onBackToPortfolio: () => void;
}

interface DemoCardProps {
  demo: PreviousWorkDemo;
  unlockRecord?: UnlockedCreationRecord;
  onOpenLightbox: (target: LightboxTarget) => void;
  onOpenGamepassModal: (demo: PreviousWorkDemo) => void;
}

const DemoShowcaseCard: React.FC<DemoCardProps> = ({
  demo,
  unlockRecord,
  onOpenLightbox,
  onOpenGamepassModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isUnlocked = Boolean(unlockRecord);
  const targetUnlockUrl =
    demo.unlockLinkUrl ||
    demo.tryAssetUrl ||
    'https://create.roblox.com/store/asset/113210150229519?viewFromStudio=true&keyword=&searchId=18788722-cf9d-4565-9e61-ae99826d0e18';

  const handleCopyAssetLink = async () => {
    if (!isUnlocked) return;
    try {
      await navigator.clipboard.writeText(targetUnlockUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const nextMuted = !isMuted;
    v.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const restartVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    setIsPlaying(true);
  };

  const highlightsHeading =
    demo.category === 'scripting'
      ? 'Included Core Systems:'
      : demo.category === 'animating'
      ? 'Animation Highlights:'
      : demo.category === 'ui-design'
      ? 'UI Design Highlights:'
      : '3D Modeling Highlights:';

  return (
    <section
      id={`demo-${demo.category}`}
      aria-labelledby={`heading-${demo.id}`}
      className="py-12 border-b border-white/10"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-sky-400 mb-1.5">
            {demo.index}. {demo.categoryLabel} Section
          </p>
          <h2
            id={`heading-${demo.id}`}
            className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white text-balance"
          >
            {demo.title}
          </h2>
        </div>

        {isUnlocked ? (
          <a
            href={targetUnlockUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-xl hover:from-sky-400 hover:to-indigo-500 transition-all whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <span>Unlocked · Open Roblox Asset Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onOpenGamepassModal(demo)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-xl hover:from-sky-400 hover:to-indigo-500 transition-all whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>
              Locked Link · Buy Gamepass ({demo.gamePassPriceRobux.toLocaleString('en-US')} R$) to Unlock
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-4">
          {demo.mediaType === 'video' && demo.videoUrl ? (
            <>
              <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                <video
                  ref={videoRef}
                  src={demo.videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full aspect-video object-cover bg-slate-950"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Roblox Studio Live Capture</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-sky-400">
                    {demo.assetId ? `Asset ID: ${demo.assetId}` : demo.craftTag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={`${isPlaying ? 'Pause' : 'Play'} ${demo.title} video`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={`${isMuted ? 'Unmute' : 'Mute'} ${demo.title} audio`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                        <span>Unmute Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Audio On</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={restartVideo}
                    aria-label={`Replay ${demo.title} video`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                </div>
              </div>
            </>
          ) : demo.galleryImages && demo.galleryImages.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {demo.galleryImages.map((imgItem) => (
                  <div
                    key={imgItem.label}
                    className="rounded-xl overflow-hidden border border-white/15 bg-slate-950 flex flex-col justify-between"
                  >
                    <div className="aspect-square overflow-hidden bg-slate-900">
                      <img
                        src={imgItem.url}
                        alt={`${imgItem.label} — 3D Model by ${demo.author}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3.5 border-t border-white/10 flex items-center justify-between gap-2 bg-slate-950">
                      <div className="min-w-0">
                        <div className="font-display text-sm font-bold text-white truncate">
                          {imgItem.label}
                        </div>
                        <div className="text-xs font-mono text-slate-400 truncate mt-0.5">
                          {imgItem.subtitle}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox({
                            title: imgItem.label,
                            subtitle: `${demo.categoryLabel} · Created by ${demo.author} · ${imgItem.subtitle}`,
                            imageUrl: imgItem.url,
                          })
                        }
                        aria-label={`Inspect ${imgItem.label} in fullscreen`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Roblox Studio Viewport Renders (2 Models)</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-sky-400">{demo.craftTag}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl">
                {!imageError && demo.imageUrl ? (
                  <img
                    src={demo.imageUrl}
                    alt={`${demo.title} — ${demo.craftTag} by ${demo.author}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-auto object-contain bg-slate-950"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-8 text-center">
                    <span className="font-display text-lg font-bold text-white">{demo.title}</span>
                    <span className="text-xs font-mono text-sky-400 mt-1">{demo.craftTag}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span>High-Resolution Roblox UI Frame</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-sky-400">{demo.craftTag}</span>
                </div>

                {demo.imageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenLightbox({
                        title: demo.title,
                        subtitle: `${demo.categoryLabel} · Created by ${demo.author} · ${demo.craftTag}`,
                        imageUrl: demo.imageUrl!,
                      })
                    }
                    aria-label={`Inspect ${demo.title} in fullscreen`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Inspect Fullscreen UI</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-slate-400">
              <span className="text-sky-400 font-semibold whitespace-nowrap">
                {demo.categoryLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">Created by {demo.author}</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{demo.craftTag}</span>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {demo.description}
            </p>

            <div className="pt-1">
              <div className="text-xs font-mono text-slate-400 mb-2">{highlightsHeading}</div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-slate-200">
                {demo.systemsIncluded.map((sys, idx) => (
                  <React.Fragment key={sys}>
                    <span className="text-sky-400">{sys}</span>
                    {idx < demo.systemsIncluded.length - 1 && (
                      <span aria-hidden="true" className="text-slate-500">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 divide-y divide-white/10">
            {demo.technicalHighlights.map((item) => (
              <div key={item.label} className="py-3">
                <div className="text-xs font-mono font-semibold text-white">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-3">
            <div
              id={`unlocked-link-box-${demo.id}`}
              className={`p-4 rounded-2xl space-y-3 ${
                isUnlocked
                  ? 'bg-sky-950/35 border border-sky-400/50'
                  : 'bg-[#0C1326]/90 border border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs font-mono">
                <span
                  className={`font-semibold ${
                    isUnlocked ? 'text-sky-400' : 'text-amber-400'
                  }`}
                >
                  {isUnlocked
                    ? `[UNLOCKED] ASSET LINK READY · @${unlockRecord?.robloxUsername || 'VERIFIED'}`
                    : `[LOCKED LINK] GAMEPASS #${demo.gamePassId || '2053169441'}`}
                </span>
                <span className="text-white font-bold tabular-nums">
                  {demo.gamePassPriceRobux.toLocaleString('en-US')} R$
                </span>
              </div>

              {isUnlocked ? (
                <>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Gamepass verified! Your official Roblox Creator Store link is now unlocked below:
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/40">
                    <div className="text-[11px] font-mono text-sky-400 mb-1">
                      Unlocked Roblox Creator Store Asset URL:
                    </div>
                    <a
                      href={targetUnlockUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs font-mono text-white hover:text-sky-300 break-all underline underline-offset-4"
                    >
                      {targetUnlockUrl}
                    </a>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={targetUnlockUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-xl hover:from-sky-400 hover:to-indigo-500 transition-all whitespace-nowrap shrink-0"
                    >
                      <span>Open Unlocked Asset Link</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyAssetLink}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-mono font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/15 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-sky-400" />
                          <span>Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Unlocked Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This Roblox Creator Store asset link is{' '}
                    <strong className="text-white">locked</strong>. Purchase the Gamepass on Roblox
                    and verify ownership—the buying menu will automatically close and unlock the
                    link right here.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-between gap-2 text-xs font-mono text-slate-400 select-none">
                    <span className="truncate">
                      https://create.roblox.com/store/asset/••••••••••••••• (Locked)
                    </span>
                    <span className="text-amber-400 shrink-0">LOCKED</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenGamepassModal(demo)}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-xl hover:from-sky-400 hover:to-indigo-500 transition-all cursor-pointer"
                  >
                    <span>
                      Buy Gamepass ({demo.gamePassPriceRobux.toLocaleString('en-US')} R$) to Unlock
                      Link
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[#0C1326]/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300 font-mono">{demo.rateLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {demo.tryAssetUrl &&
        (isUnlocked ? (
          <div className="mt-8 p-4 rounded-xl bg-sky-950/25 border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-mono text-sky-400">
                [UNLOCKED] Official Roblox Creator Store Link
              </div>
              <a
                href={targetUnlockUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs font-mono text-slate-200 hover:text-white truncate underline underline-offset-4"
              >
                {targetUnlockUrl}
              </a>
            </div>

            <a
              href={targetUnlockUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-400 hover:text-sky-300 whitespace-nowrap shrink-0"
            >
              <span>Open in Roblox Creator Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="mt-8 p-4 rounded-xl bg-[#0C1326]/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-mono text-amber-400">
                [LOCKED] Official Roblox Creator Store Link
              </div>
              <div className="text-xs font-mono text-slate-400 truncate">
                Link is locked — Buy &amp; verify Gamepass #{demo.gamePassId || '2053169441'} (
                {demo.gamePassPriceRobux.toLocaleString('en-US')} R$) to unlock link
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenGamepassModal(demo)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-400 hover:text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>
                Unlock Link ({demo.gamePassPriceRobux.toLocaleString('en-US')} R$ Gamepass)
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
    </section>
  );
};

function loadInitialUnlockedMap(): Record<string, UnlockedCreationRecord> {
  try {
    const raw = localStorage.getItem(UNLOCKED_CREATIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const PreviousWorkPage: React.FC<PreviousWorkPageProps> = ({
  initialSubPage = 'all',
  onBackToPortfolio,
}) => {
  const [activeSubPage, setActiveSubPage] = useState<PreviousWorkSubPage>(initialSubPage);
  const [lightboxTarget, setLightboxTarget] = useState<LightboxTarget | null>(null);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, UnlockedCreationRecord>>(() =>
    loadInitialUnlockedMap()
  );
  const [activeGamepassDemo, setActiveGamepassDemo] = useState<PreviousWorkDemo | null>(null);
  const [robloxUsername, setRobloxUsername] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [botStatus, setBotStatus] = useState<{
    type: 'info' | 'error' | 'success';
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setActiveSubPage(initialSubPage);
  }, [initialSubPage]);

  const handleOpenGamepassModal = (demo: PreviousWorkDemo) => {
    setActiveGamepassDemo(demo);
    setBotStatus(null);
  };

  const handleVerifyGamepass = async () => {
    if (!activeGamepassDemo) return;
    const cleanUser = robloxUsername.trim();
    if (!cleanUser) {
      setBotStatus({
        type: 'error',
        message: 'Please enter your Roblox username in Step 1 before verifying Gamepass ownership.',
      });
      return;
    }

    setIsVerifying(true);
    setBotStatus({
      type: 'info',
      message: `[Bot Verifying]: Checking Roblox Inventory of @${cleanUser} for Gamepass #${activeGamepassDemo.gamePassId}...`,
    });

    try {
      const res = await fetch('/api/verify-gamepass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          gamePassId: activeGamepassDemo.gamePassId,
          claimCode: claimCode.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data && data.verified) {
        const record: UnlockedCreationRecord = {
          demoId: activeGamepassDemo.id,
          gamePassId: activeGamepassDemo.gamePassId,
          robloxUsername: data.username || cleanUser,
          robloxUserId: String(data.userId || ''),
          verificationMethod: data.verificationMethod || 'Roblox Inventory API',
          unlockedAt: data.verifiedAt || new Date().toISOString(),
        };
        const nextMap = { ...unlockedMap, [activeGamepassDemo.id]: record };
        setUnlockedMap(nextMap);
        try {
          localStorage.setItem(UNLOCKED_CREATIONS_STORAGE_KEY, JSON.stringify(nextMap));
        } catch {}

        const targetId = activeGamepassDemo.id;
        setActiveGamepassDemo(null);
        setBotStatus(null);

        setTimeout(() => {
          const el = document.getElementById(`unlocked-link-box-${targetId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 80);
      } else {
        setBotStatus({
          type: 'error',
          message:
            data?.message ||
            data?.error ||
            `Gamepass #${activeGamepassDemo.gamePassId} was not detected in @${cleanUser}'s public inventory yet.`,
        });
      }
    } catch {
      setBotStatus({
        type: 'error',
        message: 'Could not reach /api/verify-gamepass. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const visibleDemos =
    activeSubPage === 'all' ? PREVIOUS_WORK_DEMOS : getDemosByCategory(activeSubPage);

  const subPageTitle =
    activeSubPage === 'scripting'
      ? 'Scripting Work'
      : activeSubPage === 'animating'
      ? 'Animation Work'
      : activeSubPage === 'ui-design'
      ? 'UI Design'
      : activeSubPage === 'modeling'
      ? '3D Modeling'
      : 'Previous Work (Demo)';

  const handleSelectSubPage = (sub: PreviousWorkSubPage) => {
    playPageChangeSfx();
    setActiveSubPage(sub);
  };

  const handleBackClick = () => {
    playPageChangeSfx();
    onBackToPortfolio();
  };

  return (
    <div className="min-h-[calc(100vh-61px)] bg-[#060913] text-slate-100 py-14 lg:py-20 px-6 lg:px-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              type="button"
              data-sfx="page-change"
              onClick={handleBackClick}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span aria-hidden="true" className="text-slate-600">
              /
            </span>
            <span className="text-slate-300">Previous Work (Demo)</span>
            <span aria-hidden="true" className="text-slate-600">
              /
            </span>
            <span className="text-sky-400">{subPageTitle}</span>
          </div>

          <div
            role="tablist"
            aria-label="Previous Work Sub-Pages"
            className="inline-flex flex-wrap items-center gap-1 p-1.5 bg-[#0B1120] border border-white/10 rounded-xl self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              data-sfx="page-change"
              aria-selected={activeSubPage === 'all'}
              onClick={() => handleSelectSubPage('all')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'all'
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Demos (4)
            </button>
            <button
              type="button"
              role="tab"
              data-sfx="page-change"
              aria-selected={activeSubPage === 'scripting'}
              onClick={() => handleSelectSubPage('scripting')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'scripting'
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Scripting Work
            </button>
            <button
              type="button"
              role="tab"
              data-sfx="page-change"
              aria-selected={activeSubPage === 'animating'}
              onClick={() => handleSelectSubPage('animating')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'animating'
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Animation Work
            </button>
            <button
              type="button"
              role="tab"
              data-sfx="page-change"
              aria-selected={activeSubPage === 'ui-design'}
              onClick={() => handleSelectSubPage('ui-design')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'ui-design'
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              UI Design
            </button>
            <button
              type="button"
              role="tab"
              data-sfx="page-change"
              aria-selected={activeSubPage === 'modeling'}
              onClick={() => handleSelectSubPage('modeling')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'modeling'
                  ? 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              3D Modeling
            </button>
          </div>
        </div>

        <div className="pt-10 pb-10 border-b border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-mono uppercase tracking-wider text-sky-400 mb-3">
              Previous Work (Demo) · Scripting, Animation, UI &amp; 3D Modeling Showcase
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance">
              {subPageTitle}
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Explore live recorded Roblox Studio demonstrations, polished interface designs, and game-ready
              3D models crafted by <strong className="text-white">balo_xio</strong> across all four core
              disciplines.
            </p>
          </div>
        </div>

        <div>
          {visibleDemos.map((demo) => (
            <DemoShowcaseCard
              key={demo.id}
              demo={demo}
              unlockRecord={unlockedMap[demo.id]}
              onOpenLightbox={(t) => setLightboxTarget(t)}
              onOpenGamepassModal={(d) => handleOpenGamepassModal(d)}
            />
          ))}
        </div>
      </div>

      {activeGamepassDemo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buy Gamepass to Unlock Creation Link"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
          onClick={() => setActiveGamepassDemo(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#090E1C] border border-sky-400/25 rounded-2xl shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D1528]">
              <div>
                <p className="text-xs font-mono text-sky-400">
                  Roblox Gamepass Verification Bot · Instant Link Unlock
                </p>
                <h2 className="font-display text-xl font-bold text-white">
                  Buy Gamepass to Unlock Creation Link
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveGamepassDemo(null)}
                aria-label="Close Gamepass unlock modal"
                className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-white/10 cursor-pointer"
              >
                Close [ESC]
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-[#0D1528] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-400">
                    {activeGamepassDemo.categoryLabel.toUpperCase()} · ROBLOX GAMEPASS LINK UNLOCK
                  </div>
                  <div className="font-display text-lg font-bold text-white mt-0.5">
                    {activeGamepassDemo.title}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    Roblox Gamepass ID: #{activeGamepassDemo.gamePassId} · Unlocks Official Roblox
                    Creator Store Link
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-xs font-mono text-slate-400">Gamepass Price</div>
                  <div className="font-display text-2xl font-bold text-sky-400 tabular-nums">
                    {activeGamepassDemo.gamePassPriceRobux.toLocaleString('en-US')} R$
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-300">
                  Step 1. Enter Your Roblox Username (Bot Checks Your Inventory) *
                </label>
                <input
                  type="text"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  placeholder="e.g. tpjerry6789"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-white/15 rounded-xl text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#0D1528]/70 border border-white/10 space-y-3">
                <div className="text-xs font-mono text-slate-300">
                  Step 2. Purchase Gamepass on Roblox &amp; Verify to Unlock Link
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={
                      activeGamepassDemo.gamePassUrl ||
                      getRobloxGamepassCheckoutUrl(activeGamepassDemo.gamePassId)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl transition-all whitespace-nowrap"
                  >
                    <span>
                      1. Buy Gamepass on Roblox (
                      {activeGamepassDemo.gamePassPriceRobux.toLocaleString('en-US')} R$)
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleVerifyGamepass}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-sky-400/40 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>
                      {isVerifying
                        ? 'Bot Checking Inventory...'
                        : '2. Verify Gamepass & Unlock Link'}
                    </span>
                  </button>
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Optional: Have a Private Inventory or Instant Claim Passcode?
                  </label>
                  <input
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    placeholder="Optional claim code (e.g. BALO-GAMEPASS-VERIFIED)"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {botStatus && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed ${
                    botStatus.type === 'error'
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                      : 'bg-slate-900/90 border-white/15 text-slate-200'
                  }`}
                >
                  {botStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {lightboxTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxTarget.title} Fullscreen Preview`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
          onClick={() => setLightboxTarget(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#090E1C] border border-white/15 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold text-white">{lightboxTarget.title}</h3>
                <p className="text-xs font-mono text-slate-400">{lightboxTarget.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxTarget(null)}
                aria-label="Close fullscreen preview"
                className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-[#050811]">
              <img
                src={lightboxTarget.imageUrl}
                alt={lightboxTarget.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
