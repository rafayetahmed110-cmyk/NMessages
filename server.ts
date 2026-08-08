import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy get Google GenAI instance
function getAIInstance() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Summarize Repository
app.post("/api/ai/summarize-repo", async (req, res) => {
  try {
    const { repoOwner, repoName, description, readmeContent, lang = "en" } = req.body;
    
    if (!repoOwner || !repoName) {
      return res.status(400).json({ error: "repoOwner and repoName are required" });
    }

    const ai = getAIInstance();
    const isBengali = lang === "bn";

    const prompt = `
You are an expert GitHub AI Assistant. Analyze this repository and create a comprehensive executive summary.

Repository: ${repoOwner}/${repoName}
Description: ${description || "No description provided."}
README Content (excerpt):
${(readmeContent || "No README provided.").slice(0, 8000)}

${isBengali ? "IMPORTANT: Provide the output in Bengali (বাংলা) language." : "Provide the output in English."}

Return a structured JSON object with the following fields:
{
  "overview": "A 2-3 sentence clear summary of what this project does and its value proposition.",
  "techStack": ["Array of detected tech, frameworks, languages, tools"],
  "keyFeatures": ["Bullet points of main features (max 5)"],
  "targetAudience": "Who this project is built for",
  "difficultyToUse": "Beginner / Intermediate / Advanced",
  "aiVerdict": "Brief rating/verdict on project health, quality, or uniqueness"
}

Respond ONLY with valid raw JSON (no markdown wrapper, no backticks).
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch {
      return res.json({
        overview: responseText,
        techStack: [],
        keyFeatures: [],
        targetAudience: "Developers",
        difficultyToUse: "Intermediate",
        aiVerdict: "Analyzed successfully."
      });
    }
  } catch (error: any) {
    console.error("Error summarizing repo:", error);
    res.status(500).json({ error: error.message || "Failed to summarize repository" });
  }
});

// AI Code Review
app.post("/api/ai/review-code", async (req, res) => {
  try {
    const { code, fileName, language, lang = "en" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "code is required" });
    }

    const ai = getAIInstance();
    const isBengali = lang === "bn";

    const prompt = `
You are a senior principal engineer conducting a code review.
File Name: ${fileName || "unknown"}
Language: ${language || "unknown"}

Code to review:
\`\`\`
${code.slice(0, 10000)}
\`\`\`

${isBengali ? "Provide all explanations in Bengali (বাংলা)." : "Provide explanations in English."}

Return a structured JSON with:
{
  "summary": "Brief 1-2 sentence overall impression",
  "score": 85, // Integer 0 to 100 code quality score
  "securityFindings": ["Security vulnerabilities or risk points, if any"],
  "performanceTips": ["Performance optimization ideas"],
  "cleanCodeSuggestions": ["Refactoring or readability improvements"],
  "improvedCode": "Refactored/improved version of key problematic parts (if applicable)"
}

Respond ONLY with valid raw JSON (no markdown wrappers).
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch {
      return res.json({
        summary: responseText,
        score: 80,
        securityFindings: [],
        performanceTips: [],
        cleanCodeSuggestions: [],
        improvedCode: ""
      });
    }
  } catch (error: any) {
    console.error("Error reviewing code:", error);
    res.status(500).json({ error: error.message || "Failed to review code" });
  }
});

// AI README Generator
app.post("/api/ai/generate-readme", async (req, res) => {
  try {
    const { projectName, description, techStack, features, installationSteps, license, lang = "en" } = req.body;

    const ai = getAIInstance();
    const isBengali = lang === "bn";

    const prompt = `
Generate a professional, beautiful GitHub Markdown README.md for a project.

Project Name: ${projectName || "Awesome Project"}
Description: ${description || "A great software application."}
Tech Stack: ${techStack || "React, TypeScript, Tailwind"}
Key Features: ${features || "Fast performance, clean design"}
Installation Steps: ${installationSteps || "npm install && npm run dev"}
License: ${license || "MIT"}

${isBengali ? "Write the descriptions and section headers in Bengali where appropriate, but keep technical commands/code in standard markdown." : "Write in English."}

Format with clear headers (#, ##), badges, shields.io style suggestions, feature lists, installation blocks, usage examples, and license section.
Output raw Markdown content.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return res.json({ markdown: response.text || "" });
  } catch (error: any) {
    console.error("Error generating README:", error);
    res.status(500).json({ error: error.message || "Failed to generate README" });
  }
});

// AI Issue & PR Generator
app.post("/api/ai/generate-issue", async (req, res) => {
  try {
    const { type = "bug", details, repoName, lang = "en" } = req.body;

    const ai = getAIInstance();
    const isBengali = lang === "bn";

    const prompt = `
Create a GitHub ${type === "bug" ? "Bug Report" : "Feature Request"} issue template filled out in Markdown.
Repository: ${repoName || "Project"}
Context & Details provided by user:
${details}

${isBengali ? "Write explanations in Bengali, keeping issue template structure clear." : "Write in English."}

Return a JSON with:
{
  "title": "Suggested concise issue title (e.g., [BUG] ... or [FEAT] ...)",
  "body": "Complete Markdown issue body with sections like Steps to Reproduce / Expected Behavior / Actual Behavior / Proposed Solution"
}
Respond ONLY with valid JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch {
      return res.json({
        title: `[${type.toUpperCase()}] Issue Report`,
        body: responseText
      });
    }
  } catch (error: any) {
    console.error("Error generating issue:", error);
    res.status(500).json({ error: error.message || "Failed to generate issue" });
  }
});

// Start Vite middleware in dev or static serve in prod
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GitHub Nexus App running at http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
