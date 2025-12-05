const API_KEY = process.env.YOU_API_KEY;
const url = "https://api.you.com/v1/agents/runs";

const max_words = 40;
const rounds = 1;
const tones = ["Funny", "Serious", "Aggressive", "Academic", "Sarcastic", "Calm"];

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question, guest_a, guest_b, tone } = req.body;

    if (!question || !guest_a || !guest_b || !tone) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Simple test response
    //const reply = `Received your question here0: "${question}"\nGuest A: ${guest_a}\nGuest B: ${guest_b}\nTone: ${tone}`;
    //res.status(200).json({ output: reply });
    
    //Promt creation
const prompt = `
Task:Create a fictional parody dialogue. 
Question:${question}

Instructions:
- The ENTIRE response must be in plain text only (no markdown, no bold, no headings).
- Each character’s response MUST be under ${max_words} words.
- Both characters should speak in exaggerated parody versions of themselves.
- Tone for this exchange: ${tone}
- Do NOT exceed the word limit.
- Do NOT format as markdown.

${guest_a}:
- Write a parody of ${guest_a} responding to the question.
- ${guest_a} should interact with or react to ${guest_b}.

${guest_b}:
- Write a parody of ${guest_b} replying to both the question and ${guest_a}'s comment.
`;

const payload = {
  agent: "express",
  input: prompt,
  stream: false
};

    // Simple test response prompt
    //const reply = `Received your question here0: "${question}"\nGuest A: ${guest_a}\nGuest B: ${guest_b}\nTone: ${tone} \nprompt: ${prompt}`;
    //res.status(200).json({ output: reply });

//llm request
  const response = await fetch(url, {
    method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(()=>null);
  console.log("RAW LLM RESPONSE:", data);

    // Safely extract LLM output
    const answer = data?.output?.[0]?.text || "No answer returned from LLM.";


    // Build final reply 
const reply = `Received your question: "${question}"
Guest A: ${guest_a}
Guest B: ${guest_b}
Tone: ${tone}

PROMPT SENT:
${prompt}

LLM ANSWER:
${answer}
`;

    return res.status(200).json({ output: reply });

/////////

  } catch (err) {
    console.error('Server error:', err);
    //res.status(500).json({ error: 'Server crashed', details: err.message });
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Server crashed', details: err.message });
    }
    // If headers already sent, do nothing — avoid libuv crash
    return;
  }
}
