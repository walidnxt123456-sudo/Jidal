// Browser TTS for each dialogue line
function playBrowserTTS(text, voiceLang = "en-US") {
  if (!('speechSynthesis' in window)) {
    alert('Your browser does not support speech synthesis.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = voiceLang;
  utter.rate = 1; // normal
  utter.pitch = 1; // normal
  utter.volume = 1;

  // Optional: pick first English voice
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === "en-US");
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

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



/*// Quick test: browser Text-To-Speech (no backend required)
function playBrowserTTS(text) {
  if (!('speechSynthesis' in window)) {
    alert('Your browser does not support speech synthesis.');
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);

  // Safe, generic settings
  utter.lang = "en-US";
  utter.rate = 1;
  utter.pitch = 1;

  // Optional: pick a specific generic voice
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === "en-US");
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

function testVoice() {
  const text = "Hello! This is a test of the voice system.";
  playBrowserTTS(text);
}*/