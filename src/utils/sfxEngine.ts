import { SFX_AUDIO_CONFIG } from './portfolioLogic';

let audioCtx: AudioContext | null = null;
const rawArrayBuffers: Partial<Record<'click' | 'page-change', ArrayBuffer>> = {};
const decodedBuffers: Partial<Record<'click' | 'page-change', AudioBuffer>> = {};
let sfxTotalPlayCount = 0;

function getOrCreateAudioContextOnGesture(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

async function fetchRawAudioBytes(kind: 'click' | 'page-change'): Promise<ArrayBuffer | null> {
  if (rawArrayBuffers[kind]) return rawArrayBuffers[kind]!;
  try {
    const profile = SFX_AUDIO_CONFIG[kind];
    const res = await fetch(profile.localTrimmedUrl);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    rawArrayBuffers[kind] = arrayBuf;
    return arrayBuf;
  } catch {
    return null;
  }
}

export function initSfxPreload(): void {
  if (typeof window === 'undefined') return;
  fetchRawAudioBytes('click').catch(() => {});
  fetchRawAudioBytes('page-change').catch(() => {});
}

function recordSfxTelemetry(kind: 'click' | 'page-change'): void {
  if (typeof document === 'undefined') return;
  sfxTotalPlayCount += 1;
  document.body.dataset.lastSfx = kind;
  document.body.dataset.sfxCount = String(sfxTotalPlayCount);
  document.body.dataset.lastSfxSource = SFX_AUDIO_CONFIG[kind].youtubeUrl;
  document.body.dataset.lastSfxTrimWindow = `${SFX_AUDIO_CONFIG[kind].activeStartSec}s-${SFX_AUDIO_CONFIG[kind].activeEndSec}s`;
}

function playFallbackHtmlAudio(kind: 'click' | 'page-change', volume: number): void {
  try {
    const profile = SFX_AUDIO_CONFIG[kind];
    const audio = new Audio(profile.localTrimmedUrl);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Ignore autoplay restriction errors
  }
}

async function playTrimmedKind(kind: 'click' | 'page-change', volume: number): Promise<void> {
  const ctx = getOrCreateAudioContextOnGesture();
  if (!ctx) {
    playFallbackHtmlAudio(kind, volume);
    return;
  }

  try {
    let buffer = decodedBuffers[kind];
    if (!buffer) {
      const raw = await fetchRawAudioBytes(kind);
      if (raw) {
        buffer = await ctx.decodeAudioData(raw.slice(0));
        decodedBuffers[kind] = buffer;
      }
    }

    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0, 0, SFX_AUDIO_CONFIG[kind].trimmedDurationSec);
      return;
    }
  } catch {
    // Fallback to HTMLAudioElement
  }

  playFallbackHtmlAudio(kind, volume);
}

/**
 * Plays the trimmed Click Sound Effect (https://youtu.be/nUsHboYC5zc)
 * with all leading (0.00s–0.85s) and trailing (0.922s–6.00s) silence cut out.
 */
export function playGlobalClickSfx(): void {
  recordSfxTelemetry('click');
  playTrimmedKind('click', 0.65).catch(() => {});
}

/**
 * Plays the trimmed Page Change SFX (https://youtu.be/y8BpZl32S-Q)
 * with all leading (0.00s–0.45s) and trailing (1.10s–5.00s) silence cut out.
 */
export function playPageChangeSfx(): void {
  recordSfxTelemetry('page-change');
  playTrimmedKind('page-change', 0.75).catch(() => {});
}
