export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, guest_a, guest_b, tone, style } = req.body;

  if (!question || !guest_a || !guest_b || !tone || !style) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock AI response for testing
  const answer = `${guest_a} and ${guest_b} discuss: "${question}" in a ${tone} ${style} style.`;

  return res.status(200).json({ answer });
}
