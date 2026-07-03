const { createAIResponse } = require("../server-ai-core");

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const result = await createAIResponse(req.body || {});
    res.status(result.statusCode).send(result.body);
  } catch (err) {
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
};
