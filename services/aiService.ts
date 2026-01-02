import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Language } from "../types";

const genAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface HealthData {
  pregnancyWeek: string;
  vaccinesDue: number;
  hydrationLevel: string;
  recentMood?: string;
}

export class AIService {
  // Model Constants for core health features
  // Following guidelines: gemini-3-flash-preview for basic text tasks
  private static fastModel = 'gemini-3-flash-preview';
  private static mapsModel = 'gemini-2.5-flash';
  private static complexModel = 'gemini-3-pro-preview';
  private static ttsModel = 'gemini-2.5-flash-preview-tts';

  static async chatAssistant(
    message: string, 
    locale: Language, 
    grounding: 'search' | 'maps' | 'none' = 'none',
    location?: { lat: number, lng: number }
  ): Promise<{ text: string, sources?: any[] }> {
    try {
      const ai = genAI();
      const config: any = {};
      let model = this.fastModel;

      // Use Maps Grounding if requested or if query looks spatial
      if (grounding === 'maps' || message.toLowerCase().includes('near me') || message.toLowerCase().includes('hospital')) {
        model = this.mapsModel;
        config.tools = [{ googleMaps: {} }];
        if (location) {
          config.toolConfig = {
            retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } }
          };
        }
      } else if (grounding === 'search') {
        model = this.complexModel;
        config.tools = [{ googleSearch: {} }];
        // Add thinking budget for complex search queries
        config.thinkingConfig = { thinkingBudget: 32768 };
      } else if (message.length > 200) {
        // Use thinking model for long/complex queries
        model = this.complexModel;
        config.thinkingConfig = { thinkingBudget: 32768 };
      }

      const response = await ai.models.generateContent({
        model,
        contents: `User: "${message}". Language: ${locale === 'bn' ? 'Bangla' : 'English'}. You are Nurture Glow assistant. Be warm, caring, and helpful.`,
        config
      });

      return {
        text: response.text || "I'm here to support you.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };
    } catch (error) {
      console.error("Assistant Error:", error);
      return { text: "I encountered an error. Please try again." };
    }
  }

  static async getHealthInsights(data: HealthData, locale: Language): Promise<string[]> {
    try {
      const ai = genAI();
      const response = await ai.models.generateContent({
        model: this.fastModel,
        contents: `Pregnant user data: Week ${data.pregnancyWeek}, Vaccines due: ${data.vaccinesDue}, Hydration: ${data.hydrationLevel}. Provide 3 short health tips in ${locale === 'bn' ? 'Bangla' : 'English'}. One per line.`,
      });
      // Extract text output using .text property directly
      const text = response.text || "";
      return text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    } catch (error) {
      return ["Stay hydrated.", "Keep tracking your symptoms.", "Consult your doctor for medical advice."];
    }
  }

  static async checkMyth(statement: string, locale: Language): Promise<{ status: string, explanation: string }> {
    try {
      const ai = genAI();
      const response = await ai.models.generateContent({
        model: this.fastModel,
        contents: `Verify this health myth in ${locale === 'bn' ? 'Bangla' : 'English'}: "${statement}".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, description: "Either 'Fact' or 'Myth'" },
              explanation: { type: Type.STRING, description: "Short medical explanation" }
            },
            required: ["status", "explanation"]
          }
        }
      });
      // Extract text output using .text property directly
      return JSON.parse(response.text?.trim() || '{"status":"Unknown","explanation":"No data"}');
    } catch (error) {
      return { status: 'Unknown', explanation: 'Could not verify at this time.' };
    }
  }

  static async generateSpeech(text: string, locale: Language): Promise<string> {
    try {
      const ai = genAI();
      const response = await ai.models.generateContent({
        model: this.ttsModel,
        contents: [{ parts: [{ text: `Say in ${locale === 'bn' ? 'Bangla' : 'English'}: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    } catch (error) {
      console.error("TTS Error:", error);
      return "";
    }
  }
}