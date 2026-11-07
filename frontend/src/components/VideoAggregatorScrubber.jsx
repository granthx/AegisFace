import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Film, 
  Activity, 
  ChevronRight, 
  ChevronLeft, 
  Sliders, 
  ShieldAlert, 
  ShieldCheck 
} from 'lucide-react';
import { playTactileClick, playGrungeChord } from '../utils/audioSynth';

export function VideoAggregatorScrubber({ soundEnabled }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState('fake_swap');

  const videoPresets = {
    fake_swap: {
      name: "suspect_faceswap_01.mp4",
      type: "DEEPFAKE SYNTHETIC",
      targetIdentity: "Celebrity Face Swap",
      // 16 frame probabilities with slight temporal flicker
      frames: [
        { f: 1, time: "00:00.25", prob: 0.991, status: "Mandible seam detected", marginOk: true },
        { f: 2, time: "00:00.60", prob: 0.985, status: "Specular eye mismatch", marginOk: true },
        { f: 3, time: "00:01.00", prob: 0.978, status: "Poisson boundary mismatch", marginOk: true },
        { f: 4, time: "00:01.35", prob: 0.992, status: "Mouth interpolation smear", marginOk: true },
        { f: 5, time: "00:01.80", prob: 0.965, status: "Slight motion blur", marginOk: true },
        { f: 6, time: "00:02.15", prob: 0.989, status: "Boundary artifact peak", marginOk: true },
        { f: 7, time: "00:02.50", prob: 0.994, status: "Corneal reflection anomaly", marginOk: true },
        { f: 8, time: "00:02.90", prob: 0.982, status: "Jawline seam detected", marginOk: true },
        { f: 9, time: "00:03.25", prob: 0.979, status: "Temporal blink jitter", marginOk: true },
        { f: 10, time: "00:03.60", prob: 0.991, status: "Hair boundary color step", marginOk: true },
        { f: 11, time: "00:04.00", prob: 0.987, status: "Transposed conv grid", marginOk: true },
        { f: 12, time: "00:04.40", prob: 0.962, status: "Micro-expression frozen", marginOk: true },
        { f: 13, time: "00:04.75", prob: 0.993, status: "High confidence boundary", marginOk: true },
        { f: 14, time: "00:05.10", prob: 0.988, status: "Poisson stitch visible", marginOk: true },
        { f: 15, time: "00:05.50", prob: 0.976, status: "Neck tone mismatch", marginOk: true },
        { f: 16, time: "00:05.85", prob: 0.995, status: "Mandible edge verified", marginOk: true },
      ]
    },
    authentic: {
      name: "authentic_interview_02.mp4",
      type: "AUTHENTIC REAL",
      targetIdentity: "Live Broadcast Interview",
      frames: [
        { f: 1, time: "00:00.25", prob: 0.001, status: "Continuous skin grain", marginOk: true },
        { f: 2, time: "00:00.60", prob: 0.002, status: "Congruent lighting", marginOk: true },
        { f: 3, time: "00:01.00", prob: 0.001, status: "Normal corneal reflection", marginOk: true },
        { f: 4, time: "00:01.35", prob: 0.003, status: "Natural facial movement", marginOk: true },
        { f: 5, time: "00:01.80", prob: 0.005, status: "Natural blink sequence", marginOk: true },
        { f: 6, time: "00:02.15", prob: 0.002, status: "Continuous skin texture", marginOk: true },
        { f: 7, time: "00:02.50", prob: 0.001, status: "Seamless jawline transition", marginOk: true },
        { f: 8, time: "00:02.90", prob: 0.002, status: "Natural pore distribution", marginOk: true },
        { f: 9, time: "00:03.25", prob: 0.001, status: "Congruent reflections", marginOk: true },
        { f: 10, time: "00:03.60", prob: 0.003, status: "Realistic shadow gradient", marginOk: true },
        { f: 11, time: "00:04.00", prob: 0.002, status: "Normal micro-expression", marginOk: true },
        { f: 12, time: "00:04.40", prob: 0.001, status: "Seamless boundary", marginOk: true },
        { f: 13, time: "00:04.75", prob: 0.004, status: "Consistent lighting angle", marginOk: true },
        { f: 14, time: "00:05.10", prob: 0.002, status: "Normal skin pores", marginOk: true },
        { f: 15, time: "00:05.50", prob: 0.001, status: "Organic eyelid dynamics", marginOk: true },
        { f: 16, time: "00:05.85", prob: 0.002, status: "Zero splicing traces", marginOk: true },
      ]
    }
  };

  const video = videoPresets[selectedVideo];
  const activeFrame = video.frames[currentFrameIndex];

  // Calculate aggregated mean video score
  const meanVideoScore = (
    video.frames.reduce((acc, cur) => acc + cur.prob, 0) / video.frames.length
  );
  const isVideoDeepfake = meanVideoScore >= 0.50;

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          const next = (prev + 1) % 16;
          if (soundEnabled && next % 4 === 0) playTactileClick();
          return next;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isPlaying, soundEnabled]);

  const togglePlay = () => {
    if (soundEnabled) playTactileClick();
    setIsPlaying(!isPlaying);
  };

  const selectFrame = (index) => {
    if (soundEnabled) playTactileClick();
    setCurrentFrameIndex(index);
  };

  return (
    <section id="video-scrubber" className="py-16 md:py-24 relative border-b border-[var(--faded-black)]/20 font-mono">
      
      {/* Background grain */}
      <div className="absolute inset-0 grunge-overlay opacity-20 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-10 border-b-2 border-[var(--faded-black)] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-badge text-xs text-[var(--tertiary)] border-[var(--tertiary)]">
                VIDEO AGGREGATOR
              </span>
              <span className="text-xs text-[var(--concrete-grey)]">
                [16 UNIFORM FRAMES PER VIDEO // ZERO DATA LEAKAGE]
              </span>
            </div>
            <h2 className="text-h1 uppercase text-[var(--text-primary)]">
              16-FRAME TEMPORAL SCRUBBER
            </h2>
          </div>
          <p className="text-sm text-[var(--concrete-grey)] max-w-sm">
            Scrub across 16 sampled frames. The video score is calculated as the mean fake probability,
            eliminating single-frame false positives.
          </p>
        </div>

        {/* Video Preset Tabs */}
        <div className="mb-6 flex gap-3 text-xs">
          <button
            onClick={() => {
              if (soundEnabled) playTactileClick();
              setSelectedVideo('fake_swap');
              setCurrentFrameIndex(0);
            }}
            className={`px-4 py-2 rounded border cursor-pointer ${
              selectedVideo === 'fake_swap'
                ? 'bg-[var(--accent-color)] text-[var(--off-white)] font-bold'
                : 'bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--concrete-grey)]/40'
            }`}
          >
            SUSPECT VIDEO 01 (DEEPFACE-LAB SWAP)
          </button>

          <button
            onClick={() => {
              if (soundEnabled) playTactileClick();
              setSelectedVideo('authentic');
              setCurrentFrameIndex(0);
            }}
            className={`px-4 py-2 rounded border cursor-pointer ${
              selectedVideo === 'authentic'
                ? 'bg-[var(--accent-color)] text-[var(--off-white)] font-bold'
                : 'bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--concrete-grey)]/40'
            }`}
          >
            AUTHENTIC VIDEO 02 (BROADCAST CROP)
          </button>
        </div>

        {/* Scrubber Console (8 Cols Video Console + 4 Cols Diagnostics) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Scrubber Transport (8 cols) */}
          <div className="lg:col-span-8 grunge-card p-6 md:p-8 border-2 border-[var(--faded-black)] bg-[var(--faded-black)] text-[var(--off-white)] relative shadow-2xl">
            {/* Duct tape */}
            <div className="duct-tape duct-tape-silver w-32 -top-3 left-8 rotate-[-3deg]" />

            {/* Console Header */}
            <div className="flex justify-between items-center border-b border-zinc-700 pb-4 mb-6 text-xs">
              <div>
                <div className="tracking-widest text-[var(--dirty-yellow)] font-bold">
                  TRANSPORT: 16-FRAME TEMPORAL SAMPLER
                </div>
                <div className="text-[10px] text-[var(--concrete-grey)]">
                  INPUT: {video.name} • UNIFORM TIME STEP
                </div>
              </div>

              {/* Aggregated Score Badge */}
              <div className="bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded text-right">
                <span className="text-[9px] text-[var(--concrete-grey)] block">AGGREGATED VIDEO SCORE:</span>
                <span className={`text-base font-bold ${isVideoDeepfake ? 'text-[var(--muted-red)]' : 'text-emerald-400'}`}>
                  {(meanVideoScore * 100).toFixed(2)}% [{isVideoDeepfake ? 'FAKE' : 'REAL'}]
                </span>
              </div>
            </div>

            {/* Frame Viewer Box */}
            <div className="p-4 bg-zinc-900 border-2 border-zinc-700 rounded-lg mb-6">
              
              <div className="flex justify-between items-center text-xs text-zinc-400 pb-2 border-b border-zinc-800 mb-3">
                <span className="font-bold text-[var(--dirty-yellow)]">
                  FRAME #{String(activeFrame.f).padStart(2, '0')} / 16
                </span>
                <span>TIMESTEP: {activeFrame.time}</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                  PADDING: +30% BOUNDARY
                </span>
              </div>

              {/* Graphic Screen */}
              <div className="h-52 bg-zinc-950 rounded border border-zinc-700 relative overflow-hidden flex items-center justify-center">
                
                {/* SVG Frame Rendering */}
                <svg className="w-full h-full object-cover" viewBox="0 0 240 180" fill="none">
                  <rect width="240" height="180" fill="#181818" />
                  
                  {/* Face contour */}
                  <path
                    d="M80 90 C80 40, 160 40, 160 90 C160 140, 140 160, 120 160 C100 160, 80 140, 80 90 Z"
                    fill={selectedVideo === 'fake_swap' ? '#DDD5C7' : '#E9E1D4'}
                  />
                  {/* Hair */}
                  <path d="M70 78 C75 30, 165 30, 170 78 C150 42, 90 42, 70 78 Z" fill="#2E2E2E" />
                  
                  {/* Eyes */}
                  <ellipse cx="102" cy="85" rx="10" ry="6" fill="#2E2E2E" />
                  <ellipse cx="138" cy="85" rx="10" ry="6" fill="#2E2E2E" />
                  <circle cx="102" cy="85" r="3" fill="#FFF" />
                  <circle cx="138" cy="85" r="3" fill="#FFF" />

                  {/* Mouth */}
                  <path d="M106 130 Q120 140 134 130" stroke="#8C2727" strokeWidth="2.5" fill="none" />

                  {/* 30% margin bounding box */}
                  <rect x="58" y="28" width="124" height="138" stroke="#B5A642" strokeWidth="1.2" strokeDasharray="3 3" />
                  <text x="62" y="40" fill="#B5A642" fontSize="7" fontFamily="Courier New">+30% MARGIN</text>

                  {/* Deepfake Seam on Fake frames */}
                  {selectedVideo === 'fake_swap' && (
                    <path d="M82 105 C84 135, 100 156, 120 156 C140 156, 156 135, 158 105" stroke="#8C2727" strokeWidth="1.8" strokeDasharray="4 2" fill="none" />
                  )}
                </svg>

                {/* Corner Overlay Status */}
                <div className="absolute bottom-2 left-2 bg-black/85 text-[var(--off-white)] px-2 py-1 rounded text-[10px] border border-zinc-700">
                  <span>FRAME P(FAKE): </span>
                  <span className={`font-bold ${activeFrame.prob >= 0.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {(activeFrame.prob * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="absolute top-2 right-2 bg-black/85 text-[var(--dirty-yellow)] px-2 py-1 rounded text-[10px] border border-zinc-700">
                  {activeFrame.status}
                </div>
              </div>

            </div>

            {/* 16-Frame Timeline Scrubber Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>TIMELINE SCRUBBER (CLICK FRAME TO INSPECT)</span>
                <span>FRAME #{activeFrame.f} SELECTED</span>
              </div>

              {/* 16 Frame Buttons Strip */}
              <div className="grid grid-cols-16 gap-1">
                {video.frames.map((fr, idx) => {
                  const isCur = currentFrameIndex === idx;
                  const isHighRisk = fr.prob >= 0.5;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectFrame(idx)}
                      className={`h-12 rounded-sm border transition-all cursor-pointer flex flex-col justify-between items-center py-1 ${
                        isCur
                          ? 'border-[var(--dirty-yellow)] bg-zinc-700 ring-2 ring-[var(--dirty-yellow)]'
                          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                      }`}
                    >
                      <span className="text-[8px] text-zinc-400">F{fr.f}</span>
                      <div
                        className={`w-2 h-4 rounded-xs ${isHighRisk ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ height: `${Math.max(4, fr.prob * 18)}px` }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transport Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className={`btn-grunge-primary text-xs px-5 py-2.5 flex items-center gap-2 cursor-pointer ${
                    isPlaying ? 'bg-[var(--tertiary)]' : 'bg-[var(--accent-color)]'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={14} />
                      <span>PAUSE SEQUENCE</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-current" />
                      <span>PLAY SEQUENCE</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) playTactileClick();
                    setIsPlaying(false);
                    setCurrentFrameIndex(0);
                  }}
                  className="btn-grunge-secondary text-white border-zinc-600 hover:bg-zinc-800 text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>REWIND</span>
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) playTactileClick();
                    setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : 15));
                  }}
                  className="p-2 border border-zinc-700 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                  title="Previous Frame"
                >
                  <ChevronLeft size={14} />
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) playTactileClick();
                    setCurrentFrameIndex((prev) => (prev + 1) % 16);
                  }}
                  className="p-2 border border-zinc-700 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                  title="Next Frame"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="text-[11px] text-zinc-400">
                AGGREGATION: <span className="text-[var(--dirty-yellow)] font-bold">UNIFORM MEAN</span>
              </div>
            </div>

          </div>

          {/* Diagnostics Panel (4 cols) */}
          <div className="lg:col-span-4 grunge-card p-6 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] space-y-4">
            
            <div className="flex items-center justify-between border-b border-[var(--concrete-grey)]/40 pb-2">
              <span className="font-bold text-xs uppercase">
                VIDEO AGGREGATION METRICS
              </span>
              <span className="stamp-badge text-[10px] text-[var(--tertiary)] border-[var(--tertiary)]">
                N=16
              </span>
            </div>

            <p className="text-xs text-[var(--concrete-grey)] leading-relaxed">
              Video decisions are never made on a single frame. Averaging over 16 uniform timestamps
              guarantees immunity against motion compression drops.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 border border-[var(--concrete-grey)]/40 rounded bg-[var(--off-white)] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--concrete-grey)]">TOTAL SAMPLES:</span>
                  <span className="font-bold">16 FRAMES</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--concrete-grey)]">PEAK FAKE PROB:</span>
                  <span className="font-bold text-red-700">
                    {(Math.max(...video.frames.map(f => f.prob)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--concrete-grey)]">MIN FAKE PROB:</span>
                  <span className="font-bold">
                    {(Math.min(...video.frames.map(f => f.prob)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dashed border-[var(--concrete-grey)]/40 font-bold">
                  <span>AGGREGATE MEAN:</span>
                  <span className={isVideoDeepfake ? 'text-red-700' : 'text-emerald-700'}>
                    {(meanVideoScore * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[var(--faded-black)]/5 rounded border border-[var(--concrete-grey)]/30 text-[11px] space-y-1">
              <span className="font-bold uppercase text-[var(--tertiary)] block">VERDICT:</span>
              <p>
                {isVideoDeepfake
                  ? "CONFIRMED DEEPFAKE: Consistent facial boundary artifacts sustained across 16 sampled timesteps."
                  : "CONFIRMED AUTHENTIC: Stable biometric temporal continuity across all 16 sampled frames."}
              </p>
            </div>

            <div className="pt-2 text-[10px] text-[var(--concrete-grey)] border-t border-dashed border-[var(--concrete-grey)]/40">
              PYTORCH PIPELINE: deepfake_full_pipeline.py Phase 9
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

