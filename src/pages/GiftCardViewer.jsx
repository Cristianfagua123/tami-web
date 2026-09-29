import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const GIFT_CARD_IMAGE = "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/0bae4bfe9_Gemini_Generated_Image_6t88db6t88db6t88.jpg";

const pad = (n) => String(n).padStart(2, "0");
const formatCOP = (v) => "$" + (v || 0).toLocaleString("es-CO");

export default function GiftCardViewer() {
  const { code } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getGiftCardByCode", { code });
        if (res?.data?.code) {
          setCard(res.data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Gift className="w-12 h-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Tarjeta no encontrada</p>
        <Link to="/">
          <Button variant="outline">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 px-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-rose-gold-gradient mb-2">
            Tarjeta de Regalo
          </h1>
          <p className="text-muted-foreground">Tu tarjeta digital</p>
        </div>

        <div className="mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl ring-1 ring-primary/30 mb-8 bg-background">
          <div className="relative">
            <img src={GIFT_CARD_IMAGE} alt="Tarjeta de Regalo TAMI" className="w-full h-auto block" />
            <div className="absolute" style={{ top: "66%", left: "40%" }}>
              <p
                className="text-2xl md:text-3xl font-bold text-left"
                style={{ color: "#C5A059", fontFamily: "Cormorant Garamond, serif" }}>
                {card.amount.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
          <div className="px-4 py-2 text-center" style={{ background: "linear-gradient(135deg, #D2B395 0%, #B89371 100%)" }}>
            <p className="text-sm font-bold" style={{ color: "#3A2E22" }}>
              {card.code}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <div className="flex items-center justify-between rounded-xl bg-card border border-primary/30 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-lg font-bold text-rose-gold-gradient">{formatCOP(card.amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Código</p>
              <p className="text-sm font-mono font-bold text-foreground">{card.code}</p>
            </div>
          </div>

          {card.pdf_url &&
          <a href={card.pdf_url} target="_blank" rel="noopener noreferrer" download>
            <Button className="w-full h-14 text-lg font-bold bg-rose-gold-gradient text-primary-foreground hover:opacity-90 gap-2">
              <Download className="w-6 h-6" /> Descargar PDF
            </Button>
          </a>}
        </div>
      </div>
    </div>
  );
}