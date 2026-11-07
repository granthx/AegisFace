import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AsymmetricFeatures } from './components/AsymmetricFeatures';
import { DeepfakeInspectorLab } from './components/DeepfakeInspectorLab';
import { VideoAggregatorScrubber } from './components/VideoAggregatorScrubber';
import { EvaluationMetrics } from './components/EvaluationMetrics';
import { ComponentShowcase } from './components/ComponentShowcase';
import { Footer } from './components/Footer';
import { ProjectReportModal } from './components/ProjectReportModal';
import { SuspectSubmissionModal } from './components/SuspectSubmissionModal';
import { Toast } from './components/Toast';

export function App() {
  const [theme, setTheme] = useState('light');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Media state: 'image' or 'video'
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedResult, setUploadedResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedHeatmap, setUploadedHeatmap] = useState(null);

  // Video frames state (when mediaType === 'video')
  const [videoFrames, setVideoFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Studio active mode: 'picture' or 'video'
  const [labActivePreset, setLabActivePreset] = useState('picture');

  // Video Frame Navigation Handlers
  const handleNextFrame = () => {
    if (!videoFrames || videoFrames.length === 0) return;
    const nextIdx = (currentFrameIndex + 1) % videoFrames.length;
    setCurrentFrameIndex(nextIdx);
    setUploadedImage(videoFrames[nextIdx].image);
    setUploadedHeatmap(videoFrames[nextIdx].heatmap || null);
  };

  const handlePrevFrame = () => {
    if (!videoFrames || videoFrames.length === 0) return;
    const prevIdx = (currentFrameIndex - 1 + videoFrames.length) % videoFrames.length;
    setCurrentFrameIndex(prevIdx);
    setUploadedImage(videoFrames[prevIdx].image);
    setUploadedHeatmap(videoFrames[prevIdx].heatmap || null);
  };

  const handleJumpFrame = (steps = 2) => {
    if (!videoFrames || videoFrames.length === 0) return;
    const targetIdx = (currentFrameIndex + steps) % videoFrames.length;
    setCurrentFrameIndex(targetIdx);
    setUploadedImage(videoFrames[targetIdx].image);
    setUploadedHeatmap(videoFrames[targetIdx].heatmap || null);
  };

  // Scroll Spy to keep Nav Link in active state
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'architecture', 'inspector', 'video-scrubber', 'evaluation', 'cli'];
      const scrollY = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-[var(--dirty-yellow)] selection:text-[var(--faded-black)] font-mono">
      
      {/* Sticky Navigation (z-index: 100) */}
      <Navbar
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Asymmetric Hero with Evidence Card & Media Upload (Video & Picture) */}
        <Hero
          soundEnabled={soundEnabled}
          onOpenSubmit={() => setIsSubmitOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          mediaType={mediaType}
          setMediaType={setMediaType}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          uploadedResult={uploadedResult}
          setUploadedResult={setUploadedResult}
          uploadedFileName={uploadedFileName}
          setUploadedFileName={setUploadedFileName}
          uploadedHeatmap={uploadedHeatmap}
          setUploadedHeatmap={setUploadedHeatmap}
          videoFrames={videoFrames}
          setVideoFrames={setVideoFrames}
          currentFrameIndex={currentFrameIndex}
          setCurrentFrameIndex={setCurrentFrameIndex}
          onNextFrame={handleNextFrame}
          onPrevFrame={handlePrevFrame}
          onJumpFrame={handleJumpFrame}
          setLabActivePreset={setLabActivePreset}
        />

        {/* Asymmetric Deepfake Forensic Architecture Grid */}
        <AsymmetricFeatures
          soundEnabled={soundEnabled}
          onOpenSubmit={() => setIsSubmitOpen(true)}
        />

        {/* Live Interactive Grad-CAM Inspection Studio */}
        <DeepfakeInspectorLab
          soundEnabled={soundEnabled}
          mediaType={mediaType}
          setMediaType={setMediaType}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          uploadedResult={uploadedResult}
          setUploadedResult={setUploadedResult}
          uploadedFileName={uploadedFileName}
          setUploadedFileName={setUploadedFileName}
          uploadedHeatmap={uploadedHeatmap}
          setUploadedHeatmap={setUploadedHeatmap}
          videoFrames={videoFrames}
          setVideoFrames={setVideoFrames}
          currentFrameIndex={currentFrameIndex}
          setCurrentFrameIndex={setCurrentFrameIndex}
          onNextFrame={handleNextFrame}
          onPrevFrame={handlePrevFrame}
          onJumpFrame={handleJumpFrame}
          activePreset={labActivePreset}
          setActivePreset={setLabActivePreset}
        />

        {/* 16-Frame Video Temporal Aggregator & Sequence Scrubber */}
        <VideoAggregatorScrubber
          soundEnabled={soundEnabled}
        />

        {/* Experimental Results & 20,000 Sample Confusion Matrix */}
        <EvaluationMetrics
          soundEnabled={soundEnabled}
          onOpenReport={() => setIsReportOpen(true)}
        />

        {/* PyTorch CLI, Checkpoint Loader & UI Component System Audit */}
        <ComponentShowcase
          soundEnabled={soundEnabled}
        />

      </main>

      {/* Deepfake Forensic Colophon Footer */}
      <Footer
        soundEnabled={soundEnabled}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />

      {/* Full PROJECT_REPORT.md Research Paper Modal (z-index: 300) */}
      <ProjectReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        soundEnabled={soundEnabled}
      />

      {/* Suspect Media Submission Modal (z-index: 300) */}
      <SuspectSubmissionModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSuccess={(msg) => setToastMessage(msg)}
        soundEnabled={soundEnabled}
      />

      {/* Tactile Forensic Notification Toast (z-index: 500) */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage('')}
        soundEnabled={soundEnabled}
      />

    </div>
  );
}

export default App;
