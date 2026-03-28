import { GoogleGenAI } from "@google/genai";
import { compressImage } from "../utils/image";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export async function generateAppIcon(prompt: string) {
  try {
    // Check if user has selected an API key (required for Gemini 3 series)
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // After opening, we assume they selected one or we'll fail later
      }
    }

    // Use the key from process.env.API_KEY which is injected after selection
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('No API key available for Gemini');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = `data:image/png;base64,${part.inlineData.data}`;
        // Compress the generated icon to keep document size small
        return await compressImage(base64Data, 256, 256, 0.8);
      }
    }
    return null;
  } catch (error: any) {
    if (error?.message?.includes("Requested entity was not found")) {
      // Reset key selection if it fails
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      }
    }
    console.error('Error generating app icon:', error);
    return null;
  }
}
