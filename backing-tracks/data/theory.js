/**
 * Music theory data and utilities
 * Pure functions for notes, scales, chords, and progressions
 */

// Note names in chromatic order
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic equivalents for flat keys
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// A4 = 440Hz standard tuning
const A4_FREQ = 440;
const A4_MIDI = 69;

/**
 * Convert MIDI note number to frequency
 * @param {number} midi - MIDI note number (0-127)
 * @returns {number} Frequency in Hz
 */
export function midiToFreq(midi) {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

/**
 * Convert note name and octave to MIDI number
 * @param {string} note - Note name (e.g., 'C', 'F#', 'Bb')
 * @param {number} octave - Octave number (0-8, middle C is C4)
 * @returns {number} MIDI note number
 */
export function noteToMidi(note, octave) {
  // Handle flat names
  let noteIndex = NOTE_NAMES.indexOf(note);
  if (noteIndex === -1) {
    noteIndex = FLAT_NAMES.indexOf(note);
  }
  if (noteIndex === -1) {
    console.warn(`Unknown note: ${note}, defaulting to C`);
    noteIndex = 0;
  }
  return noteIndex + (octave + 1) * 12;
}

/**
 * Convert note name and octave to frequency
 * @param {string} note - Note name
 * @param {number} octave - Octave number
 * @returns {number} Frequency in Hz
 */
export function noteToFreq(note, octave) {
  return midiToFreq(noteToMidi(note, octave));
}

/**
 * Scale interval definitions (semitones from root)
 */
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10]
};

/**
 * Chord formulas (intervals from root in semitones)
 */
export const CHORDS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  dim7: [0, 3, 6, 9],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7]
};

/**
 * Roman numeral chord qualities in major key
 * I, ii, iii, IV, V, vi, vii°
 */
const MAJOR_KEY_CHORDS = {
  'I': { interval: 0, type: 'major' },
  'ii': { interval: 2, type: 'minor' },
  'iii': { interval: 4, type: 'minor' },
  'IV': { interval: 5, type: 'major' },
  'V': { interval: 7, type: 'major' },
  'vi': { interval: 9, type: 'minor' },
  'vii': { interval: 11, type: 'dim' }
};

/**
 * Roman numeral chord qualities in minor key
 * i, ii°, III, iv, v, VI, VII
 */
const MINOR_KEY_CHORDS = {
  'i': { interval: 0, type: 'minor' },
  'ii': { interval: 2, type: 'dim' },
  'III': { interval: 3, type: 'major' },
  'iv': { interval: 5, type: 'minor' },
  'v': { interval: 7, type: 'minor' },
  'V': { interval: 7, type: 'major' }, // harmonic minor
  'VI': { interval: 8, type: 'major' },
  'VII': { interval: 10, type: 'major' }
};

/**
 * Common chord progressions
 */
export const PROGRESSIONS = {
  'I-V-vi-IV': ['I', 'V', 'vi', 'IV'],
  'I-IV-V-I': ['I', 'IV', 'V', 'I'],
  'ii-V-I': ['ii', 'V', 'I', 'I'],
  'I-vi-IV-V': ['I', 'vi', 'IV', 'V'],
  'I-IV-I-V': ['I', 'IV', 'I', 'V'],
  'vi-IV-I-V': ['vi', 'IV', 'I', 'V']
};

/**
 * Parse key string (e.g., 'Am', 'C', 'F#m')
 * @param {string} key - Key string
 * @returns {{ root: string, isMinor: boolean }}
 */
export function parseKey(key) {
  const isMinor = key.endsWith('m');
  const root = isMinor ? key.slice(0, -1) : key;
  return { root, isMinor };
}

/**
 * Get root note index (0-11) from note name
 * @param {string} note - Note name
 * @returns {number} Semitone offset from C
 */
export function getNoteIndex(note) {
  let index = NOTE_NAMES.indexOf(note);
  if (index === -1) {
    index = FLAT_NAMES.indexOf(note);
  }
  return index === -1 ? 0 : index;
}

/**
 * Transpose a note by semitones
 * @param {string} note - Note name
 * @param {number} semitones - Number of semitones to transpose
 * @returns {string} Transposed note name
 */
export function transpose(note, semitones) {
  const index = getNoteIndex(note);
  const newIndex = (index + semitones + 12) % 12;
  return NOTE_NAMES[newIndex];
}

/**
 * Get chord notes for a roman numeral in a key
 * @param {string} key - Key string (e.g., 'C', 'Am')
 * @param {string} numeral - Roman numeral (e.g., 'I', 'vi')
 * @returns {{ root: string, type: string, notes: number[] }}
 */
export function getChordInKey(key, numeral) {
  const { root, isMinor } = parseKey(key);
  const chordMap = isMinor ? MINOR_KEY_CHORDS : MAJOR_KEY_CHORDS;
  const chordInfo = chordMap[numeral];
  
  if (!chordInfo) {
    console.warn(`Unknown numeral: ${numeral}`);
    return { root: root, type: 'major', notes: CHORDS.major };
  }
  
  const chordRoot = transpose(root, chordInfo.interval);
  const intervals = CHORDS[chordInfo.type] || CHORDS.major;
  
  return {
    root: chordRoot,
    type: chordInfo.type,
    intervals: intervals
  };
}

/**
 * Get all chords for a progression in a key
 * @param {string} key - Key string
 * @param {string} progressionName - Progression name (e.g., 'I-V-vi-IV')
 * @returns {Array<{ root: string, type: string, intervals: number[] }>}
 */
export function getProgressionChords(key, progressionName) {
  const numerals = PROGRESSIONS[progressionName];
  if (!numerals) {
    console.warn(`Unknown progression: ${progressionName}`);
    return [];
  }
  
  return numerals.map(numeral => getChordInKey(key, numeral));
}

/**
 * Get frequencies for a chord
 * @param {string} root - Root note name
 * @param {number[]} intervals - Chord intervals
 * @param {number} octave - Base octave (default 3)
 * @returns {number[]} Array of frequencies
 */
export function getChordFrequencies(root, intervals, octave = 3) {
  const rootMidi = noteToMidi(root, octave);
  return intervals.map(interval => midiToFreq(rootMidi + interval));
}

/**
 * Get bass note frequency for a chord
 * @param {string} root - Root note name  
 * @param {number} octave - Octave for bass (default 2)
 * @returns {number} Frequency in Hz
 */
export function getBassFrequency(root, octave = 2) {
  return noteToFreq(root, octave);
}
