export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question, guestA, guestB, style, tone } = req.body;

    // Simple test response
    const reply = `Received your question: "${question}"\nGuest A: ${guestA}\nGuest B: ${guestB}\nStyle: ${style}\nTone: ${tone}`;

    res.status(200).json({ output: reply });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server crashed', details: err.message });
  }
}
