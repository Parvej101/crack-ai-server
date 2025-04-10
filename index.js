import dotenv from "dotenv";
import express from "express";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/test-ai", async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Explain how AI works in a few words",
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
