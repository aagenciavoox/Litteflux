import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('VITE_GEMINI_API_KEY not configured. AI features will use fallback responses.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export interface CampaignAnalysis {
  summary: string;
  riskLevel: string;
  recommendedKPIs: string[];
  estimatedROI: string;
}

export const getSmartCampaignAnalysis = async (brand: string, goals: string): Promise<CampaignAnalysis> => {
  try {
    const ai = getClient();
    if (!ai) {
      return getFallbackAnalysis();
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analise o potencial para uma campanha entre a marca "${brand}" e um influenciador para os objetivos: "${goals}".

Forneça sua resposta em JSON com este formato exato:
{
  "summary": "Resumo estratégico em português",
  "riskLevel": "Baixo, Médio ou Alto",
  "recommendedKPIs": ["KPI1", "KPI2", "KPI3"],
  "estimatedROI": "ROI estimado (ex: 3.5x)"
}

O resultado DEVE ser em Português do Brasil. Responda APENAS com o JSON, sem markdown.`;

    const response = await model.generateContent(prompt);
    const textOutput = response.response.text();

    if (!textOutput) {
      throw new Error("Resposta vazia do Gemini");
    }

    try {
      const cleanedOutput = textOutput.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedOutput);
    } catch (parseError) {
      console.warn("Gemini retornou JSON inválido, tentando extração manual...");
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw parseError;
    }
  } catch (error) {
    console.error("Erro na análise do Gemini:", error);
    return getFallbackAnalysis();
  }
};

const getFallbackAnalysis = (): CampaignAnalysis => ({
  summary: "Análise inteligente não disponível. Configure VITE_GEMINI_API_KEY para habilitar.",
  riskLevel: "Indeterminado",
  recommendedKPIs: ["Alcance", "Engajamento", "Cliques"],
  estimatedROI: "N/A"
});

export const generatePitchEmail = async (brand: string, influencerName: string): Promise<string> => {
  try {
    const ai = getClient();
    if (!ai) {
      return "Configure VITE_GEMINI_API_KEY para habilitar a geração de pitch por IA.";
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Escreva um e-mail de prospecção profissional e amigável em Português do Brasil para uma agência de influenciadores apresentando ${influencerName} para a marca ${brand}. O tom deve ser impactante e conciso.`;

    const response = await model.generateContent(prompt);
    return response.response.text() || "Erro ao gerar e-mail.";
  } catch (error) {
    console.error("Erro ao gerar Pitch no Gemini:", error);
    return "Não foi possível gerar o pitch no momento. Verifique se o serviço está disponível.";
  }
};
