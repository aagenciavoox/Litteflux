
import { GoogleGenAI, Type } from "@google/genai";

// Segurança: Use process.env.API_KEY diretamente
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartCampaignAnalysis = async (brand: string, goals: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o potencial para uma campanha entre a marca "${brand}" e um influenciador para os objetivos: "${goals}". Forneça um resumo estratégico, nível de risco e 3 KPIs recomendados. O resultado DEVE ser em Português do Brasil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Resumo estratégico em português' },
            riskLevel: { type: Type.STRING, description: 'Baixo, Médio ou Alto' },
            recommendedKPIs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            estimatedROI: { type: Type.STRING, description: 'ROI estimado (ex: 3.5x)' }
          },
          required: ['summary', 'riskLevel', 'recommendedKPIs', 'estimatedROI']
        }
      }
    });

    // Sanitização de Saída: Validar se é um JSON válido
    const textOutput = response.text;
    if (!textOutput) throw new Error("Resposta vazia do Gemini");
    
    try {
      return JSON.parse(textOutput.trim());
    } catch (parseError) {
      console.warn("Gemini retornou JSON inválido, tentando extração manual...");
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw parseError;
    }
  } catch (error) {
    console.error("Erro na análise do Gemini:", error);
    return {
      summary: "Falha na análise inteligente. Verifique sua conexão ou API Key.",
      riskLevel: "Indeterminado",
      recommendedKPIs: ["Alcance", "Engajamento", "Cliques"],
      estimatedROI: "N/A"
    };
  }
};

export const generatePitchEmail = async (brand: string, influencerName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Escreva um e-mail de prospecção profissional e amigável em Português do Brasil para uma agência de influenciadores apresentando ${influencerName} para a marca ${brand}. O tom deve ser impactante e conciso.`,
    });
    return response.text || "Erro ao gerar e-mail.";
  } catch (error) {
    console.error("Erro ao gerar Pitch no Gemini:", error);
    return "Não foi possível gerar o pitch no momento. Verifique se o serviço está disponível.";
  }
};
