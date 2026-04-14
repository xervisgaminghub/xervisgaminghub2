import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateGamingUsername(name: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `Generate a unique, cool, and futuristic gaming username for a person named "${name}". 
      The username should be one word, alphanumeric, and sound like a pro gamer or cyberpunk character. 
      Return ONLY the username, nothing else.`,
    });
    
    return response.text.trim().replace(/\s+/g, '_');
  } catch (error) {
    console.error("Error generating username:", error);
    return `${name.toLowerCase().replace(/\s+/g, '')}_${Math.floor(Math.random() * 1000)}`;
  }
}
