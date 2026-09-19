const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const ResourceHistory = require("../models/Resource");

router.post("/generate", verifyToken, async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, error: "Topic is required" });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ success: false, error: "Server missing OPENROUTER_API_KEY configuration." });
    }

    const prompt = `Act as an expert technical tutor. Create a well-balanced, comprehensive study guide on the topic: "${topic}". 

    Provide clear architectural explanations, core concepts, practical code examples, and key time/space complexities. Make it detailed enough to fully master the topic, but concise and well-structured to avoid unnecessary fluff.

    Format the response strictly in Markdown using these two exact sections:

    # 1. Comprehensive Study Notes
    [Provide clear headings, core principles, code snippets, and structured explanations here]

    # 2. Recommended References, Books & Live Articles
    [Provide a structured list of 3 authoritative books and 3 live clickable online web resources/articles formatted cleanly as markdown links using this exact pattern: - [Resource Name](https://url-here) - Brief description of what to learn from it]`;

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Study Notes Generator",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      console.error("OpenRouter API Error:", data);
      return res.status(500).json({ 
        success: false, 
        error: data.error?.message || "OpenRouter API rejected the request." 
      });
    }

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ success: false, error: "No response returned from OpenRouter." });
    }

    const generatedText = data.choices[0].message.content;

    try {
      console.log("=== ATTEMPTING TO SAVE HISTORY ===");
      console.log("req.user object received:", req.user);

      const userId = req.user?.id || req.user?._id || req.user?.userId;
      console.log("Resolved userId for database:", userId);

      if (!userId) {
        console.error("ERROR: No user ID found on req.user! History cannot be saved.");
      } else {
        const newRecord = await ResourceHistory.create({
          userId,
          topic,
          generatedContent: generatedText
        });
        console.log("SUCCESS! Saved history record with ID:", newRecord._id);
      }
    } catch (dbErr) {
      console.error("MONGOOSE SAVE ERROR CRASH:", dbErr.message);
    }

    return res.status(200).json({ success: true, data: generatedText });

  } catch (error) {
    console.error("Fatal Route Crash in /api/resources/generate:", error);
    return res.status(500).json({ success: false, error: "Internal server error while generating resources." });
  }
});

router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    console.log("=== GET /history ===");
    console.log("Searching history for resolved userId:", userId);

    const history = await ResourceHistory.find({ userId }).sort({ createdAt: -1 }).limit(10);
    console.log("Found records in database:", history.length);

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    console.error("Failed to fetch history:", err);
    res.status(500).json({ success: false, error: "Failed to fetch history." });
  }
});

module.exports = router;