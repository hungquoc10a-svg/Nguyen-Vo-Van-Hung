async function createAIResponse(payload) {
  const system = `You are a strict English speaking and interview coach for a Vietnamese learner in manufacturing.
Focus only on production, factory operations, quality, delivery, manpower, safety, leadership, and job interviews.

Return ONLY valid JSON. No markdown. No extra text.

JSON schema:
{
  "correctSentence": "short corrected sentence",
  "professionalAnswer": "more professional interview answer, 2-4 sentences max",
  "mistakes": ["Vietnamese mistake 1", "Vietnamese mistake 2", "Vietnamese mistake 3"],
  "pronunciationNotes": ["short likely pronunciation note based on transcript"],
  "usefulPhrases": ["phrase 1", "phrase 2", "phrase 3"],
  "followUpQuestion": "one practical follow-up question",
  "scores": {
    "grammar": 0-100,
    "vocabulary": 0-100,
    "clarity": 0-100,
    "interviewQuality": 0-100
  },
  "summaryVietnamese": "one short Vietnamese summary"
}

Keep output practical, concise, and tied to manufacturing/interview context.`;

  const user = `
Mode: ${payload.mode || "interview"}
Target role: ${payload.role || "Production Shift Leader / Line Manager"}
Learner profile: ${payload.profile || ""}
Question/context: ${payload.question || ""}
Learner answer/transcript: ${payload.answer || ""}
`;

  if (process.env.OPENROUTER_API_KEY) {
    return await callOpenRouter(system, user);
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      error: "Missing OPENROUTER_API_KEY. Add it in Vercel Environment Variables, then redeploy."
    })
  };
}

async function callOpenRouter(system, user) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://nguyen-vo-van-hung.vercel.app",
      "X-Title": "Production Interview AI Coach V2"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0.25,
      max_tokens: 900,
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: JSON.stringify({
        provider: "openrouter",
        error: data
      })
    };
  }

  const text = data?.choices?.[0]?.message?.content || "{}";

  return {
    statusCode: 200,
    body: JSON.stringify({
      provider: "openrouter",
      text
    })
  };
}

module.exports = { createAIResponse };
