import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI, Type } from "@google/genai";

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateGEOData(businessInfo: any) {
  try {
    const ai = getAi();
    const prompt = `
      أنت خبير في Local SEO و GEO (Generative Engine Optimization) لمتجر عطور مستوحاة مصري اسمه "Aura Perfumes".
      
      بيانات النشاط الحالية (لو موجودة): ${JSON.stringify(businessInfo)}
      
      المطلوب توليده:
      1. بيانات النشاط المحلي (Local Business):
         - اسم النشاط بالعربي والإنجليزي
         - وصف النشاط المحلي (للظهور في Google Maps)
         - فئة النشاط في Google Business
         - مناطق الخدمة في مصر
      
      2. Schema.org JSON-LD (LocalBusiness):
         - structured data كامل وجاهز للاستخدام
      
      3. كلمات مفتاحية محلية:
         - كلمات بالعربي تستهدف مصر
         - كلمات بالإنجليزي تستهدف Egypt
      
      4. GEO Optimization:
         - وصف محسن لمحركات البحث التوليدية (AI Overviews, Bing Chat, etc.)
         - أسئلة شائعة (FAQ) للظهور في نتائج البحث
         - citations ومصادر موثوقة مقترحة
      
      Return a JSON object with these keys:
      {
        "businessNameEn": "...",
        "businessNameAr": "...",
        "businessDescEn": "...",
        "businessDescAr": "...",
        "googleCategory": "...",
        "serviceAreas": "...",
        "schemaJsonLd": "...",
        "localKeywordsAr": "...",
        "localKeywordsEn": "...",
        "geoDescEn": "...",
        "geoDescAr": "...",
        "faqJson": "...",
        "citations": "..."
      }
    `;
    
    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessNameEn: { type: Type.STRING },
            businessNameAr: { type: Type.STRING },
            businessDescEn: { type: Type.STRING },
            businessDescAr: { type: Type.STRING },
            googleCategory: { type: Type.STRING },
            serviceAreas: { type: Type.STRING },
            schemaJsonLd: { type: Type.STRING },
            localKeywordsAr: { type: Type.STRING },
            localKeywordsEn: { type: Type.STRING },
            geoDescEn: { type: Type.STRING },
            geoDescAr: { type: Type.STRING },
            faqJson: { type: Type.STRING },
            citations: { type: Type.STRING }
          },
          required: ["businessNameEn", "businessNameAr", "businessDescEn", "businessDescAr", "schemaJsonLd", "localKeywordsAr", "localKeywordsEn", "geoDescEn", "geoDescAr", "faqJson"]
        }
      }
    });

    console.log("Success! Raw JSON:");
    console.log(response.text);
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("GEO Generation Error:", error);
    throw error;
  }
}

generateGEOData({}).then(res => console.log(res)).catch(e => console.error(e));
