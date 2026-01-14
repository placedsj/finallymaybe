
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
 * Uses gemini-3-flash-preview for efficient multimodal analysis.
 */
export const processExhibitFile = async (
  base64Data: string, 
  mimeType: string, 
  fileName: string,
  lastExhibitNum: number
): Promise<Partial<Exhibit>> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `Act as a Senior Litigator for Case FDSJ-739-24 (NB Family Court).
  Analyze the provided evidence file for forensic relevance.
  
  STRATEGY: 
  1. Map this evidence to the New Brunswick Family Services Act s.17 (Best Interests of the Child).
  2. If this involves the Dec 9 incident or Sept 2025 Assault charges, flag as CRITICAL child endangerment.
  3. Frame arguments to contrast the Applicant's criminal instability with Craig's documented safety and stable parenting.
  4. LEGACY: In 'reflection', write a brief, honest note to Harper about why this moment matters for her future safety.
  5. PERJURY: If this contradicts a claim of 'safety' or 'good parenting' by the Applicant, detail it in 'contradictionNote'.
  
  CATEGORIES: [VIOLENCE, SUBSTANCE, OBSTRUCTION, CUSTODY, FINANCIAL, MEDICAL, PERJURY, CONTEMPT, PARENTING, INTEGRITY].`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: `Analyze the file: ${fileName}. Use last exhibit number ${lastExhibitNum} as reference.` }
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
 * Switched to gemini-3-flash-preview to avoid paid key requirement.
 */
export const generateAffidavitDraft = async (exhibits: Exhibit[], focus: 'SAFETY' | 'CONTEMPT' | 'STABILITY' | 'GENERAL' = 'GENERAL'): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  const context = exhibits.map(e => 
    `EXHIBIT ${e.exhibitNumber} [${e.date}]: ${e.description}. 
     Legal Relevance: ${e.legalRelevance}. 
     Contradiction: ${e.contradictionNote || 'None'}. 
     s.17 Factor: ${e.bestInterestMapping?.factor || 'General'}.
     Priority: ${e.priority}/10.`
  ).join('\n---\n');

  const prompt = `Using the provided exhibits, draft a formal "Statement of Facts" for an Affidavit focusing on: ${focus}.
  
  EVIDENCE CONTEXT:
  ${context}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: "You are a professional legal drafting engine for high-stakes custody litigation specialized in New Brunswick Family Court (Case FDSJ-739-24). Organize content by NB FSA s.17 factors. Use clinical, forensic language. Reference exhibits explicitly by number. Focus on child safety and the 129-day contempt period."
    }
  });

  return response.text || "Unable to generate draft at this time.";
};

/**
 * Performs a forensic perjury scan on an applicant's statement.
 * Switched to gemini-3-flash-preview.
 */
export const analyzeForPerjury = async (applicantStatement: string, exhibits: Exhibit[]) => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const context = exhibits
    .map(ex => `EXHIBIT ${ex.exhibitNumber}: ${ex.description} (Date: ${ex.date}). Relevance: ${ex.legalRelevance}`)
    .join('\n');

  const prompt = `Analyze the following STATEMENT from the Applicant against the VERIFIED EXHIBITS provided.
  
  APPLICANT STATEMENT:
  "${applicantStatement}"

  VERIFIED EXHIBITS:
  ${context}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: `Act as a Forensic Legal Analyst for Case FDSJ-739-24. 
      TASK:
      1. Identify every claim in the STATEMENT that is contradicted by an EXHIBIT.
      2. For each contradiction, output:
         - The exact "Claim" being made.
         - The "Counter-Evidence" (Exhibit number and description).
         - The "Perjury Risk Level" (High, Medium, Low).
         - A "Judicial Note" on how this impacts the Applicant's credibility regarding Harper's safety.
      3. Use clear, objective, and clinical language. Use Markdown for formatting.`
    }
  });
  
  return response.text;
};

/**
 * Analyzes raw text for legal forensics.
 * Switched to gemini-3-flash-preview.
 */
export const analyzeLegalForensics = async (text: string): Promise<Partial<Exhibit>[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `Act as a Senior Legal Forensics Expert for Case FDSJ-739-24 (New Brunswick).
  Analyze the provided text for "weaponized transparency" and incident extraction.
  
  FOR EACH INCIDENT:
  1. Map to s.17 Factors: [Safety, Emotional Ties, Stability, Child's Views, Care Capacity].
  2. Draft specific legal arguments for a New Brunswick Judge.
  3. Detail any perjury risks in 'contradictionNote'.
  
  Return output as a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model,
    contents: `TEXT TO ANALYZE:\n${text}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: FORENSIC_LIST_SCHEMA
    }
  });

  return JSON.parse(response.text || '[]');
};

/**
 * Real-time legal consultation with context.
 * Switched to gemini-3-flash-preview.
 */
export const chatWithGemini = async (message: string, exhibitsContext: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Exhibits Context: ${exhibitsContext}\n\nClient Query: ${message}`,
    config: {
      systemInstruction: "You are 'Pro-Counsel', a senior legal AI advisor for Case FDSJ-739-2024. Your mission is to provide arguments for Sole Custody based on Harper's safety and the Applicant's criminal conduct (NB FSA s.17)."
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
    contents: `Summarize impact into a 5-word 'Judicial Impact' statement. Description: ${description}. Relevance: ${relevance}`,
  });
  return response.text;
};

/**
 * Deep vision analysis for forensic image evidence.
 * Switched to gemini-2.5-flash-image to avoid paid key requirement.
 */
export const deepImageAnalysis = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  const model = 'gemini-2.5-flash-image';
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Perform a deep legal forensic analysis of this image. Identify persons, safety hazards (weapons, threats), emotional state indicators, and s.17 violations (child endangerment). Explain how this protects the child." }
      ]
    }
  });
  return response.text;
};
