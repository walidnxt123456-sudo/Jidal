export default async function handler(req, res) {
  const { text } = req.body;

  // Call a safe TTS provider here
  const audioBuffer = await generateAudioBuffer(text); // pseudocode

  res.setHeader("Content-Type", "audio/mpeg");
  res.send(audioBuffer);
}