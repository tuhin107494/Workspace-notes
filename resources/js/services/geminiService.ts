import { GoogleGenAI } from "@google/genai";

// Ensure we have an API key (simulated check)
const API_KEY = process.env.API_KEY || '';

// Initialize client
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateNoteContent = async (title: string, currentContent: string, promptType: 'expand' | 'summarize' | 'fix'): Promise<string> => {
  if (!API_KEY) {
    console.warn("No API Key provided for Gemini.");
    return "AI generation unavailable: Missing API Key. Please configure process.env.API_KEY.";
  }

  const model = 'gemini-2.5-flash';
  
  let systemInstruction = "You are a helpful writing assistant for a professional SaaS notes application.";
  let userPrompt = "";

  switch (promptType) {
    case 'expand':
      userPrompt = `The note title is "${title}". The current content is:\n"${currentContent}"\n\nPlease continue writing this note. Add 2-3 detailed paragraphs relevant to the context. Use Markdown formatting.`;
      break;
    case 'summarize':
      systemInstruction = "You are an expert summarizer. Return a concise bulleted list.";
      userPrompt = `Summarize the following content:\n"${currentContent}"`;
      break;
    case 'fix':
      userPrompt = `Proofread and improve the grammar/clarity of the following text without changing the meaning. Keep Markdown formatting:\n"${currentContent}"`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content.");
  }
};
