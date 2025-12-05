    async function sendQuestion() {
      const question = document.getElementById('question').value;
        if (!question) return alert('Enter a question');
      const guest_a = document.getElementById('guest_a').value;
        if (!guest_a) return alert('Enter a guest_a');
      const guest_b = document.getElementById('guest_b').value;
        if (!guest_a) return alert('Enter a guest_b');
      const tone = document.getElementById('tone').value;
        if (!tone) return alert('Enter a tone');


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

        // For testing, just show raw text from API
        //const text = await res.text();
        //document.getElementById('response').textContent = text;
        const data = await res.json();
        // Show only the readable AI text
        document.getElementById('response').textContent = data.output;

      } catch (err) {
        document.getElementById('response').textContent = 'Error: ' + err.message;
      }
    }
