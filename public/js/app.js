// Helper function to show/hide the "Return Backstage" button
function toggleReturnButton(isVisible) {
    const button = document.getElementById('return-button');
    button.style.display = isVisible ? 'block' : 'none';
}

// Helper function to trigger the slide-up animation and transition to the show
function triggerSlide() {
    const form = document.getElementById('talk-show-form');
    
    // Set z-index low as we hide it (z-index: 0 is set in CSS for .form-slide-up)
    form.style.zIndex = 0; 
    form.classList.add('form-slide-up');
    
    // Hide the descriptive text in the header
    document.querySelector('.app-header p').style.display = 'none'; 

    // Show the "Return Backstage" button
    toggleReturnButton(true);
}

// NEW FUNCTION: Slides the form back down and returns to the director controls
function returnBackstage() {
    const form = document.getElementById('talk-show-form');
    
    // Set z-index high so it slides back over the response area
    form.style.zIndex = 2; 
    form.classList.remove('form-slide-up');

    // Show the descriptive text in the header again
    document.querySelector('.app-header p').style.display = 'block'; 

    // Hide the "Return Backstage" button
    toggleReturnButton(false);
    
    // Optionally clear the response when returning backstage
    document.getElementById('response').textContent = 'Set your cast and topic above, then hit \'Start Discussion\'!';
}

async function sendQuestion() {
    const question = document.getElementById('question').value;
    if (!question) return alert('Enter a question');
    const guest_a = document.getElementById('guest_a').value;
    if (!guest_a) return alert('Enter a guest_a');
    const guest_b = document.getElementById('guest_b').value;
    if (!guest_b) return alert('Enter a guest_b');
    const tone = document.getElementById('tone').value;
    if (!tone) return alert('Enter a tone');

    // 1. Trigger the visual slide-up animation
    triggerSlide();
    
    // 2. Wait 200ms for the animation to start before fetching data.
    await new Promise(r => setTimeout(r, 200)); 

    // Reset response area content before fetch
    document.getElementById('response').textContent = 'Loading live feed...';
    
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
        // Show only the readable AI text
        document.getElementById('response').textContent = data.output;

    } catch (err) {
        document.getElementById('response').textContent = 'Error: ' + err.message;
    }
}