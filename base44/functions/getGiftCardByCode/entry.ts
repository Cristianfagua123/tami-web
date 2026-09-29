import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const code = body?.code;
    if (!code) return Response.json({ error: "Missing code" }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const cards = await base44.asServiceRole.entities.GiftCard.filter({ code });
    if (!cards || cards.length === 0) {
      return Response.json({ error: "Gift card not found" }, { status: 404 });
    }
    const card = cards[0];
    return Response.json({ code: card.code, amount: card.amount, pdf_url: card.pdf_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}