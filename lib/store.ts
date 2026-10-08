import { db } from "@/lib/db";
import { Card } from "@/models/Card";

export interface CardLink {
  label: string;
  url: string;
}

export interface CardDoc {
  id: string;
  username: string;
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  bio: string;
  theme: string;
  links: CardLink[];
  views: number;
}

export type NewCard = Omit<CardDoc, "id" | "views">;

const mem = new Map<string, CardDoc>(); // key: username

type Raw = Record<string, unknown> & { _id?: unknown };

const toDoc = (r: Raw): CardDoc => ({
  id: String(r._id ?? r.id ?? ""),
  username: String(r.username ?? ""),
  name: String(r.name ?? ""),
  title: String(r.title ?? ""),
  phone: String(r.phone ?? ""),
  whatsapp: String(r.whatsapp ?? ""),
  email: String(r.email ?? ""),
  address: String(r.address ?? ""),
  bio: String(r.bio ?? ""),
  theme: String(r.theme ?? "emerald"),
  links: Array.isArray(r.links)
    ? (r.links as CardLink[]).map((l) => ({ label: String(l.label ?? ""), url: String(l.url ?? "") }))
    : [],
  views: Number(r.views ?? 0),
});

export const validUsername = (u: string) => /^[a-z0-9]([a-z0-9-_]{1,28}[a-z0-9])?$/i.test(u);

export async function listCards(): Promise<CardDoc[]> {
  if (await db()) {
    const rows = (await Card.find({}).sort({ username: 1 }).lean().catch(() => [])) as unknown as Raw[];
    return rows.map(toDoc);
  }
  return [...mem.values()].sort((a, b) => a.username.localeCompare(b.username));
}

export async function getCard(username: string): Promise<CardDoc | null> {
  const u = username.toLowerCase();
  if (await db()) {
    const r = (await Card.findOne({ username: u }).lean().catch(() => null)) as unknown as Raw | null;
    return r ? toDoc(r) : null;
  }
  return mem.get(u) ?? null;
}

export async function createCard(c: NewCard): Promise<CardDoc> {
  const username = c.username.toLowerCase().trim();
  if (!validUsername(username)) throw new Error("Username: 3–30 chars, letters/numbers/dash.");
  if (!c.name.trim()) throw new Error("Name is required.");
  if (await getCard(username)) throw new Error("Username is taken.");
  const doc: Omit<CardDoc, "id"> & { id?: string } = { ...c, username, name: c.name.trim(), views: 0 };
  if (await db()) {
    const created = await Card.create(doc);
    return toDoc(created.toObject() as unknown as Raw);
  }
  const full: CardDoc = { ...doc, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` } as CardDoc;
  mem.set(username, full);
  return full;
}

export async function updateCard(username: string, patch: Partial<NewCard>): Promise<CardDoc | null> {
  const u = username.toLowerCase();
  const clean: Record<string, unknown> = { ...patch };
  delete clean.username;
  delete (clean as Record<string, unknown>).views;
  if (await db()) {
    const r = (await Card.findOneAndUpdate({ username: u }, clean, { new: true }).lean().catch(() => null)) as unknown as Raw | null;
    return r ? toDoc(r) : null;
  }
  const cur = mem.get(u);
  if (!cur) return null;
  const next = { ...cur, ...clean } as CardDoc;
  mem.set(u, next);
  return next;
}

export async function deleteCard(username: string): Promise<boolean> {
  const u = username.toLowerCase();
  if (await db()) {
    const r = await Card.findOneAndDelete({ username: u }).catch(() => null);
    return !!r;
  }
  return mem.delete(u);
}

export async function bumpViews(username: string): Promise<void> {
  const u = username.toLowerCase();
  if (await db()) {
    await Card.updateOne({ username: u }, { $inc: { views: 1 } }).catch(() => undefined);
    return;
  }
  const cur = mem.get(u);
  if (cur) mem.set(u, { ...cur, views: cur.views + 1 });
}
