// api/chat.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, guestA, guestB, style, tone, maxWords } = req.body;

  if (!question || !guestA || !guestB) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const prompt = `
Task:Create a fictional parody dialogue in the style of a ${style}.

Question: ${question}

Instructions:
- The dialogue must be clearly fictional and humorous.
- Both characters should speak in exaggerated parody versions of themselves.
- Tone for this exchange: ${tone}

${guestA}:
- Write a parody of ${guestA} responding to the question.
- In this ${style}, ${guestA} should interact with or react to ${guestB}.
- Maximum ${maxWords} words.

${guestB}:
- Write a parody of ${guestB} replying to both the question and ${guestA}'s comment.
- Maintain the ${style} style and the ${tone} tone.
- Maximum ${maxWords} words.
`;

  try {
    const response = await fetch('https://api.you.com/v1/agents/runs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOU_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent: "express",
        input: prompt,
        stream: false
      })
    });

    const data = await response.json();  // safe because API returns JSON

    return res.status(200).json(data);  // forward entire AI response
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'AI API error', details: err.message });
  }
}
