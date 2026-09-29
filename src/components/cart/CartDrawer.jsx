import React from "react";
import { useCart } from "@/lib/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import WhatsAppIconLogo from "@/components/WhatsAppIcon";

const WHATSAPP_NUMBER = "573214498931";

const formatCOP = (v) => "$" + (v || 0).toLocaleString("es-CO");

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, removeItem, clear, total, count } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    const lines = items
      .map((i) => `🧥 **${i.qty}x ${i.name}** — ${i.color}`)
      .join("\n");
    const totalStr = formatCOP(total);
    const msg = `¡Hola! 😊 Quisiera finalizar mi compra con los siguientes productos:\n\n${lines}\n\n💰 **Total estimado:** ${totalStr}\n\nQuedo atento para confirmar el valor final y coordinar el **pago y envío**. ¡Gracias! 😊`;
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="font-display text-2xl text-rose-gold-gradient flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Tu Carrito
            {count > 0 && (
              <span className="ml-1 text-sm bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="w-14 h-14 text-muted-foreground mb-4" />
            <p className="font-display text-xl text-foreground mb-1">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground mb-6">
              Explora nuestro catálogo y agrega tus prendas favoritas.
            </p>
            <Button
              onClick={() => setOpen(false)}
              className="h-14 text-lg bg-rose-gold-gradient text-primary-foreground cta-glow"
            >
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-3 pb-4 border-b border-border last:border-0"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-base font-semibold text-foreground line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.color}
                    </p>
                    <p className="text-sm text-primary font-semibold mt-1">
                      {formatCOP(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.key, item.qty - 1)}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.key, item.qty + 1)}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="ml-auto text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4 space-y-3 bg-background/40">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total estimado</span>
                <span className="font-display text-2xl font-semibold text-rose-gold-gradient">
                  {formatCOP(total)}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full h-12 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-base font-semibold gap-2"
              >
                <WhatsAppIconLogo className="w-5 h-5" />
                Comprar
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full h-14 text-lg border-primary text-primary hover:bg-primary/10 cta-glow"
              >
                Seguir comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}