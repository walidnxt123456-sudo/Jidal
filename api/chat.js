import fetch from 'node-fetch';

const API_KEY = process.env.YOU_API_KEY;
const API_URL = "https://api.you.com/v1/agents/runs";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, guest_a, guest_b, tone, style, max_words = 40 } = req.body;

  if (!question || !guest_a || !guest_b || !tone || !style) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `
Task: Create a fictional parody dialogue in the style of a ${style}.

Question: ${question}

Instructions:
- The dialogue must be clearly fictional and humorous.
- Both characters should speak in exaggerated parody versions of themselves.
- Tone for this exchange: ${tone}

${guest_a}:
- Write a parody of ${guest_a} responding to the question.
- In this ${style}, ${guest_a} should interact with or react to ${guest_b}.
- Maximum ${max_words} words.

${guest_b}:
- Write a parody of ${guest_b} replying to both the question and ${guest_a}'s comment.
- Maintain the ${style} style and the ${tone} tone.
- Maximum ${max_words} words.
`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent: "express",
        input: prompt,
        stream: false
      })
    });

    const data = await response.json();

    const parsed = {
      answer: data.output[0].text,
      type: data.output[0].type,
      agent: data.agent,
      mode: data.mode,
      user_prompt: data.input[0].content
    };

    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server crashed", details: err.message });
  }
}
