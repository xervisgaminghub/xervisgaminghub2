import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI | null => {
  if (aiInstance) return aiInstance;
  
  try {
    // Standard access as defined in vite.config.ts
    // @ts-ignore
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. AI features will use fallback logic.");
      return null;
    }
    
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (e) {
    console.error("Failed to initialize Gemini AI:", e);
    return null;
  }
};

export async function generateGamingUsername(name: string): Promise<string> {
  try {
    const ai = getAi();
    if (!ai) {
      throw new Error("AI not initialized");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Generate a unique, cool, and futuristic gaming username for a person named "${name}". 
      The username should be one word, alphanumeric, and sound like a pro gamer or cyberpunk character. 
      Return ONLY the username, nothing else.`,
    });
    
    return response.text.trim().replace(/\s+/g, '_');
  } catch (error) {
    console.error("Error generating username:", error);
    // Fallback logic if AI fails or is not initialized
    return `${name.toLowerCase().replace(/\s+/g, '')}_${Math.floor(Math.random() * 1000)}`;
  }
}
