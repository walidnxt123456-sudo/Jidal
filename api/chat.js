export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  console.log("API HIT");

  try {
    // If it's GET request → respond with info (prevents body undefined crash)
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "GET working — but send POST with JSON body!"
      });
    }

    // Parse JSON body safely
    const body = req.body || {};
    console.log("RAW BODY:", body);

    const { question, guestA, guestB, tone, style, maxWords, rounds } = body;

    if (!question) {
      return res.status(400).json({
        error: "Missing question in POST body.",
        received_body: body
      });
    }

    // TEMPORARY TEST RESPONSE
    return res.status(200).json({
      ok: true,
      message: "Backend POST working!",
      echo: { question, guestA, guestB, tone, style }
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      error: "Server crashed",
      details: err.toString()
    });
  }
}
