/**
 * Audio Recorder
 * MediaRecorder API with Web Audio API fallback for iOS Safari
 */

import { getAudioContext, getMasterGain } from './context.js';

// Recording state
let mediaRecorder = null;
let recordedChunks = [];
let isRecordingActive = false;
let recordingStartTime = 0;
let recordingDuration = 0;

// Audio playback for recordings
let playbackSource = null;

// Stream and nodes for recording
let mediaStream = null;
let streamSource = null;
let recordingDestination = null;

/**
 * Check if MediaRecorder is supported
 * @returns {boolean}
 */
function isMediaRecorderSupported() {
  return typeof MediaRecorder !== 'undefined' && 
         typeof navigator.mediaDevices !== 'undefined' &&
         typeof navigator.mediaDevices.getUserMedia !== 'undefined';
}

/**
 * Get preferred MIME type for recording
 * @returns {string}
 */
function getPreferredMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return '';
}

/**
 * Start recording audio (microphone + backing track mix)
 * @returns {Promise<boolean>} Success
 */
export async function startRecording() {
  if (isRecordingActive) {
    console.warn('Already recording');
    return false;
  }
  
  try {
    // Get microphone access
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    
    const ctx = getAudioContext();
    
    // Create destination for recording
    recordingDestination = ctx.createMediaStreamDestination();
    
    // Connect microphone to recording destination
    streamSource = ctx.createMediaStreamSource(mediaStream);
    const micGain = ctx.createGain();
    micGain.gain.value = 1.0;
    streamSource.connect(micGain);
    micGain.connect(recordingDestination);
    
    // Connect master output to recording destination (for backing track)
    const masterGain = getMasterGain();
    masterGain.connect(recordingDestination);
    
    // Set up MediaRecorder
    const mimeType = getPreferredMimeType();
    const options = mimeType ? { mimeType } : {};
    
    mediaRecorder = new MediaRecorder(recordingDestination.stream, options);
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.start(100); // Collect data every 100ms
    isRecordingActive = true;
    recordingStartTime = ctx.currentTime;
    
    console.log('Recording started');
    return true;
    
  } catch (error) {
    console.error('Failed to start recording:', error);
    cleanup();
    return false;
  }
}

/**
 * Stop recording and return audio blob
 * @returns {Promise<Blob>}
 */
export async function stopRecording() {
  if (!isRecordingActive || !mediaRecorder) {
    console.warn('Not recording');
    return null;
  }
  
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    recordingDuration = ctx.currentTime - recordingStartTime;
    
    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || 'audio/webm';
      const blob = new Blob(recordedChunks, { type: mimeType });
      
      cleanup();
      console.log('Recording stopped, duration:', recordingDuration);
      resolve(blob);
    };
    
    mediaRecorder.stop();
    isRecordingActive = false;
  });
}

/**
 * Check if currently recording
 * @returns {boolean}
 */
export function isRecording() {
  return isRecordingActive;
}

/**
 * Get duration of last recording
 * @returns {number} Duration in seconds
 */
export function getRecordingDuration() {
  return recordingDuration;
}

/**
 * Play a recording blob
 * @param {Blob} blob - Audio blob to play
 */
export async function playRecording(blob) {
  // Stop any current playback
  stopPlayback();
  
  try {
    const ctx = getAudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    playbackSource = ctx.createBufferSource();
    playbackSource.buffer = audioBuffer;
    playbackSource.connect(ctx.destination);
    
    playbackSource.onended = () => {
      playbackSource = null;
    };
    
    playbackSource.start();
    console.log('Playing recording');
    
  } catch (error) {
    console.error('Failed to play recording:', error);
  }
}

/**
 * Stop playback of recording
 */
export function stopPlayback() {
  if (playbackSource) {
    try {
      playbackSource.stop();
    } catch (e) {
      // Ignore if already stopped
    }
    playbackSource = null;
  }
}

/**
 * Cleanup recording resources
 */
function cleanup() {
  // Disconnect nodes
  if (streamSource) {
    streamSource.disconnect();
    streamSource = null;
  }
  
  // Disconnect master from recording destination
  if (recordingDestination) {
    try {
      getMasterGain().disconnect(recordingDestination);
    } catch (e) {
      // Ignore if not connected
    }
    recordingDestination = null;
  }
  
  // Stop media stream tracks
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  
  mediaRecorder = null;
  recordedChunks = [];
}

/**
 * Check if recorder is available
 * @returns {boolean}
 */
export function isRecorderAvailable() {
  return isMediaRecorderSupported();
}
