// public/js/services/api.js

// We'll import constants later
// import { API_ENDPOINTS } from '../utils/constants.js';

export class ApiService {
  /**
   * Base fetch method with error handling
   * @param {string} url - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  static async fetch(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), defaultOptions.timeout);

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Create a new discussion (from sendQuestion function)
   * @param {Object} payload - Discussion data
   * @returns {Promise<Object>} Created discussion
   */
  static async createDiscussion(payload) {
    try {
      // This replaces the fetch in sendQuestion() line ~207
      const data = await this.fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  }

  /**
   * Fetch discussions with pagination and sorting
   * @param {number} page - Page number
   * @param {string} sort - Sort type ('popular' or 'newest')
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Discussions data
   */
  static async getDiscussions(page = 1, sort = 'popular', limit = 10) {
    try {
      // This replaces fetchDiscussions() function lines ~317-365
      const url = `/api/get-discussions?page=${page}&limit=${limit}&sort_by=${sort}`;
      const data = await this.fetch(url);
      return data;
    } catch (error) {
      console.error('Error fetching discussions:', error);
      // Return empty structure to match your current error handling
      return {
        success: false,
        discussions: [],
        pagination: { has_more: false, page: page, total: 0 }
      };
    }
  }

  /**
   * Test backend connection
   * @returns {Promise<boolean>} Connection status
   */
  static async testConnection() {
    try {
      // This replaces testBackendConnection() lines ~267-311
      const data = await this.fetch('/api/get-discussions?page=1&limit=5');
      return data.success === true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  /**
   * Handle discussion interactions (likes, comments, ratings)
   * @param {Object} interactionData - Interaction data
   * @returns {Promise<Object>} Interaction result
   */
  static async interact(interactionData) {
    try {
      // This replaces calls in toggleLike(), postComment(), rateDiscussion()
      const data = await this.fetch('/api/interactions', {
        method: 'POST',
        body: JSON.stringify(interactionData),
      });
      return data;
    } catch (error) {
      console.error('Error with interaction:', error);
      throw error;
    }
  }

  /**
   * Get comments for a discussion
   * @param {string|number} discussionId - Discussion ID
   * @returns {Promise<Object>} Comments data
   */
  static async getComments(discussionId) {
    try {
      const data = await this.fetch(`/api/get-comments?discussion_id=${discussionId}`);
      return data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Save discussion to backend (additional save if needed)
   * @param {Object} discussionData - Discussion data to save
   * @returns {Promise<Object>} Save result
   */
  static async saveDiscussion(discussionData) {
    try {
      // This would be for additional saving if your backend supports it
      // Currently your saveDiscussionToBackend() does nothing
      console.log('Discussion saved via chat API');
      return { success: true };
    } catch (error) {
      console.error('Error saving discussion:', error);
      throw error;
    }
  }
}

// Export singleton instance for easy access
export const apiService = new ApiService();

// For backward compatibility during migration
window.ApiService = ApiService;