import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
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
  DisciplineId,
  calculateCommissionBreakdown,
  getDemosByCategory,
} from '../utils/portfolioLogic';

export type PreviousWorkSubPage = 'all' | 'scripting' | 'animating' | 'ui-design';

interface PreviousWorkPageProps {
  initialSubPage?: PreviousWorkSubPage;
  onBackToPortfolio: () => void;
  onBookCommissionFromDemo: (discipline: DisciplineId, prefilledSummary: string) => void;
}

interface DemoCardProps {
  demo: PreviousWorkDemo;
  onBookCommission: (discipline: DisciplineId, prefilledSummary: string) => void;
  onOpenLightbox: (demo: PreviousWorkDemo) => void;
}

const DemoShowcaseCard: React.FC<DemoCardProps> = ({
  demo,
  onBookCommission,
  onOpenLightbox,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleCopyAssetLink = async () => {
    if (!demo.tryAssetUrl) return;
    try {
      await navigator.clipboard.writeText(demo.tryAssetUrl);
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

  const handleBookThisDiscipline = () => {
    const estimate = calculateCommissionBreakdown({
      disciplineId: demo.disciplineId,
      contractType: 'commission',
      currency: 'USD',
    });
    const refLine = demo.assetId
      ? `Reference Demo: ${demo.title} (Asset ID: ${demo.assetId})`
      : `Reference Demo: ${demo.title} (${demo.categoryLabel})`;
    onBookCommission(demo.disciplineId, `${estimate.summaryText}\n${refLine}`);
  };

  const bookButtonLabel =
    demo.category === 'scripting'
      ? 'Book Custom Scripting'
      : demo.category === 'animating'
      ? 'Book Custom Animation'
      : 'Book Custom UI Design';

  const highlightsHeading =
    demo.category === 'scripting'
      ? 'Included Core Systems:'
      : demo.category === 'animating'
      ? 'Animation Highlights:'
      : 'UI Design Highlights:';

  return (
    <section
      id={`demo-${demo.category}`}
      aria-labelledby={`heading-${demo.id}`}
      className="py-12 border-b border-white/10"
    >
      {/* Section Kicker */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-emerald-400 mb-1.5">
            {demo.index}. {demo.categoryLabel} Section
          </p>
          <h2
            id={`heading-${demo.id}`}
            className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white text-balance"
          >
            {demo.title}
          </h2>
        </div>

        {demo.tryAssetUrl && (
          <a
            href={demo.tryAssetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <span>Try Combat System on Roblox</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 7 Columns: High-Retention Video or Image Showcase */}
        <div className="lg:col-span-7 space-y-4">
          {demo.mediaType === 'video' && demo.videoUrl ? (
            <>
              <div className="relative rounded-lg overflow-hidden border border-white/15 bg-black shadow-2xl">
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
                  className="w-full aspect-video object-cover bg-zinc-950"
                />
              </div>

              {/* Video Controls & Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span>Roblox Studio Live Capture</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">
                    {demo.assetId ? `Asset ID: ${demo.assetId}` : demo.craftTag}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={`${isPlaying ? 'Pause' : 'Play'} ${demo.title} video`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Unmute Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Audio On</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={restartVideo}
                    aria-label={`Replay ${demo.title} video`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative rounded-lg overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl">
                {!imageError && demo.imageUrl ? (
                  <img
                    src={demo.imageUrl}
                    alt={`${demo.title} — ${demo.craftTag} by ${demo.author}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-full h-auto object-contain bg-zinc-950"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-8 text-center">
                    <span className="font-display text-lg font-bold text-white">{demo.title}</span>
                    <span className="text-xs font-mono text-emerald-400 mt-1">{demo.craftTag}</span>
                  </div>
                )}
              </div>

              {/* Image Inspection Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span>High-Resolution Roblox UI Frame</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">{demo.craftTag}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenLightbox(demo)}
                  aria-label={`Inspect ${demo.title} in fullscreen`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inspect Fullscreen UI</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right 5 Columns: Description, Systems Included & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="text-emerald-400 font-semibold">{demo.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Created by {demo.author}</span>
              <span aria-hidden="true">·</span>
              <span>{demo.craftTag}</span>
            </div>

            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
              {demo.description}
            </p>

            {/* Unboxed Systems List (Zero-Pill Discipline) */}
            <div className="pt-1">
              <div className="text-xs font-mono text-zinc-400 mb-2">{highlightsHeading}</div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-mono text-zinc-200">
                {demo.systemsIncluded.map((sys, idx) => (
                  <React.Fragment key={sys}>
                    <span className="text-emerald-400">{sys}</span>
                    {idx < demo.systemsIncluded.length - 1 && (
                      <span aria-hidden="true" className="text-zinc-500">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Breakdown Rows */}
          <div className="border-t border-white/10 divide-y divide-white/10">
            {demo.technicalHighlights.map((item) => (
              <div key={item.label} className="py-3">
                <div className="text-xs font-mono font-semibold text-white">{item.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 space-y-3">
            {demo.tryAssetUrl && (
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={demo.tryAssetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Try Combat System (Roblox Studio)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyAssetLink}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-mono font-medium text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Roblox Link</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="p-3.5 rounded-md bg-zinc-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-zinc-300 font-mono">{demo.rateLabel}</div>
              <button
                type="button"
                onClick={handleBookThisDiscipline}
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{bookButtonLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Store URL Reference Strip for Scripting Combat System */}
      {demo.tryAssetUrl && (
        <div className="mt-8 p-4 rounded-lg bg-zinc-900/50 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-mono text-emerald-400">
              Official Roblox Creator Store Link
            </div>
            <a
              href={demo.tryAssetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs font-mono text-zinc-300 hover:text-white truncate underline underline-offset-4"
            >
              {demo.tryAssetUrl}
            </a>
          </div>

          <a
            href={demo.tryAssetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap shrink-0"
          >
            <span>Open in Roblox Creator Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </section>
  );
};

export const PreviousWorkPage: React.FC<PreviousWorkPageProps> = ({
  initialSubPage = 'all',
  onBackToPortfolio,
  onBookCommissionFromDemo,
}) => {
  const [activeSubPage, setActiveSubPage] = useState<PreviousWorkSubPage>(initialSubPage);
  const [lightboxDemo, setLightboxDemo] = useState<PreviousWorkDemo | null>(null);

  useEffect(() => {
    setActiveSubPage(initialSubPage);
  }, [initialSubPage]);

  const visibleDemos =
    activeSubPage === 'all' ? PREVIOUS_WORK_DEMOS : getDemosByCategory(activeSubPage);

  const subPageTitle =
    activeSubPage === 'scripting'
      ? 'Scripting Work'
      : activeSubPage === 'animating'
      ? 'Animation Work'
      : activeSubPage === 'ui-design'
      ? 'UI Design'
      : 'Previous Work (Demo)';

  return (
    <div className="min-h-[calc(100vh-61px)] bg-[#070908] text-zinc-100 py-14 lg:py-20 px-6 lg:px-12">
      <div className="max-w-[1280px] mx-auto">
        {/* Top Breadcrumb & Sub-Page Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              type="button"
              onClick={onBackToPortfolio}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span aria-hidden="true" className="text-zinc-600">
              /
            </span>
            <span className="text-zinc-300">Previous Work (Demo)</span>
            <span aria-hidden="true" className="text-zinc-600">
              /
            </span>
            <span className="text-emerald-400">{subPageTitle}</span>
          </div>

          {/* Dedicated Sub-Page Selector: All Demos, Scripting Work, Animation Work, UI Design */}
          <div
            role="tablist"
            aria-label="Previous Work Sub-Pages"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-zinc-900 border border-white/10 rounded-md self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSubPage === 'all'}
              onClick={() => setActiveSubPage('all')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'all'
                  ? 'bg-emerald-400 text-zinc-950 font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              All Demos (3)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSubPage === 'scripting'}
              onClick={() => setActiveSubPage('scripting')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'scripting'
                  ? 'bg-emerald-400 text-zinc-950 font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Scripting Work
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSubPage === 'animating'}
              onClick={() => setActiveSubPage('animating')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'animating'
                  ? 'bg-emerald-400 text-zinc-950 font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Animation Work
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSubPage === 'ui-design'}
              onClick={() => setActiveSubPage('ui-design')}
              className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubPage === 'ui-design'
                  ? 'bg-emerald-400 text-zinc-950 font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              UI Design
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="pt-10 pb-10 border-b border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-mono text-emerald-400 mb-3">
              Previous Work (Demo) · Scripting, Animation &amp; UI Showcase
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance">
              {subPageTitle}
            </h1>
            <p className="mt-4 text-base text-zinc-400 leading-relaxed">
              Explore live recorded Roblox Studio demonstrations and polished interface designs crafted by{' '}
              <strong className="text-white">balo_xio</strong> across Scripting, Animation, and UI Design.
            </p>
          </div>
        </div>

        {/* Render Visible Demo Sections */}
        <div>
          {visibleDemos.map((demo) => (
            <DemoShowcaseCard
              key={demo.id}
              demo={demo}
              onBookCommission={onBookCommissionFromDemo}
              onOpenLightbox={(d) => setLightboxDemo(d)}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal for Image Demos */}
      {lightboxDemo && lightboxDemo.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightboxDemo.title} Fullscreen Preview`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
          onClick={() => setLightboxDemo(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-zinc-950 border border-white/15 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold text-white">{lightboxDemo.title}</h3>
                <p className="text-xs font-mono text-zinc-400">
                  {lightboxDemo.categoryLabel} · Created by {lightboxDemo.author} · {lightboxDemo.craftTag}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxDemo(null)}
                aria-label="Close fullscreen preview"
                className="p-2 text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-[#050706]">
              <img
                src={lightboxDemo.imageUrl}
                alt={lightboxDemo.title}
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
