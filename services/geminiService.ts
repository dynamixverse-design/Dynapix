import { GoogleGenAI } from "@google/ai";
import type { PromptGenerationParams } from '../types';

// This is a placeholder for a real API key, which should be stored in environment variables.
// In a real application, you would replace `process.env.API_KEY` with your actual key management solution.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI;
// Conditional initialization to handle environments where process.env might not be configured.
// In a production setup, the API key would always be expected to be present.
if (API_KEY) {
    ai = new GoogleGenAI(API_KEY);
} else {
    console.warn("API_KEY not found. Using mock AI service.");
    // A mock implementation for local development or testing without a real key.
    ai = {
        // @ts-ignore
        getGenerativeModel: (options) => ({
            generateContent: async (prompt: string) => {
                if(options.model.startsWith("gemini")) { // Text generation mock
                    return {
                        response: {
                            text: () => `This is a mock AI response for the prompt about "${prompt.slice(0, 50)}...". A photorealistic image of a majestic lion with a golden mane, standing on a rocky outcrop overlooking the savanna at sunset, dramatic lighting, high detail.`
                        }
                    };
                }
                return {}; // Fallback for other model types
            },
            // @ts-ignore
            generateImages: async (params) => { // Image generation mock
                 return Promise.resolve([
                    {
                        image: {
                            // Using a placeholder image service
                            url: `https://picsum.photos/seed/${encodeURIComponent(params.prompt)}/1024/1024`,
                        },
                    },
                ]);
            }
        })
    }
}

export const IDEATOR_SYSTEM_INSTRUCTION = `You are "Dyna", a world-class AI Creative Director within the Dynapix app. Your primary function is to take a user's core idea—no matter how simple—and rapidly expand it into a rich, detailed, professional prompt for AI image generation.

Your process is as follows:
1.  Start by introducing yourself warmly and asking for the user's initial idea.
2.  When the user provides a concept (e.g., "a dragon", "a futuristic car"), DO NOT just ask generic clarifying questions. Instead, immediately demonstrate your creative expertise. Propose 2-3 distinct, imaginative themes or directions. For example, for "a dragon," you might suggest: "A classic, fearsome European dragon hoarding gold," "A wise, serpentine Eastern dragon coiled around a mountain peak," or "A bio-mechanical dragon in a cyberpunk city."
3.  Guide the user to pick a direction. Once they do, build upon it by suggesting specific, evocative details about the mood, environment, lighting, and style. Frame your suggestions as an expert would (e.g., "For that cyberpunk feel, I'm picturing neon-drenched streets reflecting off its chrome scales, with volumetric smoke creating a gritty atmosphere. How does that sound?").
4.  Your goal is to minimize user effort and maximize creative output. You are the expert; lead the conversation with confidence and creativity.
5.  Once you have gathered enough detail from this guided collaboration, synthesize everything into a single, cohesive, descriptive paragraph.
6.  CRITICAL: When you provide the final, complete prompt, you MUST format it inside a single markdown code block using triple backticks (e.g., \`\`\`A photorealistic image of...\`\`\`). Do not use backticks for any other part of your response.`;


export const generatePrompt = async (params: PromptGenerationParams): Promise<string> => {
    const { category, style, subject, mood, composition, lighting } = params;
    
    let instruction = `You are a world-class AI prompt engineer. Your task is to generate a highly detailed and professional AI image generation prompt.
The prompt must be descriptive, artistic, and ready to be used in an AI image generator like DALL-E 3, Midjourney, or Imagen.

Base the prompt on the following parameters:
- Category: "${category}"
- Style: "${style}"`;

    if (subject) {
        instruction += `\n- Core Subject: "${subject}"`;
    }
    if (mood && mood !== 'Default') {
        instruction += `\n- Mood/Atmosphere: "${mood}"`;
    }
    if (composition && composition !== 'Default') {
        instruction += `\n- Composition/Framing: "${composition}"`;
    }
    if (lighting && lighting !== 'Default') {
        instruction += `\n- Lighting: "${lighting}"`;
    }
    
    instruction += `\n
Combine these elements into a cohesive, single-paragraph prompt. The prompt should be evocative and rich in detail, painting a vivid picture.
For example, instead of "a cat", describe "a fluffy Persian cat with emerald green eyes, lounging on a velvet cushion in a sun-drenched Victorian library".
The final output MUST be only the prompt text itself, without any extra explanation, preamble, titles, or markdown formatting.`;

    try {
        const model = ai.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(instruction);
        const text = result.response.text();
        return text.trim();
    } catch (error) {
        console.error("Error generating prompt:", error);
        throw new Error("Failed to generate prompt. Please try again.");
    }
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    try {
        const model = ai.getGenerativeModel({ model: "imagen-2" });
        const result = await model.generateImages({
            prompt: prompt,
            number_of_images: 1,
            // The API might expect specific enums or string formats.
            // This is a conceptual mapping.
            aspect_ratio: aspectRatio === '1:1' ? 'SQUARE' : aspectRatio === '16:9' ? 'LANDSCAPE' : 'PORTRAIT',
        });

        // The response structure for Imagen 2 might differ. This is an adaptation.
        const imageUrl = result[0]?.image?.url;
        if (imageUrl) {
             // In a real scenario with direct image data, you'd return a data URI.
             // With a URL, we might need to proxy it or handle CORS depending on the setup.
             // For this mock, we return the URL directly.
            return imageUrl;
        }
        throw new Error("Image generation returned no images.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. The prompt may have been rejected. Please try a different prompt.");
    }
};