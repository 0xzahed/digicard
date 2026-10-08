"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface Card {
  username: string;
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  bio: string;
  theme: string;
  links: { label: string; url: string }[];
  views: number;
}

const THEMES = ["emerald", "sky", "amber", "rose", "violet"];

const input =
  "h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm outline-none placeholder:text-slate-600 focus:border-violet-500";
const btn =
  "h-11 cursor-pointer rounded-xl bg-violet-500 px-5 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40";
const ghost =
  "h-9 cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-violet-500 hover:text-white";

const empty = { username: "", name: "", title: "", phone: "", whatsapp: "", email: "", address: "", bio: "", theme: "emerald", linksText: "" };

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [form, setForm] = useState(empty);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/cards");
      setCards((await r.json()).cards ?? []);
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    load();
    setOrigin(window.location.origin);
  }, [load]);

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : "Failed.");

  const parseLinks = (t: string) =>
    t
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const i = l.indexOf("|");
        return i === -1 ? null : { label: l.slice(0, i).trim(), url: l.slice(i + 1).trim() };
      })
      .filter((x): x is { label: string; url: string } => !!x && !!x.label && !!x.url);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const r = await fetch("/api/cards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, links: parseLinks(form.linksText) }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setForm(empty);
      load();
    } catch (e) {
      fail(e);
    }
  };

  const remove = async (username: string) => {
    if (!confirm(`Delete @${username}?`)) return;
    await fetch(`/api/cards?username=${encodeURIComponent(username)}`, { method: "DELETE" });
    load();
  };

  const seed = async () => {
    await fetch("/api/seed", { method: "POST" });
    load();
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-violet-400">DigiCard</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Digital visiting cards.</h1>
          <p className="mt-2 text-slate-400">One link + QR per customer. ৳500/year each.</p>
        </div>
        <button onClick={seed} className={ghost}>Load demo card</button>
      </header>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <form onSubmit={create} className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-3">
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username * (link id)" className={input} />
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name / shop *" className={input} />
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title / tagline" className={input} />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={input} />
        <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp number" className={input} />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className={input} />
        <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className={input} />
        <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className={`${input} cursor-pointer`}>
          {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio" className={`${input} col-span-2 sm:col-span-3`} />
        <textarea
          value={form.linksText}
          onChange={(e) => setForm({ ...form, linksText: e.target.value })}
          placeholder={"Links — one per line: Label | https://…\nFacebook | https://facebook.com/…"}
          rows={3}
          className="col-span-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-violet-500 sm:col-span-3"
        />
        <button type="submit" className={`${btn} col-span-2 sm:col-span-3`}>Create card</button>
      </form>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const url = `${origin}/c/${c.username}`;
          return (
            <li key={c.username} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="shrink-0 rounded-xl bg-white p-2">
                <QRCode value={url} size={96} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{c.name}</p>
                <a href={url} target="_blank" rel="noreferrer" className="truncate font-mono text-xs text-violet-300 hover:underline">
                  /c/{c.username}
                </a>
                <p className="mt-1 font-mono text-xs text-slate-500">{c.views} views · {c.links.length} links</p>
                <div className="mt-2 flex gap-2">
                  <a href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 px-3 py-1 text-xs hover:border-violet-500">Open</a>
                  <button onClick={() => remove(c.username)} className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-500 hover:border-red-500 hover:text-red-300">Del</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {cards.length === 0 && <p className="mt-8 text-center text-sm text-slate-500">No cards yet — create one or load the demo.</p>}
    </div>
  );
}
