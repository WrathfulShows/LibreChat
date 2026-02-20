// Auto-routing middleware — classifies prompt and selects best model/mode
const classifyPrompt = (message) => {
  const msg = message.toLowerCase();

  // Image generation keywords
  const imageGenKeywords = ["generate", "create image", "draw", "make a picture", "imagine", "paint", "design"];
  if (imageGenKeywords.some(k => msg.includes(k))) return "image_gen";

  // Vision/image understanding
  if (msg.includes("attached") || msg.includes("this image") || msg.includes("what's in") || msg.includes("describe")) return "vision";

  // Voice/lyrics
  if (msg.includes("lyrics") || msg.includes("song") || msg.includes("sing") || msg.includes("voice")) return "voice";

  // Reasoning tasks
  const reasoningKeywords = ["solve", "prove", "reason", "step by step", "math", "logic", "debug", 
                              "analyze", "compare", "think through", "explain why", "how does"];
  const isLong = message.length > 400;
  const reasoningScore = reasoningKeywords.filter(k => msg.includes(k)).length;
  if (reasoningScore >= 2 || (reasoningScore >= 1 && isLong)) return "reasoning";

  // Multi-agent for very complex/important queries
  const complexKeywords = ["best possible", "comprehensive", "exhaustive", "research", "all perspectives"];
  if (complexKeywords.some(k => msg.includes(k)) || message.length > 800) return "multiagent";

  // Default: fast mode
  return "fast";
};

// Model map per mode
const modelMap = {
  fast: { endpoint: "Groq Fast", model: "llama-3.3-70b-versatile" },
  reasoning: { endpoint: "DeepSeek Reasoning", model: "deepseek/deepseek-r1" },
  vision: { endpoint: "Gemini Vision", model: "gemini-2.0-flash" },
  image_gen: { endpoint: "Replicate", model: "black-forest-labs/flux-schnell" },
  voice: { endpoint: "Groq Fast", model: "whisper-large-v3" },
  multiagent: { endpoint: "Multi-Agent Synthesis", model: "deepseek/deepseek-chat-v3-0324" },
};

module.exports = { classifyPrompt, modelMap };
