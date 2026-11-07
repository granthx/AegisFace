import React, { useState } from 'react';
import { X, Send, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';
import { playTactileClick, playGrungeChord } from '../utils/audioSynth';

export function SuspectSubmissionModal({ isOpen, onClose, onSuccess, soundEnabled }) {
  const [formData, setFormData] = useState({
    fileName: '',
    caseId: '',
    mediaType: 'Video File (16-Frame Uniform Sampling)',
    detectorBackend: 'Haar Cascade (+30% Boundary Margin)',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    if (soundEnabled) playTactileClick();
    onClose();
  };

  const validate = () => {
    const errs = {};
    if (!formData.fileName.trim()) {
      errs.fileName = 'Suspect file name or storage URI is required';
    } else if (!formData.fileName.match(/\.(mp4|avi|mov|jpg|jpeg|png)$/i)) {
      errs.fileName = 'Invalid file extension: must be video (.mp4, .mov, .avi) or image (.jpg, .png)';
    }
    if (!formData.caseId.trim()) {
      errs.caseId = 'Case identifier or forensic tag is required (e.g. CASE-2026-09)';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (soundEnabled) playTactileClick();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    if (soundEnabled) playGrungeChord(1);
    onSuccess(`Suspect media "${formData.fileName}" queued. 16-frame tensor extraction initialized.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[var(--faded-black)]/75 backdrop-blur-sm font-mono">
      
      {/* Modal Card (z-index 300) */}
      <div className="relative z-[300] w-full max-w-lg max-h-[90dvh] overflow-y-auto grunge-card p-6 sm:p-8 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] shadow-2xl">
        
        {/* Duct tape top left */}
        <div className="duct-tape duct-tape-yellow w-36 -top-3 -left-3 rotate-[-5deg]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-[var(--faded-black)] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="stamp-badge text-[10px] text-[var(--tertiary)] border-[var(--tertiary)]">
                INFERENCE DISPATCH
              </span>
              <span className="text-xs text-[var(--concrete-grey)]">
                [PIPELINE QUEUE]
              </span>
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
              QUEUE SUSPECT MEDIA FOR ANALYSIS
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded border border-[var(--concrete-grey)]/40 hover:bg-[var(--faded-black)]/10 text-[var(--text-primary)] cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form complying with strict input specs:
            - Label above input
            - 1px border stroke
            - Focus ring: 2px accent color offset 2px
            - Error text below in semantic red
            - No floating labels
        */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Field 1: File Name / URI */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-[var(--text-primary)]">
              SUSPECT FILE NAME / STORAGE URI:
            </label>
            <input
              type="text"
              placeholder="e.g. raw_videos/suspect_interview.mp4"
              value={formData.fileName}
              onChange={(e) => {
                setFormData({ ...formData, fileName: e.target.value });
                if (errors.fileName) setErrors({ ...errors, fileName: '' });
              }}
              className={`grunge-input text-xs ${errors.fileName ? 'input-error' : ''}`}
            />
            {errors.fileName && (
              <p className="text-xs text-[var(--muted-red)] flex items-center gap-1 pt-0.5">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.fileName}</span>
              </p>
            )}
          </div>

          {/* Field 2: Case Identifier */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-[var(--text-primary)]">
              FORENSIC CASE ID:
            </label>
            <input
              type="text"
              placeholder="e.g. EVIDENCE-2026-DF-04"
              value={formData.caseId}
              onChange={(e) => {
                setFormData({ ...formData, caseId: e.target.value });
                if (errors.caseId) setErrors({ ...errors, caseId: '' });
              }}
              className={`grunge-input text-xs ${errors.caseId ? 'input-error' : ''}`}
            />
            {errors.caseId && (
              <p className="text-xs text-[var(--muted-red)] flex items-center gap-1 pt-0.5">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.caseId}</span>
              </p>
            )}
          </div>

          {/* Field 3: Media Type */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-[var(--text-primary)]">
              ANALYSIS MODALITY:
            </label>
            <select
              value={formData.mediaType}
              onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
              className="grunge-input text-xs"
            >
              <option value="Video File (16-Frame Uniform Sampling)">VIDEO: 16-FRAME UNIFORM TEMPORAL AGGREGATION</option>
              <option value="Single Image Face Crop">IMAGE: 224x224 TENSOR + GRAD-CAM HOOK</option>
              <option value="Batch Directory Scan">DIRECTORY: PARALLEL BATCH INFERENCE</option>
            </select>
          </div>

          {/* Field 4: Face Detector Backend */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-[var(--text-primary)]">
              FACE DETECTION BACKEND (+30% MARGIN):
            </label>
            <select
              value={formData.detectorBackend}
              onChange={(e) => setFormData({ ...formData, detectorBackend: e.target.value })}
              className="grunge-input text-xs"
            >
              <option value="Haar Cascade (+30% Boundary Margin)">HAAR CASCADE + 30% BOUNDARY MARGIN (DEFAULT)</option>
              <option value="MTCNN (facenet-pytorch)">MTCNN MULTI-TASK CONVOLUTIONAL NET</option>
              <option value="MediaPipe Face Mesh">MEDIAPIPE FULL MESH CONTOUR</option>
            </select>
          </div>

          {/* Field 5: Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-[var(--text-primary)]">
              INVESTIGATOR LOG NOTES (OPTIONAL):
            </label>
            <textarea
              rows={3}
              placeholder="Specific synthesis suspicions, e.g. suspect GAN boundary artifact along jawline or compressed TikTok stream..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="grunge-input text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-dashed border-[var(--concrete-grey)]/40 flex justify-between items-center">
            <button
              type="button"
              onClick={handleClose}
              className="btn-grunge-secondary text-xs py-2 px-3 cursor-pointer"
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="btn-grunge-primary text-xs py-2.5 px-6 flex items-center gap-2 cursor-pointer"
            >
              <Send size={14} />
              <span>INITIALIZE INFERENCE</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

