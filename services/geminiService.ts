
import { GoogleGenAI, Type } from "@google/genai";
import { Exhibit, ExhibitCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const EXHIBIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    exhibitNum: { type: Type.STRING },
    date: { type: Type.STRING },
    category: { 
      type: Type.STRING, 
      enum: Object.values(ExhibitCategory) 
    },
    description: { type: Type.STRING },
    legalRelevance: { type: Type.STRING },
    caption: { type: Type.STRING },
    source: { type: Type.STRING },
    authentication: { type: Type.STRING }
  },
  required: ["exhibitNum", "date", "category", "description", "legalRelevance", "caption"]
};

export const processExhibitFile = async (
  base64Data: string, 
  mimeType: string, 
  fileName: string,
  lastExhibitNum: number
): Promise<Partial<Exhibit>> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `You are a legal exhibit organizer for a New Brunswick Family Court case.
  Analyze this file: ${fileName}.
  Generate a professional exhibit entry. This is exhibit A-${lastExhibitNum + 1}.
  Refer to the Family Services Act SNB 2014 c.6 s.17 (Best Interests of Child) where applicable.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: EXHIBIT_SCHEMA
    }
  });

  const data = JSON.parse(response.text || '{}');
  
  return {
    exhibitNum: data.exhibitNum || `A-${lastExhibitNum + 1}`,
    date: data.date || "Unknown Date",
    category: data.category as ExhibitCategory || ExhibitCategory.INTEGRITY,
    description: data.description || "No description provided.",
    legalRelevance: data.legalRelevance || "Child's best interest assessment.",
    caption: data.caption || "Official exhibit record.",
    chainOfCustody: {
      source: data.source || "User provided file",
      dateObtained: new Date().toLocaleDateString(),
      custody: "Stored in secure digital evidence locker",
      authentication: data.authentication || "Timestamp and visual metadata",
      status: 'Ready'
    }
  };
};
