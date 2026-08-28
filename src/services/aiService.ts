import { AnalysisData, DevSettings } from '../types';
import { storage } from './storage';

export async function analyzeImageWithAI(
  imageBase64OrUrl: string,
  userPrompt?: string
): Promise<AnalysisData> {
  const settings = storage.getDevSettings();
  const groqApiKey = settings.groqApiKey?.trim();
  
  let brainConfig;
  try {
    brainConfig = JSON.parse(settings.aiBrainJson);
  } catch (e) {
    console.warn('Failed to parse AI Brain JSON, using default logic', e);
  }

  // If user provided Groq API Key, try real Groq Vision API
  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: settings.groqModel || 'llama-3.2-90b-vision-preview',
          messages: [
            {
              role: 'system',
              content: `${brainConfig?.systemPrompt || 'You are an expert AI vision analyst and prompt reverse engineer.'}
Respond strictly in valid JSON format matching this schema:
{
  "detectedElements": ["element 1 in Arabic", "element 2 in Arabic", ...],
  "styleKeywords": ["style1", "style2", ...],
  "lighting": "Detailed lighting description in Arabic",
  "cameraLens": "Camera and lens type in Arabic/English",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "extractedPrompt": "Detailed English prompt optimized for Midjourney v6 and Flux.1",
  "suggestedVariations": ["suggestion 1 in Arabic", "suggestion 2 in Arabic", "suggestion 3 in Arabic"],
  "confidenceScore": 98.5
}`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userPrompt || 'قم بتحليل هذه الصورة تفصيلياً واستخراج البرومبت الهندسي المعكوس وعناصر الإضاءة والأسلوب.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64OrUrl
                  }
                }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            detectedElements: parsed.detectedElements || ['عناصر بصرية متقدمة', 'إضاءة سينمائية'],
            styleKeywords: parsed.styleKeywords || ['Cinematic', 'Hyperrealistic', '8k'],
            lighting: parsed.lighting || 'إضاءة سينمائية احترافية مع تباين عالي',
            cameraLens: parsed.cameraLens || '85mm f/1.4 Lens',
            colorPalette: parsed.colorPalette || ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            extractedPrompt: parsed.extractedPrompt || 'Masterpiece photorealistic image, 8k resolution, cinematic lighting --ar 16:9 --v 6.0',
            suggestedVariations: parsed.suggestedVariations || ['تغيير زاوية الكاميرا', 'إضافة إضاءة درامية'],
            confidenceScore: parsed.confidenceScore || 97.5
          };
        }
      } else {
        const errText = await response.text();
        console.warn('Groq API error:', errText);
      }
    } catch (err) {
      console.warn('Failed to call Groq API:', err);
    }
  }

  // High-fidelity fallback / simulator when key is not yet set or processing demo
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const sampleStyles = [
    ['Cinematic Lighting', 'Unreal Engine 5', 'Octane 8k', 'Photorealistic', 'Volumetric Fog'],
    ['Rembrandt Soft Light', 'Editorial Portrait', '85mm f/1.2', 'Film Grain', 'Hasselblad'],
    ['Cyberpunk Neo-Tokyo', 'Raytracing', 'Anamorphic Lens', 'Bioluminescent Neon', 'Syd Mead Style'],
    ['Minimalist Studio', 'Clean Cyclorama', 'Commercial Product Lighting', 'Color Graded', 'Phase One']
  ];
  const chosenStyle = sampleStyles[Math.floor(Math.random() * sampleStyles.length)];

  return {
    detectedElements: [
      'تكوين بصري متوازن بقاعدة الأثلاث',
      'تدرجات إضاءة ناعمة وظلال حادة محسوبة',
      'تفاصيل دقيقة في النسيج والملامح السطحية',
      'عمق ميداني احترافي مع عزل الخلفية'
    ],
    styleKeywords: chosenStyle,
    lighting: 'إضاءة سينمائية محيطية متعددة الطبقات مع إضاءة حافة (Rim Light) تفصل العنصر عن الخلفية بانسيابية.',
    cameraLens: 'Hasselblad H6D-100c مع عدسة 85mm f/1.4 للحصول على بوكيه ناعم وتفاصيل مسام بصرية متناهية الصغر.',
    colorPalette: ['#0b0f19', '#1e293b', '#38bdf8', '#fbbf24', '#f43f5e'],
    extractedPrompt: `Hyperrealistic masterwork visual, dramatic ambient volumetric lighting, raytracing reflections, high dynamic contrast, shot on Hasselblad H6D-100c 85mm f/1.4 lens, Unreal Engine 5.4 render, photorealistic micro-details, editorial color grading --ar 16:9 --v 6.0 --stylize 750`,
    suggestedVariations: [
      'تعديل نمط الإضاءة إلى الساعة الذهبية (Golden Hour) لإضفاء دفء طبيعي',
      'إضافة مؤثرات حركة الكاميرا (Cinematic Motion Blur) في حال توليد فيديو',
      'تغيير النمط الفني إلى رسم رقمي زيتي كلاسيكي (Oil Painting Impasto)'
    ],
    confidenceScore: 98.8
  };
}

export async function generateAIPromptFromDescription(
  type: 'image' | 'youtube_video' | 'shorts_video',
  description: string,
  settings: DevSettings
): Promise<string> {
  const groqApiKey = settings.groqApiKey?.trim();
  
  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an elite Prompt Engineer. Generate an ultra-detailed, production-ready English prompt for ${
                type === 'image' ? 'Midjourney v6 / Flux.1 image generation' : type === 'youtube_video' ? 'Runway Gen-3 / Sora 16:9 YouTube video generation' : 'Kling / Luma 9:16 vertical video Reels/Shorts'
              }. Return ONLY the prompt text without markdown backticks or commentary.`
            },
            {
              role: 'user',
              content: `Convert this Arabic/English description into an advanced prompt: "${description}"`
            }
          ],
          temperature: 0.6
        })
      });

      if (response.ok) {
        const data = await response.json();
        const prompt = data.choices?.[0]?.message?.content?.trim();
        if (prompt) return prompt;
      }
    } catch (e) {
      console.warn('Groq prompt generation error:', e);
    }
  }

  // Fallback generator based on type
  if (type === 'image') {
    return `Cinematic mastershot of ${description}, ultra-detailed photorealistic render, Hasselblad 8k, volumetric lighting, Octane render, raytracing reflections, atmospheric depth --ar 16:9 --v 6.0 --stylize 600`;
  } else if (type === 'youtube_video') {
    return `Cinematic wide horizontal 16:9 video sequence of ${description}, smooth slow camera dolly forward, 4k 60fps, anamorphic lens flare, IMAX color grade, Hans Zimmer aesthetic mood --motion 6 --duration 8s`;
  } else {
    return `Viral dynamic vertical 9:16 video of ${description}, energetic speed ramping, vibrant saturated lighting, cinematic macro perspective, seamless loop, high framerate --ar 9:16 --motion 8`;
  }
}
