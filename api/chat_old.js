export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { question, guest_a, guest_b, style, tone } = req.body;

    // Simple test response
    const reply = `Received your question here0: "${question}"\nGuest A: ${guest_a}\nGuest B: ${guest_b}\nStyle: ${style}\nTone: ${tone}`;

    res.status(200).json({ output: reply });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server crashed', details: err.message });
  }
}
