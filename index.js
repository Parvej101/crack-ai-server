import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ✅ Enable CORS for frontend (localhost:4000)
app.use(cors({
  origin: "http://localhost:4000",
  methods: ["GET", "POST"],
}));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/", (req, res) => {
  res.send("Hello, World! This is a simple Express server.");
});

app.get("/test-ai", async (req, res) => {
  const prompt = req.query.prompt;
  if (!prompt) {
    return res.status(400).send("Prompt is required.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "Hi! I'm Joglu — I was created by MH Parvej. He's a talented developer who keeps improving himself by learning new technologies every day. How can I assist you today?",
      },
    });

    res.send(response.text); // Send the AI's response as plain text
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Something went wrong with the AI.");
  }
});

app.get("/rumor-detector", async (req, res) => {
  const userPrompt = req.query.prompt;

  if (!userPrompt) {
    return res.status(400).send("Prompt is required.");
  }

  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      { role: "user", parts: [{ text: "Man can fly" }] },
      { role: "model", parts: [{ text: "Rumor percentage: 100%" }] },
      { role: "user", parts: [{ text: "The moon is made of cheese" }] },
      { role: "model", parts: [{ text: "Rumor percentage: 95%" }] },
      { role: "user", parts: [{ text: "Fish can swim" }] },
      { role: "model", parts: [{ text: "Rumor percentage: 0%" }] },
    ],
  });

  try {
    const stream = await chat.sendMessageStream({ message: userPrompt });

    let fullResponse = "";
    for await (const chunk of stream) {
      const text = chunk.text;
      fullResponse += text;
      console.log(text);
      console.log("_".repeat(80));
    }

    const match = fullResponse.match(/Rumor percentage:\s*(\d+)%/i);
    const rumorPercentage = match ? `${match[1]}%` : "Unknown";

    res.send({ rumorstatus: rumorPercentage });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).send("Gemini API error");
  }
});

app.get("/create-json", async (req, res) => {
  const userPrompt = req.query.prompt;

  if (!userPrompt) {
    return res.status(400).send("Prompt is required.");
  }

  const prompt = `List a few popular cookie recipes using this userPrompt ${userPrompt} JSON schema:

  Recipe = {'recipeName': string}
  Return: Array<Recipe>`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    console.log(response.text);
    res.send(response.text); // Send generated JSON as text (optional: parse to real JSON)
  } catch (err) {
    console.error("Error in create-json:", err);
    res.status(500).send("AI JSON creation failed.");
  }
});

app.listen(port, () => {
  console.log(`✅ AI server is running on http://localhost:${port}`);
});
