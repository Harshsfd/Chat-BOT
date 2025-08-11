// api/chat.js
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    // Check if API key is set
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key is missing in server environment" });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid request: 'message' must be a non-empty string" });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Or "gpt-4" if your API key supports it
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `OpenAI API error: ${errorText}` });
    }

    const data = await response.json();

    // Extract reply
    const reply = data.choices?.[0]?.message?.content || "No response from AI";

    res.status(200).json({ reply });

  } catch (error) {
    // Always return JSON on error
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
