const axios = require("axios");

const agents = [
  { name: "DeepSeek R1", url: "https://openrouter.ai/api/v1/chat/completions", 
    model: "deepseek/deepseek-r1", key: process.env.OPENROUTER_API_KEY },
  { name: "Gemini Flash Thinking", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", 
    model: "gemini-2.0-flash-thinking-exp", key: process.env.GEMINI_API_KEY },
  { name: "Llama 3.3 70B", url: "https://api.groq.com/openai/v1/chat/completions", 
    model: "llama-3.3-70b-versatile", key: process.env.GROQ_API_KEY },
];

async function callAgent(agent, messages) {
  const res = await axios.post(agent.url, {
    model: agent.model,
    messages,
    max_tokens: 2048,
  }, {
    headers: { Authorization: `Bearer ${agent.key}`, "Content-Type": "application/json" }
  });
  return res.data.choices[0].message.content;
}

async function multiAgentQuery(userMessage) {
  const messages = [{ role: "user", content: userMessage }];

  // Run all agents in parallel
  const responses = await Promise.allSettled(agents.map(a => callAgent(a, messages)));
  const validResponses = responses
    .filter(r => r.status === "fulfilled")
    .map((r, i) => `[Agent ${agents[i].name}]:\n${r.value}`);

  // Synthesis step
  const synthesisPrompt = `You are a synthesis expert. Multiple AI agents have answered this question:

"${userMessage}"

Here are their responses:
${validResponses.join("\n\n")}

Synthesize the single best, most accurate, and comprehensive answer. Resolve any conflicts using reasoning. Output only the final answer.`;

  return callAgent(agents[2], [{ role: "user", content: synthesisPrompt }]); // Groq for speed
}

module.exports = { multiAgentQuery };
