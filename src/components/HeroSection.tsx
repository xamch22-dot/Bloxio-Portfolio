import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, RotateCcw, ArrowUpRight } from 'lucide-react';
import {
  HACKER_SENTENCES,
  SENTENCE_ANIMATION_DURATION_MS,
  VIDEO_LOOP_START_SECONDS,
  scrambleText,
} from '../utils/portfolioLogic';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onOpenPreviousWork?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onOpenPreviousWork,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [sentenceProgress, setSentenceProgress] = useState<number>(0);
  const [cycleRunId, setCycleRunId] = useState<number>(0);

  // Enforce skipping the first 2 seconds (0s - 2s) and looping strictly from 2.0s to end
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforceStartAtTwoSeconds = () => {
      if (video.currentTime < VIDEO_LOOP_START_SECONDS) {
        video.currentTime = VIDEO_LOOP_START_SECONDS;
      }
    };

    const handleTimeUpdate = () => {
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
    };

    const handleEnded = () => {
      video.currentTime = VIDEO_LOOP_START_SECONDS;
      video.play().catch(() => {});
    };

    if (video.readyState >= 1) {
      enforceStartAtTwoSeconds();
    }

    video.addEventListener('loadedmetadata', enforceStartAtTwoSeconds);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', enforceStartAtTwoSeconds);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    let rafId: number;
    let startTime = performance.now();
    let currentIdx = activeSentenceIdx;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      // 1-second (1000ms) animation per sentence:
      // 420ms active hacker character decode + 580ms crisp hold
      const decodeWindowMs = 420;
      const rawProgress = Math.min(1, elapsed / decodeWindowMs);
      setSentenceProgress(rawProgress);

      // Hold the 5th culmination sentence ("I am an All-Rounder.") longer on screen before looping
      const totalStepMs =
        currentIdx === HACKER_SENTENCES.length - 1
          ? SENTENCE_ANIMATION_DURATION_MS + 1200
          : SENTENCE_ANIMATION_DURATION_MS;

      if (elapsed >= totalStepMs) {
        currentIdx = (currentIdx + 1) % HACKER_SENTENCES.length;
        setActiveSentenceIdx(currentIdx);
        setSentenceProgress(0);
        startTime = now;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [cycleRunId]);

  const handleReplaySequence = () => {
    setActiveSentenceIdx(0);
    setSentenceProgress(0);
    setCycleRunId((prev) => prev + 1);
  };

  const toggleAudio = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      if (videoRef.current.currentTime < VIDEO_LOOP_START_SECONDS) {
        videoRef.current.currentTime = VIDEO_LOOP_START_SECONDS;
      }
      videoRef.current.play().catch(() => {});
    }
  };

  const currentSentenceObj = HACKER_SENTENCES[activeSentenceIdx] ?? HACKER_SENTENCES[0];
  const animatedHeadline = scrambleText(currentSentenceObj.sentence, sentenceProgress);

  return (
    <section
      id="overview"
      aria-label="balo_xio Portfolio Hero"
      className="relative min-h-[calc(100vh-61px)] flex flex-col justify-between overflow-hidden border-b border-white/10"
    >
      {/* Full-Bleed Background Video (Cut first 2s, loops from 2.0s to end) with Selective Partial Blur */}
      <div className="absolute inset-0 z-0 bg-[#070908]">
        <video
          ref={videoRef}
          src="/assets/aistudio/1022_bd4c00dc.mp4#t=2"
          autoPlay
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center blur-[1.5px] scale-[1.01] opacity-90"
        />

        {/* Selective Partial Blur: blurs the left side where background code text is so portfolio copy stays ultra-legible, while keeping the Roblox character on the right side clear */}
        <div
          aria-hidden="true"
          className="absolute inset-0 selective-video-blur bg-[#070908]/40 pointer-events-none"
        />

        {/* Measured contrast scrim on the left & bottom */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#070908]/95 via-[#070908]/75 to-transparent pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#070908] via-transparent to-[#070908]/50 pointer-events-none"
        />
      </div>

      {/* Main Hero Content — Clean Editorial Typography Over Video */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-12 pt-16 pb-12 lg:pt-24 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end flex-1">
        {/* Left 8 Columns: Unboxed Identity & Hacker Green Sequence */}
        <div className="lg:col-span-8 space-y-7 self-center">
          {/* Quiet unboxed kicker */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-medium text-zinc-300">
            <span className="text-emerald-400 font-mono">balo_xio portfolio</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>Roblox Developer</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>16+ Years Old</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>40% Upfront Deposit</span>
          </div>

          {/* Primary Display Name */}
          <div>
            <p className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.04]">
              balo_xio
            </p>

            {/* The 5-Sentence Hacker Green Identity Sequence (1s per sentence) */}
            <div className="mt-4 min-h-[3.5rem] sm:min-h-[4.5rem] flex items-center">
              <h1
                aria-live="polite"
                className="font-mono font-bold text-2xl sm:text-4xl lg:text-5xl tracking-tight text-[#22c55e] hacker-text-shadow"
              >
                <span className="text-emerald-500/80 mr-2.5 select-none">&gt;</span>
                <span>{animatedHeadline}</span>
                <span
                  aria-hidden="true"
                  className="inline-block w-3 h-7 sm:h-10 ml-2 align-middle bg-[#22c55e] animate-pulse"
                />
              </h1>
            </div>

            {/* Subtle synchronized role descriptor */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono text-emerald-400/90">
              <span>{currentSentenceObj.yearsLabel}</span>
              <span aria-hidden="true" className="text-zinc-600">—</span>
              <span className="text-zinc-300">{currentSentenceObj.shortSpec}</span>
              <button
                type="button"
                onClick={handleReplaySequence}
                aria-label="Replay 5-sentence hacker text animation"
                className="inline-flex items-center gap-1.5 ml-1 text-xs text-zinc-400 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            </div>
          </div>

          {/* Clean, grammatically polished bio paragraph */}
          <p className="text-base sm:text-lg text-zinc-200 leading-relaxed max-w-2xl font-normal">
            I bring <strong className="text-white font-semibold">3+ years of scripting</strong>,{' '}
            <strong className="text-white font-semibold">2+ years of UI design</strong>,{' '}
            <strong className="text-white font-semibold">2+ years of 3D modeling</strong>, and{' '}
            <strong className="text-white font-semibold">1+ year of animating</strong> into one cohesive
            workflow. I am <strong className="text-white font-semibold">16+ years old</strong> and work on
            short-term tasks, long-term contracts, and single Roblox commissions. I do{' '}
            <strong className="text-white font-semibold">not</strong> work for revenue share—I always
            take a <strong className="text-emerald-400 font-semibold">40% upfront payment</strong>.
          </p>

          {/* Clean Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-zinc-950 bg-emerald-400 rounded-md hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Start a Commission</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            {onOpenPreviousWork && (
              <button
                type="button"
                onClick={onOpenPreviousWork}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-zinc-100 hover:text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/10 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Previous Work (Demo)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
            <a
              href="#estimator"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium text-zinc-200 hover:text-white border border-white/15 hover:border-white/30 bg-white/[0.03] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              View Commission Rates
            </a>
          </div>
        </div>

        {/* Right 4 Columns: Open view of the Roblox character typing + subtle audio button */}
        <div className="lg:col-span-4 flex justify-start lg:justify-end items-end">
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={isMuted ? 'Unmute background video sound' : 'Mute background video sound'}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono text-zinc-300 hover:text-white bg-[#070908]/75 backdrop-blur-md border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                <span>Video Audio: Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Video Audio: On</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Full-Width Architectural Experience Strip Below Hero */}
      <div className="relative z-10 bg-[#070908]/90 backdrop-blur-md border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-7 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
              3+ Years
            </div>
            <div className="text-sm font-medium text-emerald-400 mt-1">Scripting Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Luau · Frameworks · DataStores</div>
          </div>

          <div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
              2+ Years
            </div>
            <div className="text-sm font-medium text-emerald-400 mt-1">UI Design Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Scale Layouts · TweenService · HUDs</div>
          </div>

          <div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
              2+ Years
            </div>
            <div className="text-sm font-medium text-emerald-400 mt-1">3D Modeling Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Blender · Weapons · Low/Mid-Poly</div>
          </div>

          <div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
              1+ Year
            </div>
            <div className="text-sm font-medium text-emerald-400 mt-1">Animating Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Moon Animator 2 · R6 & R15 Rigs</div>
          </div>
        </div>
      </div>
    </section>
  );
};
