export default async function handler(req, res) {
  console.log("API HIT"); // test

  try {
    const { question, guestA, guestB, tone, style, maxWords, rounds } = req.body;

    console.log("Received body:", req.body); // test

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    // TEMPORARY TEST RESPONSE (no AI yet)
    return res.status(200).json({
      ok: true,
      message: "Backend working!",
      echo: { question, guestA, guestB, tone, style }
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server crashed", details: err.toString() });
  }
}
