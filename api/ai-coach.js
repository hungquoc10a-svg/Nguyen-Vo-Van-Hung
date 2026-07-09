const { createAIResponse } = require('../server-ai-core');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const result = await createAIResponse(req.body || {});
    res.status(result.statusCode || 200).send(result.body);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
};
