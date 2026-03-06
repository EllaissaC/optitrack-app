import { db } from "./db";
import { frames } from "@shared/schema";
import { sql } from "drizzle-orm";
import { storage } from "./storage";

const DEFAULT_LABS = [
  { name: "Vision-Craft", account: "Y1500" },
  { name: "Opti-Craft", account: "18369" },
  { name: "Custom Eyelab", account: "1015" },
  { name: "HOYA Lab", account: "632142" },
  { name: "Frame Dream", account: "fd10673" },
];

const MANUFACTURER_BRANDS: Record<string, string[]> = {
  Luxottica: [
    "Ray-Ban", "Oakley", "Persol", "Oliver Peoples", "Alain Mikli", "Arnette",
    "Vogue Eyewear", "Tiffany & Co", "Giorgio Armani", "Emporio Armani",
    "Armani Exchange", "Burberry", "Prada", "Prada Linea Rossa", "Dolce & Gabbana",
    "Versace", "Michael Kors", "Coach", "Tory Burch", "Swarovski", "Jimmy Choo",
    "Brooks Brothers", "Ralph Lauren", "Polo Ralph Lauren", "Ferragamo", "Bulgari",
  ],
  Marchon: [
    "Nike", "Calvin Klein", "Calvin Klein Jeans", "Lacoste", "Dragon", "Flexon",
    "Skaga", "Nine West", "Marchon NYC", "Longchamp", "Victoria Beckham",
    "Karl Lagerfeld", "Converse", "Liu Jo",
  ],
  Safilo: [
    "Carrera", "Polaroid", "Boss", "Hugo", "Kate Spade", "Tommy Hilfiger",
    "Marc Jacobs", "David Beckham", "Dsquared2", "Moschino", "Missoni",
    "Under Armour", "Levi's",
  ],
  Kering: [
    "Gucci", "Saint Laurent", "Balenciaga", "Bottega Veneta", "Alexander McQueen",
    "Cartier", "Chloé", "Dunhill", "Montblanc", "Puma",
  ],
  Marcolin: [
    "Tom Ford", "Guess", "Adidas Sport", "Adidas Originals", "Max Mara",
    "Zegna", "MCM", "Timberland", "Skechers",
  ],
  Kenmark: [
    "Lilly Pulitzer", "Original Penguin", "Zac Posen", "Vera Wang",
    "Vera Wang V", "Nicole Miller", "Ted Baker",
  ],
  Silhouette: ["Silhouette", "adidas eyewear"],
  "De Rigo": ["Police", "Lozza", "Sting", "Chopard"],
  Charmant: ["Charmant", "Line Art", "Eschenbach"],
  Altair: ["Revo", "BCBGMAXAZRIA", "Joseph Abboud", "Adidas Originals"],
  Blackfin: ["Blackfin", "Blackfin Titanium"],
};

export async function seedDatabase() {
  const existing = await db.select({ count: sql<number>`count(*)` }).from(frames);
  if (Number(existing[0].count) === 0) {
    await db.insert(frames).values([
      {
        manufacturer: "Safilo",
        brand: "Carrera",
        model: "CA 8865",
        color: "Matte Black",
        eyeSize: 54,
        bridge: 17,
        templeLength: 145,
        cost: "42.00",
        retailPrice: "195.00",
        status: "on_board",
      },
      {
        manufacturer: "Luxottica",
        brand: "Ray-Ban",
        model: "RB5154 Clubmaster",
        color: "Tortoise / Gold",
        eyeSize: 51,
        bridge: 21,
        templeLength: 150,
        cost: "58.50",
        retailPrice: "175.00",
        status: "on_board",
      },
      {
        manufacturer: "Kering",
        brand: "Gucci",
        model: "GG0396O",
        color: "Havana Brown",
        eyeSize: 52,
        bridge: 18,
        templeLength: 145,
        cost: "115.00",
        retailPrice: "395.00",
        status: "at_lab",
        labName: "HOYA Lab",
        labAccountNumber: "632142",
        dateSentToLab: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      {
        manufacturer: "Silhouette",
        brand: "Silhouette",
        model: "Momentum 2924",
        color: "Crystal Grey",
        eyeSize: 50,
        bridge: 16,
        templeLength: 140,
        cost: "89.00",
        retailPrice: "340.00",
        status: "sold",
      },
      {
        manufacturer: "Marchon",
        brand: "Nike",
        model: "NK 7252",
        color: "Navy Blue",
        eyeSize: 56,
        bridge: 18,
        templeLength: 145,
        cost: "33.00",
        retailPrice: "130.00",
        status: "on_board",
      },
      {
        manufacturer: "Safilo",
        brand: "Boss",
        model: "BOSS 1084",
        color: "Dark Ruthenium",
        eyeSize: 53,
        bridge: 19,
        templeLength: 150,
        cost: "67.00",
        retailPrice: "260.00",
        status: "at_lab",
        labName: "Vision-Craft",
        labAccountNumber: "Y1500",
        dateSentToLab: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      {
        manufacturer: "Luxottica",
        brand: "Prada",
        model: "PR 08WV",
        color: "Pale Gold / Top Black",
        eyeSize: 54,
        bridge: 18,
        templeLength: 140,
        cost: "98.00",
        retailPrice: "360.00",
        status: "sold",
      },
    ]);
  }

  const hasLabs = await storage.labsExist();
  if (!hasLabs) {
    for (const lab of DEFAULT_LABS) {
      await storage.createLab({ name: lab.name, account: lab.account });
    }
  }

  const hasManufacturers = await storage.manufacturersExist();
  if (!hasManufacturers) {
    for (const [mfgName, brandList] of Object.entries(MANUFACTURER_BRANDS)) {
      const mfg = await storage.createManufacturer({ name: mfgName });
      for (const brandName of brandList) {
        await storage.createBrand({ manufacturerId: mfg.id, name: brandName });
      }
    }
  }
}
