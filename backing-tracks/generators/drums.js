/**
 * Drum pattern generator
 * Schedules drum sounds based on pattern templates
 */

import { playKick, playSnare, playHiHat, createTrackGain } from '../audio/synth.js';
import { getDrumPattern } from '../data/patterns.js';

// Track gain node for drums
let drumsGain = null;
let isMuted = false;

/**
 * Get or create drums gain node
 * @returns {GainNode}
 */
export function getDrumsGain() {
  if (!drumsGain) {
    drumsGain = createTrackGain(0.8);
  }
  return drumsGain;
}

/**
 * Set drums mute state
 * @param {boolean} muted
 */
export function setDrumsMuted(muted) {
  isMuted = muted;
  if (drumsGain) {
    drumsGain.gain.value = muted ? 0 : 0.8;
  }
}

/**
 * Check if drums are muted
 * @returns {boolean}
 */
export function isDrumsMuted() {
  return isMuted;
}

/**
 * Schedule drum pattern for one bar
 * @param {string} style - Pattern style (rock, pop, jazz, etc.)
 * @param {number} barStartTime - Audio context time when bar starts
 * @param {number} tempo - BPM
 */
export function scheduleDrumBar(style, barStartTime, tempo) {
  if (isMuted) return;
  
  const pattern = getDrumPattern(style);
  const destination = getDrumsGain();
  
  // Duration of one 16th note in seconds
  const sixteenthDuration = 60 / tempo / 4;
  
  pattern.forEach(event => {
    const eventTime = barStartTime + (event.beat * sixteenthDuration);
    const velocity = event.velocity;
    
    switch (event.drum) {
      case 'kick':
        playKick(eventTime, destination, velocity);
        break;
      case 'snare':
        playSnare(eventTime, destination, velocity);
        break;
      case 'hihat':
        playHiHat(eventTime, destination, false, velocity);
        break;
      case 'hihatOpen':
        playHiHat(eventTime, destination, true, velocity);
        break;
    }
  });
}

/**
 * Get current beat position for UI (0-3 for quarter notes)
 * @param {number} currentTime - Current audio context time
 * @param {number} loopStartTime - When the current loop started
 * @param {number} tempo - BPM
 * @returns {number} Beat number 0-3, or -1 if not playing
 */
export function getCurrentBeat(currentTime, loopStartTime, tempo) {
  if (loopStartTime < 0) return -1;
  
  const elapsed = currentTime - loopStartTime;
  const beatDuration = 60 / tempo;
  const beatsPerBar = 4;
  
  const beatInLoop = (elapsed / beatDuration) % beatsPerBar;
  return Math.floor(beatInLoop);
}
