import React from 'react';
import { ShieldCheck, Cpu, Terminal, FileText, ArrowUp, BarChart3, Scan } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

export function Footer({ soundEnabled, onOpenReport, onOpenSubmit }) {
  const scrollToTop = () => {
    if (soundEnabled) playTactileClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t-2 border-[var(--faded-black)] bg-[var(--faded-black)] text-[var(--off-white)] pt-16 pb-12 font-mono">
      
      {/* Background grain */}
      <div className="absolute inset-0 grunge-overlay opacity-30 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Top Colophon / Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-700">
          
          {/* Brand & Dedication (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[var(--dirty-yellow)] text-[var(--faded-black)] flex items-center justify-center font-bold text-sm rotate-[-2deg]">
                AFF
              </div>
              <span className="font-bold text-lg uppercase tracking-wider text-[var(--off-white)]">
                AEGISFACE // FORENSICS
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              AegisFace Forensics — End-to-end PyTorch deepfake detection pipeline featuring a fine-tuned EfficientNet-B0 backbone,
              30% facial boundary margin extraction, and Grad-CAM spatial explainability.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="stamp-badge text-[10px] text-[var(--dirty-yellow)] border-[var(--dirty-yellow)]">
                VAL AUC: 1.0000
              </span>
              <span className="stamp-badge text-[10px] text-[var(--surface)] border-[var(--surface)]">
                VAL ACC: 99.94%
              </span>
            </div>
          </div>

          {/* Quick Nav Links (Span 3) */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <span className="block font-bold uppercase text-[var(--dirty-yellow)] border-b border-zinc-700 pb-1">
              FORENSIC MODULES
            </span>
            <ul className="space-y-2 text-zinc-300">
              <li>
                <a href="#hero" className="hover:text-[var(--dirty-yellow)] transition-colors">
                  01. Overview & 20K Benchmark
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-[var(--dirty-yellow)] transition-colors">
                  02. 30% Margin & Architecture
                </a>
              </li>
              <li>
                <a href="#inspector" className="hover:text-[var(--dirty-yellow)] transition-colors">
                  03. Live Grad-CAM Lab
                </a>
              </li>
              <li>
                <a href="#video-scrubber" className="hover:text-[var(--dirty-yellow)] transition-colors">
                  04. 16-Frame Video Scrubber
                </a>
              </li>
              <li>
                <a href="#evaluation" className="hover:text-[var(--dirty-yellow)] transition-colors">
                  05. Confusion Matrix (20K Samples)
                </a>
              </li>
              <li>
                <a href="#cli" className="hover:text-[var(--dirty-yellow)] transition-colors">
                  06. PyTorch CLI & Reproduction
                </a>
              </li>
            </ul>
          </div>

          {/* Model Artifacts & Checkpoints (Span 4) */}
          <div className="md:col-span-4 space-y-4 text-xs">
            <span className="block font-bold uppercase text-[var(--dirty-yellow)] border-b border-zinc-700 pb-1">
              SYSTEM ARTIFACTS
            </span>

            <div className="space-y-1 text-zinc-400 text-[11px]">
              <div>WEIGHTS: weights/deepfake_effnetb0_best.pt (16.3 MB)</div>
              <div>PIPELINE: deepfake_full_pipeline.py (983 Lines)</div>
              <div>DATASET: Kaggle 140k Real & Fake Faces Benchmark</div>
              <div>PLOT: confusion_matrix.png (32.8 KB)</div>
            </div>

            {/* SVG Barcode */}
            <div className="pt-2">
              <svg className="h-9 w-40 text-[var(--off-white)]" viewBox="0 0 100 30" fill="currentColor">
                <rect x="0" y="0" width="3" height="30" />
                <rect x="5" y="0" width="1" height="30" />
                <rect x="8" y="0" width="4" height="30" />
                <rect x="14" y="0" width="2" height="30" />
                <rect x="18" y="0" width="5" height="30" />
                <rect x="25" y="0" width="1" height="30" />
                <rect x="28" y="0" width="3" height="30" />
                <rect x="34" y="0" width="6" height="30" />
                <rect x="42" y="0" width="2" height="30" />
                <rect x="46" y="0" width="3" height="30" />
                <rect x="52" y="0" width="1" height="30" />
                <rect x="55" y="0" width="4" height="30" />
                <rect x="62" y="0" width="2" height="30" />
                <rect x="66" y="0" width="5" height="30" />
                <rect x="73" y="0" width="2" height="30" />
                <rect x="77" y="0" width="4" height="30" />
                <rect x="83" y="0" width="1" height="30" />
                <rect x="86" y="0" width="3" height="30" />
                <rect x="91" y="0" width="4" height="30" />
                <rect x="97" y="0" width="3" height="30" />
              </svg>
              <div className="text-[9px] text-zinc-500 tracking-widest mt-1">
                EFFICIENTNET-B0 // ZERO CROSSOVER ERROR
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © 2026 AegisFace Forensics Project. PyTorch • EfficientNet-B0 • Grad-CAM.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-zinc-300 hover:text-[var(--dirty-yellow)] transition-colors cursor-pointer"
          >
            <span>BACK TO TOP</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>
    </footer>
  );
}
