const OPENROUTER_API_KEY = "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";

const mainAI = {
  async askAI({ goal, message }) {
    const prompt = `Ты ассистент по целеполаганию. Вот цель пользователя:
Название: ${goal.name}
Описание: ${goal.description || ''}

Пользователь спрашивает: ${message}

Дай совет или ответ, учитывая контекст цели и текущий шаг, если он есть.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000/",
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
    return data.choices?.[0]?.message?.content || "";
  }
};

export default mainAI; 