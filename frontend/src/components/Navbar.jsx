import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, Menu, X, ShieldAlert, FileText, Upload } from 'lucide-react';
import { playTactileClick } from '../utils/audioSynth';

export function Navbar({
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  activeSection,
  setActiveSection,
  onOpenReport,
  onOpenSubmit
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'hero', label: 'OVERVIEW' },
    { id: 'architecture', label: 'ARCHITECTURE' },
    { id: 'inspector', label: 'GRAD-CAM LAB' },
    { id: 'video-scrubber', label: '16-FRAME SCRUBBER' },
    { id: 'evaluation', label: 'CONFUSION MATRIX' },
    { id: 'cli', label: 'CLI & PIPELINE' },
  ];

  const handleNavClick = (id) => {
    if (soundEnabled) playTactileClick();
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    if (soundEnabled) playTactileClick();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleSound = () => {
    if (!soundEnabled) playTactileClick();
    setSoundEnabled(!soundEnabled);
  };

  return (
    <header className="sticky top-0 w-full z-[100] border-b border-[var(--faded-black)]/20 bg-[var(--bg-primary)]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('hero');
            }}
            className="group flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 bg-[var(--faded-black)] text-[var(--off-white)] flex items-center justify-center font-bold text-xs border border-[var(--dirty-yellow)] rotate-[-2deg] group-hover:rotate-0 transition-transform">
              AFF
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block uppercase text-[var(--text-primary)]">
                AEGISFACE // FORENSICS
              </span>
              <span className="text-[10px] tracking-widest uppercase block text-[var(--concrete-grey)]">
                EfficientNet-B0 • Grad-CAM Neural Forensics
              </span>
            </div>
          </a>
          <span className="hidden sm:inline-block stamp-badge text-[10px] text-[var(--tertiary)] ml-2">
            AUC 1.0000
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative text-xs tracking-wider uppercase transition-colors duration-200 py-1 cursor-pointer font-mono ${
                  link.id === 'upload-detector'
                    ? 'text-[var(--tertiary)] font-bold'
                    : isActive
                      ? 'text-[var(--accent-color)] font-bold'
                      : 'text-[var(--text-primary)]/80 hover:text-[var(--text-primary)] font-medium'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-color)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-3">
          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            title={soundEnabled ? "Mute Forensic Clicks & Tape Hiss" : "Enable Sound FX"}
            className="p-2 rounded-md border border-[var(--concrete-grey)]/40 hover:bg-[var(--faded-black)]/10 text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={16} className="text-[var(--dirty-yellow)]" /> : <VolumeX size={16} />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark / Light Grunge Palette"
            title="Switch Dark / Light"
            className="p-2 rounded-md border border-[var(--concrete-grey)]/40 hover:bg-[var(--faded-black)]/10 text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-[var(--dirty-yellow)]" />}
          </button>

          {/* Read Project Report Modal Button */}
          <button
            onClick={() => {
              if (soundEnabled) playTactileClick();
              onOpenReport();
            }}
            className="hidden md:inline-flex btn-grunge-secondary text-xs py-2 px-3 items-center gap-1.5 font-mono"
          >
            <FileText size={14} />
            <span>REPORT.MD</span>
          </button>

          {/* Upload Button */}
          <a
            href="#hero"
            onClick={() => {
              if (soundEnabled) playTactileClick();
              handleNavClick('hero');
            }}
            className="btn-grunge-primary text-xs py-2 px-3.5 tracking-wider uppercase font-mono flex items-center gap-1.5"
          >
            <Upload size={14} />
            <span>UPLOAD MEDIA</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[var(--text-primary)] border border-[var(--concrete-grey)]/50 rounded-md"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--faded-black)]/30 bg-[var(--card-bg)] px-6 py-4 space-y-3 font-mono">
          <div className="text-[10px] uppercase tracking-widest text-[var(--concrete-grey)] pb-1 border-b border-dashed border-[var(--concrete-grey)]/40">
            Pipeline Navigation // System Modules
          </div>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left py-2 px-2 text-xs tracking-wide uppercase rounded ${
                activeSection === link.id
                  ? 'bg-[var(--accent-color)] text-[var(--off-white)] font-bold'
                  : 'text-[var(--text-primary)] hover:bg-[var(--faded-black)]/5'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReport();
              }}
              className="flex-1 btn-grunge-secondary text-xs py-2 text-center"
            >
              Project Report
            </button>
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 btn-grunge-primary text-xs py-2 text-center flex items-center justify-center gap-1"
            >
              <Upload size={12} />
              <span>Upload Media</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
