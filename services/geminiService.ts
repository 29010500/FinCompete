import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, FinancialMetrics } from "../types";

const processEnvApiKey = process.env.API_KEY;

if (!processEnvApiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

const MODEL_ID = "gemini-2.5-flash";

const METRICS_LIST = `
- Name
- Ticker
- Price
- Market Cap
- ROE
- ROIC
- EV/EBIT
- PER
- FCF per Share (Check Fiscal.ai/TIKR. If missing, calc: (Op. Cash Flow - CapEx) / Shares).
- Beta
- Ke (Cost of Equity)
- Kd (Cost of Debt)
- WACC
`;

const JSON_SCHEMA_INSTRUCTION = `
Format: JSON Array of objects.
Keys: "name", "ticker", "price", "marketCap", "roe", "roic", "evEbit", "per", "fcfPerShare", "beta", "ke", "kd", "wacc".
Values: Strings (e.g. "15.4%", "$145.20"). Use "-" if not found.
`;

export const analyzeCompetitors = async (query: string): Promise<AnalysisResult> => {
  const prompt = `
    Analyze "${query}" and its top 5 public competitors.
    
    Task:
    1. Identify the 5 most relevant public competitors.
    2. Search for the latest financial data for the main company and these 5 competitors.
    
    Prioritize sources like Yahoo Finance, TIKR, and Fiscal.ai.
    For "FCF per Share", you MUST check Fiscal.ai or TIKR, or calculate it manually if the direct figure is missing.

    Metrics to find:
    ${METRICS_LIST}

    ${JSON_SCHEMA_INSTRUCTION}
    Return ONLY valid JSON.
  `;

  return executeGeminiRequest(prompt);
};

export const analyzeSingleCompany = async (query: string): Promise<{ company: FinancialMetrics, sources: Array<{ title: string; uri: string }> }> => {
  const prompt = `
    Analyze the company: "${query}".
    
    Task: Search for the latest financial data for this specific company.
    
    Prioritize sources like Yahoo Finance, TIKR, and Fiscal.ai.
    For "FCF per Share", you MUST check Fiscal.ai or TIKR, or calculate it manually.

    Metrics to find:
    ${METRICS_LIST}

    ${JSON_SCHEMA_INSTRUCTION}
    Return ONLY a JSON array containing a single object.
  `;

  const result = await executeGeminiRequest(prompt);
  return {
    company: result.companies[0],
    sources: result.sources
  };
};

const executeGeminiRequest = async (prompt: string): Promise<AnalysisResult> => {
  const maxRetries = 3;
  let delay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.1,
        },
      });

      const textResponse = response.text || "";
      
      // Extract JSON from the text response
      let cleanJson = textResponse;
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const startIdx = cleanJson.indexOf('[');
      const endIdx = cleanJson.lastIndexOf(']');
      
      if (startIdx === -1 || endIdx === -1) {
        throw new Error("Failed to parse financial data from API response.");
      }

      cleanJson = cleanJson.substring(startIdx, endIdx + 1);

      const companies: FinancialMetrics[] = JSON.parse(cleanJson);

      // Extract sources
      const sources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      chunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri || "#"
          });
        }
      });

      // Deduplicate sources
      const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

      return {
        companies,
        sources: uniqueSources.slice(0, 8)
      };

    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed:`, error);
      
      const isInternalError = 
        error?.status === 500 || 
        error?.status === 503 || 
        (error?.message && error.message.includes("Internal error"));

      if (attempt === maxRetries || !isInternalError) {
        console.error("Final Gemini API Error:", error);
        throw new Error("Unable to retrieve financial data. The server is busy or the query is too complex. Please try again.");
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error("Unexpected error in retry loop.");
};
