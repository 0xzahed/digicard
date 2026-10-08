import { NextResponse } from "next/server";
import { createCard } from "@/lib/store";

/** One-click demo card for client demos. */
export async function POST() {
  try {
    const doc = await createCard({
      username: "demo-shop",
      name: "Demo Fashion House",
      title: "Online Clothing Store · Dhaka",
      phone: "01XXXXXXXXX",
      whatsapp: "8801XXXXXXXXX",
      email: "hello@demoshop.test",
      address: "New Market, Dhaka",
      bio: "Quality fashion at honest prices. Order on WhatsApp!",
      theme: "rose",
      links: [
        { label: "🛍 Facebook Page", url: "https://facebook.com" },
        { label: "📸 Instagram", url: "https://instagram.com" },
        { label: "🌐 Website", url: "https://example.com" },
      ],
    });
    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ ok: true, note: "demo card already exists" });
  }
}
