import React, { useState } from 'react';
import { 
  FileText, 
  Terminal, 
  AlertCircle, 
  Check, 
  Copy, 
  Cpu, 
  FolderArchive, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

export function ComponentShowcase({ soundEnabled }) {
  const [suspectPath, setSuspectPath] = useState('');
  const [pathError, setPathError] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [copiedCli, setCopiedCli] = useState(null);

  const handleTestInput = (e) => {
    const val = e.target.value;
    setSuspectPath(val);
    if (!val) {
      setPathError('File path cannot be blank for tensor inference');
    } else if (!val.match(/\.(mp4|avi|mov|jpg|jpeg|png)$/i)) {
      setPathError('Invalid media format: must be video (.mp4, .avi, .mov) or image (.jpg, .png)');
    } else {
      setPathError('');
    }
  };

  const copyCliCommand = (cmd, id) => {
    if (soundEnabled) playTactileClick();
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedCli(id);
      setTimeout(() => setCopiedCli(null), 2000);
    });
  };

  const cliSnippets = [
    {
      id: 'predict',
      label: 'PREDICT WITH GRAD-CAM HEATMAPS',
      cmd: 'python deepfake_full_pipeline.py predict --input suspect.mp4 --gradcam --weights weights/deepfake_effnetb0_best.pt'
    },
    {
      id: 'evaluate',
      label: 'RUN BENCHMARK EVALUATION (20K SAMPLES)',
      cmd: 'python deepfake_full_pipeline.py evaluate --data data --weights weights/deepfake_effnetb0_best.pt'
    },
    {
      id: 'demo',
      label: 'LAUNCH LOCAL GRADIO WEB INTERFACE',
      cmd: 'python deepfake_full_pipeline.py demo --weights weights/deepfake_effnetb0_best.pt'
    }
  ];

  return (
    <section id="cli" className="py-16 md:py-24 relative border-b border-[var(--faded-black)]/20 font-mono">
      
      {/* Background grain */}
      <div className="absolute inset-0 grunge-overlay opacity-20 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-10 border-b-2 border-[var(--faded-black)] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="stamp-badge text-xs text-[var(--surface)] border-[var(--surface)]">
                CLI & REPRODUCTION
              </span>
              <span className="text-xs text-[var(--concrete-grey)]">
                [PYTORCH INFERENCE SPECIFICATIONS & UI TOKENS]
              </span>
            </div>
            <h2 className="text-h1 uppercase text-[var(--text-primary)]">
              PIPELINE CLI & SYSTEM AUDIT
            </h2>
          </div>
          <p className="text-sm text-[var(--concrete-grey)] max-w-sm">
            Execute inference commands directly from your terminal and verify UI component tokens.
          </p>
        </div>

        {/* 2-Column Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (6 cols): CLI Commands & Strict Input Verification */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* CLI Snippets */}
            <div className="grunge-card p-6 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--concrete-grey)]/40 pb-2">
                <span className="font-bold text-xs uppercase flex items-center gap-2">
                  <Terminal size={14} className="text-[var(--tertiary)]" />
                  REPRODUCTION COMMAND LINE INTERFACE
                </span>
                <span className="text-[10px] text-[var(--concrete-grey)]">
                  PHASE 12 ARGPARSE WIRING
                </span>
              </div>

              <div className="space-y-3">
                {cliSnippets.map((snippet) => (
                  <div key={snippet.id} className="p-3 bg-[var(--faded-black)] text-[var(--off-white)] rounded border border-zinc-700 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-[var(--dirty-yellow)]">
                      <span>{snippet.label}</span>
                      <button
                        onClick={() => copyCliCommand(snippet.cmd, snippet.id)}
                        className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCli === snippet.id ? (
                          <>
                            <Check size={11} className="text-green-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                    <code className="text-xs text-zinc-200 block break-all font-mono">
                      {snippet.cmd}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Strict Form Input Verification */}
            <div className="grunge-card p-6 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--concrete-grey)]/40 pb-2">
                <span className="font-bold text-xs uppercase">
                  FILE PATH VERIFICATION (INPUT SPEC)
                </span>
                <span className="text-[10px] text-[var(--concrete-grey)]">
                  NO FLOATING LABELS • 2PX FOCUS RING
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[var(--text-primary)]">
                  SUSPECT FILE PATH ON DISK:
                </label>
                
                <input
                  type="text"
                  placeholder="e.g. raw_videos/suspect_01.mp4"
                  value={suspectPath}
                  onChange={handleTestInput}
                  className={`grunge-input text-xs ${pathError ? 'input-error' : ''}`}
                />

                {/* Semantic Red Error Text */}
                {pathError && (
                  <p className="text-xs text-[var(--muted-red)] flex items-center gap-1.5 pt-1">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{pathError}</span>
                  </p>
                )}

                {!pathError && suspectPath && (
                  <p className="text-xs text-emerald-700 pt-1">
                    File format accepted: video sequence ready for 16-frame uniform extraction.
                  </p>
                )}
              </div>

              <div className="text-[10px] text-[var(--concrete-grey)]">
                Type an invalid path (e.g. "document.pdf") to trigger the semantic red error text below.
              </div>
            </div>

          </div>

          {/* Right Column (6 cols): Shimmer Skeletons & Empty State Patterns */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Shimmer Skeleton (Strict: No circular spinners!) */}
            <div className="grunge-card p-6 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--concrete-grey)]/40 pb-2">
                <span className="font-bold text-xs uppercase">
                  TENSOR SHIMMER SKELETON (NO CIRCULAR SPINNERS)
                </span>
                <button
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  className="btn-grunge-secondary text-[10px] py-1 px-2 cursor-pointer"
                >
                  {showSkeleton ? 'SHOW LOADED CHECKPOINT' : 'TRIGGER SHIMMER'}
                </button>
              </div>

              <p className="text-xs text-[var(--text-primary)]/80">
                Linear shimmer animation matching exact component dimensions. Circular spinners strictly forbidden.
              </p>

              {showSkeleton ? (
                <div className="space-y-3 p-4 border border-dashed border-[var(--concrete-grey)]/40 rounded">
                  <div className="h-6 w-3/4 skeleton-shimmer rounded" />
                  <div className="h-4 w-full skeleton-shimmer rounded" />
                  <div className="h-4 w-5/6 skeleton-shimmer rounded" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-9 w-28 skeleton-shimmer rounded" />
                    <div className="h-9 w-28 skeleton-shimmer rounded" />
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-[var(--concrete-grey)]/30 rounded bg-[var(--off-white)] text-[var(--faded-black)] text-xs space-y-2">
                  <div className="font-bold text-sm uppercase">CHECKPOINT WEIGHTS LOADED</div>
                  <p className="text-[11px] leading-relaxed">
                    Model: EfficientNet-B0 backbone (16,339,489 bytes) loaded into CUDA device memory.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <span className="stamp-badge text-[9px] text-[var(--surface)] border-[var(--surface)]">
                      CUDA ACCELERATED
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Empty State Pattern */}
            <div className="grunge-card p-6 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--concrete-grey)]/40 pb-2">
                <span className="font-bold text-xs uppercase">
                  EMPTY STATE FORENSIC PATTERN
                </span>
                <button
                  onClick={() => setShowEmptyState(!showEmptyState)}
                  className="btn-grunge-secondary text-[10px] py-1 px-2 cursor-pointer"
                >
                  {showEmptyState ? 'RESET STATE' : 'PREVIEW EMPTY STATE'}
                </button>
              </div>

              {showEmptyState ? (
                <div className="p-8 text-center border-2 border-dashed border-[var(--concrete-grey)]/50 rounded-lg bg-[var(--faded-black)]/5 flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--concrete-grey)] flex items-center justify-center text-[var(--tertiary)] mb-1">
                    <FolderArchive size={26} />
                  </div>
                  <h4 className="text-base font-bold uppercase tracking-tight text-[var(--text-primary)]">
                    NO SUSPECT MEDIA LOGGED
                  </h4>
                  <p className="text-xs text-[var(--concrete-grey)] max-w-xs leading-relaxed">
                    No active batch frames queued in memory. Select a test video or supply an inference file path.
                  </p>
                  <button
                    onClick={() => {
                      if (soundEnabled) playTactileClick();
                      setShowEmptyState(false);
                    }}
                    className="btn-grunge-primary text-xs mt-2"
                  >
                    LOAD BATCH SAMPLES
                  </button>
                </div>
              ) : (
                <div className="p-4 border border-[var(--concrete-grey)]/30 rounded text-xs text-[var(--concrete-grey)] space-y-2">
                  <p>
                    Click "Preview Empty State" to see the icon-based composition with descriptive copy and tactile CTA.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
