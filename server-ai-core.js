async function createAIResponse(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }) };
  }

  const system = `You are a strict English speaking and interview coach for a Vietnamese learner in manufacturing.
Focus only on production, factory operations, quality, delivery, manpower, safety, leadership, and job interviews.
After each learner answer, give:
1. Correct sentence
2. More professional interview version
3. Mistakes in Vietnamese
4. Pronunciation notes based on likely Vietnamese learner errors
5. 3 useful manufacturing phrases
6. One follow-up question
Keep feedback short, practical, and direct.`;

  const user = `
Mode: ${payload.mode || "interview"}
Target role: ${payload.role || "Production Shift Leader"}
Learner profile: ${payload.profile || ""}
Question/context: ${payload.question || ""}
Learner answer: ${payload.answer || ""}
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return { statusCode: response.status, body: JSON.stringify({ error: data }) };
  }

  const text =
    data.output_text ||
    (data.output || []).flatMap(o => o.content || []).map(c => c.text || "").join("\n") ||
    JSON.stringify(data);

  return { statusCode: 200, body: JSON.stringify({ text }) };
}

module.exports = { createAIResponse };
