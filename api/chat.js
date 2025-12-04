export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, guestA, guestB, tone, message } = req.body;

  if (!topic || !guestA || !guestB || !tone || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const prompt = `
Parody dialogue.
Topic: ${topic}
Characters: ${guestA} (parody), ${guestB} (parody)
Tone: ${tone}
User message: "${message}"

Return JSON ONLY:
{
  "A": "reply",
  "B": "reply"
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer ${process.env.OPENAI_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You output only JSON." },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  return res.status(200).json({ reply: JSON.parse(text) });
}
