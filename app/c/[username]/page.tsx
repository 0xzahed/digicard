import { notFound } from "next/navigation";
import { bumpViews, getCard } from "@/lib/store";

export const dynamic = "force-dynamic";

const themes: Record<string, { bg: string; btn: string; accent: string }> = {
  emerald: { bg: "from-emerald-950 via-slate-950 to-slate-950", btn: "bg-emerald-500 text-slate-950 hover:bg-emerald-400", accent: "text-emerald-400" },
  sky: { bg: "from-sky-950 via-slate-950 to-slate-950", btn: "bg-sky-500 text-slate-950 hover:bg-sky-400", accent: "text-sky-400" },
  amber: { bg: "from-amber-950 via-slate-950 to-slate-950", btn: "bg-amber-500 text-slate-950 hover:bg-amber-400", accent: "text-amber-400" },
  rose: { bg: "from-rose-950 via-slate-950 to-slate-950", btn: "bg-rose-500 text-slate-950 hover:bg-rose-400", accent: "text-rose-400" },
  violet: { bg: "from-violet-950 via-slate-950 to-slate-950", btn: "bg-violet-500 text-slate-950 hover:bg-violet-400", accent: "text-violet-400" },
};

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const card = await getCard(username);
  return { title: card ? `${card.name} — DigiCard` : "Card not found" };
}

export default async function CardPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const card = await getCard(username);
  if (!card) notFound();
  await bumpViews(username);
  const t = themes[card.theme] ?? themes.emerald;
  const wa = card.whatsapp.replace(/\D/g, "");

  return (
    <div className={`flex min-h-full flex-col items-center bg-gradient-to-b px-5 py-12 ${t.bg}`}>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10 text-3xl font-black">
          {card.name.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="mt-4 text-3xl font-bold">{card.name}</h1>
        {card.title && <p className={`mt-1 font-medium ${t.accent}`}>{card.title}</p>}
        {card.bio && <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.bio}</p>}

        <div className="mt-6 grid grid-cols-2 gap-2">
          {card.phone && (
            <a href={`tel:${card.phone}`} className={`rounded-xl px-4 py-3 font-semibold transition ${t.btn}`}>
              📞 Call
            </a>
          )}
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className={`rounded-xl px-4 py-3 font-semibold transition ${t.btn}`}>
              💬 WhatsApp
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-400">
              ✉️ Email
            </a>
          )}
          <a href={`/api/cards/${card.username}/vcard`} className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200 transition hover:border-slate-400">
            ⬇ Save contact
          </a>
        </div>

        {card.links.length > 0 && (
          <div className="mt-4 space-y-2">
            {card.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-800 bg-white/5 px-4 py-3 font-medium transition hover:border-slate-500"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

        {card.address && <p className="mt-5 font-mono text-xs text-slate-500">📍 {card.address}</p>}
        <p className="mt-6 font-mono text-[11px] text-slate-600">
          {card.views} views · made with DigiCard
        </p>
      </div>
    </div>
  );
}
