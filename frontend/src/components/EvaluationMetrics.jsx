import React, { useState } from 'react';
import { 
  Check, 
  Activity, 
  BarChart3, 
  Cpu, 
  FileCheck2, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Maximize2 
} from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

export function EvaluationMetrics({ soundEnabled, onOpenReport }) {
  const [activeMetricTab, setActiveMetricTab] = useState('confusion'); // 'confusion' | 'table'

  const metrics = [
    { label: "VALIDATION AUC", value: "1.0000", note: "Zero crossover rank error" },
    { label: "VALIDATION ACCURACY", value: "99.94%", note: "19,988 / 20,000 correct" },
    { label: "PRECISION (FAKE)", value: "1.00", note: "9,996 True Positives / 8 FP" },
    { label: "RECALL (FAKE)", value: "1.00", note: "Only 4 False Negatives in 20k" },
    { label: "MACRO F1-SCORE", value: "1.00", note: "Harmonic balance across classes" },
  ];

  return (
    <section id="evaluation" className="py-16 md:py-24 relative border-b border-[var(--faded-black)]/20 font-mono">
      
      {/* Background grain */}
      <div className="absolute inset-0 grunge-overlay opacity-25 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 border-b-2 border-[var(--faded-black)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-badge text-xs text-[var(--dirty-yellow)] border-[var(--dirty-yellow)]">
                BENCHMARK EVALUATION
              </span>
              <span className="text-xs text-[var(--concrete-grey)]">
                [20,000 HELD-OUT VALIDATION SAMPLES]
              </span>
            </div>
            <h2 className="text-h1 uppercase text-[var(--text-primary)]">
              EXPERIMENTAL RESULTS & CONFUSION MATRIX
            </h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-[var(--faded-black)]/10 rounded-md border border-[var(--concrete-grey)]/40 text-xs">
            <button
              onClick={() => {
                if (soundEnabled) playTactileClick();
                setActiveMetricTab('confusion');
              }}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeMetricTab === 'confusion'
                  ? 'bg-[var(--accent-color)] text-[var(--off-white)] font-bold shadow'
                  : 'text-[var(--text-primary)] hover:bg-[var(--faded-black)]/5'
              }`}
            >
              CONFUSION MATRIX
            </button>
            <button
              onClick={() => {
                if (soundEnabled) playTactileClick();
                setActiveMetricTab('table');
              }}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeMetricTab === 'table'
                  ? 'bg-[var(--accent-color)] text-[var(--off-white)] font-bold shadow'
                  : 'text-[var(--text-primary)] hover:bg-[var(--faded-black)]/5'
              }`}
            >
              BENCHMARK METRICS
            </button>
          </div>
        </div>

        {/* Asymmetric Evaluation Grid (7 Cols Matrix / Plot + 5 Cols Hardware & Hyperparameters) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column (7 cols): Confusion Matrix / Visual Heatmap */}
          <div className="lg:col-span-7 grunge-card p-6 md:p-8 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] shadow-xl relative flex flex-col justify-between">
            {/* Duct tape top right */}
            <div className="duct-tape duct-tape-yellow w-36 -top-3 -right-2 rotate-[4deg]" />

            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-dashed border-[var(--concrete-grey)]/40">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-[var(--tertiary)]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    EVALUATION ON 20,000 SAMPLES (10K REAL / 10K FAKE)
                  </span>
                </div>
                <span className="stamp-badge text-[10px] text-[var(--surface)] border-[var(--surface)]">
                  99.94% ACCURACY
                </span>
              </div>

              {activeMetricTab === 'confusion' ? (
                /* Confusion Matrix Display */
                <div className="space-y-4">
                  
                  {/* Actual Confusion Matrix Image if available, with interactive numbers overlay */}
                  <div className="p-4 border-2 border-[var(--faded-black)] bg-[var(--off-white)] text-[var(--faded-black)] rounded">
                    
                    <div className="flex justify-between items-center mb-3 border-b border-[var(--faded-black)] pb-2 text-xs">
                      <span className="font-bold uppercase text-[var(--tertiary)]">
                        CONFUSION MATRIX HEATMAP [N = 20,000]
                      </span>
                      <span className="text-[10px] text-[var(--concrete-grey)]">
                        FILE: confusion_matrix.png
                      </span>
                    </div>

                    {/* Interactive 2x2 Matrix Grid */}
                    <div className="grid grid-cols-2 gap-3 my-4">
                      
                      {/* True Negatives (Authentic Real -> Real) */}
                      <div className="p-4 border-2 border-[var(--surface)] bg-emerald-50 text-emerald-950 rounded">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase">TRUE NEGATIVE (AUTHENTIC REAL)</div>
                        <div className="text-3xl font-black my-1 text-emerald-900">9,992</div>
                        <div className="text-[10px] text-emerald-700">99.92% of authentic faces correctly classified.</div>
                      </div>

                      {/* False Positives (Authentic Real -> Fake) */}
                      <div className="p-4 border-2 border-amber-500 bg-amber-50 text-amber-950 rounded">
                        <div className="text-[10px] font-bold text-amber-800 uppercase">FALSE POSITIVE (REAL MISIDENTIFIED)</div>
                        <div className="text-3xl font-black my-1 text-amber-900">8</div>
                        <div className="text-[10px] text-amber-700">Only 0.08% false alarm rate (due to extreme motion blur).</div>
                      </div>

                      {/* False Negatives (Deepfake -> Real) */}
                      <div className="p-4 border-2 border-red-400 bg-red-50 text-red-950 rounded">
                        <div className="text-[10px] font-bold text-red-800 uppercase">FALSE NEGATIVE (MISSED SYNTHETIC)</div>
                        <div className="text-3xl font-black my-1 text-red-900">4</div>
                        <div className="text-[10px] text-red-700">Only 4 synthetic faces escaped detection (0.04%).</div>
                      </div>

                      {/* True Positives (Deepfake -> Fake) */}
                      <div className="p-4 border-2 border-[var(--tertiary)] bg-red-100 text-red-950 rounded">
                        <div className="text-[10px] font-bold text-red-900 uppercase">TRUE POSITIVE (DEEPFAKE CAUGHT)</div>
                        <div className="text-3xl font-black my-1 text-red-900">9,996</div>
                        <div className="text-[10px] text-red-800">99.96% of synthetic deepfakes correctly intercepted.</div>
                      </div>

                    </div>

                    <div className="text-[11px] text-[var(--concrete-grey)] pt-2 border-t border-[var(--faded-black)] flex justify-between">
                      <span>TOTAL CORRECT: 19,988 / 20,000</span>
                      <span className="font-bold text-[var(--text-primary)]">AUC SCORE: 1.0000</span>
                    </div>

                  </div>

                </div>
              ) : (
                /* Benchmark Metrics Table */
                <div className="space-y-3">
                  <div className="p-4 border border-[var(--faded-black)] bg-[var(--off-white)] text-[var(--faded-black)] space-y-3">
                    {metrics.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-dashed border-[var(--concrete-grey)]/40 text-xs">
                        <div>
                          <span className="font-bold block">{m.label}</span>
                          <span className="text-[10px] text-[var(--concrete-grey)]">{m.note}</span>
                        </div>
                        <div className="text-xl font-black text-[var(--tertiary)]">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="pt-4 border-t border-[var(--concrete-grey)]/30 flex items-center justify-between text-xs">
              <span className="text-[var(--concrete-grey)]">EVALUATION SCRIPT: deepfake_full_pipeline.py evaluate</span>
              <button
                onClick={() => {
                  if (soundEnabled) playTactileClick();
                  onOpenReport();
                }}
                className="btn-grunge-secondary text-xs py-1.5 px-3 cursor-pointer"
              >
                FULL REPORT DETAILS
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Hardware, Hyperparameters & Training Specs */}
          <div className="lg:col-span-5 grunge-card p-6 border-2 border-[var(--faded-black)] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase text-[var(--concrete-grey)]">
                  TRAINING CONFIGURATION
                </span>
                <span className="text-[10px] border border-[var(--concrete-grey)] px-2 py-0.5">
                  5 EPOCHS
                </span>
              </div>

              <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                NVIDIA RTX Pro 6000 Pipeline
              </h3>

              <p className="text-xs text-[var(--text-primary)]/80 mb-6 leading-relaxed">
                Trained with AdamW optimizer, cosine learning rate annealing, and data augmentation
                simulating social media JPEG compression and Gaussian blur.
              </p>

              {/* Hardware & Config Checklist */}
              <div className="space-y-3 text-xs mb-6">
                <div className="p-2.5 bg-[var(--faded-black)]/5 rounded border border-[var(--concrete-grey)]/30 flex justify-between">
                  <span className="text-[var(--concrete-grey)]">TRAINING DATASET:</span>
                  <span className="font-bold">100,000 FACES</span>
                </div>
                <div className="p-2.5 bg-[var(--faded-black)]/5 rounded border border-[var(--concrete-grey)]/30 flex justify-between">
                  <span className="text-[var(--concrete-grey)]">VALIDATION DATASET:</span>
                  <span className="font-bold">20,000 FACES</span>
                </div>
                <div className="p-2.5 bg-[var(--faded-black)]/5 rounded border border-[var(--concrete-grey)]/30 flex justify-between">
                  <span className="text-[var(--concrete-grey)]">OPTIMIZER & LR:</span>
                  <span className="font-bold">AdamW (lr = 3e-4)</span>
                </div>
                <div className="p-2.5 bg-[var(--faded-black)]/5 rounded border border-[var(--concrete-grey)]/30 flex justify-between">
                  <span className="text-[var(--concrete-grey)]">WEIGHT DECAY:</span>
                  <span className="font-bold">1e-4</span>
                </div>
                <div className="p-2.5 bg-[var(--faded-black)]/5 rounded border border-[var(--concrete-grey)]/30 flex justify-between">
                  <span className="text-[var(--concrete-grey)]">BATCH SIZE:</span>
                  <span className="font-bold">64 (FP32 / Tensors)</span>
                </div>
                <div className="p-2.5 bg-[var(--faded-black)]/5 rounded border border-[var(--concrete-grey)]/30 flex justify-between">
                  <span className="text-[var(--concrete-grey)]">LR SCHEDULE:</span>
                  <span className="font-bold">Cosine Annealing</span>
                </div>
              </div>
            </div>

            <div className="p-3 border border-dashed border-[var(--concrete-grey)]/40 rounded text-xs space-y-1">
              <div className="font-bold text-[var(--tertiary)] uppercase text-[10px]">CHECKPOINT LOCATION:</div>
              <div className="text-[11px] text-[var(--text-primary)]">weights/deepfake_effnetb0_best.pt (16.3 MB)</div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

