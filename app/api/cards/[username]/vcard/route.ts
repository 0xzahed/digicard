import { NextResponse } from "next/server";
import { bumpViews, getCard } from "@/lib/store";
import { buildVCard } from "@/lib/vcard";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ username: string }> }) {
  const { username } = await ctx.params;
  const card = await getCard(username);
  if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
  await bumpViews(username);
  return new NextResponse(buildVCard(card), {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${card.username}.vcf"`,
    },
  });
}
