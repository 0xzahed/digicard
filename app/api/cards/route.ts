import { NextResponse } from "next/server";
import { createCard, deleteCard, getCard, listCards, updateCard } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ cards: await listCards() });
}

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Send card JSON." }, { status: 400 });
  }
  try {
    const links = Array.isArray(b.links)
      ? (b.links as { label?: string; url?: string }[])
          .filter((l) => l.label && l.url)
          .slice(0, 12)
          .map((l) => ({ label: String(l.label), url: String(l.url) }))
      : [];
    const doc = await createCard({
      username: String(b.username ?? ""),
      name: String(b.name ?? ""),
      title: String(b.title ?? ""),
      phone: String(b.phone ?? ""),
      whatsapp: String(b.whatsapp ?? ""),
      email: String(b.email ?? ""),
      address: String(b.address ?? ""),
      bio: String(b.bio ?? ""),
      theme: ["emerald", "sky", "amber", "rose", "violet"].includes(String(b.theme)) ? String(b.theme) : "emerald",
      links,
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 422 });
  }
}

export async function PATCH(req: Request) {
  const username = new URL(req.url).searchParams.get("username") ?? "";
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Send patch JSON." }, { status: 400 });
  }
  if (!(await getCard(username))) return NextResponse.json({ error: "Card not found." }, { status: 404 });
  const patch: Record<string, unknown> = {};
  for (const k of ["name", "title", "phone", "whatsapp", "email", "address", "bio", "theme"] as const) {
    if (b[k] !== undefined) patch[k] = String(b[k]);
  }
  if (b.links !== undefined && Array.isArray(b.links)) {
    patch.links = (b.links as { label?: string; url?: string }[])
      .filter((l) => l.label && l.url)
      .slice(0, 12)
      .map((l) => ({ label: String(l.label), url: String(l.url) }));
  }
  const doc = await updateCard(username, patch);
  return NextResponse.json(doc);
}

export async function DELETE(req: Request) {
  const username = new URL(req.url).searchParams.get("username") ?? "";
  return NextResponse.json({ deleted: await deleteCard(username) });
}
