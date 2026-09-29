import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/CartContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingBag, Check } from "lucide-react";
import ProductDetailModal from "@/components/catalog/ProductDetailModal";

const COLOR_HEX = {
  negro: "#1a1a1a", taupe: "#b8a289", vino: "#5c1a2b", crema: "#e8dcc8",
  rojo: "#c0392b", azul: "#2c3e50", verde: "#27ae60", blanco: "#f5f5f5",
  gris: "#7f8c8d", marrón: "#6e4b2a", marron: "#6e4b2a", beige: "#d8c4a8",
  mostaza: "#d4a017", camel: "#c9a27a", café: "#4a2c1a", cafe: "#4a2c1a"
};
const colorHex = (c) => COLOR_HEX[(c || "").toLowerCase()] || "#c58f76";

const formatCOP = (v) => "$" + (v || 0).toLocaleString("es-CO");

export default function ProductCard({ product }) {
  const { addItem, setOpen } = useCart();
  const variants = product.variants;
  const [colorIdx, setColorIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
    setOpen(true);
  };

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] transition-all duration-300 flex flex-col">
      {/* Carousel */}
      <div
        className="relative overflow-hidden bg-card cursor-zoom-in"
        onClick={() => setModalOpen(true)}
      >
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none" }}>

          {variants.map((v, i) =>
          <div key={i} className="snap-center shrink-0 w-full aspect-[2/3] bg-white">
              <img
              src={v.image_url}
              alt={`${product.name} ${v.color}`}
              className="w-full h-full object-contain block" />

            </div>
          )}
        </div>

        {variants.length > 1 &&
        <>
            <button
            onClick={(e) => { e.stopPropagation(); scrollTo((colorIdx - 1 + variants.length) % variants.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
            
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
            onClick={(e) => { e.stopPropagation(); scrollTo((colorIdx + 1) % variants.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
            
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {variants.map((_, i) =>
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); scrollTo(i); }}
              className={`h-1.5 rounded-full transition-all ${
              i === colorIdx ? "w-5 bg-primary" : "w-1.5 bg-white/50"}`
              } />

            )}
            </div>
          </>
        }
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-base font-semibold leading-tight text-foreground line-clamp-2 uppercase min-h-10">
          {product.name}
        </h3>
        {product.price != null &&
        <p className="text-rose-gold-gradient text-lg font-semibold">
            {formatCOP(product.price)}
          </p>
        }
        {product.fabric &&
        <p className="text-xs text-muted-foreground">
            <span className="text-foreground/70">Tela:</span> {product.fabric}
          </p>
        }

        {/* Color selector */}
        {variants.length > 1 &&
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Color:</span>
            <div className="flex gap-1.5">
              {variants.map((v, i) =>
            <button
              key={i}
              onClick={() => scrollTo(i)}
              title={v.color}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
              i === colorIdx ?
              "border-primary scale-110 ring-2 ring-primary/30" :
              "border-border hover:border-primary/60"}`
              }
              style={{ backgroundColor: colorHex(v.color) }} />

            )}
            </div>
            <span className="text-xs text-foreground/80 ml-1">{current.color}</span>
          </div>
        }

        {product.detail &&
        <p className="text-xs text-muted-foreground italic leading-snug">
            {product.detail}
          </p>
        }

        <Button
          onClick={handleAdd}
          className="mt-auto w-full h-11 bg-rose-gold-gradient hover:opacity-90 text-primary-foreground gap-2">
          
          {added ?
          <>
              <Check className="w-4 h-4" /> Agregado
            </> :

          <>
              <ShoppingBag className="w-4 h-4" /> Agregar al carrito
            </>
          }
        </Button>
      </div>

      {modalOpen && createPortal(
        <ProductDetailModal product={product} onClose={() => setModalOpen(false)} />,
        document.body
      )}
    </div>);

}