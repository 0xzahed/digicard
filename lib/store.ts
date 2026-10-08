import fs from "node:fs";
import path from "node:path";
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

type Raw = Record<string, unknown> & { _id?: unknown };

// ---------- File store (shared across pages, routes, workers) ----------
// Next.js may load pages and API routes in isolated module graphs, so a
// module-level Map is NOT shared. A tiny JSON file is — and MongoDB (when
// configured) is the real multi-instance store.

const DATA_DIR = path.join(process.cwd(), ".data");
const CARDS_FILE = path.join(DATA_DIR, "cards.json");

function readFileStore(): Record<string, CardDoc> {
  try {
    return JSON.parse(fs.readFileSync(CARDS_FILE, "utf8")) as Record<string, CardDoc>;
  } catch {
    return {};
  }
}

function writeFileStore(all: Record<string, CardDoc>): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CARDS_FILE, JSON.stringify(all));
}

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
  return Object.values(readFileStore()).sort((a, b) => a.username.localeCompare(b.username));
}

export async function getCard(username: string): Promise<CardDoc | null> {
  const u = username.toLowerCase();
  if (await db()) {
    const r = (await Card.findOne({ username: u }).lean().catch(() => null)) as unknown as Raw | null;
    return r ? toDoc(r) : null;
  }
  return readFileStore()[u] ?? null;
}

export async function createCard(c: NewCard): Promise<CardDoc> {
  const username = c.username.toLowerCase().trim();
  if (!validUsername(username)) throw new Error("Username: 3–30 chars, letters/numbers/dash.");
  if (!c.name.trim()) throw new Error("Name is required.");
  if (await getCard(username)) throw new Error("Username is taken.");
  const base = { ...c, username, name: c.name.trim(), views: 0 };
  if (await db()) {
    const created = await Card.create(base);
    return toDoc(created.toObject() as unknown as Raw);
  }
  const all = readFileStore();
  const full: CardDoc = { ...base, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
  all[username] = full;
  writeFileStore(all);
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
  const all = readFileStore();
  const cur = all[u];
  if (!cur) return null;
  all[u] = { ...cur, ...clean } as CardDoc;
  writeFileStore(all);
  return all[u];
}

export async function deleteCard(username: string): Promise<boolean> {
  const u = username.toLowerCase();
  if (await db()) {
    const r = await Card.findOneAndDelete({ username: u }).catch(() => null);
    return !!r;
  }
  const all = readFileStore();
  if (!all[u]) return false;
  delete all[u];
  writeFileStore(all);
  return true;
}

export async function bumpViews(username: string): Promise<void> {
  const u = username.toLowerCase();
  if (await db()) {
    await Card.updateOne({ username: u }, { $inc: { views: 1 } }).catch(() => undefined);
    return;
  }
  const all = readFileStore();
  const cur = all[u];
  if (cur) {
    all[u] = { ...cur, views: cur.views + 1 };
    writeFileStore(all);
  }
}
