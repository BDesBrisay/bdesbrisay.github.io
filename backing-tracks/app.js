/**
 * BackingTracks - Main App Controller
 * Wires UI to audio, manages state, handles iOS gestures
 */

import { resumeContext, setMasterVolume, isAudioReady } from './audio/context.js';
import * as player from './audio/player.js';
import { setDrumsMuted, isDrumsMuted } from './generators/drums.js';
import { setBassMuted, isBassMuted } from './generators/bass.js';
import { setChordsMuted, isChordsMuted } from './generators/chords.js';
import * as recorder from './audio/recorder.js';
import * as storage from './data/storage.js';

// DOM Elements
const initOverlay = document.getElementById('init-overlay');
const initBtn = document.getElementById('init-btn');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const volumeSlider = document.getElementById('volume');
const tempoSlider = document.getElementById('tempo');
const tempoValue = document.getElementById('tempo-value');
const styleSelect = document.getElementById('style');
const keySelect = document.getElementById('key');
const progressionSelect = document.getElementById('progression');
const metronomeToggle = document.getElementById('metronome-toggle');
const beatIndicator = document.getElementById('beat-indicator');
const beatDots = beatIndicator.querySelectorAll('.beat-dot');
const drumsToggle = document.getElementById('drums-toggle');
const bassToggle = document.getElementById('bass-toggle');
const chordsToggle = document.getElementById('chords-toggle');
const recordBtn = document.getElementById('record-btn');
const recordText = document.getElementById('record-text');
const playRecordingBtn = document.getElementById('play-recording-btn');
const libraryList = document.getElementById('library-list');

// State
let isInitialized = false;
let currentRecording = null;

/**
 * Initialize app - called on first user gesture
 */
async function initApp() {
  try {
    await resumeContext();
    isInitialized = true;
    
    // Hide overlay
    initOverlay.classList.add('hidden');
    
    // Load preferences
    loadPreferences();
    
    // Load saved recordings
    await loadLibrary();
    
    console.log('BackingTracks initialized');
  } catch (error) {
    console.error('Failed to initialize audio:', error);
    alert('Failed to initialize audio. Please try again.');
  }
}

/**
 * Load user preferences from localStorage
 */
function loadPreferences() {
  const prefs = storage.getPreferences();
  
  if (prefs.tempo) {
    player.setTempo(prefs.tempo);
    tempoSlider.value = prefs.tempo;
    tempoValue.textContent = `${prefs.tempo} BPM`;
  }
  
  if (prefs.key) {
    player.setKey(prefs.key);
    keySelect.value = prefs.key;
  }
  
  if (prefs.style) {
    player.setStyle(prefs.style);
    styleSelect.value = prefs.style;
  }
  
  if (prefs.progression) {
    player.setProgression(prefs.progression);
    progressionSelect.value = prefs.progression;
  }
  
  if (prefs.volume !== undefined) {
    setMasterVolume(prefs.volume / 100);
    volumeSlider.value = prefs.volume;
  }
  
  if (prefs.metronomeEnabled !== undefined) {
    player.setMetronomeEnabled(prefs.metronomeEnabled);
    metronomeToggle.classList.toggle('active', prefs.metronomeEnabled);
  } else {
    metronomeToggle.classList.add('active');
  }
}

/**
 * Save preference to localStorage
 */
function savePreference(key, value) {
  const prefs = storage.getPreferences();
  prefs[key] = value;
  storage.savePreferences(prefs);
}

/**
 * Load saved recordings library
 */
async function loadLibrary() {
  try {
    const recordings = await storage.getAllRecordings();
    renderLibrary(recordings);
  } catch (error) {
    console.error('Failed to load library:', error);
  }
}

/**
 * Render library list
 */
function renderLibrary(recordings) {
  if (recordings.length === 0) {
    libraryList.innerHTML = '<div class="library-empty">No saved recordings yet</div>';
    return;
  }
  
  libraryList.innerHTML = recordings.map(rec => `
    <div class="library-item" data-id="${rec.id}">
      <span class="library-item-icon">🎵</span>
      <div class="library-item-info">
        <div class="library-item-name">${rec.name}</div>
        <div class="library-item-meta">${formatDuration(rec.duration)} · ${formatDate(rec.createdAt)}</div>
      </div>
      <div class="library-item-actions">
        <button class="library-item-btn play-recording" data-id="${rec.id}" aria-label="Play">▶</button>
        <button class="library-item-btn delete" data-id="${rec.id}" aria-label="Delete">✕</button>
      </div>
    </div>
  `).join('');
  
  // Bind library item events
  libraryList.querySelectorAll('.play-recording').forEach(btn => {
    btn.addEventListener('click', handlePlayLibraryItem);
  });
  
  libraryList.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', handleDeleteLibraryItem);
  });
}

/**
 * Format duration in seconds to mm:ss
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date for display
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

/**
 * Update beat indicator UI
 */
function updateBeatIndicator(beat) {
  beatDots.forEach((dot, index) => {
    const isActive = index === beat;
    const isDownbeat = index === 0 && isActive;
    
    dot.classList.toggle('active', isActive);
    dot.classList.toggle('downbeat', isDownbeat);
  });
}

/**
 * Update play button state
 */
function updatePlayButton(isPlaying) {
  playBtn.textContent = isPlaying ? '⏸' : '▶';
  playBtn.classList.toggle('active', isPlaying);
}

/**
 * Update track toggle button state
 */
function updateTrackToggle(btn, isMuted) {
  btn.classList.toggle('muted', isMuted);
}

// Event Handlers

function handleInit() {
  initApp();
}

function handlePlay() {
  if (!isInitialized) return;
  player.toggle();
  updatePlayButton(player.getIsPlaying());
}

function handleStop() {
  if (!isInitialized) return;
  player.stop();
  updatePlayButton(false);
  updateBeatIndicator(-1);
}

function handleVolumeChange() {
  const volume = parseInt(volumeSlider.value, 10);
  setMasterVolume(volume / 100);
  savePreference('volume', volume);
}

function handleTempoChange() {
  const newTempo = parseInt(tempoSlider.value, 10);
  player.setTempo(newTempo);
  tempoValue.textContent = `${newTempo} BPM`;
  savePreference('tempo', newTempo);
}

function handleStyleChange() {
  const newStyle = styleSelect.value;
  player.setStyle(newStyle);
  savePreference('style', newStyle);
}

function handleKeyChange() {
  const newKey = keySelect.value;
  player.setKey(newKey);
  savePreference('key', newKey);
}

function handleProgressionChange() {
  const newProgression = progressionSelect.value;
  player.setProgression(newProgression);
  savePreference('progression', newProgression);
}

function handleMetronomeToggle() {
  const enabled = !player.isMetronomeEnabled();
  player.setMetronomeEnabled(enabled);
  metronomeToggle.classList.toggle('active', enabled);
  savePreference('metronomeEnabled', enabled);
}

function handleDrumsToggle() {
  const muted = !isDrumsMuted();
  setDrumsMuted(muted);
  updateTrackToggle(drumsToggle, muted);
}

function handleBassToggle() {
  const muted = !isBassMuted();
  setBassMuted(muted);
  updateTrackToggle(bassToggle, muted);
}

function handleChordsToggle() {
  const muted = !isChordsMuted();
  setChordsMuted(muted);
  updateTrackToggle(chordsToggle, muted);
}

async function handleRecord() {
  if (!isInitialized) return;
  
  if (recorder.isRecording()) {
    // Stop recording
    const blob = await recorder.stopRecording();
    currentRecording = blob;
    
    recordBtn.classList.remove('recording');
    recordText.textContent = 'Record';
    playRecordingBtn.disabled = false;
    
    // Stop playback
    player.stop();
    updatePlayButton(false);
    
    // Save recording
    const name = `Recording ${new Date().toLocaleTimeString()}`;
    await storage.saveRecording({
      name,
      audioBlob: blob,
      duration: recorder.getRecordingDuration(),
      style: player.getStyle(),
      key: player.getKey(),
      tempo: player.getTempo(),
      progression: player.getProgression()
    });
    
    await loadLibrary();
  } else {
    // Start recording
    const success = await recorder.startRecording();
    if (success) {
      recordBtn.classList.add('recording');
      recordText.textContent = 'Stop';
      
      // Start playback
      player.play();
      updatePlayButton(true);
    }
  }
}

function handlePlayRecording() {
  if (currentRecording) {
    recorder.playRecording(currentRecording);
  }
}

async function handlePlayLibraryItem(event) {
  const id = event.currentTarget.dataset.id;
  const recording = await storage.getRecording(id);
  if (recording && recording.audioBlob) {
    recorder.playRecording(recording.audioBlob);
  }
}

async function handleDeleteLibraryItem(event) {
  event.stopPropagation();
  const id = event.currentTarget.dataset.id;
  
  if (confirm('Delete this recording?')) {
    await storage.deleteRecording(id);
    await loadLibrary();
  }
}

// Set up player callbacks
player.onBeat(updateBeatIndicator);

// Bind event listeners
initBtn.addEventListener('click', handleInit);
initBtn.addEventListener('touchstart', handleInit, { passive: true });

playBtn.addEventListener('click', handlePlay);
stopBtn.addEventListener('click', handleStop);
volumeSlider.addEventListener('input', handleVolumeChange);
tempoSlider.addEventListener('input', handleTempoChange);
styleSelect.addEventListener('change', handleStyleChange);
keySelect.addEventListener('change', handleKeyChange);
progressionSelect.addEventListener('change', handleProgressionChange);
metronomeToggle.addEventListener('click', handleMetronomeToggle);
drumsToggle.addEventListener('click', handleDrumsToggle);
bassToggle.addEventListener('click', handleBassToggle);
chordsToggle.addEventListener('click', handleChordsToggle);
recordBtn.addEventListener('click', handleRecord);
playRecordingBtn.addEventListener('click', handlePlayRecording);

// Check if already initialized (page refresh with audio context persisting)
if (isAudioReady()) {
  initOverlay.classList.add('hidden');
  isInitialized = true;
  loadPreferences();
  loadLibrary();
}
