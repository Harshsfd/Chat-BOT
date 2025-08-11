// api/chat.js
export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call Groq API
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // Your API key from Vercel env
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // You can change model if needed
        messages: [
          { role: "system", content: "You are a helpful AI chatbot." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!groqRes.ok) {
      const errorData = await groqRes.json();
      return res.status(groqRes.status).json({ error: errorData.error || "Groq API request failed" });
    }

    const data = await groqRes.json();

    // Send back chatbot reply
    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response from Groq API"
    });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
