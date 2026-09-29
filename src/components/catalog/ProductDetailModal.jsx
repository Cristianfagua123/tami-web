import React, { useState, useRef } from "react";
import { useCart } from "@/lib/CartContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingBag, Check, X, MessageCircle } from "lucide-react";

const COLOR_HEX = {
  negro: "#1a1a1a", taupe: "#b8a289", vino: "#5c1a2b", crema: "#e8dcc8",
  rojo: "#c0392b", azul: "#2c3e50", verde: "#27ae60", blanco: "#f5f5f5",
  gris: "#7f8c8d", marrón: "#6e4b2a", marron: "#6e4b2a", beige: "#d8c4a8",
  mostaza: "#d4a017", camel: "#c9a27a", café: "#4a2c1a", cafe: "#4a2c1a"
};
const colorHex = (c) => COLOR_HEX[(c || "").toLowerCase()] || "#c58f76";
const formatCOP = (v) => "$" + (v || 0).toLocaleString("es-CO");
const WHATSAPP_NUMBER = "573214498931";

export default function ProductDetailModal({ product, onClose }) {
  const { addItem, setOpen } = useCart();
  const variants = product.variants;
  const [colorIdx, setColorIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const scrollRef = useRef(null);

  const current = variants[colorIdx];

  const scrollTo = (i) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setColorIdx(i);
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== colorIdx) setColorIdx(i);
  };

  const handleAdd = () => {
    addItem({
      key: `${product.name}-${current.color}`,
      name: product.name,
      color: current.color,
      price: product.price,
      image_url: current.image_url,
      qty: 1
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    setJustAdded(true);
  };

  const continueShopping = () => onClose();
  const viewCart = () => { setOpen(true); onClose(); };

  const waMessage = encodeURIComponent(
    `¡Hola Tami! ✨ Me interesa el producto:\n*${product.name}*\nColor: ${current.color}${product.price != null ? `\nPrecio: ${formatCOP(product.price)}` : ""}`
  );
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image carousel */}
        <div className="relative w-full md:w-1/2 h-[45vh] md:h-[90vh] md:max-h-[90vh] bg-card overflow-hidden shrink-0">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {variants.map((v, i) => (
              <div key={i} className="snap-center shrink-0 w-full h-full flex items-center justify-center">
                <img
                  src={v.image_url}
                  alt={`${product.name} ${v.color}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          {variants.length > 1 && (
            <>
              <button
                onClick={() => scrollTo((colorIdx - 1 + variants.length) % variants.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scrollTo((colorIdx + 1) % variants.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {variants.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === colorIdx ? "w-6 bg-primary" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info + CTAs */}
        <div className="md:w-1/2 flex flex-col p-6 md:p-8 overflow-y-auto gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-rose-gold-gradient leading-tight">
              {product.name}
            </h2>
            {product.price != null && (
              <p className="text-rose-gold-gradient text-3xl font-semibold mt-2">
                {formatCOP(product.price)}
              </p>
            )}
          </div>

          {product.fabric && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground/70">Tela:</span> {product.fabric}
            </p>
          )}

          {product.detail && (
            <p className="text-xl text-foreground/90 italic leading-relaxed font-medium">
              {product.detail}
            </p>
          )}

          {/* Color selector */}
          {variants.length > 1 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-base text-muted-foreground">Color:</span>
                <div className="flex gap-2">
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => scrollTo(i)}
                      title={v.color}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        i === colorIdx
                          ? "border-primary scale-110 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/60"
                      }`}
                      style={{ backgroundColor: colorHex(v.color) }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-2xl font-display font-semibold text-rose-gold-gradient capitalize">
                {current.color}
              </span>
              <span className="text-xs text-muted-foreground/80">Selecciona un color para continuar</span>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-4">
            {justAdded ? (
              <>
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40">
                  <Check className="w-6 h-6 text-[#25D366]" />
                  <span className="text-lg font-display font-semibold text-[#25D366]">¡Agregado al carrito!</span>
                </div>
                <Button
                  onClick={continueShopping}
                  className="w-full h-14 text-base bg-rose-gold-gradient hover:opacity-90 text-primary-foreground gap-2"
                >
                  <ShoppingBag className="w-5 h-5" /> Continuar comprando
                </Button>
                <Button
                  onClick={viewCart}
                  variant="outline"
                  className="w-full h-14 text-base gap-2 border-primary text-primary hover:bg-primary/10"
                >
                  Ver carrito
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAdd}
                  className="w-full h-16 text-lg font-bold bg-rose-gold-gradient hover:opacity-90 text-primary-foreground gap-2 shadow-lg shadow-primary/40 ring-2 ring-primary/20"
                >
                  {added ? (
                    <>
                      <Check className="w-6 h-6" /> Agregado
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-6 h-6" /> Agregar al carrito
                    </>
                  )}
                </Button>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-14 text-base gap-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                  >
                    <MessageCircle className="w-5 h-5" /> Consultar por WhatsApp
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}