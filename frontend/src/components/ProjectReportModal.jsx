import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

export function ProjectReportModal({ isOpen, onClose, soundEnabled }) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (soundEnabled) playTactileClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[var(--faded-black)]/75 backdrop-blur-sm font-mono">
      
      {/* Modal Card z-index: 300 */}
      <div className="relative z-[300] w-full max-w-3xl max-h-[85dvh] overflow-y-auto grunge-card p-6 sm:p-8 border-2 border-[var(--faded-black)] bg-[var(--card-bg)] shadow-2xl">
        
        {/* Duct tape decoration */}
        <div className="duct-tape duct-tape-yellow w-36 -top-3 -right-2 rotate-[4deg]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-[var(--faded-black)] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="stamp-badge text-[10px] text-[var(--tertiary)] border-[var(--tertiary)]">
                RESEARCH DOSSIER
              </span>
              <span className="text-xs text-[var(--concrete-grey)]">
                [PROJECT_REPORT.MD]
              </span>
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight text-[var(--text-primary)]">
              AEGISFACE FORENSICS: EFFICIENTNET-B0 & GRAD-CAM
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

        {/* Report Content */}
        <div className="space-y-6 text-xs sm:text-sm text-[var(--text-primary)]/90 leading-relaxed">
          
          {/* Abstract */}
          <div>
            <h4 className="text-base font-bold uppercase text-[var(--tertiary)] border-b border-[var(--concrete-grey)]/40 pb-1 mb-2">
              1. Abstract
            </h4>
            <p className="bg-[var(--faded-black)]/5 p-3 rounded border-l-4 border-[var(--tertiary)]">
              The proliferation of deep learning-based image synthesis and generative models (GANs, Diffusion models, and neural face-swappers) poses serious threats to identity integrity, digital forensics, and media security. This project implements an end-to-end deepfake detection pipeline featuring a fine-tuned <strong>EfficientNet-B0</strong> backbone with low-rank adaptation support, robust facial artifact extraction, and visual explainability via <strong>Grad-CAM</strong>. Evaluated across 20,000 held-out face images from the <em>140k Real and Fake Faces</em> dataset, the model achieved <strong>99.94% validation accuracy</strong>, an <strong>AUC of 1.0000</strong>, and <strong>1.00 precision and recall</strong> on synthetic detection.
            </p>
          </div>

          {/* Related Work */}
          <div>
            <h4 className="text-base font-bold uppercase text-[var(--tertiary)] border-b border-[var(--concrete-grey)]/40 pb-1 mb-2">
              2. Related Work
            </h4>
            <ul className="space-y-2 list-disc list-inside text-xs">
              <li><strong>Frame-Level Artifact Detectors (MesoNet, Xception, EfficientNet)</strong>: Focus on low-level blending seams, eye specular mismatch, and pixel-level interpolation anomalies.</li>
              <li><strong>Frequency-Domain Analysis (FFT / DCT)</strong>: Synthesized faces display checkerboard frequency artifacts due to transposed convolution upsampling.</li>
              <li><strong>Temporal & Sequence Modeling</strong>: Exploit temporal inconsistencies across video sequences using recurrent (BiLSTM) or 3D convolutional architectures.</li>
            </ul>
          </div>

          {/* Methodology */}
          <div>
            <h4 className="text-base font-bold uppercase text-[var(--tertiary)] border-b border-[var(--concrete-grey)]/40 pb-1 mb-2">
              3. Methodology & Architecture
            </h4>
            <div className="p-3 bg-[var(--off-white)] text-[var(--faded-black)] border border-[var(--faded-black)] space-y-2 text-xs">
              <div><strong>1. Face Detection & Crop:</strong> Multi-backend detection with a mandatory <strong>30% bounding-box margin</strong> to capture outer boundary blending artifacts.</div>
              <div><strong>2. Video-Level Split:</strong> Splits enforced strictly at the video level (rather than frame-level) to eliminate data leakage.</div>
              <div><strong>3. Data Augmentation:</strong> JPEG compression simulation, Gaussian blur, ColorJitter, and spatial perturbations.</div>
              <div><strong>4. Backbone:</strong> Pre-trained EfficientNet-B0 trunk (ImageNet-1K) with a single-logit classification head.</div>
              <div><strong>5. Loss Regularization:</strong> Binary Cross-Entropy with <strong>0.05 Label Smoothing</strong> to mitigate overconfidence on borderline synthetic artifacts.</div>
              <div><strong>6. Visual Explainability (Grad-CAM):</strong> Gradient activations from final convolutional block (`features[-1]`) overlaid as thermal heatmaps onto face crops.</div>
            </div>
          </div>

          {/* Quantitative Performance */}
          <div>
            <h4 className="text-base font-bold uppercase text-[var(--tertiary)] border-b border-[var(--concrete-grey)]/40 pb-1 mb-2">
              4. Experimental Results (20,000 Validation Samples)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 border border-[var(--concrete-grey)]/40 bg-[var(--faded-black)]/5">
                <span className="text-[10px] text-[var(--concrete-grey)] block">VALIDATION AUC</span>
                <span className="font-bold text-base text-[var(--tertiary)]">1.0000</span>
              </div>
              <div className="p-2 border border-[var(--concrete-grey)]/40 bg-[var(--faded-black)]/5">
                <span className="text-[10px] text-[var(--concrete-grey)] block">VAL ACCURACY</span>
                <span className="font-bold text-base text-[var(--surface)]">99.94%</span>
              </div>
              <div className="p-2 border border-[var(--concrete-grey)]/40 bg-[var(--faded-black)]/5">
                <span className="text-[10px] text-[var(--concrete-grey)] block">PRECISION (FAKE)</span>
                <span className="font-bold text-base">1.00</span>
              </div>
              <div className="p-2 border border-[var(--concrete-grey)]/40 bg-[var(--faded-black)]/5">
                <span className="text-[10px] text-[var(--concrete-grey)] block">RECALL (FAKE)</span>
                <span className="font-bold text-base">1.00</span>
              </div>
            </div>

            <div className="mt-3 p-3 border border-dashed border-[var(--concrete-grey)]/40 text-xs space-y-1">
              <div className="font-bold uppercase text-[var(--tertiary)]">CONFUSION MATRIX EVALUATION:</div>
              <div>• True Negatives (Authentic recognized as Real): <strong>9,992</strong></div>
              <div>• False Positives (Authentic misclassified as Fake): <strong>8</strong></div>
              <div>• True Positives (Deepfakes recognized as Fake): <strong>9,996</strong></div>
              <div>• False Negatives (Deepfakes missed): <strong>4</strong></div>
            </div>
          </div>

          {/* Limitations */}
          <div>
            <h4 className="text-base font-bold uppercase text-[var(--tertiary)] border-b border-[var(--concrete-grey)]/40 pb-1 mb-2">
              5. Limitations & Future Directions
            </h4>
            <p className="text-xs text-[var(--text-primary)]/80">
              Cross-dataset testing on out-of-distribution generators (Celeb-DF v2, DFDC) is recommended to prevent overfitting to StyleGAN distributions. For long videos, our BiLSTM temporal head over frame embeddings captures blink rate anomalies.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t-2 border-[var(--faded-black)] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[var(--concrete-grey)]">
            EFFICIENTNET-B0 // WEIGHTS: weights/deepfake_effnetb0_best.pt
          </span>
          <button
            onClick={handleClose}
            className="btn-grunge-primary text-xs py-2 px-4"
          >
            CLOSE REPORT
          </button>
        </div>

      </div>

    </div>
  );
}

