
import { GoogleGenAI, Type } from "@google/genai";
import { Exhibit, ExhibitCategory } from "../types";

// Schema for structured exhibit extraction
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
        factor: { type: Type.STRING, description: "Which NB FSA s.17 factor this relates to (e.g., Safety, Emotional Ties, Stability)" },
        legalArgument: { type: Type.STRING, description: "A high-impact 2-sentence argument for the court linking this evidence to Harper's best interests." }
      },
      required: ["factor", "legalArgument"]
    },
    reflection: { type: Type.STRING, description: "A brief, honest note to Harper about why this moment matters for her safety." },
    contradictionNote: { type: Type.STRING, description: "Details of how this evidence contradicts the Applicant's claims." },
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
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Processes an uploaded file for forensic evidence extraction.
 */
export const processExhibitFile = async (
  base64Data: string, 
  mimeType: string, 
  fileName: string,
  lastExhibitNum: number
): Promise<Partial<Exhibit>> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
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

  return JSON.parse(response.text || '{}');
};

/**
 * Generates a formal affidavit draft.
 */
export const generateAffidavitDraft = async (exhibits: Exhibit[], focus: 'SAFETY' | 'CONTEMPT' | 'STABILITY' | 'GENERAL' = 'GENERAL'): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const context = exhibits.map(e => 
    `EXHIBIT ${e.exhibitNumber} [${e.date}]: ${e.description}. Relevance: ${e.legalRelevance}.`
  ).join('\n');

  const response = await ai.models.generateContent({
    model,
    contents: `Draft Statement of Facts focusing on: ${focus}.\n\nEVIDENCE:\n${context}`,
    config: {
      systemInstruction: "Senior legal drafting for NB Family Court. Clinical, forensic, explicitly reference exhibit numbers. Focus on child safety."
    }
  });

  return response.text || "Drafting failed.";
};

/**
 * Performs a forensic perjury scan on an applicant's statement.
 */
export const analyzeForPerjury = async (applicantStatement: string, exhibits: Exhibit[]) => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const context = exhibits
    .map(ex => `EXHIBIT ${ex.exhibitNumber}: ${ex.description} (${ex.date})`)
    .join('\n');

  const response = await ai.models.generateContent({
    model,
    contents: `Analyze Statement:\n"${applicantStatement}"\n\nAgainst Evidence:\n${context}`,
    config: {
      systemInstruction: "Forensic Perjury Analyst. Identify direct contradictions. Be blunt. Use bullet points for: Claim, Counter-Evidence, Risk Level."
    }
  });
  
  return response.text;
};

/**
 * Analyzes raw text for legal forensics.
 */
export const analyzeLegalForensics = async (text: string): Promise<Partial<Exhibit>[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `EXTRACT INCIDENTS:\n${text}`,
    config: {
      systemInstruction: "Senior Legal Forensics Expert. Extract incidents as JSON objects. Map to s.17 factors. Frame for judicial review.",
      responseMimeType: "application/json",
      responseSchema: FORENSIC_LIST_SCHEMA
    }
  });

  return JSON.parse(response.text || '[]');
};

/**
 * Real-time legal consultation with context.
 * REFINED: Enforcing 2-sentence maximum for tactical brevity.
 */
export const chatWithGemini = async (message: string, exhibitsContext: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Exhibits Context: ${exhibitsContext}\n\nUser Question: ${message}`,
    config: {
      systemInstruction: `You are 'Pro-Counsel' for Case FDSJ-739-2024. 
      VOICE: Tactical, high-intelligence litigation commander.
      STRICT RULE: MAX 2 SENTENCES PER RESPONSE. 
      NO FLUFF. No polite greetings. No generic advice.
      Output must be purely strategic, legal strikes targeting Sole Custody and s.17 Best Interests.
      Speak in short, punchy, forensic commands.`
    }
  });
  return response.text;
};

/**
 * Provides a high-speed summary of evidence impact.
 */
export const fastEvidenceSummary = async (description: string, relevance: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Judicial Impact (5 words max): ${description} | ${relevance}`,
  });
  return response.text;
};

/**
 * Deep vision analysis for forensic image evidence.
 */
export const deepImageAnalysis = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  const model = 'gemini-2.5-flash-image';
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Forensic image scan. Person detection, hazard mapping, s.17 violations. Be concise." }
      ]
    }
  });
  return response.text;
};
