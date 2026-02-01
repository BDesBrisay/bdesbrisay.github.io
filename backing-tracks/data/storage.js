/**
 * Storage utilities
 * IndexedDB for recordings, localStorage for preferences
 */

const DB_NAME = 'backing-tracks-db';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'recordings';
const PREFS_KEY = 'backing-tracks-prefs';

let db = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
async function initDB() {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB');
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Create recordings store
      if (!database.objectStoreNames.contains(RECORDINGS_STORE)) {
        const store = database.createObjectStore(RECORDINGS_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Generate unique ID
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Save a recording
 * @param {Object} recording - Recording data
 * @returns {Promise<string>} Recording ID
 */
export async function saveRecording(recording) {
  const database = await initDB();
  
  const data = {
    id: generateId(),
    name: recording.name || 'Untitled',
    audioBlob: recording.audioBlob,
    duration: recording.duration || 0,
    style: recording.style,
    key: recording.key,
    tempo: recording.tempo,
    progression: recording.progression,
    createdAt: Date.now()
  };
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.add(data);
    
    request.onsuccess = () => resolve(data.id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a recording by ID
 * @param {string} id - Recording ID
 * @returns {Promise<Object>}
 */
export async function getRecording(id) {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([RECORDINGS_STORE], 'readonly');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all recordings
 * @returns {Promise<Array>}
 */
export async function getAllRecordings() {
  try {
    const database = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([RECORDINGS_STORE], 'readonly');
      const store = transaction.objectStore(RECORDINGS_STORE);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // Newest first
      
      const recordings = [];
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Don't include blob in list for memory efficiency
          const { audioBlob, ...metadata } = cursor.value;
          recordings.push(metadata);
          cursor.continue();
        } else {
          resolve(recordings);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get recordings:', error);
    return [];
  }
}

/**
 * Delete a recording
 * @param {string} id - Recording ID
 * @returns {Promise<void>}
 */
export async function deleteRecording(id) {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([RECORDINGS_STORE], 'readwrite');
    const store = transaction.objectStore(RECORDINGS_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get user preferences from localStorage
 * @returns {Object}
 */
export function getPreferences() {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return {};
  }
}

/**
 * Save user preferences to localStorage
 * @param {Object} prefs - Preferences object
 */
export function savePreferences(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * Clear all data (for debugging/reset)
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  // Clear localStorage
  localStorage.removeItem(PREFS_KEY);
  
  // Clear IndexedDB
  if (db) {
    db.close();
    db = null;
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
