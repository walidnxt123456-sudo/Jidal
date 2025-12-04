export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  console.log("API HIT", req.method);

  try {
    // GET test
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        message: "GET working — but send POST with JSON body!"
      });
    }

    // Reject other methods
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method Not Allowed. Use POST.",
        method: req.method
      });
    }

    const body = req.body || {};
    console.log("BODY:", body);

    const { question } = body;

    if (!question) {
      return res.status(400).json({
        error: "Missing 'question' in JSON body.",
        bodyReceived: body
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Backend POST working!",
      echo: body
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.toString() });
  }
}
