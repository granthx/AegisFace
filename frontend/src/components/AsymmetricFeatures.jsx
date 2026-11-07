import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Scan, 
  Activity, 
  Sliders, 
  Maximize2, 
  FileCheck2, 
  Radio, 
  Eye 
} from 'lucide-react';
import { playTactileClick, playGrungeChord } from '../utils/audioSynth';

export function AsymmetricFeatures({ soundEnabled, onOpenSubmit }) {
  const [paddingMargin, setPaddingMargin] = useState(30);

  const handleInteractiveClick = () => {
    if (soundEnabled) playTactileClick();
  };

  return (
    <section id="architecture" className="py-16 md:py-24 relative border-b border-[var(--faded-black)]/20">
      
      {/* Background distressed grain */}
      <div className="absolute inset-0 grunge-overlay opacity-20 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Section Header with Asymmetric Stamp & Underline */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[var(--faded-black)] pb-6 font-mono">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-badge text-xs text-[var(--dirty-yellow)] border-[var(--dirty-yellow)] bg-[var(--dirty-yellow)]/10">
                ARCHITECTURE PIPELINE
              </span>
              <span className="text-xs text-[var(--concrete-grey)]">
                [DEEPFAKE FORENSICS // EFFICIENTNET-B0 SPEC]
              </span>
            </div>
            <h2 className="text-h1 uppercase text-[var(--text-primary)]">
              BUILT ON TENSOR RIGOR, <br />
              NOT BLACK-BOX HEURISTICS.
            </h2>
          </div>

          <p className="text-body-md text-sm text-[var(--concrete-grey)] md:max-w-md">
            Neural face synthesis leaves structural traces: Poisson boundary blending mismatches,
            transposed convolution frequency anomalies, and micro-expression discontinuities.
          </p>
        </div>

        {/* Asymmetric Grid (No 3 equal columns!)
            Row 1: 7-col vs 5-col
            Row 2: 4-col vs 8-col
            Row 3: 7-col vs 5-col
        */}
        <div className="space-y-8 font-mono">
          
          {/* Row 1: 7 Cols (30% Margin Crop) + 5 Cols (Video-Level Split) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Card 1 (Span 7): 30% Facial Boundary Padding */}
            <div className="md:col-span-7 grunge-card p-6 relative border-2 border-[var(--faded-black)] flex flex-col justify-between">
              {/* Duct tape top right */}
              <div className="duct-tape duct-tape-silver w-28 -top-3 -right-2 rotate-[4deg]" />

              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-[var(--concrete-grey)]/40">
                  <div className="flex items-center gap-2">
                    <Scan size={18} className="text-[var(--tertiary)]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      PHASE 2 // BOUNDARY PADDING (30% MARGIN)
                    </span>
                  </div>
                  <span className="text-[10px] bg-[var(--dirty-yellow)] text-[var(--faded-black)] px-2 py-0.5 font-bold">
                    CRITICAL SEAM CAPTURE
                  </span>
                </div>

                <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">
                  Facial Boundary Seam Extraction
                </h3>

                <p className="text-sm text-[var(--text-primary)]/80 mb-6 leading-relaxed">
                  Standard Haar face crops tightly clip the inner facial region, completely missing the
                  Poisson blending boundary where face-swappers splice synthetic masks onto original neck and hair contours.
                  Our pipeline enforces a mandatory <strong>30% bounding-box expansion margin</strong>.
                </p>

                {/* Interactive margin adjustment slider */}
                <div className="p-4 bg-[var(--faded-black)]/5 rounded-md border border-[var(--concrete-grey)]/30 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">BOUNDING BOX PADDING MARGIN:</span>
                    <span className="text-[var(--tertiary)] font-bold">+{paddingMargin}% [ACTIVE]</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={paddingMargin}
                    onChange={(e) => {
                      setPaddingMargin(Number(e.target.value));
                      if (soundEnabled) playTactileClick();
                    }}
                    className="w-full accent-[var(--accent-color)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--concrete-grey)]">
                    <span>0% (CLIPPED: MISSES BOUNDARY ARTIFACTS)</span>
                    <span>+30% OPTIMAL FORENSIC MARGIN</span>
                  </div>
                </div>

                {/* Visual Diagram Box */}
                <div className="p-4 border-2 border-[var(--faded-black)] bg-[var(--off-white)] text-[var(--faded-black)]">
                  <div className="flex justify-between items-center text-xs pb-1 border-b border-[var(--faded-black)] mb-2">
                    <span className="font-bold text-[var(--tertiary)]">[PIPELINE CROP SIMULATION]</span>
                    <span className="text-[10px] text-[var(--concrete-grey)]">CROP RESOLUTION: 224x224 TENSOR</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>INNER HAAR DETECT:</span>
                      <span className="text-zinc-600">[x: 48, y: 32, w: 120, h: 140]</span>
                    </div>
                    <div className="flex justify-between font-bold text-[var(--tertiary)]">
                      <span>EXPANDED BOUNDARY (+{paddingMargin}%):</span>
                      <span>[x: {Math.max(0, 48 - paddingMargin)}, y: {Math.max(0, 32 - paddingMargin)}, w: {120 + paddingMargin * 2}, h: {140 + paddingMargin * 2}]</span>
                    </div>
                    <div className="text-[11px] text-[var(--concrete-grey)] pt-1 italic">
                      {paddingMargin >= 25 
                        ? "✓ Optimal: Jawline boundary & hair blending seam fully captured within receptive field." 
                        : "⚠ Warning: Low margin. Outer Poisson blending boundary is partially clipped out."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--concrete-grey)]/30 flex items-center justify-between text-xs">
                <span className="text-[var(--concrete-grey)]">MULTI-BACKEND: HAAR / MTCNN / MEDIAPIPE</span>
                <span className="font-bold text-[var(--tertiary)]">ZERO SEAM LOSS</span>
              </div>
            </div>

            {/* Card 2 (Span 5): Video-Level Split (Zero Leakage) */}
            <div className="md:col-span-5 grunge-card p-6 relative border-2 border-[var(--faded-black)] bg-[var(--card-bg)] flex flex-col justify-between rotate-[-1deg] hover:rotate-0 transition-transform">
              {/* Duct tape top left */}
              <div className="duct-tape duct-tape-yellow w-28 -top-3 -left-3 rotate-[-6deg]" />

              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-[var(--concrete-grey)]/40">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-[var(--surface)]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      PHASE 3 // VIDEO-LEVEL SPLIT
                    </span>
                  </div>
                  <span className="stamp-badge text-[10px] text-[var(--surface)] border-[var(--surface)]">
                    ZERO LEAKAGE
                  </span>
                </div>

                <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                  Strict Video-Level Partitioning
                </h3>

                <p className="text-sm text-[var(--text-primary)]/80 mb-4 leading-relaxed">
                  In naive video classifiers, adjacent frames from the same video land in both training
                  and validation sets. The model simply memorizes facial identities rather than forgery artifacts.
                  Our pipeline strictly enforces splits at the <strong>video file boundary</strong>.
                </p>

                {/* Leakage comparison box */}
                <div className="p-3 border border-[var(--faded-black)] bg-[var(--off-white)] text-[var(--faded-black)] space-y-2 text-xs">
                  <div className="p-2 border border-dashed border-red-800 bg-red-50 text-red-950">
                    <div className="font-bold text-[10px] text-red-800 uppercase">✕ NAIVE FRAME-LEVEL SPLIT:</div>
                    <div className="text-[10px]">Frame 01 in Train, Frame 02 in Val ➔ False 99% accuracy via face memorization.</div>
                  </div>
                  <div className="p-2 border border-[var(--surface)] bg-emerald-50 text-emerald-950">
                    <div className="font-bold text-[10px] text-emerald-800 uppercase">✓ OUR STRICT VIDEO SPLIT:</div>
                    <div className="text-[10px]">Video_001 (all frames) ➔ Train. Video_002 (all frames) ➔ Val. Zero identity contamination.</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--concrete-grey)]/30 flex items-center justify-between text-xs">
                <span className="text-[var(--concrete-grey)]">EVALUATED: 20,000 HELD-OUT FRAMES</span>
                <span className="font-bold text-[var(--accent-color)]">GENERALIZES</span>
              </div>
            </div>

          </div>

          {/* Row 2: 4 Cols (Label Smoothing Loss) + 8 Cols (Grad-CAM Spatial Explainability) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Card 3 (Span 4): Label Smoothing (0.05 BCE) */}
            <div className="md:col-span-4 grunge-card p-6 relative border-2 border-[var(--faded-black)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-[var(--concrete-grey)]/40">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-[var(--tertiary)]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      PHASE 5 // LOSS REGULARIZATION
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                  0.05 Label Smoothing BCE
                </h3>

                <p className="text-sm text-[var(--text-primary)]/80 mb-4 leading-relaxed">
                  Deep neural networks tend to become dangerously overconfident on borderline synthetic artifacts.
                  Applying 0.05 label smoothing prevents logit saturation and hardens the model against social media compression noise.
                </p>

                {/* Mathematical Formula Box */}
                <div className="p-3 bg-[var(--faded-black)] text-[var(--off-white)] border border-[var(--dirty-yellow)] text-center my-3">
                  <div className="text-sm font-bold text-[var(--dirty-yellow)] mb-1">
                    y_smooth = y * (1 - ε) + 0.5 * ε
                  </div>
                  <div className="text-[10px] text-[var(--concrete-grey)] uppercase">
                    REGULARIZATION FACTOR: ε = 0.05
                  </div>
                </div>

                <ul className="text-xs space-y-2 pt-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--tertiary)] rounded-full" />
                    <span>Prevents gradient vanishing in backprop</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--dirty-yellow)] rounded-full" />
                    <span>Tolerant to JPEG recompression</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full" />
                    <span>Calibrates probabilities towards truth</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--concrete-grey)]/30 text-xs text-[var(--concrete-grey)]">
                OPTIMIZER: ADAMW (LR = 3e-4, COSINE SCHEDULE)
              </div>
            </div>

            {/* Card 4 (Span 8): Grad-CAM Explainability & Feature Hooking */}
            <div className="md:col-span-8 grunge-card p-6 relative border-2 border-[var(--faded-black)] bg-[var(--card-bg)] flex flex-col justify-between">
              {/* Duct tape top center */}
              <div className="duct-tape duct-tape-red w-36 -top-3 left-1/3 rotate-[-2deg]" />

              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-[var(--concrete-grey)]/40">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-[var(--accent-color)]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      PHASE 7 // GRAD-CAM EXPLAINABILITY
                    </span>
                  </div>
                  <span className="stamp-badge text-[10px] text-[var(--olive-drab)] border-[var(--olive-drab)]">
                    FEATURES[-1] HOOK
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">
                      Visual Activation Heatmaps
                    </h3>
                    <p className="text-sm text-[var(--text-primary)]/80 mb-4 leading-relaxed">
                      Deep learning forensics cannot be a black box. Our Grad-CAM implementation hooks
                      into the gradients of EfficientNet-B0's final convolutional layer (`features[-1]`).
                      It generates heatmaps verifying the model looks at actual synthesis artifacts:
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-[var(--faded-black)]/5 border border-[var(--concrete-grey)]/30">
                        <span>EYE SPECULAR ANOMALIES:</span>
                        <span className="font-bold text-[var(--tertiary)]">CORNEAL REFLECTION CLUES</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[var(--faded-black)]/5 border border-[var(--concrete-grey)]/30">
                        <span>JAWLINE SEAM BLENDING:</span>
                        <span className="font-bold text-[var(--dirty-yellow)]">BOUNDARY DISCONTINUITY</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-[var(--faded-black)]/5 border border-[var(--concrete-grey)]/30">
                        <span>TEETH & ORAL TEXTURE:</span>
                        <span className="font-bold text-[var(--surface)]">GAN INTERPOLATION SMEAR</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Grad-CAM Gradient Hook Visualizer */}
                  <div className="p-4 border-2 border-[var(--faded-black)] bg-[var(--faded-black)] text-[var(--off-white)] rounded">
                    <div className="flex justify-between items-center text-[10px] text-[var(--dirty-yellow)] pb-2 border-b border-zinc-700">
                      <span>GRADIENT ACTIVATION SPECTRUM</span>
                      <span className="font-bold text-emerald-400">HOOK ACTIVE</span>
                    </div>

                    <div className="space-y-3 py-3">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>ORBITAL RECEPTIVE FIELD</span>
                          <span className="text-[var(--dirty-yellow)]">ALPHA = 0.88</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-800 rounded-sm overflow-hidden flex">
                          <div className="w-[30%] bg-blue-600" />
                          <div className="w-[45%] bg-yellow-500" />
                          <div className="w-[25%] bg-red-600" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>MANDIBLE BOUNDARY SEAM</span>
                          <span className="text-[var(--dirty-yellow)]">ALPHA = 0.94</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-800 rounded-sm overflow-hidden flex">
                          <div className="w-[15%] bg-blue-600" />
                          <div className="w-[35%] bg-yellow-500" />
                          <div className="w-[50%] bg-red-600" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span>BACKGROUND NOISE (INVARIANT)</span>
                          <span className="text-[var(--dirty-yellow)]">ALPHA = 0.04</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-800 rounded-sm overflow-hidden flex">
                          <div className="w-[96%] bg-zinc-700" />
                          <div className="w-[4%] bg-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px]">
                      <span>HOOK: register_forward_hook()</span>
                      <span className="text-[var(--dirty-yellow)]">TARGET: features[-1]</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--concrete-grey)]/30 flex items-center justify-between">
                <span className="text-xs text-[var(--concrete-grey)]">PROVEN EXPLAINABLE INFERENCE</span>
                <a
                  href="#inspector"
                  onClick={handleInteractiveClick}
                  className="btn-grunge-secondary text-xs py-1.5 px-3"
                >
                  TEST IN LIVE LAB
                </a>
              </div>
            </div>

          </div>

          {/* Row 3: 7 Cols (16-Frame Aggregation) + 5 Cols (BiLSTM Temporal & FFT) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            
            {/* Card 5 (Span 7): Video-Level 16-Frame Temporal Aggregation */}
            <div className="md:col-span-7 grunge-card p-6 relative border-2 border-[var(--faded-black)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-[var(--concrete-grey)]/40">
                  <div className="flex items-center gap-2">
                    <Radio size={18} className="text-[var(--olive-drab)]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      PHASE 9 // VIDEO-LEVEL AGGREGATION
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--concrete-grey)]">
                    N_FRAMES = 16
                  </span>
                </div>

                <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">
                  Uniform 16-Frame Video Aggregation
                </h3>

                <p className="text-sm text-[var(--text-primary)]/80 mb-4 leading-relaxed">
                  Single-frame detection on videos produces false alarms due to transient camera motion blur
                  or rapid occlusion. Our pipeline samples 16 uniformly spaced frames across the video timeline,
                  extracts per-frame fake probabilities, and computes the aggregate video score:
                </p>

                {/* Aggregator Formula & Mini Grid */}
                <div className="p-3 border border-[var(--faded-black)] bg-[var(--off-white)] text-[var(--faded-black)] text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>AGGREGATION STRATEGY:</span>
                    <span className="text-[var(--tertiary)]">Score_video = (1/16) * Σ P(Fake_i)</span>
                  </div>
                  {/* 16 Frame Bars */}
                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 pt-1">
                    {[0.99, 0.98, 0.99, 0.97, 0.98, 0.99, 0.99, 0.98, 0.99, 0.97, 0.99, 0.98, 0.99, 0.99, 0.98, 0.99].map((val, idx) => (
                      <div key={idx} className="text-center">
                        <div className="h-8 bg-[var(--tertiary)] rounded-t-sm" style={{ opacity: val }} />
                        <div className="text-[8px] text-[var(--concrete-grey)] mt-0.5">F{idx+1}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-[var(--concrete-grey)] flex justify-between pt-1">
                    <span>UNIFORM TEMPORAL SAMPLING</span>
                    <span className="font-bold text-[var(--tertiary)]">MEAN SCORE: 98.6% [SYNTHETIC]</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--concrete-grey)]/30 flex items-center justify-between text-xs">
                <span className="text-[var(--concrete-grey)]">SAMPLING STRATEGY: UNIFORM TIMESTEP</span>
                <span className="font-bold text-[var(--tertiary)]">ELIMINATES FLICKER</span>
              </div>
            </div>

            {/* Card 6 (Span 5): Frequency-Domain FFT & BiLSTM Extension */}
            <div className="md:col-span-5 grunge-card p-6 relative border-2 border-[var(--faded-black)] bg-[var(--card-bg)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed border-[var(--concrete-grey)]/40">
                  <div className="flex items-center gap-2">
                    <Cpu size={18} className="text-[var(--tertiary)]" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      PHASE 8 // TEMPORAL & FREQUENCY EXTENSION
                    </span>
                  </div>
                  <span className="stamp-badge text-[10px] text-[var(--dirty-yellow)] border-[var(--dirty-yellow)]">
                    PHASE 8+
                  </span>
                </div>

                <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                  FFT & BiLSTM Temporal Sequence
                </h3>

                <p className="text-sm text-[var(--text-primary)]/80 mb-4 leading-relaxed">
                  For complex video manipulations, our modular architecture integrates frequency-domain
                  Fast Fourier Transforms (capturing checkerboard transposed convolution artifacts) and a
                  BiLSTM temporal head over frame embeddings.
                </p>

                <div className="p-3 border border-dashed border-[var(--faded-black)] bg-[var(--off-white)] text-[var(--faded-black)] text-xs space-y-1">
                  <div className="font-bold text-[var(--tertiary)]">[TEMPORAL CUES DETECTED]:</div>
                  <div>• Unnatural blink frequency anomalies</div>
                  <div>• Micro-expression discontinuity across cuts</div>
                  <div>• High-frequency transposed conv grid artifacts</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--concrete-grey)]/30 flex items-center justify-between">
                <span className="text-xs text-[var(--concrete-grey)]">MODULAR ARCHITECTURE</span>
                <button
                  onClick={() => {
                    handleInteractiveClick();
                    onOpenSubmit();
                  }}
                  className="btn-grunge-primary text-xs py-1.5 px-3"
                >
                  RUN PIPELINE
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
