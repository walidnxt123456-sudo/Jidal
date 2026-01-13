// ============================================
// GLOBAL VARIABLES
// ============================================
let isGenerating = false;
let discussions = [];
let currentPage = 1;
let currentSort = 'popular';
let isLoading = false;
let hasMore = true;

// ============================================
// VIEW MANAGEMENT FUNCTIONS
// ============================================

// Show the home view (with history)
function showHomeView() {
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('form-view').style.display = 'none';
    document.querySelector('.app-header p').style.display = 'block';
    
    // Reset form view state
    resetFormView();
    
    // Hide the response buttons
    toggleResponseButtons(false);
    
    // Refresh the feed to show any new discussions
    loadDiscussionsFeed(true);
}


// Show the form view (for creating new discussion)
function showFormView() {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('form-view').style.display = 'block';
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById('guest_a').focus();
    }, 100);
}


// Save discussion to backend API
async function saveDiscussionToBackend(guestA, guestB, topic, tone, content) {
    try {
        // Note: Your discussion is already saved via /api/chat
        // This is just for additional saving if needed
        console.log('Discussion already saved via chat API');
    } catch (error) {
        console.error('Error saving to backend:', error);
    }
}

// Function to save the current discussion
async function saveCurrentDiscussion() {
    const response = document.getElementById('response').textContent;
    const guest_a = document.getElementById('guest_a').value;
    const guest_b = document.getElementById('guest_b').value;
    const question = document.getElementById('question').value;
    const tone = document.getElementById('tone').value;
    
    // Check if there's actual content
    const hasContent = response && 
        response !== 'Set your cast and topic above, then hit \'Start Discussion\'!' && 
        response !== 'Loading live feed...' &&
        !response.includes('spinner') &&
        !response.includes('❌ Connection Error');
    
    if (!hasContent) {
        alert('No discussion content to save. Please generate a discussion first.');
        return false;
    }
    
    try {
        console.log('Saving discussion to backend...');
        
        // Save to backend API
        const saved = await saveDiscussionToBackend(guest_a, guest_b, question, tone, response);
        
        // Save to localStorage for immediate display
        saveToLocalStorage(guest_a, guest_b, question, tone, response);
        
        // Refresh the feed to show the new discussion
        loadDiscussionsFeed(true);
        
        alert('Discussion saved successfully!');
        return true;
        
    } catch (error) {
        console.error('Error saving discussion:', error);
        alert('Error saving discussion. Please try again.');
        return false;
    }
}


// Save a discussion to localStorage for immediate display
function saveToLocalStorage(guestA, guestB, topic, tone, content) {
    try {
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
        
        // Get existing discussions from localStorage
        let discussions = JSON.parse(localStorage.getItem('directorsCutDiscussions') || '[]');
        
        // Add new discussion at the beginning
        discussions.unshift(discussion);
        
        // Keep only last 10 discussions
        if (discussions.length > 10) {
            discussions = discussions.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('directorsCutDiscussions', JSON.stringify(discussions));
        
        console.log('Saved to localStorage:', discussion);
        
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}


// Reset the form view to initial state
function resetFormView() {
    document.getElementById('talk-show-form').reset();
    document.getElementById('response').textContent = 'Set your cast and topic above, then hit \'Start Discussion\'!';
    
    // Reset button states
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Start Discussion';
    isGenerating = false;
    
    // Remove form slide-up class if present
    const form = document.getElementById('talk-show-form');
    form.classList.remove('form-slide-up');
    form.style.zIndex = 2;
    
    // Hide the response buttons
    toggleResponseButtons(false);
}

// Return to home (from form view)
// saveDiscussion: boolean - whether to save the discussion before returning
function returnToHome(saveDiscussion = false) {
    const response = document.getElementById('response').textContent;
    const guest_a = document.getElementById('guest_a').value;
    const guest_b = document.getElementById('guest_b').value;
    const question = document.getElementById('question').value;
    const tone = document.getElementById('tone').value;
    
    // Check if there's actual response content (not the default/loading message)
    const hasContent = response && 
        response !== 'Set your cast and topic above, then hit \'Start Discussion\'!' && 
        response !== 'Loading live feed...' &&
        !response.includes('spinner') &&
        !response.includes('❌ Connection Error');
    
    // Only save if requested AND there's actual content
    if (saveDiscussion && hasContent) {
        console.log('Saving discussion before returning home...');
        
        // Save to backend API
        saveDiscussionToBackend(guest_a, guest_b, question, tone, response);
        
        // Also save to localStorage for immediate display
        saveToLocalStorage(guest_a, guest_b, question, tone, response);
        
        // Show confirmation message
        alert('Discussion saved successfully!');
    } else if (saveDiscussion && !hasContent) {
        // If user tries to save but there's no content
        alert('No discussion content to save. Please generate a discussion first.');
        return; // Don't return to home
    }
    
    // Return to home view
    showHomeView();
}

// ============================================
// FORM SUBMISSION & API FUNCTIONS
// ============================================

// Helper function to show/hide the response buttons
function toggleResponseButtons(isVisible) {
    const buttonsContainer = document.querySelector('.response-buttons');
    if (buttonsContainer) {
        buttonsContainer.style.display = isVisible ? 'flex' : 'none';
    }
}

// Update triggerSlide to use it:
function triggerSlide() {
    const form = document.getElementById('talk-show-form');
    
    // Set z-index low as we hide it
    form.style.zIndex = 0; 
    form.classList.add('form-slide-up');
    
    // Hide the descriptive text in the header
    document.querySelector('.app-header p').style.display = 'none';
    
    // Show the response buttons
    toggleResponseButtons(true);
}

async function sendQuestion() {
    // Prevent multiple submissions
    if (isGenerating) {
        alert('Please wait for the current discussion to complete.');
        return;
    }
    
    const question = document.getElementById('question').value;
    if (!question) return alert('Enter a question');
    const guest_a = document.getElementById('guest_a').value;
    if (!guest_a) return alert('Enter Guest A');
    const guest_b = document.getElementById('guest_b').value;
    if (!guest_b) return alert('Enter Guest B');
    const tone = document.getElementById('tone').value;
    if (!tone) return alert('Select a tone');

    // Set generating state
    isGenerating = true;
    
    // Update button to show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Setting Stage...';

    // 1. Trigger the visual slide-up animation
    triggerSlide();
    
    // 2. Show loading animation in response area
    document.getElementById('response').innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p class="loading-text">Setting the stage for <strong>${guest_a}</strong> and <strong>${guest_b}</strong>...</p>
            <p class="loading-subtitle">Topic: "${question}"</p>
            <p class="loading-subtitle">Tone: ${tone}</p>
        </div>
    `;
    
    // 3. Wait for animation
    await new Promise(r => setTimeout(r, 200)); 
    
    const payload = {
        question,
        guest_a,
        guest_b,
        tone,
    };

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        // Show the AI text
        document.getElementById('response').textContent = data.output;
        
        // Auto-scroll to response
        document.querySelector('.response-area').scrollIntoView({ behavior: 'smooth' });
        
    } catch (err) {
        document.getElementById('response').innerHTML = `
            <div class="error-message">
                ❌ Connection Error<br>
                <small>${err.message}</small><br>
                <small>Please try again or check your connection.</small>
            </div>
        `;
    } finally {
        // Always reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Start Discussion';
        isGenerating = false;
    }
}

// Save a discussion (now saves to database via API)
async function saveDiscussion(guestA, guestB, topic, tone, content) {
    try {
        // Note: Your backend already saves discussions via the /api/chat endpoint
        // So we don't need to save separately here
        console.log('Discussion saved to database via API');
        
        // Just refresh the feed to show the new discussion
        setTimeout(() => {
            loadDiscussionsFeed(true);
        }, 1000);
        
    } catch (error) {
        console.error('Error in saveDiscussion:', error);
    }
}

// ============================================
// SOCIAL MEDIA FEED FUNCTIONS
// ============================================

// Generate random user data (temporary - replace with real user data later)
function generateRandomUser() {
    const names = ['Alex Johnson', 'Taylor Swift', 'John Doe', 'Jane Smith', 'Mike Brown', 'Sarah Wilson'];
    const handles = ['@alexj', '@taylorswift', '@johndoe', '@janesmith', '@mikeb', '@sarahw'];
    const avatars = ['A', 'T', 'J', 'J', 'M', 'S'];
    const colors = ['#007bff', '#e0245e', '#28a745', '#ffc107', '#6f42c1', '#17a2b8'];
    
    const index = Math.floor(Math.random() * names.length);
    return {
        name: names[index],
        handle: handles[index],
        avatar: avatars[index],
        color: colors[index]
    };
}

// Format date to relative time (e.g., "2 hours ago")
function formatRelativeTime(dateString) {
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

// Test backend connection
async function testBackendConnection() {
    console.log('Testing backend connection...');
    console.log('Current URL:', window.location.origin);
    
    try {
        // Test get-discussions endpoint
        console.log('Fetching from:', '/api/get-discussions?page=1&limit=5');
        const response = await fetch('/api/get-discussions?page=1&limit=5');
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Backend response:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log(`✓ Backend connected! Found ${data.discussions.length} discussions`);
            if (data.discussions.length > 0) {
                console.log('Sample discussion:', data.discussions[0]);
            }
            return true;
        } else {
            console.error('✗ Backend error:', data.error);
            return false;
        }
        
    } catch (error) {
        console.error('✗ Backend connection failed:', error);
        console.error('Error details:', error.message);
        
        // Show error in UI
        const feedContent = document.getElementById('feed-content');
        if (feedContent) {
            feedContent.innerHTML = `
                <div class="error-message" style="margin: 20px;">
                    ❌ Backend Connection Error<br>
                    <small>${error.message}</small><br>
                    <small>Please check:</small><br>
                    <small>1. Server is running</small><br>
                    <small>2. API endpoints are deployed</small><br>
                    <small>3. Database is connected</small>
                    <br><br>
                    <button onclick="testBackendConnection()" style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px;">
                        Retry Connection
                    </button>
                </div>
            `;
        }
        return false;
    }
}

// Fetch discussions from backend
async function fetchDiscussions(page = 1, sort = 'popular') {
    if (isLoading) return { discussions: [], pagination: { has_more: false } };
    
    isLoading = true;
    showLoadingState();
    
    try {
        console.log(`Fetching discussions: page=${page}, sort=${sort}`);
        const response = await fetch(`/api/get-discussions?page=${page}&limit=10&sort_by=${sort}`);
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Backend response data:', data);
        
        hideLoadingState();
        return data;
        
    } catch (error) {
        console.error('Network error fetching discussions:', error);
        hideLoadingState();
        
        // Show error to user only on first page
        if (page === 1) {
            const feedContent = document.getElementById('feed-content');
            if (feedContent) {
                feedContent.innerHTML = `
                    <div class="error-message" style="margin: 20px;">
                        ❌ Cannot load discussions<br>
                        <small>${error.message}</small><br>
                        <small>Backend API may not be available.</small>
                    </div>
                `;
            }
        }
        
        // Return empty data structure
        return {
            success: false,
            discussions: [],
            pagination: { has_more: false, page: page, total: 0 }
        };
    } finally {
        isLoading = false;
    }
}

// Show loading state
function showLoadingState() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<div class="spinner small"></div> Loading...';
    }
}

// Hide loading state
function hideLoadingState() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.textContent = 'Load More Discussions';
    }
}

// Render a single discussion card
function renderDiscussionCard(discussion) {
    // For now, generate random user data until we have real user data
    const user = generateRandomUser();
    const relativeTime = formatRelativeTime(discussion.created_at || new Date().toISOString());
    
    // Format discussion content
    const previewLength = 200;
    const fullContent = discussion.response || 'No content available';
    const preview = fullContent.length > previewLength 
        ? fullContent.substring(0, previewLength) + '...' 
        : fullContent;
    const isLong = fullContent.length > previewLength;
    
    // Generate star rating HTML
    const stars = parseFloat(discussion.stars) || 0;
    const starRating = Array(5).fill('').map((_, i) => {
        const starValue = i + 1;
        const starClass = starValue <= Math.round(stars) ? 'filled' : 'empty';
        return `<span class="star ${starClass}" data-value="${starValue}">★</span>`;
    }).join('');
    
    // Get interaction counts
    const likes = discussion.likes || 0;
    const comments = discussion.comments || 0;
    
    return `
        <div class="discussion-card" data-id="${discussion.id}">
            <div class="card-header">
                <div class="user-avatar" style="background: ${user.color}">
                    ${user.avatar}
                </div>
                <div class="user-info">
                    <div class="user-name">
                        ${user.name}
                        <span class="user-handle">${user.handle}</span>
                    </div>
                    <div class="post-meta">
                        <span class="post-time">🕒 ${relativeTime}</span>
                        <span>•</span>
                        <span class="post-tone">🎭 ${discussion.tone || 'Unknown'}</span>
                        <span>•</span>
                        <span class="post-type">${discussion.type || 'Dialogue'}</span>
                    </div>
                </div>
            </div>
            
            <div class="card-content">
                <div class="discussion-guests">
                    ${discussion.guest1} 🤝 ${discussion.guest2}
                </div>
                
                <div class="discussion-topic">
                    "${discussion.topic || 'Untitled discussion'}"
                </div>
                
                <div class="discussion-preview" id="preview-${discussion.id}">
                    ${preview}
                    ${isLong ? '<span class="read-more" onclick="toggleReadMore(' + discussion.id + ')">Read more</span>' : ''}
                </div>
                
                <div class="card-stats">
                    <div class="stat-item like-stat" onclick="toggleLike(${discussion.id})" data-liked="false">
                        <span>❤️</span>
                        <span class="stat-count">${likes}</span>
                    </div>
                    <div class="stat-item comment-stat" onclick="toggleComments(${discussion.id})">
                        <span>💬</span>
                        <span class="stat-count">${comments}</span>
                    </div>
                    <div class="stat-item">
                        <span>🔗</span>
                        <span class="stat-count" onclick="shareDiscussion(${discussion.id})">Share</span>
                    </div>
                </div>
                
                <div class="star-rating">
                    <div class="stars" onclick="rateDiscussion(${discussion.id}, event)">
                        ${starRating}
                    </div>
                    <div class="average-rating">
                        ${stars > 0 ? stars.toFixed(1) : '0.0'} ⭐
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="action-btn like-btn" onclick="toggleLike(${discussion.id})">
                        ❤️ Like
                    </button>
                    <button class="action-btn comment-btn" onclick="toggleComments(${discussion.id})">
                        💬 Comment
                    </button>
                    <button class="action-btn share-btn" onclick="shareDiscussion(${discussion.id})">
                        🔗 Share
                    </button>
                </div>
                
                <div class="comments-section" id="comments-${discussion.id}">
                    <div class="comment-input">
                        <input type="text" placeholder="Add a comment..." id="comment-input-${discussion.id}">
                        <button onclick="postComment(${discussion.id})">Post</button>
                    </div>
                    <div class="comments-list" id="comments-list-${discussion.id}">
                        <!-- Comments will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load and display discussions
async function loadDiscussionsFeed(reset = false) {
    console.log('loadDiscussionsFeed called, reset:', reset);
    
    const feedContent = document.getElementById('feed-content');
    const noDiscussions = document.getElementById('no-discussions');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (!feedContent) {
        console.error('ERROR: feed-content element not found!');
        return;
    }
    
    if (reset) {
        currentPage = 1;
        feedContent.innerHTML = `
            <div class="loading-feed">
                <div class="spinner"></div>
                <p>Loading discussions...</p>
            </div>
        `;
    }
    
    try {
        const data = await fetchDiscussions(currentPage, currentSort);
        console.log('Received data:', data);
        
        // Safely extract data
        const discussions = data.discussions || [];
        const pagination = data.pagination || { has_more: false };
        
        if (reset) {
            feedContent.innerHTML = '';
        }
        
        // Show appropriate message
        if (discussions.length === 0 && currentPage === 1) {
            feedContent.innerHTML = '';
            if (noDiscussions) noDiscussions.style.display = 'block';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }
        
        if (noDiscussions) noDiscussions.style.display = 'none';
        
        // Render each discussion
        discussions.forEach(discussion => {
            feedContent.innerHTML += renderDiscussionCard(discussion);
        });
        
        // Update pagination
        hasMore = pagination.has_more || false;
        if (loadMoreContainer) {
            loadMoreContainer.style.display = hasMore ? 'block' : 'none';
        }
        
    } catch (error) {
        console.error('Error in loadDiscussionsFeed:', error);
        feedContent.innerHTML = `
            <div class="error-message" style="margin: 20px;">
                ❌ Unexpected error loading discussions<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Load more discussions
async function loadMoreDiscussions() {
    if (isLoading || !hasMore) return;
    
    currentPage++;
    await loadDiscussionsFeed(false);
}

// Toggle read more/less
function toggleReadMore(discussionId) {
    const preview = document.getElementById(`preview-${discussionId}`);
    const isExpanded = preview.classList.contains('expanded');
    
    if (isExpanded) {
        preview.classList.remove('expanded');
        preview.querySelector('.read-more').textContent = 'Read more';
    } else {
        preview.classList.add('expanded');
        preview.querySelector('.read-more').textContent = 'Read less';
    }
}

// Toggle like
async function toggleLike(discussionId) {
    const likeBtn = document.querySelector(`[data-id="${discussionId}"] .like-btn`);
    const likeStat = document.querySelector(`[data-id="${discussionId}"] .like-stat`);
    const likeCount = likeStat.querySelector('.stat-count');
    
    const isLiked = likeBtn.classList.contains('liked');
    
    try {
        const response = await fetch('/api/interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'like',
                discussion_id: discussionId,
                user_id: 'anonymous' // TODO: Replace with real user ID when auth is implemented
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update UI based on backend response
            if (data.liked) {
                likeBtn.classList.add('liked');
                likeStat.classList.add('liked');
                likeBtn.innerHTML = '❤️ Liked';
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
            } else {
                likeBtn.classList.remove('liked');
                likeStat.classList.remove('liked');
                likeBtn.innerHTML = '❤️ Like';
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        } else {
            console.error('Error toggling like:', data.error);
            alert('Failed to like/unlike discussion');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please try again.');
    }
}

// Toggle comments section
function toggleComments(discussionId) {
    const commentsSection = document.getElementById(`comments-${discussionId}`);
    const isVisible = commentsSection.classList.contains('show');
    
    if (isVisible) {
        commentsSection.classList.remove('show');
    } else {
        commentsSection.classList.add('show');
        // Load comments if not loaded
        loadComments(discussionId);
    }
}

// Load comments
async function loadComments(discussionId) {
    const commentsList = document.getElementById(`comments-list-${discussionId}`);
    
    try {
        const response = await fetch(`/api/get-comments?discussion_id=${discussionId}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.comments.length === 0) {
                commentsList.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No comments yet. Be the first to comment!</p>';
            } else {
                commentsList.innerHTML = data.comments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-author">${comment.user_id || 'Anonymous'}</div>
                        <div class="comment-text">${comment.content}</div>
                        <div class="comment-time">${formatRelativeTime(comment.created_at)}</div>
                    </div>
                `).join('');
            }
        } else {
            console.error('Error loading comments:', data.error);
            commentsList.innerHTML = '<p style="text-align: center; color: #dc3545; padding: 20px;">Failed to load comments</p>';
        }
    } catch (error) {
        console.error('Network error:', error);
        commentsList.innerHTML = '<p style="text-align: center; color: #dc3545; padding: 20px;">Network error loading comments</p>';
    }
}

// Post comment
async function postComment(discussionId) {
    const input = document.getElementById(`comment-input-${discussionId}`);
    const comment = input.value.trim();
    
    if (!comment) return;
    
    try {
        const response = await fetch('/api/interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'comment',
                discussion_id: discussionId,
                user_id: 'anonymous', // TODO: Replace with real user ID when auth is implemented
                content: comment
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Add comment to UI
            const commentsList = document.getElementById(`comments-list-${discussionId}`);
            const now = new Date();
            const newComment = `
                <div class="comment-item">
                    <div class="comment-author">Anonymous</div>
                    <div class="comment-text">${comment}</div>
                    <div class="comment-time">Just now</div>
                </div>
            `;
            commentsList.innerHTML = newComment + commentsList.innerHTML;
            
            // Update comment count
            const commentStat = document.querySelector(`[data-id="${discussionId}"] .comment-stat .stat-count`);
            commentStat.textContent = parseInt(commentStat.textContent) + 1;
            
            // Clear input
            input.value = '';
        } else {
            console.error('Error posting comment:', data.error);
            alert('Failed to post comment');
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please try again.');
    }
}

// Rate discussion
async function rateDiscussion(discussionId, event) {
    if (event.target.classList.contains('star')) {
        const stars = parseInt(event.target.getAttribute('data-value'));
        
        try {
            const response = await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'rate',
                    discussion_id: discussionId,
                    user_id: 'anonymous', // TODO: Replace with real user ID when auth is implemented
                    stars: stars
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update star display
                const starsContainer = event.currentTarget;
                starsContainer.querySelectorAll('.star').forEach((star, index) => {
                    if (index < stars) {
                        star.classList.remove('empty');
                        star.classList.add('filled');
                    } else {
                        star.classList.remove('filled');
                        star.classList.add('empty');
                    }
                });
                
                // In a real app, you might want to fetch updated average from backend
                // For now, we'll update the display optimistically
                const averageRating = document.querySelector(`[data-id="${discussionId}"] .average-rating`);
                
                // Get current average and adjust based on new rating
                // This is a simplified calculation - in real app, fetch from backend
                const currentAvg = parseFloat(averageRating.textContent) || 0;
                const newAvg = ((currentAvg + stars) / 2).toFixed(1);
                averageRating.textContent = `${newAvg} ⭐`;
            } else {
                console.error('Error rating discussion:', data.error);
                alert('Failed to rate discussion');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. Please try again.');
        }
    }
}

// Share discussion
function shareDiscussion(discussionId) {
    const shareUrl = `${window.location.origin}/discussion/${discussionId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out this AI dialogue!',
            text: 'An amazing AI-generated discussion',
            url: shareUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// Change sort filter
function changeSort(sortType) {
    if (sortType === currentSort) return;
    
    currentSort = sortType;
    currentPage = 1;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.filter-btn[data-sort="${sortType}"]`).classList.add('active');
    
    // Reload discussions
    loadDiscussionsFeed(true);
}

// ============================================
// OLD LOCALSTORAGE FUNCTIONS (for compatibility)
// ============================================

// Load discussions from localStorage (for backward compatibility)
function loadDiscussions() {
    try {
        discussions = JSON.parse(localStorage.getItem('directorsCutDiscussions') || '[]');
        const historyContainer = document.getElementById('discussion-history');
        
        // Only proceed if the old history container exists
        if (!historyContainer) {
            console.log('No old history container found - using new feed system');
            return;
        }
        
        if (discussions.length === 0) {
            historyContainer.innerHTML = '<p class="empty-history">No discussions yet. Start your first one!</p>';
            return;
        }
        
        let historyHTML = '';
        
        discussions.forEach(discussion => {
            historyHTML += `
                <div class="history-item" data-id="${discussion.id}">
                    <div class="history-header">
                        <div class="history-guests">${discussion.guestA} 🤝 ${discussion.guestB}</div>
                        <div class="history-date">${discussion.date}</div>
                    </div>
                    <div class="history-topic">"${discussion.topic}"</div>
                    <div class="history-preview">${discussion.content}</div>
                    <div class="history-actions">
                        <button class="history-btn view-btn" onclick="viewDiscussion(${discussion.id})">
                            View Full
                        </button>
                        <button class="history-btn delete-btn" onclick="deleteDiscussion(${discussion.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
        
    } catch (error) {
        console.error('Error loading old discussions:', error);
        // Don't show error to user - just use new feed
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing app...');
    
    // Don't call loadDiscussions() anymore - we're using the new feed system
    
    // Set up event listeners
    const newDiscussionBtn = document.getElementById('new-discussion-btn');
    console.log('New discussion button found:', newDiscussionBtn);
    
    if (newDiscussionBtn) {
        newDiscussionBtn.addEventListener('click', function() {
            console.log('Generate New Discussion button clicked!');
            showFormView();
        });
    } else {
        console.error('ERROR: new-discussion-btn not found!');
    }
    
    // Test backend connection first
    console.log('Testing backend connection...');
    testBackendConnection().then((connected) => {
        console.log('Backend connected:', connected);
        if (connected) {
            // Load social media feed
            console.log('Loading discussions feed...');
            loadDiscussionsFeed(true);
        } else {
            console.log('Backend not connected, showing error state');
        }
    }).catch(error => {
        console.error('Error in initialization:', error);
    });
    
    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreDiscussions);
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeSort(this.getAttribute('data-sort'));
        });
    });
    
    // Infinite scroll
    window.addEventListener('scroll', function() {
        if (isLoading || !hasMore) return;
        
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        
        if (scrollPosition >= pageHeight - 100) {
            loadMoreDiscussions();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (document.getElementById('form-view').style.display !== 'none' && !isGenerating) {
                sendQuestion();
            }
        }
        
        // Escape key to return home
        if (e.key === 'Escape' && document.getElementById('form-view').style.display !== 'none') {
            returnToHome();
        }
    });
    
    // Initial state: show home view
    showHomeView();
    console.log('App initialization complete');
});