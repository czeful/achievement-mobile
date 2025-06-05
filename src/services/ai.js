const OPENROUTER_API_KEY = "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"; 

export async function generateSteps({ name, description, category }) {
  const prompt = `
Ты ассистент по целеполаганию. Помоги структурировать цель:
Название: ${name}
Категория: ${category}
Описание: ${description}

Дай список конкретных шагов (steps) для достижения этой цели, без вступления и пояснений, только список шагов по одному на строку.
  `;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      // OpenRouter требует этот заголовок
      "HTTP-Referer": "http://localhost:3000/", // или твой домен
      "X-Title": "AchievementManager"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-opus-20240229",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return text.split('\n').map(line => line.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
} 