import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health and System Info API
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      backend: "Node.js Express",
      database: "Google Cloud Firestore (Enterprise)",
      timestamp: new Date().toISOString()
    });
  });

  // API routes
  app.post("/api/generate-notulen", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing." });
      }

      const { agendaItems, location, meetingType, participantCount, month } = req.body;

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        You are a professional administrative secretary for an RT (Rukun Tetangga) or PKK in Gunungpati, Kota Semarang.
        Please generate a formal, concise, and easy-to-read meeting summary (Notulen) for a ${meetingType.toUpperCase()} meeting in the month of ${month}.

        Context:
        Location: ${location}
        Participants: ${participantCount}
        Agenda:
        ${agendaItems.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}

        CRITICAL REQUIREMENT (1-PAGE FIT):
        - The entire notulen document MUST fit within a SINGLE printed page (1 page).
        - Keep "discussionNotes" brief, concise, and to the point (1 short paragraph, around 2-3 sentences max). Avoid wordy or redundant bureaucratic filler.
        - Keep "decisions" as 2-4 concise, high-impact numbered action items (1. ..., 2. ...).
        - Language must be standard, formal Indonesian (Bahasa Indonesia baku) suitable for official RT/PKK governance & SPJ reporting.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              discussionNotes: {
                type: Type.STRING,
                description: "A concise, 1-page suitable paragraph (2-3 sentences max) summarizing the discussion directly."
              },
              decisions: {
                type: Type.STRING,
                description: "A concise numbered list (maximum 3-4 items) of key decisions/agreements suitable for 1-page layout."
              }
            },
            required: ["discussionNotes", "decisions"]
          }
        }
      });

      const generatedText = response.text;
      if (!generatedText) {
         return res.status(500).json({ error: "Empty response from AI" });
      }

      const parsed = JSON.parse(generatedText.trim());
      res.json(parsed);

    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate notulen" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
