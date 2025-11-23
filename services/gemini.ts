import { GoogleGenAI } from "@google/genai";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Frontend Engineer and UI/UX Designer. 
Your task is to convert UI designs (images) into a single, self-contained HTML file using Tailwind CSS for styling.

Rules:
1. The output must be a valid HTML string.
2. Include the Tailwind CSS script tag: <script src="https://cdn.tailwindcss.com"></script> in the head.
3. Use ONLY standard Tailwind utility classes. Do not write custom CSS in <style> tags unless absolutely necessary for things Tailwind cannot do (like custom scrollbars).
4. Use https://picsum.photos/200/300 (or similar dimensions) for placeholders.
5. Use 'lucide-react' icons are NOT available in the raw HTML output. Use SVG strings directly for icons if needed, or simple emoji/text placeholders if complex icons are not crucial.
6. The design should be responsive and look professional.
7. Do NOT wrap the output in markdown code fences (like \`\`\`html). Return just the raw HTML code.
8. Ensure high contrast and accessibility.
`;

export async function analyzeDesignAndGenerateCode(imageBase64: string, mimeType: string): Promise<string> {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: "Analyze this design and recreate it exactly as a high-quality HTML file with Tailwind CSS."
          },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType
            }
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for code precision
      }
    });

    let text = response.text || "";
    // Cleanup markdown if present despite instructions
    text = text.replace(/^```html\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Failed to generate code from design.");
  }
}

export async function refineCodeWithPrompt(currentCode: string, userPrompt: string): Promise<string> {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            {
                text: `Current HTML Code:\n${currentCode}`
            },
            {
                text: `User Instruction: ${userPrompt}\n\nUpdate the HTML code based on the user instruction. Return the full updated HTML file.`
            }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    let text = response.text || "";
    text = text.replace(/^```html\s*/, '').replace(/```$/, '');
    return text;
  } catch (error) {
     console.error("Gemini refinement error:", error);
     throw new Error("Failed to refine code.");
  }
}