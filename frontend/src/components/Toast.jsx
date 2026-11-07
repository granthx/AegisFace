import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

export function Toast({ message, onClose, soundEnabled }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[500] max-w-sm w-full animate-bounce-once">
      <div className="grunge-card p-4 border-2 border-[var(--faded-black)] bg-[var(--off-white)] text-[var(--faded-black)] shadow-2xl relative font-mono text-xs">
        
        {/* Duct tape mini strip */}
        <div className="duct-tape duct-tape-yellow w-20 -top-2.5 right-4 rotate-[-3deg]" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="stamp-badge text-[9px] text-[var(--tertiary)] border-[var(--tertiary)] block mb-1">
                DISPATCH VERIFIED
              </span>
              <p className="text-xs font-semibold leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) playTactileClick();
              onClose();
            }}
            className="p-1 text-[var(--concrete-grey)] hover:text-[var(--faded-black)] cursor-pointer"
            aria-label="Close Toast"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-dashed border-[var(--concrete-grey)]/40 text-[9px] text-[var(--concrete-grey)] flex justify-between">
          <span>STATUS: TRANSMITTED</span>
          <span>47.6062° N, 122.3321° W</span>
        </div>

      </div>
    </div>
  );
}

