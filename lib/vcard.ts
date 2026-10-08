import type { CardDoc } from "@/lib/store";

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** RFC 6350 vCard 4.0 download for phone contact apps. */
export function buildVCard(c: CardDoc): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:4.0",
    `FN:${esc(c.name)}`,
    c.title ? `TITLE:${esc(c.title)}` : "",
    c.phone ? `TEL;TYPE=cell:${esc(c.phone)}` : "",
    c.whatsapp ? `TEL;TYPE=msg:${esc(c.whatsapp)}` : "",
    c.email ? `EMAIL:${esc(c.email)}` : "",
    c.address ? `ADR:;;${esc(c.address)};;;;` : "",
    c.bio ? `NOTE:${esc(c.bio)}` : "",
    ...c.links.map((l) => `URL;TYPE=${esc(l.label).slice(0, 20)}:${esc(l.url)}`),
    "END:VCARD",
  ];
  return lines.filter(Boolean).join("\r\n");
}
