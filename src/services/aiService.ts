import { GoogleGenAI } from "@google/genai";

export async function generateInvoiceDescription(role: string, project: string) {
  try {
    // Check if user has selected an API key
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('No API key available for Gemini');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Génère une description professionnelle et concise pour une ligne de facture. 
      Rôle/Prestation: ${role}
      Projet: ${project}
      La description doit être en français, adaptée au secteur de l'audiovisuel et du cinéma en Algérie. 
      Exemple: "Prestation de Chef Opérateur Son pour le tournage du long-métrage 'Le Destin'."
      Réponds uniquement avec la description générée.`,
    });

    return response.text?.trim() || null;
  } catch (error: any) {
    console.error('Error generating description:', error);
    return null;
  }
}
