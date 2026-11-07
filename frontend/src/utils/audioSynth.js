// Web Audio API Synthesizer for 90s Grunge Lo-Fi Cassette & Sound Effects
let audioCtx = null;
let hissNode = null;
let hissGain = null;
let isPlayingRiff = false;
let riffInterval = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Tape Hiss Pink Noise Generator
export function startTapeHiss(volume = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (hissNode) return;

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate 90s cassette deck tape head (bandpass + warm lowpass)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3200;

    hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(volume, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(ctx.destination);

    whiteNoise.start();
    hissNode = whiteNoise;
  } catch {
    // Graceful fallback if audio is blocked by browser policy
  }
}

export function stopTapeHiss() {
  try {
    if (hissNode) {
      hissNode.stop();
      hissNode.disconnect();
      hissNode = null;
    }
    if (hissGain) {
      hissGain.disconnect();
      hissGain = null;
    }
  } catch {
    // Ignore error
  }
}

// Tactile button mechanical click sound
export function playTactileClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore error
  }
}

// 90s Grunge Drop-D Power Chord Generator (synthesized Nirvana/Soundgarden fuzzy chords)
export function playGrungeChord(chordIndex = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Grunge chord progressions in Drop D / E minor
    const chords = [
      [73.42, 110.0, 146.83, 220.0], // D power chord (Drop D low punch)
      [98.0, 146.83, 196.0, 246.94], // G5
      [82.41, 123.47, 164.81, 220.0], // E5
      [116.54, 174.61, 233.08, 349.23], // Bb5 (Sub Pop dissonance)
    ];

    const notes = chords[chordIndex % chords.length];

    // Distortion waveshaper
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(18);
    distortion.oversample = '2x';

    // Lowpass filter for analog cabinet resonance
    const cabFilter = ctx.createBiquadFilter();
    cabFilter.type = 'lowpass';
    cabFilter.frequency.value = 2400;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.09, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    distortion.connect(cabFilter);
    cabFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      // Slight detune for raw chorus/flanger analog feel
      osc.frequency.setValueAtTime(freq + (Math.random() * 1.5 - 0.75), ctx.currentTime);
      osc.connect(distortion);
      osc.start(ctx.currentTime + idx * 0.015);
      osc.stop(ctx.currentTime + 1.2);
    });
  } catch {
    // Ignore audio error
  }
}

function makeDistortionCurve(amount = 20) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function startRiffLoop(onBeatChange) {
  if (isPlayingRiff) return;
  isPlayingRiff = true;
  let beat = 0;
  startTapeHiss(0.06);

  playGrungeChord(beat);
  if (onBeatChange) onBeatChange(beat);

  riffInterval = setInterval(() => {
    beat = (beat + 1) % 4;
    playGrungeChord(beat);
    if (onBeatChange) onBeatChange(beat);
  }, 1400);
}

export function stopRiffLoop() {
  isPlayingRiff = false;
  if (riffInterval) {
    clearInterval(riffInterval);
    riffInterval = null;
  }
  stopTapeHiss();
}

