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
      className="relative min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-hidden border-b border-white/10"
    >
      <div className="absolute inset-0 z-0 bg-[#09090B]">
        <video
          ref={videoRef}
          src="/assets/aistudio/1022_bd4c00dc.mp4#t=2"
          autoPlay
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center hero-video-grade scale-[1.01] opacity-75"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 selective-video-blur bg-[#09090B]/55 pointer-events-none"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#09090B]/95 via-[#09090B]/80 to-transparent pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-[#09090B]/70 pointer-events-none"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-12 pt-16 pb-12 lg:pt-24 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end flex-1">
        <div className="lg:col-span-8 space-y-7 self-center">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-400 border-l-2 border-[#DFC08A] pl-3.5">
            <span className="text-[#DFC08A] font-semibold">Index 00 / Dossier</span>
            <span aria-hidden="true" className="text-zinc-600">—</span>
            <span>Roblox Systems &amp; Technical Art</span>
            <span aria-hidden="true" className="text-zinc-600">—</span>
            <span className="text-zinc-200">16+ Years Old</span>
            <span aria-hidden="true" className="text-zinc-600">—</span>
            <span className="text-[#DFC08A]">40% Upfront Terms</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.02]">
              balo_xio
              <span className="block mt-2 text-2xl sm:text-4xl lg:text-5xl font-semibold pro-gradient-text tracking-tight">
                Full-Stack Roblox Systems &amp;{' '}
                <em className="font-serif-editorial italic font-normal text-[#EAD3A7]">
                  Technical Craft.
                </em>
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 tracking-wider uppercase">
              Luau Architecture <span className="text-[#DFC08A] mx-2">/</span> Scale UI Engineering{' '}
              <span className="text-[#DFC08A] mx-2">/</span> Hard-Surface 3D{' '}
              <span className="text-[#DFC08A] mx-2">/</span> R6 &amp; R15 Combat Motion
            </p>
          </div>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-normal">
            Independent technical developer combining{' '}
            <strong className="text-white font-semibold">3+ years of Luau scripting</strong>,{' '}
            <strong className="text-white font-semibold">2+ years of UI design</strong>,{' '}
            <strong className="text-white font-semibold">2+ years of 3D modeling</strong>, and{' '}
            <strong className="text-white font-semibold">1+ year of animation</strong> into a
            cohesive production pipeline. I am{' '}
            <strong className="text-white font-semibold">16+ years old</strong> and available for
            single commissions, short-term sprints, and long-term studio contracts—strictly with a{' '}
            <strong className="text-[#DFC08A] font-semibold">40% upfront deposit</strong> and zero
            revenue share.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {onOpenPreviousWork && (
              <button
                type="button"
                onClick={onOpenPreviousWork}
                className="inline-flex items-center gap-3 px-6 py-3.5 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold studio-btn-gradient rounded-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Previous Work (Demo)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
            <a
              href="#estimator"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-mono uppercase tracking-wider font-medium text-zinc-200 hover:text-white border border-white/20 hover:border-[#DFC08A] bg-[#0C0C0E]/80 hover:bg-white/[0.04] rounded-sm transition-all whitespace-nowrap shrink-0"
            >
              Open Specification Ledger
            </a>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-start lg:justify-end items-end">
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={isMuted ? 'Unmute background video sound' : 'Mute background video sound'}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white bg-[#0C0C0E]/90 backdrop-blur-md border border-white/15 hover:border-[#DFC08A] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                <span>Reel Audio // Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#DFC08A]" />
                <span>Reel Audio // Active</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative z-10 bg-[#0B0B0E]/95 backdrop-blur-md border-t border-white/10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-white/10">
          <div className="px-6 lg:px-10 py-6">
            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              01 / Luau Engineering
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums mt-1">
              3+ Years
            </div>
            <div className="text-xs font-mono text-[#DFC08A] mt-1">Scripting Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Combat · Replication · DataStores</div>
          </div>

          <div className="px-6 lg:px-10 py-6">
            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              02 / Interface Systems
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums mt-1">
              2+ Years
            </div>
            <div className="text-xs font-mono text-[#DFC08A] mt-1">UI Design Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Scale Layouts · Springs · HUDs</div>
          </div>

          <div className="px-6 lg:px-10 py-6">
            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              03 / Mesh Topology
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums mt-1">
              2+ Years
            </div>
            <div className="text-xs font-mono text-[#DFC08A] mt-1">3D Modeling Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Blender · Weapons · Environmental</div>
          </div>

          <div className="px-6 lg:px-10 py-6">
            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              04 / Keyframe Motion
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums mt-1">
              1+ Year
            </div>
            <div className="text-xs font-mono text-[#DFC08A] mt-1">Animating Experience</div>
            <div className="text-xs text-zinc-400 mt-0.5">Moon Animator 2 · R6 &amp; R15 Rigs</div>
          </div>
        </div>
      </div>
    </section>
  );
};
