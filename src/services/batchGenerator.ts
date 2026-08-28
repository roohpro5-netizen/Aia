import { MediaItem, WindowId, DevSettings } from '../types';
import { cloudflareService } from './cloudflareService';

interface BatchGenerationOptions {
  windowId: WindowId;
  count?: number; // default 5
  devSettings?: DevSettings;
  customTopic?: string;
}

// High Quality Curated Portals Content Blueprint Engine
const PORTAL_TEMPLATES: Record<WindowId, Array<{
  title: string;
  description: string;
  url: string;
  videoUrl?: string;
  prompt: string;
  negativePrompt: string;
  model: string;
  tags: string[];
  aspectRatio: string;
  parameters?: Record<string, any>;
  analysisData?: any;
}>> = {
  // Window 1: Photorealistic (8K, Professional Cameras, Natural/Studio Light)
  1: [
    {
      title: 'صقر صحراوي مستقبلي بدرع كريستالي مذهب',
      description: 'لوحة سينمائية لصقر عربي في بيئة واحة سيبرانية بألوان ذهبية وفيزياء إضاءة فائقة الواقعية 8K.',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      prompt: 'A majestic Arabian falcon perched on an ancient futuristic dune, dramatic volumetric dusk lighting, Hasselblad 85mm f/1.4, cinematic 8k, photorealistic feathers with nano-circuit glow, hyperdetailed, natural sharp focus --ar 1:1 --v 6.1 --stylize 750',
      negativePrompt: 'blurry, low quality, oversaturated, deformed beak, extra wings, cartoonish, lowres, noise',
      model: 'Midjourney v6.1',
      tags: ['Falcon', 'Photorealistic', 'Arabian Heritage', '8K', 'Hasselblad'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.5, steps: 40, seed: 84920412 }
    },
    {
      title: 'بورتريه فتاة شرقية بعيون ياقوتية وأزياء حريرية',
      description: 'صورة استوديو فائقة الجودة بتفاصيل مسام الجلد وتدرجات إضاءة ناعمة بأسلوب ناشيونال جيوغرافيك.',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Editorial high fashion close-up portrait of an elegant woman with luminous amber eyes, soft studio rim lighting, 85mm f/1.2 lens, visible natural skin pores, National Geographic award winner, Kodak Portra 400 --ar 1:1 --v 6.1',
      negativePrompt: 'airbrushed, plastic skin, distorted eyes, bad anatomy, cartoon, drawing, low quality',
      model: 'FLUX.1 Dev',
      tags: ['Portrait', 'Fashion', 'Studio Light', 'Photorealistic', '8K'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.0, steps: 35, seed: 3904921 }
    },
    {
      title: 'سيارة سوبر سبورت كهربائية بلمسات الكاربون والبرونز',
      description: 'لقطة ليلية ديناميكية مع انعكاسات أضواء النيون على الأسفلت المبلل ورذاذ الماء المتطاير.',
      url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Futuristic matte bronze hypercar on a rain-slicked Tokyo street at midnight, vibrant neon reflections, water spray from wheels, crisp automotive photography, raytracing reflections, Sony A7R V 50mm f/1.4 --ar 1:1 --v 6.1',
      negativePrompt: 'blurry subject, damaged vehicle, deformed wheels, low detail, noisy',
      model: 'Imagen 3 Ultra',
      tags: ['Hypercar', 'Tokyo', 'Rain', 'Automotive', '8K'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.5, steps: 40, seed: 7819204 }
    },
    {
      title: 'قصر معماري أندلسي فوتوغرافي عند شروق الشمس',
      description: 'تفاصيل معمارية مذهلة للزخارف والأقواس الرخامية مع انعكاس الضوء الذهبي على النوافير.',
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Architectural photography of an Andalusian marble courtyard at sunrise, intricate muqarnas arches, crystal clear reflecting pool, golden hour soft light, high dynamic range 8k, Hasselblad H6D-100c --ar 1:1 --v 6.1',
      negativePrompt: 'ugly, disfigured, modern wires, low resolution, bad symmetry, pixelated',
      model: 'Midjourney v6.1',
      tags: ['Architecture', 'Andalusian', 'Marble', 'Sunrise', '8K'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 8.0, steps: 45, seed: 1409240 }
    },
    {
      title: 'فنجان قهوة مختصة مع تصاعد البخار وإضاءة الصباح',
      description: 'تصوير احترافي للماكرو يبرز قطرات الماء وتدرجات الكريما الدافئة على خلفية خشبية ريفية.',
      url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Macro commercial food photography of artisan latte art in a ceramic cup, delicate steam swirls in morning sunlight, rustic dark wooden table, shallow depth of field, 100mm macro lens f/2.8, 8k --ar 1:1',
      negativePrompt: 'spilled liquid, blurry, artificial looking, distorted mug, noisy',
      model: 'FLUX.1 Schnell',
      tags: ['Coffee', 'Macro', 'Morning', 'Food Photography', '8K'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 6.5, steps: 30, seed: 954120 }
    }
  ],

  // Window 2: 3D Digital Art & Anime (Octane, Unreal 5, Niji)
  2: [
    {
      title: 'محاربة سايبربانك بأنيمي ثلاثي الأبعاد مع سيف نيون',
      description: 'شخصية أنيمي متقنة في مدينة مستقبلية ممطرة بألوان بنفسجية ووردية متوهجة وإضاءة حجمية.',
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
      prompt: '3D Anime stylized cyber warrior girl standing on a skyscraper ledge in Neo-Tokyo, holding a glowing purple plasma katana, volumetric rain and neon billboards, Unreal Engine 5.4 render, Octane 3D, Makoto Shinkai aesthetic --ar 1:1 --niji 6',
      negativePrompt: 'bad anatomy, extra limbs, 2D flat, low quality, pixelated, washed out',
      model: 'Niji v6',
      tags: ['Anime', 'Cyberpunk', '3D Art', 'Neon', 'Katana'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.0, steps: 35, seed: 442109 }
    },
    {
      title: 'تنين كريستالي أرجواني عائم في سديم فضائي',
      description: 'فن رقمي مفاهيمي لمخلوق أسطوري مصنوع من البلورات المشعة المحاطة بحلقات الكواكب.',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Majestic crystalline dragon flying through a vibrant violet cosmic nebula, glowing amethyst scales, stardust particles, raytraced glass refraction, Cinema 4D Octane render, masterpiece concept art --ar 1:1',
      negativePrompt: 'dull colors, low poly, noisy background, muddy textures',
      model: 'DALL-E 3',
      tags: ['Fantasy', 'Dragon', 'Crystal', 'Space', '3D Render'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 8.0, steps: 40, seed: 681920 }
    },
    {
      title: 'روبوت ميكانيكي لطيف بأسلوب بيكسار في حديقة مضيئة',
      description: 'تصميم ثلاثي الأبعاد لشخصية روبوت صغير يكتشف زهرة مضيئة في بيئة غابية سحرية.',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Adorable miniature brass robot observing a glowing dandelion, Pixar 3D animation style, subsurface scattering on metals, warm magical sunset lighting, octane render, cozy atmosphere --ar 1:1',
      negativePrompt: 'scary, horror, dark, rusted, deformed metal, low quality',
      model: 'SDXL Turbo',
      tags: ['3D Character', 'Pixar Style', 'Cute Robot', 'Fantasy', 'Lighting'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 6.5, steps: 30, seed: 198273 }
    },
    {
      title: 'قلعة عائمة في السحاب بأسلوب استوديو غيبلي 3D',
      description: 'تصميم فني يدمج طراز الرسوم اليابانية مع عمق ثلاثي الأبعاد وإضاءة شمسية دافئة.',
      url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Magical floating fantasy castle surrounded by fluffy cumulus clouds and waterfalls flowing into the sky, Studio Ghibli inspired 3D aesthetic, cel-shaded vibrant colors, golden sunlight, masterpiece --ar 1:1',
      negativePrompt: 'flat, boring, grayscale, low resolution, artifacts',
      model: 'Midjourney v6.1',
      tags: ['Ghibli', 'Fantasy Castle', 'Clouds', 'Anime 3D', 'Sky'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.5, steps: 35, seed: 382910 }
    },
    {
      title: 'ساموراي مستقبلي ميكانيكي تحت شجرة كرز نيون',
      description: 'لوحة سايبربانك تمزج التراث الياباني مع الألياف الضوئية والدروع التيتانيوم.',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Mecha Cyber Samurai kneeling under a glowing holographic cherry blossom tree, titanium armor with LED accents, petals floating in volumetric purple fog, Octane 3D render, raytraced reflections --ar 1:1',
      negativePrompt: 'broken joints, low quality, noisy, ugly helmet',
      model: 'FLUX.1 Dev',
      tags: ['Samurai', 'Cyberpunk', 'Mecha', 'Neon', '3D Concept'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.0, steps: 40, seed: 827104 }
    }
  ],

  // Window 3: Cinematic AI Video (Protected Video Player, Camera Angles, 60fps)
  3: [
    {
      title: 'لقطة سينمائية لرحلة طائرة درون عبر وادٍ جليدي',
      description: 'حركة كاميرا فائقة السلاسة بين الجبال الجليدية مع انعكاسات الشفق القطبي والإضاءة السينمائية.',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0',
      prompt: 'Cinematic FPV drone shot sweeping through a massive glowing glacial canyon at dusk, northern lights aurora dancing in the sky, 4k 60fps, IMAX camera motion, anamorphic lens flare, movie grade --motion 8 --duration 10s',
      negativePrompt: 'shaky camera, low resolution, stuttering, oversaturated, watermark',
      model: 'Runway Gen-3 Alpha',
      tags: ['Cinematic Video', 'Drone Shot', 'Glacier', 'Aurora', '4K'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', duration: '10s', fps: 60, motionIntensity: 8 }
    },
    {
      title: 'انفجار نيزك متوهج في الفضاء مع موجات صادمة',
      description: 'محاكاة فيزيائية لحطام الكويكبات الفضائية مع جزيئات الطاقة المتناثرة وحركة كاميرا 360 درجة.',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
      videoUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=0&controls=1&rel=0',
      prompt: 'Slow motion 3D orbit shot of a glowing celestial meteorite exploding into cosmic dust particles, energy shockwaves rippling through space, IMAX color grading, 4k 60fps --motion 9 --duration 8s',
      negativePrompt: 'blurry, bad particle physics, cartoonish, low framerate',
      model: 'Sora AI',
      tags: ['Space Video', 'Slow Motion', 'Explosion', 'Sci-Fi', 'Particles'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', duration: '8s', fps: 60, motionIntensity: 9 }
    },
    {
      title: 'مركبة فضائية تهبط في ميناء نيون مستقبلي',
      description: 'تسلسل سينمائي لحركة المحركات النفاثة وانعكاسات المدرج المبلل بالماء في مدينة عمودية.',
      url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1000&q=80',
      videoUrl: 'https://www.youtube.com/embed/L_LUpnjgPso?autoplay=0&controls=1&rel=0',
      prompt: 'Low angle tracking camera shot of a sleek spacecraft landing on a rain-drenched cyberpunk launchpad, thruster heat shimmer, neon steam exhaust, cinematic lighting, 4k 60fps --motion 7 --duration 12s',
      negativePrompt: 'jitter, low quality, unnatural movement, frame drops',
      model: 'Kling AI Video',
      tags: ['Cyberpunk Video', 'Spaceship', 'Landing', 'Tracking Shot'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', duration: '12s', fps: 60, motionIntensity: 7 }
    },
    {
      title: 'أمواج محيط متوهجة حيوياً تضرب شاطئاً بركانياً',
      description: 'لقطة بطيئة للغاية لقطرات الماء المضيئة باللون الفيروزي تحت سماء مرصعة بالنجوم.',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      videoUrl: 'https://www.youtube.com/embed/9No-FiEInLA?autoplay=0&controls=1&rel=0',
      prompt: 'Ultra slow-motion cinematic dolly shot of bioluminescent turquoise waves crashing onto black volcanic sand, sparkling starry galaxy sky above, 4k 60fps, BBC Earth documentary quality --motion 6 --duration 15s',
      negativePrompt: 'grainy, low fps, artificial color banding, static water',
      model: 'Luma Dream Machine',
      tags: ['Nature Video', 'Bioluminescence', 'Ocean Waves', 'Slow Motion'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', duration: '15s', fps: 60, motionIntensity: 6 }
    },
    {
      title: 'سباق سيارات نيون في نفق زجاجي تحت الماء',
      description: 'حركة كاميرا خلفية فائقة السرعة مع تأثيرات ضبابية الحركة ومرور أسماك القرش المضيئة.',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      videoUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ?autoplay=0&controls=1&rel=0',
      prompt: 'High speed chase sequence through an underwater glass tunnel, glowing neon sports cars, dynamic speed ramps, water refractions, deep blue marine life outside, Hollywood action movie color grade --motion 10 --duration 10s',
      negativePrompt: 'blurry cars, stutter, bad compression, distorted glass',
      model: 'Runway Gen-3 Alpha',
      tags: ['Action Video', 'Racing', 'Underwater', 'Speed Ramp', '4K'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', duration: '10s', fps: 60, motionIntensity: 10 }
    }
  ],

  // Window 4: Logo & Brand Identity (Clean Vectors, Minimalist, Isolated)
  4: [
    {
      title: 'شعار صقر هندسي حديث لشركة تقنية وذكاء اصطناعي',
      description: 'شعار فيكتور مسطح معزول بخلفية بيضاء نقية بخطوط هندسية متناسقة وتدرج زمردي مذهب.',
      url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Minimalist geometric vector logo of an eagle head, modern tech brand identity, sleek sharp lines, emerald green and gold gradient, flat 2D icon, isolated on clean white background, vector masterpiece, Dribbble trending --ar 1:1',
      negativePrompt: 'photorealistic, 3D render, complex background, text, words, blurry, gradients overload',
      model: 'Midjourney Vector Mode',
      tags: ['Logo', 'Vector', 'Minimalist', 'Eagle', 'Brand Identity'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 8.0, steps: 35, seed: 551029 }
    },
    {
      title: 'رمز أيقونة سحابة ذكية متصلة بعقد شبكية',
      description: 'أيقونة تطبيق حوسبة سحابية بتدرجات لونية عصرية وتصميم مسطح احترافي.',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Modern flat app icon of a stylized cloud integrated with glowing neural nodes, clean minimalist vector art, vibrant cyan and emerald green gradient, isolated on white background, iOS icon style --ar 1:1',
      negativePrompt: 'shadows, noisy, realistic clouds, photo, extra text',
      model: 'Adobe Firefly Vector',
      tags: ['App Icon', 'Cloud', 'Neural Network', 'Vector', 'Tech Logo'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.5, steps: 30, seed: 918234 }
    },
    {
      title: 'شعار حرف A مونوغرام فاخر لعلامة أزياء راقية',
      description: 'تصميم مونوغرام هندسي أنيق بخطوط ذهبية دقيقة وخلفية بيضاء معزولة.',
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Luxury minimalist monogram logo of the letter A, intertwined golden ribbon geometric lines, high-end fashion branding, clean vector symbol, isolated on pure white background, timeless elegance --ar 1:1',
      negativePrompt: 'busy, messy, low quality, raster artifacts, colorful clutter',
      model: 'Ideogram 2.0',
      tags: ['Monogram', 'Luxury Logo', 'Fashion Brand', 'Gold', 'Vector'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 8.5, steps: 40, seed: 772109 }
    },
    {
      title: 'رمز شجرة طاقة خضراء مستدامة لشركة بيئية',
      description: 'شعار فيكتور يدمج ورقة الشجر مع خطوط الدوائر الكهربائية بأسلوب عصري جذاب.',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Eco-tech company emblem logo, fusion of a stylized green leaf and renewable energy circuit traces, modern flat vector design, clean emerald and lime colors, isolated on solid white background --ar 1:1',
      negativePrompt: 'photoreal, dirty, complex texture, text, signatures',
      model: 'Midjourney v6.1',
      tags: ['Eco Logo', 'Leaf', 'Green Tech', 'Vector', 'Emblem'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.0, steps: 35, seed: 381920 }
    },
    {
      title: 'أيقونة درع أمان سيبراني ثلاثي الأبعاد مصقول',
      description: 'رمز درع حماية كريستالي شفاف مع قفل مضيء لشركات الأمن الرقمي.',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Isometric 3D security shield icon with glowing cyber padlock core, translucent glass and emerald metallic rim, clean minimalist studio render, isolated on white background, Behance award winner --ar 1:1',
      negativePrompt: 'dark background, noisy, low polygon, blurry lock',
      model: 'FLUX.1 Dev',
      tags: ['Security Icon', 'Cyber Shield', '3D Icon', 'Branding', 'Clean'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.5, steps: 35, seed: 661928 }
    }
  ],

  // Window 5: Commercial Ads & Product Mockups (Studio Lighting, High-End Packaging)
  5: [
    {
      title: 'إعلان زجاجة عطر فاخرة فوق صخور بركانية مع قطرات ماء',
      description: 'تصوير تجاري احترافي لمنتج عطر رجالي راقٍ مع إضاءة استوديو درامية ورذاذ منعش.',
      url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Commercial product photography of a luxury matte black and amber glass perfume bottle resting on wet volcanic obsidian rocks, crisp water droplets on glass, soft orange rim lighting, premium advertising mockup, Hasselblad 8k --ar 1:1',
      negativePrompt: 'cheap looking, label distortion, blurry product, bad lighting, text',
      model: 'FLUX.1 Dev',
      tags: ['Commercial', 'Perfume Mockup', 'Product Photography', 'Luxury', 'Studio Lighting'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.5, steps: 40, seed: 718293, commercialProduct: 'Perfume' }
    },
    {
      title: 'موك أب ساعة ذكية متطورة مع حزام سيليكون برتقالي',
      description: 'عرض إعلاني ثلاثي الأبعاد لساعة رياضية عائمة مع شاشة أموليد مضيئة وتفاصيل ألياف الكاربون.',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      prompt: 'High-end commercial advertisement for a futuristic titanium smartwatch with vivid orange silicone strap, floating at a dynamic angle, glowing AMOLED watch face, studio softbox illumination, 8k advertising banner --ar 1:1',
      negativePrompt: 'scratched screen, broken strap, low resolution, dirty background',
      model: 'Midjourney v6.1',
      tags: ['Smartwatch', 'Mockup', 'Commercial', 'Gadget', 'Studio Light'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 8.0, steps: 35, seed: 441029, commercialProduct: 'Smartwatch' }
    },
    {
      title: 'إعلان سماعات رأس لاسلكية احترافية مع تموجات صوتية',
      description: 'لقطة إعلانية فخمة لسماعات عازلة للضوضاء محاطة بتموجات ضوئية ملونة على منصة عرض رخامية.',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Commercial studio advertisement shot of matte graphite wireless over-ear headphones placed on a polished marble podium, subtle glowing soundwave trails around earcups, premium audio brand marketing, 8k --ar 1:1',
      negativePrompt: 'tangled wires, deformed cushions, poor contrast, low detail',
      model: 'Imagen 3 Ultra',
      tags: ['Headphones', 'Audio Mockup', 'Product Ad', 'Marble Podium', '8K'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 7.0, steps: 40, seed: 881920, commercialProduct: 'Headphones' }
    },
    {
      title: 'موك أب علبة مستحضرات تجميل عضوية بين أوراق خضراء',
      description: 'تصوير تسويقي لمنتجات العناية بالبشرة مع لمسات الطبيعة وظلال أشعة الشمس الطبيعية.',
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Organic cosmetics glass jar mockup surrounded by fresh botanical eucalyptus leaves, gentle dappled sunlight through palm shadows, clean minimalist pastel cream background, Vogue beauty commercial shoot --ar 1:1',
      negativePrompt: 'artificial look, smudged jar, fake leaves, plastic glare',
      model: 'FLUX.1 Schnell',
      tags: ['Skincare Mockup', 'Cosmetics', 'Organic', 'Sunlight', 'Commercial'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 6.5, steps: 30, seed: 291048, commercialProduct: 'Cosmetics' }
    },
    {
      title: 'إعلان حذاء سنيكرز رياضي ثلاثي الأبعاد ينفجر بالغبار الملون',
      description: 'لقطة حركية ديناميكية لحذاء جري مع جزيئات هولي الملونة المتطايرة وإضاءة عالية التباين.',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      prompt: 'High action dynamic commercial photography of a red running sneaker suspended mid-air with explosive bursts of orange and cyan holi powder, high speed shutter sync, crisp commercial campaign --ar 1:1',
      negativePrompt: 'blurry sneaker, muddy powder, awkward angle, low quality',
      model: 'Midjourney v6.1',
      tags: ['Sneaker Mockup', 'Footwear Ad', 'Action Powder', 'Commercial', 'Dynamic'],
      aspectRatio: '1:1',
      parameters: { aspectRatio: '1:1', cfgScale: 8.0, steps: 45, seed: 651920, commercialProduct: 'Sneakers' }
    }
  ],

  // Window 6: Vision & Reverse Engineering (Deconstructed Layers & Blueprints)
  6: [
    {
      title: 'تحليل بصري: مشهد مدينة مستقبلية مع قطار هوائي',
      description: 'تم تفكيك الأسلوب واستخراج البرومبت الهندسي العكسي بدقة 98% وتحديد بارامترات الإضاءة.',
      url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Reverse-Engineered Prompt: Futuristic metropolis skyline with elevated maglev monorail, dusk golden hour lighting, cinematic volumetric smog, Kodak Ektar 100 color tone, 35mm wide angle lens --ar 1:1 --v 6.1',
      negativePrompt: 'blurry buildings, flat lighting, oversaturated sky, pixelated',
      model: 'Gemini 2.5 Flash Vision',
      tags: ['Reverse Engineering', 'Vision Analysis', 'Cityscape', 'Architecture', 'Deconstruction'],
      aspectRatio: '1:1',
      analysisData: {
        detectedElements: ['ناطحات سحاب مستقبلية', 'قطار مغناطيسي هوائي', 'إضاءة الشفق الذهبية', 'شوارع متعددة المستويات'],
        styleKeywords: ['Cinematic Urban', 'Cyber Realism', 'Kodak Ektar', 'Volumetric Fog'],
        lighting: 'Golden Hour Dusk Rim Light',
        cameraLens: '35mm Wide Angle f/2.8',
        colorPalette: ['#1E293B', '#F59E0B', '#3B82F6', '#EF4444'],
        extractedPrompt: 'Futuristic metropolis skyline with elevated maglev monorail, dusk golden hour lighting, cinematic volumetric smog, Kodak Ektar 100 color tone, 35mm wide angle lens --ar 1:1',
        suggestedVariations: ['إضافة أمطار ليلية مع انعكاسات نيون', 'تغيير الوقت إلى الفجر الضبابي', 'تصوير لقطة ماكرو لقمرة القطار'],
        confidenceScore: 98
      }
    },
    {
      title: 'تحليل بصري: بورتريه سينمائي بإضاءة شمسية جانبية',
      description: 'استخراج دقيق لإعدادات فتحة العدسة والبعد البؤري ومعاملات درجات الألوان الطبيعية.',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Reverse-Engineered Prompt: Authentic close-up portrait of a thoughtful man, directional window sunlight creating soft Rembrandt shadows, visible facial hair and skin texture, 85mm f/1.4 prime lens, shallow depth of field --ar 1:1',
      negativePrompt: 'plastic skin, airbrushed, oversaturated, deformed eyes',
      model: 'Groq Llama-3.2 Vision',
      tags: ['Reverse Engineering', 'Portrait Analysis', 'Rembrandt Light', 'Skin Texture'],
      aspectRatio: '1:1',
      analysisData: {
        detectedElements: ['ملامح وجه طبيعية', 'إضاءة نافذة جانبية', 'ظل رمبرانت الكلاسيكي', 'خلفية ضبابية ناعمة'],
        styleKeywords: ['Rembrandt Portrait', 'Naturalism', '85mm Prime', 'Editorial'],
        lighting: 'Natural Side Window Light (Rembrandt)',
        cameraLens: '85mm f/1.4 Portrait Prime',
        colorPalette: ['#78350F', '#FDE68A', '#1E293B', '#E2E8F0'],
        extractedPrompt: 'Authentic close-up portrait of a thoughtful man, directional window sunlight creating soft Rembrandt shadows, visible facial hair and skin texture, 85mm f/1.4 prime lens, shallow depth of field --ar 1:1',
        suggestedVariations: ['تحويل الإضاءة إلى نيون سيبراني أزرق وأحمر', 'تصوير بالأبيض والأسود عالي التباين', 'إضافة قطرات مطر على نافذة المشهد'],
        confidenceScore: 96
      }
    },
    {
      title: 'تحليل بصري: لوحة زيتية تجريدية ثلاثية الأبعاد',
      description: 'تفكيك ضربات الفرشاة السميكة (Impasto) وطبقات الطلاء والملمس المرتفع.',
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Reverse-Engineered Prompt: Thick impasto abstract oil painting, bold palette knife strokes of cobalt blue, ochre yellow and crimson, rich textured canvas relief, dramatic gallery spotlights --ar 1:1',
      negativePrompt: 'flat texture, digital gradient, smooth plastic, low resolution',
      model: 'Gemini 2.5 Flash Vision',
      tags: ['Reverse Engineering', 'Impasto Oil', 'Abstract Texture', 'Art Analysis'],
      aspectRatio: '1:1',
      analysisData: {
        detectedElements: ['سكتات سكين ألوان سميكة', 'قماش رسم بارز', 'تداخل ألوان زيتي غني', 'إضاءة معرض موجهة'],
        styleKeywords: ['Impasto Painting', 'Expressionism', 'Tactile Oil', 'Palette Knife'],
        lighting: 'Focused Gallery Spotlights',
        cameraLens: '50mm Macro f/4',
        colorPalette: ['#1D4ED8', '#EAB308', '#DC2626', '#F8FAFC'],
        extractedPrompt: 'Thick impasto abstract oil painting, bold palette knife strokes of cobalt blue, ochre yellow and crimson, rich textured canvas relief, dramatic gallery spotlights --ar 1:1',
        suggestedVariations: ['تطبيق النمط على رسم بورتريه بشري', 'استبدال الألوان بدرجات الباستيل الهادئة', 'تحويل اللوحة إلى مجسم ثلاثي الأبعاد متحرك'],
        confidenceScore: 99
      }
    },
    {
      title: 'تحليل بصري: مشهد غابة استوائية بضباب صباحي وإضاءة تيندال',
      description: 'تفكيك خطوط أشعة الشمس المخترقة للأشجار (Crepuscular Rays) وطبقات النباتات.',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Reverse-Engineered Prompt: Ancient lush tropical rainforest at dawn, dramatic God rays filtering through thick canopy fog, vibrant emerald ferns and mossy tree trunks, National Geographic landscape photography --ar 1:1',
      negativePrompt: 'overexposed, dry landscape, low contrast, pixelated foliage',
      model: 'Groq Vision + Gemini',
      tags: ['Reverse Engineering', 'Rainforest', 'God Rays', 'Nature Analysis'],
      aspectRatio: '1:1',
      analysisData: {
        detectedElements: ['أشجار غابة كثيفة', 'أشعة شمس متسللة (God rays)', 'ضباب صباحي رطب', 'سرخس وأعشاب زمردية'],
        styleKeywords: ['Atmospheric Landscape', 'Tyndall Effect', 'National Geographic', 'Lush Nature'],
        lighting: 'Morning Crepuscular Rays (God Rays)',
        cameraLens: '24-70mm f/2.8 Landscape Lens',
        colorPalette: ['#065F46', '#D97706', '#047857', '#F0FDF4'],
        extractedPrompt: 'Ancient lush tropical rainforest at dawn, dramatic God rays filtering through thick canopy fog, vibrant emerald ferns and mossy tree trunks, National Geographic landscape photography --ar 1:1',
        suggestedVariations: ['إضافة نهر متدفق في مقدمة المشهد', 'تحويل الوقت إلى ليلة مقمرة مع نباتات مضيئة', 'إضافة حيوانات برية نادرة في الغابة'],
        confidenceScore: 97
      }
    },
    {
      title: 'تحليل بصري: رندر ثلاثي الأبعاد لمبنى معماري مستقبلي بيوفيليك',
      description: 'استخراج أوامر الهندسة المعمارية البيومورفية وتوزيع الزجاج والطاقة الشمسية.',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      prompt: 'Reverse-Engineered Prompt: Biophilic futuristic skyscraper with cascading vertical gardens, parametric curved glass facade, organic white composite materials, clear blue sky reflections, architectural visualization 8k --ar 1:1',
      negativePrompt: 'boxy, ugly building, unrealistic plants, low poly geometry',
      model: 'Gemini 2.5 Flash Vision',
      tags: ['Reverse Engineering', 'Biophilic Architecture', 'Parametric Design', 'ArchViz'],
      aspectRatio: '1:1',
      analysisData: {
        detectedElements: ['أبراج بيوفيلية خضراء', 'حدائق عمودية متدرجة', 'واجهات زجاجية بارامترية', 'مواد بناء بيضاء عضوية'],
        styleKeywords: ['Zaha Hadid Style', 'Biophilic ArchViz', 'Parametric', 'Unreal Engine 5'],
        lighting: 'Crisp Midday Architectural Sunlight',
        cameraLens: 'Tilt-Shift 24mm f/5.6',
        colorPalette: ['#FFFFFF', '#059669', '#0284C7', '#334155'],
        extractedPrompt: 'Biophilic futuristic skyscraper with cascading vertical gardens, parametric curved glass facade, organic white composite materials, clear blue sky reflections, architectural visualization 8k --ar 1:1',
        suggestedVariations: ['إظهار المبنى ليلاً مع إضاءات ليد داخلية', 'عرض المخطط الداخلي المفتوح', 'تصوير لقطة عين الطائر من سماء المدينة'],
        confidenceScore: 98
      }
    }
  ]
};

/**
 * Generate a batch of 5 items for a specific portal, registers to Cloudflare R2,
 * and outputs them staged for Developer Review and Approval.
 */
export async function generatePortalBatch(options: BatchGenerationOptions): Promise<MediaItem[]> {
  const { windowId, count = 5 } = options;
  const templates = PORTAL_TEMPLATES[windowId] || PORTAL_TEMPLATES[1];
  const now = new Date();
  const timestamp = now.getTime();

  // Simulate network generation delay
  await new Promise((res) => setTimeout(res, 800));

  const itemsToCreate: MediaItem[] = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const numericCode = `${windowId}0${i + 1}`;
    const uniqueId = `w${windowId}-batch-${timestamp}-${i + 1}`;

    // Cloudflare R2 Integration: register R2 object simulation
    const r2Key = `windows/win-${windowId}/item-${numericCode}.jpg`;
    try {
      await cloudflareService.uploadR2Object(
        {
          name: `item-${numericCode}.jpg`,
          size: 420000,
          type: 'image/jpeg',
          base64OrUrl: template.url
        },
        `windows/win-${windowId}`,
        windowId
      );
    } catch (e) {
      console.warn('R2 auto upload notice:', e);
    }

    const item: MediaItem = {
      id: uniqueId,
      numericCode,
      windowId,
      type: windowId === 3 ? 'youtube_video' : windowId === 5 ? 'commercial_ad' : windowId === 6 ? 'reverse_vision' : 'image',
      title: template.title,
      description: template.description,
      url: template.url,
      videoUrl: template.videoUrl,
      prompt: template.prompt,
      negativePrompt: template.negativePrompt,
      model: template.model,
      tags: template.tags,
      aspectRatio: template.aspectRatio,
      parameters: template.parameters,
      analysisData: template.analysisData,
      views: 0,
      copies: 0,
      createdAt: now.toISOString().split('T')[0]
    };

    itemsToCreate.push(item);
  }

  return itemsToCreate;
}

/**
 * Generate 5 items for all 6 portals at once (30 items total staged for approval)
 */
export async function generateAllPortalsBatches(): Promise<Record<WindowId, MediaItem[]>> {
  const result: Record<WindowId, MediaItem[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
  };

  for (let w = 1; w <= 6; w++) {
    result[w as WindowId] = await generatePortalBatch({ windowId: w as WindowId, count: 5 });
  }

  return result;
}
