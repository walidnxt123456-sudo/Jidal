// 1. APP CONFIGURATION
export const APP = {
  NAME: 'JIDAL',
  DESCRIPTION: 'Create AI-powered dialogues.',
  VERSION: '1.0.0'
};

// 2. API ENDPOINTS
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  GET_DISCUSSIONS: '/api/get-discussions',
  INTERACTIONS: '/api/interactions',
  GET_COMMENTS: '/api/get-comments'
};

// 3. UI/UX CONSTANTS
export const UI = {
  // Guest options
  GUEST_OPTIONS: [
    'Elon Musk',
    'Donald Trump',
    'Aristotle', 
    'Nelson Mandela',
    'Julius Caesar'
  ],
  
  // Tone options  
  TONE_OPTIONS: [
    'Funny',
    'Serious',
    'Aggressive',
    'Academic',
    'Sarcastic',
    'Calm'
  ],
  
  // Pagination
  PAGINATION: {
    PAGE_SIZE: 10,
    INITIAL_PAGE: 1,
    LOAD_MORE_LIMIT: 10
  },
  
  // Feed
  FEED: {
    PREVIEW_LENGTH: 200,
    MAX_PREVIEW_HEIGHT: 100
  }
};

// 4. LOCAL STORAGE KEYS
export const STORAGE_KEYS = {
  DISCUSSIONS: 'directorsCutDiscussions'
};

// 5. MOCK DATA (for random generation)
export const MOCK_USERS = {
  NAMES: ['Alex Johnson', 'Taylor Swift', 'John Doe', 'Jane Smith', 'Mike Brown', 'Sarah Wilson'],
  HANDLES: ['@alexj', '@taylorswift', '@johndoe', '@janesmith', '@mikeb', '@sarahw'],
  AVATARS: ['A', 'T', 'J', 'J', 'M', 'S'],
  COLORS: ['#007bff', '#e0245e', '#28a745', '#ffc107', '#6f42c1', '#17a2b8']
};

// 6. ERROR MESSAGES
export const ERROR_MESSAGES = {
  CONNECTION: '❌ Connection Error',
  LOADING: 'Cannot load discussions',
  NO_CONTENT: 'No discussion content to save',
  VALIDATION: {
    NO_QUESTION: 'Enter a question',
    NO_GUEST_A: 'Enter Guest A',
    NO_GUEST_B: 'Enter Guest B',
    NO_TONE: 'Select a tone'
  }
};

// 7. COLOR PALETTE (from CSS)
export const COLORS = {
  PRIMARY: '#007bff',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
  LIGHT: '#f4f7f6',
  GRAY: '#6c757d'
};