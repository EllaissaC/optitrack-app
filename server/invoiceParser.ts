import OpenAI from "openai";
import { createRequire } from "module";

const _require = createRequire(import.meta.url ?? (process.cwd() + "/server/invoiceParser.ts"));
const pdfParse: (buffer: Buffer) => Promise<{ text: string; numpages: number }> = _require("pdf-parse");

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ExtractedFrame {
  manufacturer: string;
  brand: string;
  model: string;
  color: string;
  eyeSize: number;
  bridge: number;
  templeLength: number;
  cost: string;
  quantity: number;
}

const SYSTEM_PROMPT = `You are an optical frame inventory specialist. Extract eyeglass/spectacle frame line items from invoices.

For each frame product found, output a JSON object with these fields:
- manufacturer: the company that manufactures or distributes the frames (e.g. "Marchon", "Safilo", "Luxottica", "Silhouette"). This is usually the invoice sender or vendor name. If unclear, use the same value as brand.
- brand: the specific label or brand name on the frame (e.g. "Ray-Ban", "Dragon", "Oakley", "Boss", "Gucci"). If the manufacturer sells directly under their own name, use the same value as manufacturer.
- model: model name or SKU (e.g. "RX5228", "M-2037", "GG0396O")
- color: color or finish (e.g. "Black", "Tortoise Brown", "Shiny Gold")
- eyeSize: eye lens width as integer mm (from size like "53-17-140" → 53, or "53□17" → 53). Default 52 if unknown.
- bridge: bridge width as integer mm (from size → 17). Default 18 if unknown.
- templeLength: temple arm length as integer mm (from size → 140). Default 145 if unknown.
- cost: wholesale/invoice unit price as string (e.g. "62.00"). Strip any currency symbols.
- quantity: integer quantity ordered. Default 1 if not shown.

Rules:
- Skip non-frame products (cases, cloths, tools, shipping fees, taxes).
- If the same model appears in multiple colors/sizes, include each as a separate entry.
- Return ONLY a valid JSON array. No markdown, no explanation.`;

function cleanJsonResponse(raw: string): string {
  return raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

export async function parseInvoiceFromImage(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedFrame[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high",
            },
          },
          {
            type: "text",
            text: SYSTEM_PROMPT,
          },
        ],
      },
    ],
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  const parsed = JSON.parse(cleanJsonResponse(content));
  return Array.isArray(parsed) ? parsed : [];
}

export async function parseInvoiceFromPdf(
  pdfBuffer: Buffer
): Promise<ExtractedFrame[]> {
  const pdfData = await pdfParse(pdfBuffer);
  const text = pdfData.text.trim();

  if (!text) {
    throw new Error("Could not extract text from PDF. Try uploading an image instead.");
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nInvoice text:\n${text.slice(0, 12000)}`,
      },
    ],
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  const parsed = JSON.parse(cleanJsonResponse(content));
  return Array.isArray(parsed) ? parsed : [];
}
