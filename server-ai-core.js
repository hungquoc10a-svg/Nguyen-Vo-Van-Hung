async function createAIResponse(payload) {
  const system = `You are a strict English speaking and interview coach for a Vietnamese learner in manufacturing.
Focus only on production, factory operations, quality, delivery, manpower, safety, leadership, and job interviews.

Return ONLY valid JSON. Do not use markdown. Do not wrap the JSON in code fences.
The JSON shape must be:
{
  "correctSentence": "...",
  "professionalAnswer": "...",
  "mistakes": ["..."],
  "pronunciationNotes": ["..."],
  "usefulPhrases": ["..."],
  "followUpQuestion": "...",
  "scores": {
    "grammar": 0,
    "vocabulary": 0,
    "clarity": 0,
    "interviewQuality": 0
  },
  "summaryVietnamese": "..."
}

Rules:
- Keep feedback short, practical, and direct.
- Do not give generic English advice.
- Always connect the answer to production, factory operation, line management, quality, delivery, manpower, safety, or interview performance.
- If the learner answer is weak, still give a usable professional version.
- Follow-up question must be one short interview question.`;

  const user = `
Mode: ${payload.mode || "interview"}
Target role: ${payload.role || "Production Shift Leader / Line Manager"}
Learner profile: ${payload.profile || ""}
Question/context: ${payload.question || ""}
Learner answer: ${payload.answer || ""}
`;

  if (process.env.OPENROUTER_API_KEY) {
    return await callOpenRouter(system, user);
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      error:
        "Missing OPENROUTER_API_KEY. Add it in Vercel Environment Variables, then redeploy."
    })
  };
}

async function callOpenRouter(system, user) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // Free-router can occasionally pick a provider that is temporarily failing.
  // This list retries multiple free model routes before returning an error.
  const models = [
    process.env.OPENROUTER_MODEL || "openrouter/free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "google/gemma-2-9b-it:free"
  ];

  let lastError = null;

  for (const model of [...new Set(models.filter(Boolean))]) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nguyen-vo-van-hung.vercel.app",
        "X-Title": "Production Interview AI Coach"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: system
          },
          {
            role: "user",
            content: user
          }
        ],
        temperature: 0.2,
        max_tokens: 900
      })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      let text = data?.choices?.[0]?.message?.content || "";

      // Clean accidental markdown fences if the model ignores instructions.
      text = String(text)
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      return {
        statusCode: 200,
        body: JSON.stringify({
          provider: "openrouter",
          model,
          text
        })
      };
    }

    lastError = { model, status: response.status, error: data };

    // Retry on provider/rate/transient errors. Stop early on bad key.
    const errString = JSON.stringify(data).toLowerCase();
    if (response.status === 401 || errString.includes("invalid api key")) {
      break;
    }
  }

  return {
    statusCode: lastError?.status || 500,
    body: JSON.stringify({
      provider: "openrouter",
      error: lastError
    })
  };
}

module.exports = { createAIResponse };
