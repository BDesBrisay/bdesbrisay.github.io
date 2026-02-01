/**
 * Chord progression generator
 * Schedules chord voicings based on pattern and progression
 */

import { playChord, createTrackGain } from '../audio/synth.js';
import { getChordPattern } from '../data/patterns.js';
import { getChordFrequencies } from '../data/theory.js';

// Track gain node for chords
let chordsGain = null;
let isMuted = false;

/**
 * Get or create chords gain node
 * @returns {GainNode}
 */
export function getChordsGain() {
  if (!chordsGain) {
    chordsGain = createTrackGain(0.5);
  }
  return chordsGain;
}

/**
 * Set chords mute state
 * @param {boolean} muted
 */
export function setChordsMuted(muted) {
  isMuted = muted;
  if (chordsGain) {
    chordsGain.gain.value = muted ? 0 : 0.5;
  }
}

/**
 * Check if chords are muted
 * @returns {boolean}
 */
export function isChordsMuted() {
  return isMuted;
}

/**
 * Schedule chord pattern for one bar
 * @param {string} style - Pattern style
 * @param {Object} chord - Chord info { root, type, intervals }
 * @param {number} barStartTime - Audio context time when bar starts
 * @param {number} tempo - BPM
 */
export function scheduleChordBar(style, chord, barStartTime, tempo) {
  if (isMuted) return;
  
  const pattern = getChordPattern(style);
  const destination = getChordsGain();
  
  // Duration of one 16th note in seconds
  const sixteenthDuration = 60 / tempo / 4;
  
  // Get chord frequencies (octave 4 for nice mid-range voicing)
  const frequencies = getChordFrequencies(chord.root, chord.intervals, 4);
  
  // Envelope for chord pads
  const envelope = {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.6,
    release: 0.2
  };
  
  pattern.forEach(event => {
    const eventTime = barStartTime + (event.beat * sixteenthDuration);
    const duration = event.duration * sixteenthDuration;
    
    // Use triangle wave for softer pad sound
    playChord(frequencies, 'triangle', envelope, eventTime, duration, destination);
  });
}
