// public/js/state.js

// We'll import constants later
// import { UI } from './utils/constants.js';

export class AppState {
  constructor() {
    // Initial state matching your current globals
    this._state = {
      // Form state
      isGenerating: false,
      
      // Feed state
      discussions: [],
      currentPage: 1,
      currentSort: 'popular',
      isLoading: false,
      hasMore: true,
      
      // UI state
      currentView: 'home', // 'home' or 'form'
      formData: {
        guest_a: '',
        guest_b: '',
        tone: '',
        question: ''
      },
      
      // Interaction state
      likedDiscussions: new Set(), // Track which discussions user liked
      ratedDiscussions: new Map(), // Map of discussionId -> rating
      
      // System state
      backendConnected: false,
      lastError: null,
      lastUpdated: null
    };
    
    // Listeners for state changes
    this.listeners = new Set();
  }

  // ==================== GETTERS ====================

  /**
   * Get entire state (use sparingly)
   */
  getState() {
    return { ...this._state };
  }

  /**
   * Get specific state value
   */
  get(key) {
    return this._state[key];
  }

  /**
   * Get form data
   */
  getFormData() {
    return { ...this._state.formData };
  }

  /**
   * Check if discussion is liked
   */
  isLiked(discussionId) {
    return this._state.likedDiscussions.has(discussionId.toString());
  }

  /**
   * Get user's rating for discussion
   */
  getUserRating(discussionId) {
    return this._state.ratedDiscussions.get(discussionId.toString()) || 0;
  }

  // ==================== SETTERS ====================

  /**
   * Update state immutably
   */
  setState(updates) {
    const oldState = this._state;
    this._state = {
      ...oldState,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    this.notifyListeners(oldState, this._state);
    this.persistState();
    
    return this._state;
  }

  /**
   * Update specific state property
   */
  set(key, value) {
    return this.setState({ [key]: value });
  }

  /**
   * Update form data
   */
  setFormData(formData) {
    return this.setState({
      formData: {
        ...this._state.formData,
        ...formData
      }
    });
  }

  /**
   * Clear form data
   */
  clearFormData() {
    return this.setState({
      formData: {
        guest_a: '',
        guest_b: '',
        tone: '',
        question: ''
      }
    });
  }

  // ==================== STATE ACTIONS ====================

  /**
   * Show loading state
   */
  startLoading() {
    return this.setState({ isLoading: true });
  }

  /**
   * Hide loading state
   */
  stopLoading() {
    return this.setState({ isLoading: false });
  }

  /**
   * Start discussion generation
   */
  startGeneration() {
    return this.setState({ isGenerating: true });
  }

  /**
   * Stop discussion generation
   */
  stopGeneration() {
    return this.setState({ isGenerating: false });
  }

  /**
   * Add discussions to feed
   */
  addDiscussions(newDiscussions, reset = false) {
    const discussions = reset 
      ? [...newDiscussions]
      : [...this._state.discussions, ...newDiscussions];
    
    return this.setState({ discussions });
  }

  /**
   * Update pagination
   */
  updatePagination(hasMore, page = null) {
    const updates = { hasMore };
    if (page !== null) {
      updates.currentPage = page;
    }
    return this.setState(updates);
  }

  /**
   * Change sort type
   */
  changeSort(sortType) {
    return this.setState({
      currentSort: sortType,
      currentPage: 1,
      discussions: [] // Clear for reload
    });
  }

  /**
   * Toggle like on discussion
   */
  toggleLike(discussionId) {
    const likedDiscussions = new Set(this._state.likedDiscussions);
    const discussionIdStr = discussionId.toString();
    
    if (likedDiscussions.has(discussionIdStr)) {
      likedDiscussions.delete(discussionIdStr);
    } else {
      likedDiscussions.add(discussionIdStr);
    }
    
    return this.setState({ likedDiscussions });
  }

  /**
   * Set rating for discussion
   */
  setRating(discussionId, stars) {
    const ratedDiscussions = new Map(this._state.ratedDiscussions);
    ratedDiscussions.set(discussionId.toString(), stars);
    
    return this.setState({ ratedDiscussions });
  }

  /**
   * Change current view
   */
  setView(view) {
    if (!['home', 'form'].includes(view)) {
      console.error('Invalid view:', view);
      return this._state;
    }
    
    return this.setState({ currentView: view });
  }

  /**
   * Set backend connection status
   */
  setBackendConnected(connected) {
    return this.setState({ backendConnected: connected });
  }

  /**
   * Set error
   */
  setError(error) {
    return this.setState({ 
      lastError: error?.message || String(error),
      isLoading: false,
      isGenerating: false
    });
  }

  /**
   * Clear error
   */
  clearError() {
    return this.setState({ lastError: null });
  }

  /**
   * Reset state to initial
   */
  reset() {
    const oldState = this._state;
    this._state = {
      ...this._state,
      isGenerating: false,
      discussions: [],
      currentPage: 1,
      currentSort: 'popular',
      isLoading: false,
      hasMore: true,
      currentView: 'home',
      formData: {
        guest_a: '',
        guest_b: '',
        tone: '',
        question: ''
      },
      lastError: null,
      lastUpdated: new Date().toISOString()
    };
    
    // Keep liked/rated discussions
    // Keep backendConnected status
    
    this.notifyListeners(oldState, this._state);
    this.persistState();
    
    return this._state;
  }

  // ==================== PERSISTENCE ====================

  /**
   * Persist state to localStorage
   */
  persistState() {
    try {
      // Only persist certain parts of state
      const stateToPersist = {
        likedDiscussions: Array.from(this._state.likedDiscussions),
        ratedDiscussions: Array.from(this._state.ratedDiscussions.entries()),
        currentSort: this._state.currentSort,
        lastUpdated: this._state.lastUpdated
      };
      
      if (typeof StorageService !== 'undefined') {
        StorageService.set('appState', stateToPersist);
      } else {
        localStorage.setItem('appState', JSON.stringify(stateToPersist));
      }
    } catch (error) {
      console.warn('Could not persist state:', error);
    }
  }

  /**
   * Restore state from localStorage
   */
  restoreState() {
    try {
      let savedState;
      
      if (typeof StorageService !== 'undefined') {
        savedState = StorageService.get('appState', {});
      } else {
        savedState = JSON.parse(localStorage.getItem('appState') || '{}');
      }
      
      if (savedState.likedDiscussions) {
        this._state.likedDiscussions = new Set(savedState.likedDiscussions);
      }
      
      if (savedState.ratedDiscussions) {
        this._state.ratedDiscussions = new Map(savedState.ratedDiscussions);
      }
      
      if (savedState.currentSort) {
        this._state.currentSort = savedState.currentSort;
      }
      
      console.log('State restored from storage');
      return true;
    } catch (error) {
      console.warn('Could not restore state:', error);
      return false;
    }
  }

  // ==================== LISTENERS ====================

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(oldState, newState) {
    this.listeners.forEach(listener => {
      try {
        listener(oldState, newState);
      } catch (error) {
        console.error('State listener error:', error);
      }
    });
  }

  // ==================== DEBUG ====================

  /**
   * Log state for debugging
   */
  logState() {
    console.group('App State');
    console.log('Current View:', this._state.currentView);
    console.log('Discussions:', this._state.discussions.length);
    console.log('Page:', this._state.currentPage, 'Sort:', this._state.currentSort);
    console.log('Loading:', this._state.isLoading, 'Generating:', this._state.isGenerating);
    console.log('Has More:', this._state.hasMore);
    console.log('Liked:', this._state.likedDiscussions.size, 'Rated:', this._state.ratedDiscussions.size);
    console.log('Backend Connected:', this._state.backendConnected);
    console.groupEnd();
  }
}

// Create and export singleton instance
export const appState = new AppState();

// For backward compatibility during migration
window.AppState = AppState;
window.appState = appState; // Global access during migration