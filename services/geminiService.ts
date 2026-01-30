
import { GoogleGenAI, Type } from "@google/genai";
import { Exhibit, ExhibitCategory, CommunicationEntry } from "../types";
import { cacheService } from "./cache";

const COMM_LOG_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timestamp: { type: Type.STRING },
      sender: { type: Type.STRING },
      receiver: { type: Type.STRING },
      content: { type: Type.STRING },
      platform: { type: Type.STRING },
      sentiment: { type: Type.STRING }
    },
    required: ["timestamp", "sender", "content", "platform"]
  }
};

const EXHIBIT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    exhibitNumber: { type: Type.STRING },
    date: { type: Type.STRING },
    category: { type: Type.STRING },
    description: { type: Type.STRING },
    caption: { type: Type.STRING },
    legalRelevance: { type: Type.STRING },
    bestInterestFactor: { type: Type.STRING },
    bestInterestMapping: {
      type: Type.OBJECT,
      properties: {
        factor: { type: Type.STRING },
        legalArgument: { type: Type.STRING }
      },
      required: ["factor", "legalArgument"]
    },
    reflection: { type: Type.STRING },
    contradictionNote: { type: Type.STRING },
    priority: { type: Type.NUMBER },
    witnesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    transcript: { type: Type.STRING },
    perjuryFlag: { type: Type.BOOLEAN }
  },
  required: ["exhibitNumber", "date", "category", "description", "legalRelevance", "priority", "witnesses", "bestInterestMapping", "reflection"]
};

const FORENSIC_LIST_SCHEMA = {
  type: Type.ARRAY,
  items: EXHIBIT_SCHEMA
};

// Helper to create a new GoogleGenAI instance right before making an API call
// Use import.meta.env for Vite, fallback to empty string if not available
const getAPIKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
  }
  return '';
};

const getAI = () => {
  const apiKey = getAPIKey();
  if (!apiKey) {
    console.warn('No Gemini API key found. AI features will be limited.');
  }
  return new GoogleGenAI({ apiKey });
};

async function computeFileHash(base64Data: string): Promise<string> {
  const raw = atob(base64Data);
  const uint8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    uint8Array[i] = raw.charCodeAt(i);
  }
  const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Processes an uploaded file for forensic evidence extraction.
 */
export const processExhibitFile = async (
  base64Data: string,
  mimeType: string,
  fileName: string,
  lastExhibitNum: number
): Promise<Partial<Exhibit>> => {
  const apiKey = getAPIKey();

  // 1. Compute Hash
  const hash = await computeFileHash(base64Data);
  const cacheKey = `exhibit_analysis:${hash}`;

  // 2. Check Cache
  const cached = await cacheService.get<Partial<Exhibit>>(cacheKey);
  if (cached) {
    console.log('Cache hit for exhibit:', fileName);
    return cached;
  }

  // Fallback mode: No API key, use basic extraction from filename
  if (!apiKey) {
    console.log('Using fallback mode (no API key) for:', fileName);
    return {
      exhibitNumber: `${lastExhibitNum + 1}A`,
      date: new Date().toLocaleDateString(),
      category: 'INTEGRITY' as any,
      description: fileName,
      legalRelevance: 'Evidence to be reviewed',
      priority: 5,
      witnesses: [],
      bestInterestMapping: {
        factor: 'To be determined',
        legalArgument: 'Evidence requires manual review and categorization.'
      },
      reflection: '',
      perjuryFlag: false
    };
  }

  // AI mode: Use Gemini for analysis
  try {
    const ai = getAI();
    // Use specialized models from updated branch
    const model = 'gemini-3-pro-preview';

    const systemInstruction = `Act as a Senior Litigator for Case FDSJ-739-24.
    Analyze evidence for forensic relevance. 
    BE CONCISE. Use clinical legal language.
    1. Map to NB FSA s.17.
    2. Dec 9 or Sept 2025 incidents = CRITICAL.
    3. Frame as Applicant criminal instability vs Craig's stability.
    4. Perjury: Detail direct contradictions.`;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: `Analyze the file: ${fileName}. Reference last exhibit: ${lastExhibitNum}.` }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: EXHIBIT_SCHEMA
      }
    });

    const result = JSON.parse(response.text || '{}');

    // 3. Cache Result (Indefinite or long TTL since content doesn't change)
    if (result && result.description) { // Verify valid result before caching
      await cacheService.set(cacheKey, result, 1000 * 60 * 60 * 24 * 30); // 30 days
    }

    return result;
  } catch (error) {
    console.error('AI processing failed, using fallback:', error);
    // Fallback if AI fails
    return {
      exhibitNumber: `${lastExhibitNum + 1}A`,
      date: new Date().toLocaleDateString(),
      category: 'INTEGRITY' as any,
      description: fileName,
      legalRelevance: 'Evidence uploaded - AI processing failed',
      priority: 5,
      witnesses: [],
      bestInterestMapping: {
        factor: 'To be determined',
        legalArgument: 'Evidence requires manual review.'
      },
      reflection: '',
      perjuryFlag: false
    };
  }
};

export const extractCommunicationLog = async (data: string, mimeType: string): Promise<CommunicationEntry[]> => {
  const ai = getAI();
  const isImage = mimeType.startsWith('image/');
  // Use specialized image model for vision tasks, flash for basic text extraction
  const model = isImage ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview';

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        isImage ? { inlineData: { data, mimeType } } : { text: data },
        { text: "Extract a chronological list of messages. Identify sender, platform, and content. If a timestamp is visible or implied, include it." }
      ]
    },
    config: {
      systemInstruction: "Forensic Data Analyst. Extract communication logs into structured JSON. Format timestamps consistently.",
      responseMimeType: "application/json",
      responseSchema: COMM_LOG_SCHEMA
    }
  });

  const raw = JSON.parse(response.text || '[]');
  return raw.map((item: any) => ({
    id: Math.random().toString(36).substr(2, 9),
    ...item
  }));
};

export const generateAffidavitDraft = async (exhibits: Exhibit[], focus: string = 'GENERAL'): Promise<string> => {
  const ai = getAI();
  const context = exhibits.map(e => `EXHIBIT ${e.exhibitNumber}: ${e.description}`).join('\n');
  const response = await ai.models.generateContent({
    // Senior legal drafting requires the highest reasoning model
    model: 'gemini-3-pro-preview',
    contents: `Draft Statement of Facts focusing on: ${focus}.\n\nEVIDENCE:\n${context}`,
    config: { systemInstruction: "Senior legal drafting for NB Family Court." }
  });
  return response.text || "Drafting failed.";
};

export const analyzeForPerjury = async (applicantStatement: string, exhibits: Exhibit[]) => {
  const ai = getAI();
  const context = exhibits.map(ex => `EXHIBIT ${ex.exhibitNumber}: ${ex.description}`).join('\n');
  const response = await ai.models.generateContent({
    // Forensic perjury detection is a complex reasoning task
    model: 'gemini-3-pro-preview',
    contents: `Analyze Statement:\n"${applicantStatement}"\n\nAgainst Evidence:\n${context}`,
    config: { systemInstruction: "Forensic Perjury Analyst. Identify contradictions." }
  });
  return response.text;
};

export const analyzeLegalForensics = async (text: string): Promise<any[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    // Extraction of structured data from unstructured transcripts is a complex task
    model: 'gemini-3-pro-preview',
    contents: `EXTRACT INCIDENTS:\n${text}`,
    config: {
      systemInstruction: "Senior Legal Forensics Expert.",
      responseMimeType: "application/json",
      responseSchema: FORENSIC_LIST_SCHEMA
    }
  });
  return JSON.parse(response.text || '[]');
};

export const chatWithGemini = async (message: string, exhibitsContext: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    // Strategic consultation requires pro-tier reasoning
    model: 'gemini-3-pro-preview',
    contents: `Exhibits Context: ${exhibitsContext}\n\nUser Question: ${message}`,
    config: { systemInstruction: "Pro-Counsel Litigation Commander. MAX 2 SENTENCES." }
  });
  return response.text;
};

export const fastEvidenceSummary = async (description: string, relevance: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    // Basic summarization is handled well by the flash model
    model: 'gemini-3-flash-preview',
    contents: `Judicial Impact (5 words max): ${description} | ${relevance}`,
  });
  return response.text;
};

export const deepImageAnalysis = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  // Image analysis task uses the dedicated flash image model
  const model = 'gemini-2.5-flash-image';
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Forensic image scan. Person detection, hazard mapping, s.17 violations." }
      ]
    }
  });
  
  // Extract generated text from multimodal image response parts
  let resultText = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        resultText += part.text;
      }
    }
  }
  return resultText || response.text;
};
