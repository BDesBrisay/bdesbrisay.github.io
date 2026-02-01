/**
 * Drum and bass pattern templates by style
 * Each pattern is an array of events with beat position and properties
 * 
 * Beat positions are in 16th notes (0-15 for one bar of 4/4)
 * 0 = beat 1, 4 = beat 2, 8 = beat 3, 12 = beat 4
 */

/**
 * Drum pattern format:
 * { beat: number, drum: 'kick'|'snare'|'hihat'|'hihatOpen', velocity: number }
 */

export const DRUM_PATTERNS = {
  rock: [
    // Kick on 1 and 3
    { beat: 0, drum: 'kick', velocity: 1.0 },
    { beat: 8, drum: 'kick', velocity: 0.9 },
    // Snare on 2 and 4
    { beat: 4, drum: 'snare', velocity: 1.0 },
    { beat: 12, drum: 'snare', velocity: 1.0 },
    // Hi-hats on 8th notes
    { beat: 0, drum: 'hihat', velocity: 0.7 },
    { beat: 2, drum: 'hihat', velocity: 0.5 },
    { beat: 4, drum: 'hihat', velocity: 0.7 },
    { beat: 6, drum: 'hihat', velocity: 0.5 },
    { beat: 8, drum: 'hihat', velocity: 0.7 },
    { beat: 10, drum: 'hihat', velocity: 0.5 },
    { beat: 12, drum: 'hihat', velocity: 0.7 },
    { beat: 14, drum: 'hihat', velocity: 0.5 }
  ],
  
  pop: [
    // Four on the floor kick
    { beat: 0, drum: 'kick', velocity: 1.0 },
    { beat: 4, drum: 'kick', velocity: 0.9 },
    { beat: 8, drum: 'kick', velocity: 0.9 },
    { beat: 12, drum: 'kick', velocity: 0.9 },
    // Snare on 2 and 4
    { beat: 4, drum: 'snare', velocity: 1.0 },
    { beat: 12, drum: 'snare', velocity: 1.0 },
    // Hi-hats on 8th notes
    { beat: 0, drum: 'hihat', velocity: 0.6 },
    { beat: 2, drum: 'hihat', velocity: 0.4 },
    { beat: 4, drum: 'hihat', velocity: 0.6 },
    { beat: 6, drum: 'hihat', velocity: 0.4 },
    { beat: 8, drum: 'hihat', velocity: 0.6 },
    { beat: 10, drum: 'hihat', velocity: 0.4 },
    { beat: 12, drum: 'hihat', velocity: 0.6 },
    { beat: 14, drum: 'hihat', velocity: 0.4 }
  ],
  
  jazz: [
    // Kick on 1, ghost on 3
    { beat: 0, drum: 'kick', velocity: 0.7 },
    { beat: 8, drum: 'kick', velocity: 0.4 },
    // Snare on 4 with ghost notes
    { beat: 6, drum: 'snare', velocity: 0.3 },
    { beat: 12, drum: 'snare', velocity: 0.8 },
    // Ride pattern (swing feel - using hihat)
    { beat: 0, drum: 'hihat', velocity: 0.6 },
    { beat: 3, drum: 'hihat', velocity: 0.4 }, // Swung
    { beat: 4, drum: 'hihat', velocity: 0.5 },
    { beat: 7, drum: 'hihat', velocity: 0.4 }, // Swung
    { beat: 8, drum: 'hihat', velocity: 0.6 },
    { beat: 11, drum: 'hihat', velocity: 0.4 }, // Swung
    { beat: 12, drum: 'hihat', velocity: 0.5 },
    { beat: 15, drum: 'hihat', velocity: 0.4 }  // Swung
  ],
  
  funk: [
    // Syncopated kick pattern
    { beat: 0, drum: 'kick', velocity: 1.0 },
    { beat: 6, drum: 'kick', velocity: 0.8 },
    { beat: 10, drum: 'kick', velocity: 0.9 },
    // Snare on 2 and 4 with ghost
    { beat: 4, drum: 'snare', velocity: 1.0 },
    { beat: 7, drum: 'snare', velocity: 0.3 },
    { beat: 12, drum: 'snare', velocity: 1.0 },
    { beat: 15, drum: 'snare', velocity: 0.3 },
    // 16th note hi-hats
    { beat: 0, drum: 'hihat', velocity: 0.7 },
    { beat: 1, drum: 'hihat', velocity: 0.3 },
    { beat: 2, drum: 'hihat', velocity: 0.5 },
    { beat: 3, drum: 'hihat', velocity: 0.3 },
    { beat: 4, drum: 'hihat', velocity: 0.7 },
    { beat: 5, drum: 'hihat', velocity: 0.3 },
    { beat: 6, drum: 'hihat', velocity: 0.5 },
    { beat: 7, drum: 'hihat', velocity: 0.3 },
    { beat: 8, drum: 'hihat', velocity: 0.7 },
    { beat: 9, drum: 'hihat', velocity: 0.3 },
    { beat: 10, drum: 'hihat', velocity: 0.5 },
    { beat: 11, drum: 'hihat', velocity: 0.3 },
    { beat: 12, drum: 'hihat', velocity: 0.7 },
    { beat: 13, drum: 'hihat', velocity: 0.3 },
    { beat: 14, drum: 'hihat', velocity: 0.5 },
    { beat: 15, drum: 'hihat', velocity: 0.3 }
  ],
  
  blues: [
    // Shuffle feel kick
    { beat: 0, drum: 'kick', velocity: 0.9 },
    { beat: 8, drum: 'kick', velocity: 0.8 },
    { beat: 10, drum: 'kick', velocity: 0.5 },
    // Snare backbeat
    { beat: 4, drum: 'snare', velocity: 0.9 },
    { beat: 12, drum: 'snare', velocity: 0.9 },
    // Shuffle hi-hats
    { beat: 0, drum: 'hihat', velocity: 0.6 },
    { beat: 3, drum: 'hihat', velocity: 0.4 }, // Triplet feel
    { beat: 4, drum: 'hihat', velocity: 0.6 },
    { beat: 7, drum: 'hihat', velocity: 0.4 },
    { beat: 8, drum: 'hihat', velocity: 0.6 },
    { beat: 11, drum: 'hihat', velocity: 0.4 },
    { beat: 12, drum: 'hihat', velocity: 0.6 },
    { beat: 15, drum: 'hihat', velocity: 0.4 }
  ]
};

/**
 * Bass pattern format:
 * { beat: number, degree: number, octaveOffset: number, duration: number, velocity: number }
 * 
 * degree: scale degree offset from chord root (0 = root, 4 = 5th in semitones)
 * octaveOffset: add to base octave
 * duration: in 16th notes
 */

export const BASS_PATTERNS = {
  rock: [
    { beat: 0, degree: 0, octaveOffset: 0, duration: 4, velocity: 0.8 },
    { beat: 4, degree: 0, octaveOffset: 0, duration: 2, velocity: 0.6 },
    { beat: 6, degree: 7, octaveOffset: 0, duration: 2, velocity: 0.6 }, // 5th
    { beat: 8, degree: 0, octaveOffset: 0, duration: 4, velocity: 0.8 },
    { beat: 12, degree: 0, octaveOffset: 0, duration: 4, velocity: 0.7 }
  ],
  
  pop: [
    { beat: 0, degree: 0, octaveOffset: 0, duration: 8, velocity: 0.8 },
    { beat: 8, degree: 0, octaveOffset: 0, duration: 4, velocity: 0.7 },
    { beat: 12, degree: 7, octaveOffset: 0, duration: 4, velocity: 0.6 }
  ],
  
  jazz: [
    // Walking bass feel
    { beat: 0, degree: 0, octaveOffset: 0, duration: 4, velocity: 0.7 },
    { beat: 4, degree: 4, octaveOffset: 0, duration: 4, velocity: 0.6 }, // 3rd
    { beat: 8, degree: 7, octaveOffset: 0, duration: 4, velocity: 0.6 }, // 5th
    { beat: 12, degree: 5, octaveOffset: 0, duration: 4, velocity: 0.6 } // 4th
  ],
  
  funk: [
    // Syncopated bass
    { beat: 0, degree: 0, octaveOffset: 0, duration: 2, velocity: 0.9 },
    { beat: 3, degree: 0, octaveOffset: 0, duration: 2, velocity: 0.6 },
    { beat: 6, degree: 0, octaveOffset: 0, duration: 2, velocity: 0.7 },
    { beat: 10, degree: 0, octaveOffset: 0, duration: 2, velocity: 0.8 },
    { beat: 13, degree: 7, octaveOffset: 0, duration: 3, velocity: 0.6 }
  ],
  
  blues: [
    // 12-bar blues style
    { beat: 0, degree: 0, octaveOffset: 0, duration: 3, velocity: 0.8 },
    { beat: 3, degree: 0, octaveOffset: 1, duration: 3, velocity: 0.5 },
    { beat: 6, degree: 3, octaveOffset: 0, duration: 2, velocity: 0.6 }, // b3
    { beat: 8, degree: 4, octaveOffset: 0, duration: 3, velocity: 0.7 }, // 3rd
    { beat: 11, degree: 5, octaveOffset: 0, duration: 3, velocity: 0.6 }, // 4th
    { beat: 14, degree: 7, octaveOffset: 0, duration: 2, velocity: 0.6 } // 5th
  ]
};

/**
 * Chord voicing patterns
 * Defines when chords are struck within a bar
 * { beat: number, duration: number, velocity: number }
 */

export const CHORD_PATTERNS = {
  rock: [
    { beat: 0, duration: 8, velocity: 0.5 },
    { beat: 8, duration: 8, velocity: 0.4 }
  ],
  
  pop: [
    { beat: 0, duration: 6, velocity: 0.4 },
    { beat: 8, duration: 6, velocity: 0.4 }
  ],
  
  jazz: [
    { beat: 0, duration: 4, velocity: 0.35 },
    { beat: 6, duration: 4, velocity: 0.3 },
    { beat: 12, duration: 4, velocity: 0.35 }
  ],
  
  funk: [
    { beat: 0, duration: 2, velocity: 0.45 },
    { beat: 4, duration: 2, velocity: 0.4 },
    { beat: 6, duration: 2, velocity: 0.35 },
    { beat: 10, duration: 2, velocity: 0.4 },
    { beat: 14, duration: 2, velocity: 0.35 }
  ],
  
  blues: [
    { beat: 0, duration: 5, velocity: 0.4 },
    { beat: 6, duration: 4, velocity: 0.35 },
    { beat: 12, duration: 4, velocity: 0.4 }
  ]
};

/**
 * Get number of bars per chord for a progression length
 * Standard is 1 bar per chord for 4-chord progressions
 */
export const BARS_PER_CHORD = 1;

/**
 * Get pattern by style with fallback
 */
export function getDrumPattern(style) {
  return DRUM_PATTERNS[style] || DRUM_PATTERNS.rock;
}

export function getBassPattern(style) {
  return BASS_PATTERNS[style] || BASS_PATTERNS.rock;
}

export function getChordPattern(style) {
  return CHORD_PATTERNS[style] || CHORD_PATTERNS.rock;
}
