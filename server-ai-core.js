async function createAIResponse(payload) {
  const system = `You are a strict English speaking and interview coach for a Vietnamese learner in manufacturing.
Focus only on production, factory operations, quality, delivery, manpower, safety, leadership, and job interviews.

After each learner answer, give:
1. Correct sentence
2. More professional interview version
3. Mistakes in Vietnamese
4. Pronunciation notes based on likely Vietnamese learner errors
5. 3 useful manufacturing phrases
6. One follow-up question

Keep feedback short, practical, and direct.
Do not give generic English advice. Always connect the answer to production, factory operation, line management, quality, delivery, manpower, safety, or interview performance.`;

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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://nguyen-vo-van-hung.vercel.app",
      "X-Title": "Production Interview AI Coach"
    },
    body: JSON.stringify({
      model: "openrouter/free",
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
      temperature: 0.3,
      max_tokens: 900
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

  const text = data?.choices?.[0]?.message?.content || JSON.stringify(data);

  return {
    statusCode: 200,
    body: JSON.stringify({
      provider: "openrouter",
      text
    })
  };
}

module.exports = { createAIResponse };
