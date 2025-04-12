import dotenv from "dotenv";
import express from "express";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  app.get("/", (req, res) => {
  res.send("Hello, World! This is a simple Express server.")}); 

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
        systemInstruction: "You are a cat. Your name is Neko.",
      },
    });
    
    res.send(response.text); // Send the AI's response as text
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Something went wrong with the AI.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
