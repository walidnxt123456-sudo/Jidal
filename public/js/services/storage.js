// public/js/services/storage.js

// We'll import constants later
// import { STORAGE_KEYS } from '../utils/constants.js';

export class StorageService {
  /**
   * Check if localStorage is available
   * @returns {boolean} True if available
   */
  static isLocalStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  /**
   * Get item from localStorage with fallback
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Stored value or default
   */
  static get(key, defaultValue = null) {
    if (!this.isLocalStorageAvailable()) {
      return defaultValue;
    }
    
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      // Try to parse as JSON, return as string if fails
      try {
        return JSON.parse(item);
      } catch (parseError) {
        return item;
      }
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} Success status
   */
  static set(key, value) {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }
    
    try {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      
      // Try to clear some space if quota exceeded
      if (error.name === 'QuotaExceededError') {
        this.clearOldItems();
        return this.set(key, value); // Retry
      }
      
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  static remove(key) {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all app-related items from localStorage
   * @returns {boolean} Success status
   */
  static clearAppData() {
    const prefix = 'directorsCut'; // Your app's prefix
    let success = true;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing app data:', error);
      success = false;
    }
    
    return success;
  }

  /**
   * Clear old items when storage is full
   * @private
   */
  static clearOldItems() {
    console.warn('Clearing old items due to storage limit');
    
    // Get all discussion keys
    const discussionsKey = 'directorsCutDiscussions';
    const discussions = this.get(discussionsKey, []);
    
    // Keep only the 5 most recent discussions
    if (discussions.length > 5) {
      const recentDiscussions = discussions.slice(0, 5);
      this.set(discussionsKey, recentDiscussions);
      console.log(`Cleared ${discussions.length - 5} old discussions`);
    }
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage stats
   */
  static getStorageStats() {
    if (!this.isLocalStorageAvailable()) {
      return { available: false };
    }
    
    try {
      let totalBytes = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        totalBytes += (key.length + value.length) * 2; // UTF-16
      }
      
      const totalMB = totalBytes / (1024 * 1024);
      const limitMB = 5; // Typical localStorage limit (5-10MB)
      const percentUsed = (totalMB / limitMB) * 100;
      
      return {
        available: true,
        totalBytes,
        totalMB: totalMB.toFixed(2),
        limitMB,
        percentUsed: percentUsed.toFixed(1),
        itemCount: localStorage.length
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { available: false, error: error.message };
    }
  }

  /**
   * Save discussion with automatic cleanup
   * @param {Object} discussion - Discussion data
   * @param {number} maxItems - Maximum items to keep
   * @returns {boolean} Success status
   */
  static saveDiscussion(discussion, maxItems = 10) {
    const key = 'directorsCutDiscussions';
    
    try {
      let discussions = this.get(key, []);
      
      // Add new discussion at the beginning
      discussions.unshift(discussion);
      
      // Keep only last N discussions
      if (discussions.length > maxItems) {
        discussions = discussions.slice(0, maxItems);
      }
      
      return this.set(key, discussions);
    } catch (error) {
      console.error('Error saving discussion to storage:', error);
      return false;
    }
  }

  /**
   * Load discussions from storage
   * @param {number} limit - Maximum number to return
   * @returns {Array} Discussions
   */
  static loadDiscussions(limit = 10) {
    const key = 'directorsCutDiscussions';
    const discussions = this.get(key, []);
    return discussions.slice(0, limit);
  }

  /**
   * Get a single discussion by ID
   * @param {string|number} id - Discussion ID
   * @returns {Object|null} Discussion or null
   */
  static getDiscussionById(id) {
    const discussions = this.loadDiscussions();
    return discussions.find(d => d.id == id) || null;
  }

  /**
   * Delete a discussion by ID
   * @param {string|number} id - Discussion ID
   * @returns {boolean} Success status
   */
  static deleteDiscussion(id) {
    const key = 'directorsCutDiscussions';
    let discussions = this.get(key, []);
    const initialLength = discussions.length;
    
    discussions = discussions.filter(d => d.id != id);
    
    if (discussions.length !== initialLength) {
      return this.set(key, discussions);
    }
    
    return false; // Nothing was deleted
  }
}

// Export singleton instance
export const storageService = new StorageService();

// For backward compatibility during migration
window.StorageService = StorageService;