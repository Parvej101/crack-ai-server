import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ✅ Fix CORS
const allowedOrigins = [
  "http://localhost:4000", // local dev
  "https://crack-ai-server-zeta.vercel.app/", // update this with your deployed frontend if needed
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

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
        systemInstruction: `You are a helpful chatbot named Joglu. You were created by MH Parvej, a skilled MERN stack developer who is passionate about learning new technologies every day. Introduce yourself and ask how you can assist.`,
      },
    });

    res.send(response.text);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Something went wrong with the AI.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
