import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { VIDEO_LOOP_START_SECONDS } from '../utils/portfolioLogic';

interface HeroSectionProps {
  onOpenPreviousWork?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenPreviousWork,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

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

  return (
    <section
      id="overview"
      aria-label="balo_xio Portfolio Hero"
      className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-white/10"
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-medium text-zinc-400">
                <span className="text-orange-300 font-semibold">Roblox Systems &amp; Technical Art</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-200">16+ Years Old</span>
                <span aria-hidden="true">·</span>
                <span>Paid Per Task or Project</span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-300">40% Upfront Policy</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-white leading-[1.04] text-balance">
                  balo_xio —
                  <span className="block mt-1 pro-gradient-text">
                    Roblox Luau Scripting &amp; Custom UI Design.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 font-medium">
                  Luau Gameplay &amp; Combat Scripting · Custom Studded &amp; Front-Page Scale UI Design
                </p>
              </div>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
                I am a <strong className="text-white font-semibold">16+ year old</strong> Roblox
                developer specializing in{' '}
                <strong className="text-white font-semibold">3+ years of Luau Scripting</strong> and{' '}
                <strong className="text-white font-semibold">2+ years of UI Design</strong>. Choose{' '}
                <strong className="text-orange-300 font-semibold">Per Task</strong> billing for a
                single isolated task (paid strictly per individual task), or book a Short-Term or
                Long-Term production package—always with a{' '}
                <strong className="text-white font-semibold">40% upfront deposit</strong> and 0%
                revenue share.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {onOpenPreviousWork && (
                <button
                  type="button"
                  onClick={onOpenPreviousWork}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold studio-btn-gradient rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Explore Previous Work (Demo)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
              <a
                href="#estimator"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-zinc-100 hover:text-white border border-white/15 hover:border-orange-400/60 bg-white/[0.03] hover:bg-white/[0.07] rounded-xl transition-all whitespace-nowrap shrink-0"
              >
                Calculate Per-Task Quote
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl overflow-hidden border border-white/15 bg-[#12141D] shadow-2xl">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-4 bg-[#161924]">
              <div className="text-xs font-medium text-zinc-300">
                <span className="text-white font-semibold">Studio Showreel</span>
                <span aria-hidden="true" className="mx-1.5 text-zinc-500">
                  ·
                </span>
                <span className="text-zinc-400">Live Capture</span>
              </div>
              <button
                type="button"
                onClick={toggleAudio}
                aria-label={isMuted ? 'Unmute background video sound' : 'Mute background video sound'}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Sound Off</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-orange-300" />
                    <span className="text-orange-300">Sound On</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative flex-1 min-h-[260px] sm:min-h-[320px] bg-black overflow-hidden">
              <video
                ref={videoRef}
                src="/assets/aistudio/1022_bd4c00dc.mp4#t=2"
                autoPlay
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover object-[74%_center] hero-video-grade"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white">Roblox Production Reel</div>
                  <div className="text-[11px] text-zinc-300">
                    Combat Systems · Luau Frameworks · Custom Scale UI
                  </div>
                </div>
                <span className="text-[11px] font-mono text-orange-300 tabular-nums">
                  Per Task from $10
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-white/10 studio-card-surface flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-zinc-400">01. Luau Engineering</div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums mt-1.5">
                3+ Years
              </div>
              <div className="text-sm font-semibold text-orange-300 mt-1">Scripting Experience</div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>Per Task (1 Task)</span>
              <span className="font-mono font-semibold text-white tabular-nums">$15 / 5,000 R$</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 studio-card-surface flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-zinc-400">02. Interface Systems</div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums mt-1.5">
                2+ Years
              </div>
              <div className="text-sm font-semibold text-orange-300 mt-1">UI Design Experience</div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>Per Task (1 Task)</span>
              <span className="font-mono font-semibold text-white tabular-nums">$10 / 1,500 R$</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
