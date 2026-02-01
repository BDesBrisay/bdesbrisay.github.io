/**
 * AudioContext singleton with iOS Safari handling
 * Manages the Web Audio API context lifecycle
 */

let audioContext = null;
let masterGain = null;
let isInitialized = false;

/**
 * Get or create the AudioContext singleton
 * @returns {AudioContext}
 */
export function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    
    // Create master gain node
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 0.8;
  }
  return audioContext;
}

/**
 * Get the master gain node for volume control
 * @returns {GainNode}
 */
export function getMasterGain() {
  if (!masterGain) {
    getAudioContext();
  }
  return masterGain;
}

/**
 * Set master volume (0-1)
 * @param {number} volume - Volume level between 0 and 1
 */
export function setMasterVolume(volume) {
  const gain = getMasterGain();
  gain.gain.setValueAtTime(
    Math.max(0, Math.min(1, volume)),
    getAudioContext().currentTime
  );
}

/**
 * Resume audio context (required after user gesture on iOS Safari)
 * @returns {Promise<void>}
 */
export async function resumeContext() {
  const ctx = getAudioContext();
  
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  
  isInitialized = true;
}

/**
 * Check if audio context is initialized and running
 * @returns {boolean}
 */
export function isAudioReady() {
  return isInitialized && audioContext && audioContext.state === 'running';
}

/**
 * Get current audio context time
 * @returns {number}
 */
export function getCurrentTime() {
  return getAudioContext().currentTime;
}

/**
 * Get sample rate of audio context
 * @returns {number}
 */
export function getSampleRate() {
  return getAudioContext().sampleRate;
}

/**
 * Create a new gain node connected to master
 * @param {number} initialGain - Initial gain value (default 1)
 * @returns {GainNode}
 */
export function createGainNode(initialGain = 1) {
  const ctx = getAudioContext();
  const gain = ctx.createGain();
  gain.gain.value = initialGain;
  gain.connect(masterGain);
  return gain;
}

/**
 * Suspend audio context (for power saving when not in use)
 * @returns {Promise<void>}
 */
export async function suspendContext() {
  if (audioContext && audioContext.state === 'running') {
    await audioContext.suspend();
  }
}
