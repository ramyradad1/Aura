import { GoogleGenAI, Modality, Type } from "@google/genai";

const _k = [
  "QUl6YVN5Q3ZZSXlXM3A3c1V3QkdpR1JiYXpvUjVUcnlfSTlZSDdF",
  "QUl6YVN5RGI5cHprS2ttZThHT0lOeUItTXlPSUF5UWc5QXpiS2N3",
  "QUl6YVN5QmZFelpJV1NQdi1NbFp6MHJQRF9mbXRZSTZXcC0wRXZR"
];

const getAi = () => {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    // Obfuscated rotation
    apiKey = atob(_k[Math.floor(Math.random() * _k.length)]);
  }
  return new GoogleGenAI({ apiKey });
};

export async function chatWithGemini(message: string, history: {role: string, parts: {text: string}[]}[] = []) {
  try {
    const ai = getAi();
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are a helpful assistant for a perfume store called 'Aura'. You help users find the perfect inspired perfume. You can answer questions about notes, categories (men, women, unisex), and recommendations. Be polite and concise in Arabic.",
      },
    });
    
    // We would ideally pass history here, but for simplicity we just send the message
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.";
  }
}

export async function generatePerfumeAdVideo(prompt: string) {
  try {
    const ai = getAi();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A cinematic, high-quality commercial for a luxury perfume. ${prompt}`,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return downloadLink || '';
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
}

export async function generatePerfumeBottleImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: `A highly detailed, photorealistic image of a luxury perfume bottle. ${prompt}` },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        }
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
}

export async function findNearestStore(location: string) {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find perfume stores or luxury boutiques near ${location}.`,
      config: {
        tools: [{googleMaps: {}}],
      },
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const places = (chunks?.map(chunk => chunk.web?.uri || chunk.maps?.uri).filter(Boolean) as string[]) || [];
    
    return {
      text: response.text || '',
      places
    };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    throw error;
  }
}

export async function searchPerfumeTrends(query: string) {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for the latest trends and reviews about inspired perfumes: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const links = (chunks?.map(chunk => chunk.web?.uri).filter(Boolean) as string[]) || [];
    
    return {
      text: response.text || '',
      links
    };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    throw error;
  }
}

export async function getQuizRecommendations(answers: any, perfumes: any[]) {
  try {
    const ai = getAi();
    const perfumeList = perfumes.map(p => `${p.id}: ${p.name} (Inspired by: ${p.inspiredBy}, Category: ${p.category}, Notes: ${JSON.stringify(p.notes)})`).join('\n');
    
    const prompt = `
      Based on these user preferences from a quiz:
      - Preferred Scent Type: ${answers.scentType}
      - Desired Mood: ${answers.mood}
      - Occasion: ${answers.occasion}
      - Intensity: ${answers.intensity}
      ${answers.details ? `- Additional Details: ${answers.details}` : ''}
      
      And this list of available perfumes:
      ${perfumeList}
      
      Pick the top 3 perfumes that best match the user's preferences.
      Return ONLY a JSON array of the perfume IDs.
      Example: ["1", "2", "3"]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Quiz Recommendation Error:", error);
    return [];
  }
}

export async function fastPerfumeRecommendation(preferences: string) {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 3 inspired perfumes based on these preferences: ${preferences}. Format as a simple list in Arabic.`,
    });
    return response.text;
  } catch (error) {
    console.error("Fast Recommendation Error:", error);
    throw error;
  }
}

export async function generateEgyptianTranslation(nameEn: string, descEn: string) {
  try {
    const ai = getAi();
    const prompt = `
      Translate the following perfume name and description to Egyptian Arabic (العامية المصرية الراقية والمفهومة). 
      Make it sound appealing, persuasive, and natural for an Egyptian e-commerce perfume store.
      
      English Name: ${nameEn}
      English Description: ${descEn}
      
      Return ONLY a JSON object with the following keys, no markdown, no other text:
      {
        "nameAr": "...",
        "descAr": "..."
      }
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nameAr: { type: Type.STRING },
            descAr: { type: Type.STRING }
          },
          required: ["nameAr", "descAr"]
        }
      }
    });

    return JSON.parse(response.text || '{"nameAr":"","descAr":""}');
  } catch (error) {
    console.error("Translation Generation Error:", error);
    throw error;
  }
}

export async function translateText(text: string, targetLang: 'ar' | 'en') {
  try {
    const ai = getAi();
    const prompt = targetLang === 'en' 
      ? `Translate the following text from Arabic to English. Return ONLY the English translation, no quotes, no markdown, no other text.\n\nText: ${text}`
      : `Translate the following text from English to Egyptian Arabic (العامية المصرية الراقية المفهومة). Return ONLY the Arabic translation, no quotes, no markdown, no other text.\n\nText: ${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translate Text Error:", error);
    return text;
  }
}

export async function generateSEOMetadata(pageType: string, currentData: any) {
  try {
    const ai = getAi();
    const prompt = `
      You are an expert SEO specialist for an Egyptian inspired-perfumes e-commerce store called 'Aura Perfumes'.
      Generate highly optimized, catchy, and conversion-focused SEO meta tags for the '${pageType}' page.
      The store sells high-quality inspired perfumes (عطور مستوحاة) in Egypt.
      
      Current Data (if any): ${JSON.stringify(currentData)}
      
      Requirements:
      - Title should be catchy, under 60 characters.
      - Description should be compelling, under 160 characters, with a call to action.
      - Keywords should be comma-separated, highly relevant search terms.
      - Provide both English and Arabic (Egyptian flavor) versions.
      
      Return ONLY a JSON object with the following keys, no markdown, no other text:
      {
        "titleEn": "...",
        "titleAr": "...",
        "descEn": "...",
        "descAr": "...",
        "keywordsEn": "...",
        "keywordsAr": "..."
      }
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use a more capable model for reasoning about SEO
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleEn: { type: Type.STRING },
            titleAr: { type: Type.STRING },
            descEn: { type: Type.STRING },
            descAr: { type: Type.STRING },
            keywordsEn: { type: Type.STRING },
            keywordsAr: { type: Type.STRING }
          },
          required: ["titleEn", "titleAr", "descEn", "descAr", "keywordsEn", "keywordsAr"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("SEO Generation Error:", error);
    throw error;
  }
}

export async function generateProductDescription(name: string, inspiredBy: string, category: string) {
  try {
    const ai = getAi();
    const prompt = `
      أنت خبير تسويق لمتجر عطور مستوحاة مصري اسمه Aura Perfumes.
      اكتب وصف تسويقي جذاب وقصير (3-4 جمل) لعطر اسمه "${name}" مستوحى من "${inspiredBy}" للفئة: ${category === 'men' ? 'رجالي' : category === 'women' ? 'نسائي' : 'للجنسين'}.
      - اكتب بالعامية المصرية الراقية المفهومة
      - خلي الوصف يحسس القارئ بالفخامة والجودة
      - اذكر إن العطر مستوحى من الأصلي وبيوفر نفس التجربة بسعر أحسن
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            descriptionEn: { type: Type.STRING }
          },
          required: ["description", "descriptionEn"]
        }
      }
    });

    return JSON.parse(response.text || '{"description":"","descriptionEn":""}');
  } catch (error) {
    console.error("Product Description Error:", error);
    throw error;
  }
}

export async function generatePolicy(policyType: 'refund' | 'terms' | 'privacy') {
  try {
    const ai = getAi();
    const types: Record<string, string> = {
      refund: 'سياسة الاسترجاع والاستبدال',
      terms: 'الشروط والأحكام',
      privacy: 'سياسة الخصوصية'
    };
    
    const prompt = `
      أنت محامي ومتخصص في التجارة الإلكترونية المصرية.
      اكتب ${types[policyType]} لمتجر "Aura Perfumes" - متجر عطور مستوحاة أونلاين في مصر.
      
      المتطلبات:
      - اكتب بالعربية الفصحى البسيطة (مش عامية)
      - التنسيق يكون بـ Markdown (عناوين # وقوائم -)
      - يكون شامل وقانوني ومهني
      - يشمل: الشحن داخل مصر، الدفع عند الاستلام أو أونلاين، العطور منتج حساس (لا يُرجع بعد فتحه)
      - لا تزيد عن 800 كلمة
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || '';
  } catch (error) {
    console.error("Policy Generation Error:", error);
    throw error;
  }
}

export async function generateReviewReply(reviewerName: string, rating: number, comment: string, productName: string) {
  try {
    const ai = getAi();
    const prompt = `
      أنت مدير خدمة العملاء في Aura Perfumes (متجر عطور مصري).
      اكتب رد مهني ومحترم على تقييم العميل ده:
      
      اسم العميل: ${reviewerName}
      المنتج: ${productName}
      التقييم: ${rating}/5 نجوم
      التعليق: "${comment}"
      
      المتطلبات:
      - اكتب بالعامية المصرية الراقية
      - لو التقييم إيجابي (4-5): اشكره وشجعه يرجع تاني
      - لو التقييم سلبي (1-2): اعتذر بلطف واعرض حل أو تواصل
      - لو متوسط (3): اشكره على رأيه ووعده بالتحسين
      - الرد يكون قصير (2-3 جمل)
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING }
          },
          required: ["reply"]
        }
      }
    });

    return JSON.parse(response.text || '{"reply":""}');
  } catch (error) {
    console.error("Review Reply Generation Error:", error);
    throw error;
  }
}

export async function generateCouponCode(occasion: string) {
  try {
    const ai = getAi();
    const prompt = `
      Generate a creative, catchy coupon code for an Egyptian perfume store called "Aura Perfumes".
      The occasion/theme is: "${occasion}"
      
      Requirements:
      - Code should be 6-10 characters, uppercase, easy to remember
      - Suggest a discount percentage that makes sense for this occasion
      - Write a short promotional message in Egyptian Arabic (العامية المصرية)
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            discount: { type: Type.NUMBER },
            message: { type: Type.STRING }
          },
          required: ["code", "discount", "message"]
        }
      }
    });

    return JSON.parse(response.text || '{"code":"","discount":10,"message":""}');
  } catch (error) {
    console.error("Coupon Generation Error:", error);
    throw error;
  }
}

export async function generateGEOData(businessInfo: any) {
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
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("GEO Generation Error:", error);
    throw error;
  }
}

export interface SmartRecommendationInput {
  perfumes: any[];
  viewedProductIds: string[];
  wishlistIds: string[];
  cartItemIds: string[];
  quizResults?: any;
  currentPerfumeId?: string;
}

export interface SmartRecommendationResult {
  bestSellers: string[];
  personalPicks: string[];
  reasoning: string;
}

export async function getSmartRecommendations(input: SmartRecommendationInput): Promise<SmartRecommendationResult> {
  try {
    const ai = getAi();

    const perfumeList = input.perfumes
      .filter(p => p.id !== input.currentPerfumeId)
      .map(p => `${p.id}: ${p.name} (Inspired by: ${p.inspiredBy}, Category: ${p.category}, Price: ${p.price}, Notes: ${JSON.stringify(p.notes || {})})`)
      .join('\n');

    const viewedPerfumes = input.perfumes.filter(p => input.viewedProductIds.includes(p.id));
    const viewedSummary = viewedPerfumes.length > 0
      ? viewedPerfumes.map(p => `${p.name} (${p.category}, Notes: ${JSON.stringify(p.notes || {})})`).join(', ')
      : 'لا يوجد';

    const wishlistPerfumes = input.perfumes.filter(p => input.wishlistIds.includes(p.id));
    const wishlistSummary = wishlistPerfumes.length > 0
      ? wishlistPerfumes.map(p => `${p.name} (${p.category})`).join(', ')
      : 'لا يوجد';

    const cartPerfumes = input.perfumes.filter(p => input.cartItemIds.includes(p.id));
    const cartSummary = cartPerfumes.length > 0
      ? cartPerfumes.map(p => `${p.name} (${p.category})`).join(', ')
      : 'لا يوجد';

    const prompt = `
      أنت خبير توصيات عطور ذكي لمتجر "Aura Perfumes" — متجر عطور مستوحاة مصري.
      
      سلوك المستخدم:
      - العطور اللي شافها: ${viewedSummary}
      - الويشلست: ${wishlistSummary}  
      - السلة: ${cartSummary}
      ${input.quizResults ? `- نتائج الكويز: ${JSON.stringify(input.quizResults)}` : ''}
      
      قائمة العطور المتاحة:
      ${perfumeList}
      
      المطلوب:
      1. "bestSellers": اختر أفضل 4 عطور كـ "الأكثر مبيعاً" — العطور الأكثر جاذبية وشعبية بشكل عام
      2. "personalPicks": اختر 4 عطور مخصصة للمستخدم بناءً على سلوكه وذوقه
         - لو المستخدم ملوش سلوك واضح، اختر عطور متنوعة ومميزة
         - لو المستخدم عنده سلوك، حلل ذوقه (الكاتيجوري المفضلة، النوتات اللي بيحبها) واقترح عطور تناسبه
      3. "reasoning": اكتب سبب قصير بالعامية المصرية الراقية يوضح ليه اخترت الاقتراحات دي (جملة أو اتنين)
      
      ملاحظات:
      - ما تكررش نفس العطر في bestSellers و personalPicks
      - رجع IDs بس في الـ arrays
      - الـ reasoning يكون بالعامية المصرية المفهومة
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestSellers: { type: Type.ARRAY, items: { type: Type.STRING } },
            personalPicks: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING }
          },
          required: ["bestSellers", "personalPicks", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text || '{"bestSellers":[],"personalPicks":[],"reasoning":""}');
  } catch (error) {
    console.error("Smart Recommendation Error:", error);
    return { bestSellers: [], personalPicks: [], reasoning: '' };
  }
}
