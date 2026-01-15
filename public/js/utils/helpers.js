// public/js/utils/helpers.js

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) return `${diffDay}d`;
  if (diffHour > 0) return `${diffHour}h`;
  if (diffMin > 0) return `${diffMin}m`;
  return 'Just now';
}

/**
 * Generate random user data for mock discussions
 * @returns {Object} User object with name, handle, avatar, color
 */
export function generateRandomUser() {
  // We'll update this later to use constants
  const names = ['Alex Johnson', 'Taylor Swift', 'John Doe', 'Jane Smith'];
  const handles = ['@alexj', '@taylorswift', '@johndoe', '@janesmith'];
  const avatars = ['A', 'T', 'J', 'J'];
  const colors = ['#007bff', '#e0245e', '#28a745', '#ffc107'];
  
  const index = Math.floor(Math.random() * names.length);
  return {
    name: names[index],
    handle: handles[index],
    avatar: avatars[index],
    color: colors[index]
  };
}

/**
 * Show loading state in UI
 * @param {string} elementId - ID of element to show loading state
 */
export function showLoadingState(elementId = 'load-more-btn') {
  const element = document.getElementById(elementId);
  if (element) {
    element.disabled = true;
    element.innerHTML = '<div class="spinner small"></div> Loading...';
  }
}

/**
 * Hide loading state in UI
 * @param {string} elementId - ID of element to hide loading state
 */
export function hideLoadingState(elementId = 'load-more-btn') {
  const element = document.getElementById(elementId);
  if (element) {
    element.disabled = false;
    element.textContent = 'Load More Discussions';
  }
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text with ellipsis if too long
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Check if string is empty or whitespace
 * @param {string} str - String to check
 * @returns {boolean} True if empty/whitespace
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Generate a unique ID based on timestamp
 * @returns {number} Unique ID
 */
export function generateUniqueId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}