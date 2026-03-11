import OpenAI from "openai";
import { createRequire } from "module";
import * as XLSX from "xlsx";

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

const SYSTEM_PROMPT = `You are an optical frame inventory specialist. Your job is to extract EVERY eyeglass/spectacle frame line item from an invoice.

CRITICAL: You MUST extract ALL frame entries. Do not stop early. Do not limit to any number. Do not summarize. If the invoice has 90 frame rows, return all 90. If it has 5, return 5. Extract every single frame row present in the document.

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
- Extract ALL frame line items — do not truncate, do not stop at any limit.
- Skip non-frame products (cases, cloths, tools, shipping fees, taxes).
- If the same model appears in multiple colors/sizes, include each as a separate entry.
- Return ONLY a valid JSON array. No markdown, no explanation, no text before or after the array.`;

function cleanJsonResponse(raw: string): string {
  const stripped = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const start = stripped.indexOf("[");
  const end = stripped.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    return stripped.slice(start, end + 1);
  }
  return stripped;
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
    max_tokens: 16000,
    temperature: 0,
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
        content: `${SYSTEM_PROMPT}\n\nInvoice text:\n${text.slice(0, 80000)}`,
      },
    ],
    max_tokens: 16000,
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  const parsed = JSON.parse(cleanJsonResponse(content));
  return Array.isArray(parsed) ? parsed : [];
}

function normalizeHeader(h: unknown): string {
  return String(h ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesAny(h: string, candidates: string[]): boolean {
  return candidates.some((c) => h.includes(c));
}

function parseSize(raw: string): { eyeSize: number; bridge: number; templeLength: number } {
  const nums = raw.match(/\d{2,3}/g)?.map(Number) ?? [];
  if (nums.length >= 3) return { eyeSize: nums[0], bridge: nums[1], templeLength: nums[2] };
  if (nums.length === 2) return { eyeSize: nums[0], bridge: nums[1], templeLength: 145 };
  if (nums.length === 1) return { eyeSize: nums[0], bridge: 18, templeLength: 145 };
  return { eyeSize: 52, bridge: 18, templeLength: 145 };
}

export function parseInvoiceFromSpreadsheet(fileBuffer: Buffer, mimetype: string): ExtractedFrame[] {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Unable to detect frame data from this file format.");

  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rawRows.length === 0) throw new Error("Unable to detect frame data from this file format.");

  const sampleHeaders = Object.keys(rawRows[0]).map(normalizeHeader);
  const hasAny = (...candidates: string[]) => sampleHeaders.some((h) => matchesAny(h, candidates));

  const hasFrameColumns =
    hasAny("brand", "brandname", "label", "eyewear") ||
    hasAny("model", "modelno", "modelnumber", "modename") ||
    hasAny("sku", "style", "stylenumber", "styleno", "itemnumber", "itemno", "partnumber", "partno", "productcode", "code") ||
    hasAny("frame", "framename", "framedescription", "framemodel") ||
    hasAny("manufacturer", "mfg", "vendor", "supplier", "company", "distributor", "maker") ||
    hasAny("description", "productname", "product", "item", "itemdescription") ||
    (hasAny("qty", "quantity", "units") && hasAny("cost", "price", "unitprice", "wholesale", "amount"));

  if (!hasFrameColumns) {
    throw new Error("Unable to detect frame data from this file format.");
  }

  const frames: ExtractedFrame[] = [];

  for (const rawRow of rawRows) {
    const row: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawRow)) {
      row[normalizeHeader(k)] = String(v ?? "").trim();
    }

    const getField = (...candidates: string[]): string => {
      for (const key of Object.keys(row)) {
        if (matchesAny(key, candidates)) return row[key] ?? "";
      }
      return "";
    };

    const brand = getField("brand", "brandname", "label", "eyewear", "framebrand");
    const manufacturer = getField("manufacturer", "mfg", "vendor", "supplier", "company", "distributor", "maker") || brand;
    const model = getField(
      "model", "modelno", "modelnumber", "modename",
      "sku", "style", "stylenumber", "styleno",
      "itemnumber", "itemno", "partnumber", "partno",
      "productcode", "code", "framemodel", "description",
      "productname", "product", "item", "itemdescription",
    );
    const color = getField("color", "colour", "colorname", "finish", "colorway", "colorcode", "framecolor");

    if (!brand && !model) continue;

    const rawSize = getField("size", "framesize", "lenssize", "dimension");
    let { eyeSize, bridge, templeLength } = parseSize(rawSize);

    const rawEye = getField("eye", "eyesize", "lens", "lenswidth");
    if (rawEye) eyeSize = parseInt(rawEye) || eyeSize;

    const rawBridge = getField("bridge", "bridgewidth", "bridgesize");
    if (rawBridge) bridge = parseInt(rawBridge) || bridge;

    const rawTemple = getField("temple", "templelength", "arm");
    if (rawTemple) templeLength = parseInt(rawTemple) || templeLength;

    const rawCost = getField("cost", "unitcost", "unitprice", "price", "wholesale", "invoiceprice", "amount");
    const costNum = parseFloat(rawCost.replace(/[^0-9.]/g, "")) || 0;

    const rawQty = getField("qty", "quantity", "units", "ordered", "qtyordered", "qtyship");
    const quantity = parseInt(rawQty) || 1;

    frames.push({
      manufacturer: manufacturer || brand || "Unknown",
      brand: brand || manufacturer || "Unknown",
      model: model || "",
      color: color || "",
      eyeSize,
      bridge,
      templeLength,
      cost: costNum.toFixed(2),
      quantity,
    });
  }

  if (frames.length === 0) {
    throw new Error("Unable to detect frame data from this file format.");
  }

  return frames;
}
