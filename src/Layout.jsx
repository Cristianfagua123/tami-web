import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, Gem, MapPin, Instagram, Gift } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import TikTokIcon from "@/components/TikTokIcon";
import CartDrawer from "@/components/cart/CartDrawer";

const LOGO_URL = "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/fe4cadd06_WhatsAppImage2026-09-06at11330PM.jpeg";
const WHATSAPP_NUMBER = "573214498931";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola Tami! ✨ Quisiera información sobre sus productos.")}`;

export default function Layout({ children, currentPageName }) {
  const { count, setOpen } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top header: logo + navigation */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          {/* Logo — left */}
          <Link to={createPageUrl("Wardrobe")} className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-primary/50 shadow-lg shrink-0 bg-black flex items-center justify-center p-1">
              <img src={LOGO_URL} alt="Tami" className="w-full h-full object-contain mx-2" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl md:text-4xl font-semibold text-rose-gold-gradient leading-none">
                Tami
              </h1>
              

              
            </div>
          </Link>

          {/* Desktop badges */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to={createPageUrl("Wardrobe")}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-lg text-muted-foreground hover:text-primary transition-all">
              
              <Gem className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-lg font-semibold tracking-wide">Calidad Premium</span>
            </Link>
            <Link
              to="/gift-card"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-lg text-muted-foreground hover:text-primary transition-all">
              <Gift className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-lg font-semibold tracking-wide">Tarjeta de Regalo</span>
            </Link>
            <a
              href="https://www.google.com/maps/search/?api=1&query=San+Andresito+de+San+José+Centro+Comercial+Puerto+Príncipe+Local+42+Calle+10+20-35+Bogotá+Colombia"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2.5 rounded-lg text-primary hover:opacity-80 transition-all">
              <MapPin className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-lg font-semibold tracking-wide">Punto Físico</span>
            </a>
          </div>

          {/* Social icons — desktop */}
          <div className="hidden md:flex items-center gap-2.5">
            <a href="https://www.instagram.com/somos_tami" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/60 hover:scale-110 transition-all">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://www.tiktok.com/@somostami_" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/60 hover:scale-110 transition-all">
              <TikTokIcon className="w-6 h-6" />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-12 h-12 rounded-full border border-[#25D366]/40 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white hover:scale-110 transition-all">
              <WhatsAppIcon className="w-6 h-6" />
            </a>
          </div>

          {/* Cart — right */}
          <button
            onClick={() => setOpen(true)}
            className="cart-btn relative flex items-center justify-center gap-2 h-11 md:h-16 px-3 md:px-7 rounded-xl bg-rose-gold-gradient text-primary-foreground text-sm md:text-lg font-semibold shadow-md hover:opacity-90 transition-all">
            
            <ShoppingCart className="w-5 h-5 md:w-8 md:h-8" />
            <span className="hidden md:inline">Carrito</span>
            {count > 0 &&
            <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-card">
                {count}
              </span>
            }
          </button>
        </div>

        {/* Mobile badges row */}
        <div className="md:hidden flex items-center justify-center gap-5 pb-2.5 px-4">
          <Link
            to={createPageUrl("Wardrobe")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            
            <Gem className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold tracking-wide">Calidad Premium</span>
          </Link>
          <Link
            to="/gift-card"
            className="flex items-center gap-1.5 text-primary">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold tracking-wide">Tarjeta Regalo</span>
          </Link>
          <a
            href="https://www.google.com/maps/search/?api=1&query=San+Andresito+de+San+José+Centro+Comercial+Puerto+Príncipe+Local+42+Calle+10+20-35+Bogotá+Colombia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold tracking-wide">Punto Físico</span>
          </a>
        </div>

        {/* Mobile social icons row */}
        <div className="md:hidden flex items-center justify-center gap-3 pb-2.5 px-4">
          <a href="https://www.instagram.com/somos_tami" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/60 transition-all">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://www.tiktok.com/@somostami_" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/60 transition-all">
            <TikTokIcon className="w-5 h-5" />
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full border border-[#25D366]/40 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all">
            <WhatsAppIcon className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Floating WhatsApp button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group">
        
        <span className="hidden sm:inline-block bg-card/90 backdrop-blur-md border border-border text-foreground text-sm px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Escríbenos
        </span>
        <span className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[#25D366] shadow-xl hover:scale-110 transition-transform duration-300">
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          <WhatsAppIcon className="w-11 h-11 text-white relative z-10" />
        </span>
      </a>

      <CartDrawer />
    </div>);

}