async function createAIResponse(payload) {
  const system = `You are a strict English speaking and interview coach for a Vietnamese learner applying for Production Supervisor / Line Manager roles.
Focus only on manufacturing, production supervision, safety, quality, delivery, manpower, productivity, ramp-up, 8D, Fishbone, MES, Power BI, Kaizen, 5S, shift handover, and interview performance.

Return ONLY valid JSON. Do not use markdown. Do not wrap JSON in code fences.
JSON shape:
{
  "correctSentence": "...",
  "professionalAnswer": "...",
  "mistakes": ["..."],
  "pronunciationNotes": ["..."],
  "usefulPhrases": ["..."],
  "followUpQuestion": "...",
  "scores": {"grammar": 0, "vocabulary": 0, "clarity": 0, "interviewQuality": 0},
  "summaryVietnamese": "..."
}
Rules:
- Keep feedback short and practical.
- Correct grammar and improve interview structure.
- Use simple English suitable for speaking in an interview.
- If mode is ipa, focus on likely pronunciation and transcript issues, but be honest that text transcript is not a full acoustic pronunciation score.
- Always give one follow-up interview question when mode is interview, speaking, roleplay, or question-bank.`;

  const user = `
Mode: ${payload.mode || "interview"}
Target role: ${payload.role || "Production Supervisor"}
Learner profile: ${payload.profile || ""}
Question/context: ${payload.question || ""}
Learner answer/transcript: ${payload.answer || ""}
Extra target: ${JSON.stringify(payload.extra || {})}
`;

  if (!process.env.OPENROUTER_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENROUTER_API_KEY in Vercel Environment Variables." }) };
  }
  return await callOpenRouter(system, user);
}

async function callOpenRouter(system, user) {
  const apiKey = process.env.OPENROUTER_API_KEY;
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
        "X-Title": "Production Supervisor Interview AI Coach"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.2,
        max_tokens: 900
      })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      let text = data?.choices?.[0]?.message?.content || "";
      text = String(text).replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
      return { statusCode: 200, body: JSON.stringify({ provider: "openrouter", model, text }) };
    }
    lastError = { model, status: response.status, error: data };
    const errString = JSON.stringify(data).toLowerCase();
    if (response.status === 401 || errString.includes("invalid api key")) break;
  }
  return { statusCode: lastError?.status || 500, body: JSON.stringify({ provider: "openrouter", error: lastError }) };
}

module.exports = { createAIResponse };
