/**
 * Audio synthesis utilities
 * Oscillators, envelopes, and drum sound generation
 */

import { getAudioContext, getMasterGain, getCurrentTime } from './context.js';

/**
 * Create an oscillator with envelope
 * @param {number} freq - Frequency in Hz
 * @param {string} type - Waveform type (sine, square, sawtooth, triangle)
 * @param {Object} envelope - ADSR envelope { attack, decay, sustain, release }
 * @param {number} startTime - When to start (audio context time)
 * @param {number} duration - How long to play
 * @param {GainNode} destination - Output node
 */
export function playTone(freq, type, envelope, startTime, duration, destination) {
  const ctx = getAudioContext();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.value = freq;
  
  osc.connect(gain);
  gain.connect(destination || getMasterGain());
  
  // Apply envelope
  const { attack = 0.01, decay = 0.1, sustain = 0.5, release = 0.1 } = envelope;
  
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(1, startTime + attack);
  gain.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
  gain.gain.setValueAtTime(sustain, startTime + duration - release);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  
  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
  
  return { oscillator: osc, gain };
}

/**
 * Play multiple frequencies as a chord
 * @param {number[]} frequencies - Array of frequencies
 * @param {string} type - Waveform type
 * @param {Object} envelope - ADSR envelope
 * @param {number} startTime - When to start
 * @param {number} duration - How long to play
 * @param {GainNode} destination - Output node
 */
export function playChord(frequencies, type, envelope, startTime, duration, destination) {
  const ctx = getAudioContext();
  
  // Create a submix for the chord
  const chordGain = ctx.createGain();
  chordGain.gain.value = 1 / frequencies.length; // Normalize volume
  chordGain.connect(destination || getMasterGain());
  
  frequencies.forEach(freq => {
    playTone(freq, type, envelope, startTime, duration, chordGain);
  });
  
  return chordGain;
}

/**
 * Generate a kick drum sound
 * @param {number} startTime - When to start
 * @param {GainNode} destination - Output node
 * @param {number} velocity - Volume 0-1
 */
export function playKick(startTime, destination, velocity = 0.8) {
  const ctx = getAudioContext();
  const dest = destination || getMasterGain();
  
  // Main body - sine wave with pitch envelope
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, startTime);
  osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.08);
  
  gain.gain.setValueAtTime(velocity, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
  
  osc.connect(gain);
  gain.connect(dest);
  
  osc.start(startTime);
  osc.stop(startTime + 0.35);
  
  // Click transient
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  
  click.type = 'square';
  click.frequency.value = 200;
  
  clickGain.gain.setValueAtTime(velocity * 0.3, startTime);
  clickGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.02);
  
  click.connect(clickGain);
  clickGain.connect(dest);
  
  click.start(startTime);
  click.stop(startTime + 0.03);
}

/**
 * Generate a snare drum sound
 * @param {number} startTime - When to start
 * @param {GainNode} destination - Output node
 * @param {number} velocity - Volume 0-1
 */
export function playSnare(startTime, destination, velocity = 0.7) {
  const ctx = getAudioContext();
  const dest = destination || getMasterGain();
  
  // Body - triangle wave
  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  
  body.type = 'triangle';
  body.frequency.setValueAtTime(200, startTime);
  body.frequency.exponentialRampToValueAtTime(120, startTime + 0.05);
  
  bodyGain.gain.setValueAtTime(velocity * 0.6, startTime);
  bodyGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
  
  body.connect(bodyGain);
  bodyGain.connect(dest);
  
  body.start(startTime);
  body.stop(startTime + 0.15);
  
  // Noise for snare wires
  const noiseBuffer = createNoiseBuffer(0.2);
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  
  noise.buffer = noiseBuffer;
  
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 3000;
  
  noiseGain.gain.setValueAtTime(velocity * 0.4, startTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
  
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);
  
  noise.start(startTime);
  noise.stop(startTime + 0.2);
}

/**
 * Generate a hi-hat sound
 * @param {number} startTime - When to start
 * @param {GainNode} destination - Output node
 * @param {boolean} open - Open hi-hat (longer decay)
 * @param {number} velocity - Volume 0-1
 */
export function playHiHat(startTime, destination, open = false, velocity = 0.5) {
  const ctx = getAudioContext();
  const dest = destination || getMasterGain();
  
  const duration = open ? 0.3 : 0.08;
  
  // Use noise
  const noiseBuffer = createNoiseBuffer(duration + 0.1);
  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  noise.buffer = noiseBuffer;
  
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  
  noiseGain.gain.setValueAtTime(velocity * 0.4, startTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(dest);
  
  noise.start(startTime);
  noise.stop(startTime + duration + 0.1);
}

/**
 * Play a metronome click
 * @param {number} startTime - When to start
 * @param {GainNode} destination - Output node
 * @param {boolean} downbeat - Is this the first beat of the bar
 */
export function playClick(startTime, destination, downbeat = false) {
  const ctx = getAudioContext();
  const dest = destination || getMasterGain();
  
  const freq = downbeat ? 1200 : 800;
  const velocity = downbeat ? 0.3 : 0.2;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = freq;
  
  gain.gain.setValueAtTime(velocity, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.03);
  
  osc.connect(gain);
  gain.connect(dest);
  
  osc.start(startTime);
  osc.stop(startTime + 0.05);
}

/**
 * Play a bass note
 * @param {number} freq - Frequency in Hz
 * @param {number} startTime - When to start
 * @param {number} duration - How long to play
 * @param {GainNode} destination - Output node
 * @param {number} velocity - Volume 0-1
 */
export function playBass(freq, startTime, duration, destination, velocity = 0.6) {
  const ctx = getAudioContext();
  const dest = destination || getMasterGain();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  
  // Low-pass filter for warmth
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 2;
  
  // Envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(velocity, startTime + 0.01);
  gain.gain.setValueAtTime(velocity * 0.8, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  
  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}

/**
 * Create a noise buffer for drum synthesis
 * @param {number} duration - Duration in seconds
 * @returns {AudioBuffer}
 */
function createNoiseBuffer(duration) {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const samples = duration * sampleRate;
  const buffer = ctx.createBuffer(1, samples, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < samples; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
}

/**
 * Create a gain node for track submix
 * @param {number} initialGain - Initial volume
 * @returns {GainNode}
 */
export function createTrackGain(initialGain = 1) {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = initialGain;
  gain.connect(getMasterGain());
  return gain;
}
