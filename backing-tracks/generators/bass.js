/**
 * Bass line generator
 * Schedules bass notes based on pattern and chord progression
 */

import { playBass, createTrackGain } from '../audio/synth.js';
import { getBassPattern } from '../data/patterns.js';
import { midiToFreq, noteToMidi } from '../data/theory.js';

// Track gain node for bass
let bassGain = null;
let isMuted = false;

/**
 * Get or create bass gain node
 * @returns {GainNode}
 */
export function getBassGain() {
  if (!bassGain) {
    bassGain = createTrackGain(0.7);
  }
  return bassGain;
}

/**
 * Set bass mute state
 * @param {boolean} muted
 */
export function setBassMuted(muted) {
  isMuted = muted;
  if (bassGain) {
    bassGain.gain.value = muted ? 0 : 0.7;
  }
}

/**
 * Check if bass is muted
 * @returns {boolean}
 */
export function isBassMuted() {
  return isMuted;
}

/**
 * Schedule bass pattern for one bar
 * @param {string} style - Pattern style
 * @param {Object} chord - Chord info { root, type, intervals }
 * @param {number} barStartTime - Audio context time when bar starts
 * @param {number} tempo - BPM
 */
export function scheduleBassBar(style, chord, barStartTime, tempo) {
  if (isMuted) return;
  
  const pattern = getBassPattern(style);
  const destination = getBassGain();
  
  // Duration of one 16th note in seconds
  const sixteenthDuration = 60 / tempo / 4;
  
  // Base octave for bass
  const baseOctave = 2;
  const rootMidi = noteToMidi(chord.root, baseOctave);
  
  pattern.forEach(event => {
    const eventTime = barStartTime + (event.beat * sixteenthDuration);
    const duration = event.duration * sixteenthDuration;
    
    // Calculate note from chord root + degree offset + octave offset
    const midi = rootMidi + event.degree + (event.octaveOffset * 12);
    const freq = midiToFreq(midi);
    
    playBass(freq, eventTime, duration, destination, event.velocity);
  });
}
