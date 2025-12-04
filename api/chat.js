export default async function handler(req, res) {
  console.log("API HIT", req.method);

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "GET working — but send POST with JSON body!"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      method: req.method
    });
  }

  const body = req.body || {};

  const { question } = body;

  if (!question) {
    return res.status(400).json({
      error: "Missing 'question' in request body.",
      received: body
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Backend POST working!",
    echo: body
  });
}
