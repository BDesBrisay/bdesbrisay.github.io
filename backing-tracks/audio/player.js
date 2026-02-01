/**
 * Track player - playback scheduling, tempo, loop, metronome
 * Coordinates drums, bass, and chords generators
 */

import { getAudioContext, getCurrentTime, createGainNode } from './context.js';
import { playClick } from './synth.js';
import { scheduleDrumBar, getCurrentBeat } from '../generators/drums.js';
import { scheduleBassBar } from '../generators/bass.js';
import { scheduleChordBar } from '../generators/chords.js';
import { getProgressionChords } from '../data/theory.js';

// Player state
let isPlaying = false;
let tempo = 120;
let style = 'rock';
let key = 'C';
let progressionName = 'I-V-vi-IV';
let metronomeEnabled = true;

// Timing
let loopStartTime = -1;
let nextBarTime = 0;
let currentBar = 0;
let scheduleAheadTime = 0.2; // Schedule 200ms ahead
let schedulerIntervalId = null;

// Metronome gain node
let metronomeGain = null;

// Callbacks for UI updates
let onBeatCallback = null;
let onBarCallback = null;

/**
 * Get metronome gain node
 */
function getMetronomeGain() {
  if (!metronomeGain) {
    metronomeGain = createGainNode(0.5);
  }
  return metronomeGain;
}

/**
 * Set tempo (BPM)
 * @param {number} bpm - Beats per minute (60-180)
 */
export function setTempo(bpm) {
  tempo = Math.max(60, Math.min(180, bpm));
}

/**
 * Get current tempo
 * @returns {number}
 */
export function getTempo() {
  return tempo;
}

/**
 * Set style
 * @param {string} newStyle
 */
export function setStyle(newStyle) {
  style = newStyle;
}

/**
 * Get current style
 * @returns {string}
 */
export function getStyle() {
  return style;
}

/**
 * Set key
 * @param {string} newKey
 */
export function setKey(newKey) {
  key = newKey;
}

/**
 * Get current key
 * @returns {string}
 */
export function getKey() {
  return key;
}

/**
 * Set progression
 * @param {string} newProgression
 */
export function setProgression(newProgression) {
  progressionName = newProgression;
}

/**
 * Get current progression
 * @returns {string}
 */
export function getProgression() {
  return progressionName;
}

/**
 * Set metronome enabled
 * @param {boolean} enabled
 */
export function setMetronomeEnabled(enabled) {
  metronomeEnabled = enabled;
  if (metronomeGain) {
    metronomeGain.gain.value = enabled ? 0.5 : 0;
  }
}

/**
 * Check if metronome is enabled
 * @returns {boolean}
 */
export function isMetronomeEnabled() {
  return metronomeEnabled;
}

/**
 * Register callback for beat updates
 * @param {function} callback - Called with beat number (0-3)
 */
export function onBeat(callback) {
  onBeatCallback = callback;
}

/**
 * Register callback for bar updates  
 * @param {function} callback - Called with bar number and chord info
 */
export function onBar(callback) {
  onBarCallback = callback;
}

/**
 * Check if player is playing
 * @returns {boolean}
 */
export function getIsPlaying() {
  return isPlaying;
}

/**
 * Get duration of one bar in seconds
 * @returns {number}
 */
function getBarDuration() {
  return (60 / tempo) * 4; // 4 beats per bar
}

/**
 * Schedule all events for one bar
 * @param {number} barTime - When this bar starts
 * @param {number} barIndex - Which bar in the progression
 */
function scheduleBar(barTime, barIndex) {
  // Get chord for this bar from progression
  const chords = getProgressionChords(key, progressionName);
  const chordIndex = barIndex % chords.length;
  const chord = chords[chordIndex];
  
  // Schedule drums
  scheduleDrumBar(style, barTime, tempo);
  
  // Schedule bass
  scheduleBassBar(style, chord, barTime, tempo);
  
  // Schedule chords
  scheduleChordBar(style, chord, barTime, tempo);
  
  // Schedule metronome clicks
  if (metronomeEnabled) {
    const beatDuration = 60 / tempo;
    const destination = getMetronomeGain();
    
    for (let beat = 0; beat < 4; beat++) {
      const clickTime = barTime + (beat * beatDuration);
      playClick(clickTime, destination, beat === 0);
    }
  }
  
  // Notify bar callback
  if (onBarCallback) {
    onBarCallback(barIndex, chord);
  }
}

/**
 * Main scheduler loop - runs periodically to schedule upcoming events
 */
function scheduler() {
  const currentTime = getCurrentTime();
  
  // Schedule bars that fall within our lookahead window
  while (nextBarTime < currentTime + scheduleAheadTime) {
    scheduleBar(nextBarTime, currentBar);
    nextBarTime += getBarDuration();
    currentBar++;
  }
  
  // Update beat callback for UI
  if (onBeatCallback && loopStartTime >= 0) {
    const beat = getCurrentBeat(currentTime, loopStartTime, tempo);
    onBeatCallback(beat);
  }
}

/**
 * Start playback
 */
export function play() {
  if (isPlaying) return;
  
  isPlaying = true;
  currentBar = 0;
  
  // Start slightly in the future to ensure context is ready
  const ctx = getAudioContext();
  loopStartTime = ctx.currentTime + 0.1;
  nextBarTime = loopStartTime;
  
  // Start scheduler
  schedulerIntervalId = setInterval(scheduler, 25); // Run every 25ms
  
  // Run immediately to start scheduling
  scheduler();
}

/**
 * Stop playback
 */
export function stop() {
  if (!isPlaying) return;
  
  isPlaying = false;
  loopStartTime = -1;
  currentBar = 0;
  
  // Stop scheduler
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
  }
  
  // Reset beat indicator
  if (onBeatCallback) {
    onBeatCallback(-1);
  }
}

/**
 * Toggle playback
 */
export function toggle() {
  if (isPlaying) {
    stop();
  } else {
    play();
  }
}

/**
 * Get current playback state for UI
 * @returns {{ isPlaying: boolean, tempo: number, style: string, key: string, progression: string }}
 */
export function getState() {
  return {
    isPlaying,
    tempo,
    style,
    key,
    progression: progressionName,
    metronomeEnabled
  };
}
