// public/js/utils/events.js

export class EventManager {
  constructor() {
    this.handlers = new Map();
    this.setupGlobalListeners();
  }

  /**
   * Setup global event listeners
   */
  setupGlobalListeners() {
    // Single click listener for the entire app
    document.addEventListener('click', (event) => {
      this.handleClick(event);
    });

    // Single submit listener for forms
    document.addEventListener('submit', (event) => {
      this.handleSubmit(event);
    });

    // Keyboard shortcuts (from your app.js lines ~675-690)
    document.addEventListener('keydown', (event) => {
      this.handleKeydown(event);
    });

    // Infinite scroll (from your app.js lines ~665-675)
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });
  }

  /**
   * Handle all click events in the app
   * @param {Event} event - Click event
   */
  handleClick(event) {
    const target = event.target;
    
    // Handle ID-based clicks first (your current approach)
    if (target.id) {
      this.handleById(target.id, event);
      return;
    }

    // Handle data-action clicks (new approach)
    const actionElement = target.closest('[data-action]');
    if (actionElement) {
      const action = actionElement.getAttribute('data-action');
      const data = this.getActionData(actionElement);
      this.dispatchAction(action, data, event);
      return;
    }

    // Handle class-based clicks (for filter buttons)
    if (target.classList.contains('filter-btn')) {
      const sortType = target.getAttribute('data-sort');
      this.dispatchAction('change-sort', { sortType });
      event.preventDefault();
    }

    // Handle dynamically generated onclick handlers from renderDiscussionCard
    this.handleDynamicOnClick(target, event);
  }

  /**
   * Handle form submissions
   * @param {Event} event - Submit event
   */
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    if (form.id === 'talk-show-form') {
      this.dispatchAction('submit-discussion-form');
    }
  }

  /**
   * Handle keyboard shortcuts (from your app.js)
   */
  handleKeydown(event) {
    // Ctrl/Cmd + Enter to submit form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      const formView = document.getElementById('form-view');
      if (formView && formView.style.display !== 'none') {
        // Check if isGenerating exists (from your global variable)
        if (!window.isGenerating) {
          this.dispatchAction('quick-submit');
        }
      }
    }

    // Escape key to return home
    if (event.key === 'Escape') {
      const formView = document.getElementById('form-view');
      if (formView && formView.style.display !== 'none') {
        this.dispatchAction('escape-to-home');
      }
    }
  }

  /**
   * Handle infinite scroll (from your app.js)
   */
  handleScroll() {
    // Check if we should load more (recreate your logic)
    if (window.isLoading || !window.hasMore) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition >= pageHeight - 100) {
      this.dispatchAction('load-more-discussions');
    }
  }

  /**
   * Handle clicks by element ID (your current approach)
   */
  handleById(id, event) {
    const handlers = {
      'new-discussion-btn': () => {
        console.log('Generate New Discussion button clicked!');
        this.dispatchAction('show-form-view');
      },
      'load-more-btn': () => {
        this.dispatchAction('load-more-discussions');
      },
      'return-home-btn': () => {
        this.dispatchAction('return-to-home', { saveDiscussion: false });
      },
      // We'll add more as we refactor
    };

    if (handlers[id]) {
      handlers[id]();
      event.preventDefault();
    }
  }

  /**
   * Handle dynamically generated onclick handlers
   * These come from your renderDiscussionCard function
   */
  handleDynamicOnClick(element, event) {
    // Check if element or parent has onclick attribute with specific patterns
    const elementWithHandler = element.closest('[onclick*="toggleReadMore"]') || 
                              element.closest('[onclick*="toggleLike"]') ||
                              element.closest('[onclick*="toggleComments"]') ||
                              element.closest('[onclick*="shareDiscussion"]') ||
                              element.closest('[onclick*="rateDiscussion"]') ||
                              element.closest('[onclick*="postComment"]');

    if (!elementWithHandler) return;

    const onclickAttr = elementWithHandler.getAttribute('onclick');
    
    // Parse the onclick attribute to extract discussionId
    if (onclickAttr.includes('toggleReadMore')) {
      const match = onclickAttr.match(/toggleReadMore\((\d+)\)/);
      if (match) {
        this.dispatchAction('toggle-read-more', { discussionId: match[1] });
        event.preventDefault();
      }
    }
    else if (onclickAttr.includes('toggleLike')) {
      const match = onclickAttr.match(/toggleLike\((\d+)\)/);
      if (match) {
        this.dispatchAction('toggle-like', { discussionId: match[1] });
        event.preventDefault();
      }
    }
    // Add similar handlers for other functions
  }

  /**
   * Extract data from action element
   */
  getActionData(element) {
    const data = {};
    
    // Get all data-* attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-') && attr.name !== 'data-action') {
        const key = attr.name.replace('data-', '');
        data[key] = attr.value;
      }
    }

    // Get discussion ID from parent
    const discussionCard = element.closest('[data-id]');
    if (discussionCard) {
      data.discussionId = discussionCard.getAttribute('data-id');
    }

    return data;
  }

  /**
   * Dispatch action to registered handlers
   */
  dispatchAction(action, data = {}, event = null) {
    console.log(`[EventManager] Action: ${action}`, data);
    
    // Call global handler if it exists (for migration)
    if (window.handleAppAction) {
      window.handleAppAction(action, data, event);
    }

    // Call legacy functions during migration
    this.callLegacyFunction(action, data, event);

    // Call registered handlers
    if (this.handlers.has(action)) {
      this.handlers.get(action).forEach(handler => handler(data, event));
    }
  }

  /**
   * Call legacy functions during migration
   */
  callLegacyFunction(action, data, event) {
    const legacyMap = {
      'show-form-view': () => { if (window.showFormView) window.showFormView(); },
      'return-to-home': () => { 
        if (window.returnToHome) window.returnToHome(data.saveDiscussion || false); 
      },
      'load-more-discussions': () => { if (window.loadMoreDiscussions) window.loadMoreDiscussions(); },
      'change-sort': () => { if (window.changeSort) window.changeSort(data.sortType); },
      'submit-discussion-form': () => { if (window.sendQuestion) window.sendQuestion(); },
      'quick-submit': () => { if (window.sendQuestion) window.sendQuestion(); },
      'escape-to-home': () => { if (window.returnToHome) window.returnToHome(); },
      'toggle-read-more': () => { 
        if (window.toggleReadMore && data.discussionId) window.toggleReadMore(data.discussionId); 
      },
      'toggle-like': () => { 
        if (window.toggleLike && data.discussionId) window.toggleLike(data.discussionId); 
      },
      // Add more as we migrate functions
    };

    if (legacyMap[action]) {
      legacyMap[action]();
    }
  }

  /**
   * Register a handler for a specific action
   */
  on(action, handler) {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, []);
    }
    this.handlers.get(action).push(handler);
  }

  /**
   * Remove a handler
   */
  off(action, handler) {
    if (this.handlers.has(action)) {
      const handlers = this.handlers.get(action);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

// Create singleton instance
export const eventManager = new EventManager();

// Export for global access (temporary during migration)
window.eventManager = eventManager;