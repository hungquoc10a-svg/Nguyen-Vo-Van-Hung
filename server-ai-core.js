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

  // Prefer Gemini first because the learner may not have OpenAI API credit.
  if (process.env.GEMINI_API_KEY) {
    return await callGemini(system, user);
  }

  if (process.env.OPENAI_API_KEY) {
    return await callOpenAI(system, user);
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      error:
        "Missing API key. Add GEMINI_API_KEY or OPENAI_API_KEY in Vercel Environment Variables, then redeploy."
    })
  };
}

async function callGemini(system, user) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${system}\n\n${user}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 900
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: JSON.stringify({
        provider: "gemini",
        error: data
      })
    };
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") ||
    data?.promptFeedback?.blockReason ||
    JSON.stringify(data);

  return {
    statusCode: 200,
    body: JSON.stringify({
      provider: "gemini",
      text
    })
  };
}

async function callOpenAI(system, user) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: system
        },
        {
          role: "user",
          content: user
        }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: JSON.stringify({
        provider: "openai",
        error: data
      })
    };
  }

  const text =
    data.output_text ||
    (data.output || [])
      .flatMap((o) => o.content || [])
      .map((c) => c.text || "")
      .join("\n") ||
    JSON.stringify(data);

  return {
    statusCode: 200,
    body: JSON.stringify({
      provider: "openai",
      text
    })
  };
}

module.exports = { createAIResponse };
