// public/js/services/discussions.js

// We'll import utilities later
// import { formatRelativeTime, generateRandomUser } from '../utils/helpers.js';
// import { MOCK_USERS, UI } from '../utils/constants.js';

export class DiscussionService {
  /**
   * Format discussion data for display
   * @param {Object} discussion - Raw discussion data from API
   * @returns {Object} Formatted discussion
   */
  static formatDiscussion(discussion) {
    return {
      id: discussion.id || Date.now(),
      guest1: discussion.guest1 || discussion.guest_a || 'Guest A',
      guest2: discussion.guest2 || discussion.guest_b || 'Guest B',
      topic: discussion.topic || discussion.question || 'Untitled discussion',
      tone: discussion.tone || 'Unknown',
      response: discussion.response || discussion.output || 'No content available',
      stars: parseFloat(discussion.stars) || 0,
      likes: discussion.likes || 0,
      comments: discussion.comments || 0,
      created_at: discussion.created_at || new Date().toISOString(),
      type: discussion.type || 'Dialogue'
    };
  }

  /**
   * Generate HTML for a discussion card
   * @param {Object} discussion - Discussion data
   * @returns {string} HTML string
   */
  static renderDiscussionCard(discussion) {
    // We'll move the full implementation from app.js later
    // For now, just a placeholder
    console.log('Rendering discussion card for:', discussion.id);
    
    // This will replace your renderDiscussionCard() function
    // We'll implement it step by step
    return `<div>Discussion ${discussion.id}</div>`;
  }

  /**
   * Prepare discussion data for localStorage
   * @param {Object} discussion - Discussion data
   * @returns {Object} Prepared discussion for storage
   */
  static prepareForStorage(guestA, guestB, topic, tone, content) {
    const discussion = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      guestA: guestA || 'Guest A',
      guestB: guestB || 'Guest B',
      topic: topic || 'Untitled discussion',
      tone: tone || 'Unknown',
      content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      fullContent: content
    };
    
    return discussion;
  }

  /**
   * Save discussion to localStorage
   * @param {Object} discussion - Discussion data
   * @param {number} maxItems - Maximum items to keep
   */
 static saveToLocalStorage(discussion, maxItems = 10) {
  try {
    // Use StorageService instead of direct localStorage
    return StorageService.saveDiscussion(discussion, maxItems);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

  /**
   * Load discussions from localStorage
   * @param {number} limit - Maximum number to return
   * @returns {Array} Discussions
   */
  static loadFromLocalStorage(limit = 10) {
    try {
      const key = 'directorsCutDiscussions';
      const discussions = JSON.parse(localStorage.getItem(key) || '[]');
      return discussions.slice(0, limit);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  /**
   * Validate discussion form inputs
   * @param {Object} formData - Form data
   * @returns {Object} Validation result
   */
  static validateDiscussionForm(formData) {
    const errors = [];
    
    if (!formData.question || formData.question.trim() === '') {
      errors.push('Enter a question');
    }
    if (!formData.guest_a || formData.guest_a.trim() === '') {
      errors.push('Enter Guest A');
    }
    if (!formData.guest_b || formData.guest_b.trim() === '') {
      errors.push('Enter Guest B');
    }
    if (!formData.tone || formData.tone.trim() === '') {
      errors.push('Select a tone');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Prepare payload for API submission
   * @param {Object} formData - Form data
   * @returns {Object} API payload
   */
  static prepareSubmissionPayload(formData) {
    return {
      question: formData.question.trim(),
      guest_a: formData.guest_a.trim(),
      guest_b: formData.guest_b.trim(),
      tone: formData.tone
    };
  }

  /**
   * Check if response content is valid for saving
   * @param {string} response - Response content
   * @returns {boolean} True if content is valid
   */
  static isValidResponseContent(response) {
    if (!response) return false;
    
    const invalidPatterns = [
      'Set your cast and topic above',
      'Loading live feed',
      'spinner',
      '❌ Connection Error'
    ];
    
    return !invalidPatterns.some(pattern => response.includes(pattern));
  }

  /**
   * Get feed statistics
   * @param {Array} discussions - Discussions array
   * @returns {Object} Statistics
   */
  static getFeedStats(discussions) {
    return {
      total: discussions.length,
      totalLikes: discussions.reduce((sum, d) => sum + (d.likes || 0), 0),
      totalComments: discussions.reduce((sum, d) => sum + (d.comments || 0), 0),
      averageRating: discussions.length > 0 
        ? (discussions.reduce((sum, d) => sum + (parseFloat(d.stars) || 0), 0) / discussions.length).toFixed(1)
        : 0
    };
  }
}

// Export singleton instance
export const discussionService = new DiscussionService();

// For backward compatibility during migration
window.DiscussionService = DiscussionService;