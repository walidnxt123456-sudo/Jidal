// api/chat.js
import fetch from 'node-fetch'; // Node 22+ has fetch built-in

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question, guestA, guestB, style, tone } = req.body || {};

    // --- Validate input ---
    if (!question || !guestA || !guestB || !style || !tone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { question, guestA, guestB, style, tone } 
      });
    }

    // --- Build AI prompt ---
    const prompt = `
Task: Create a fictional parody dialogue in the style of a ${style}.

Question: ${question}

Instructions:
- Both characters speak in exaggerated parody versions of themselves.
- Tone: ${tone}

${guestA}:
- Respond to the question and interact with ${guestB}.
- Max 40 words.

${guestB}:
- Reply to both the question and ${guestA}'s comment.
- Maintain ${style} style and ${tone} tone.
- Max 40 words.
`;

    // --- Call You.com API ---
    const apiRes = await fetch('https://api.you.com/v1/agents/runs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOU_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent: 'express',
        input: prompt,
        stream: false
      }),
      timeout: 15000 // optional: 15 seconds timeout
    });

    // --- Handle non-JSON response ---
    let data;
    try {
      data = await apiRes.json();
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', parseErr);
      return res.status(502).json({ 
        error: 'Invalid response from AI API',
        details: await apiRes.text() 
      });
    }

    // --- Extract text safely ---
    const aiText = data?.output?.[0]?.text;
    if (!aiText) {
      console.warn('AI API returned empty output:', data);
      return res.status(502).json({ 
        error: 'AI returned no output',
        details: data
      });
    }

    // --- Success ---
    res.status(200).json({ output: aiText });

  } catch (err) {
    // --- Catch-all errors ---
    console.error('Server error in /api/chat:', err);
    res.status(500).json({
      error: 'Server crashed',
      details: err.message
    });
  }
}
