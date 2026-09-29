import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Gift, Copy, Check, ArrowLeft, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { base44 } from "@/api/base44Client";
import jsPDF from "jspdf";

const GIFT_CARD_IMAGE = "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/0bae4bfe9_Gemini_Generated_Image_6t88db6t88db6t88.jpg";
const WHATSAPP_NUMBER = "573214498931";
const STORAGE_KEY = "tami_gift_cards";

const pad = (n) => String(n).padStart(2, "0");

const formatDate = (d) =>
`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

const formatCOP = (v) => "$" + (v || 0).toLocaleString("es-CO");

export default function GiftCard() {
  const [amount, setAmount] = useState("");
  const [generated, setGenerated] = useState(false);
  const [code, setCode] = useState("");
  const [genDate, setGenDate] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    try {
      setSavedCards(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {/* ignore */}
  }, []);

  const handleGenerate = () => {
    const val = parseInt(amount);
    if (!val || val <= 0) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    const random = Math.floor(1000 + Math.random() * 9000);
    const newCode = `TM-${dateStr}${random}`;
    setCode(newCode);
    setGenDate(now);
    setGenerated(true);
    const card = { code: newCode, date: now.toISOString(), value: val };
    const updated = [card, ...savedCards];
    setSavedCards(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const generatePDF = async () => {
    // Load the gift card image at full resolution
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = GIFT_CARD_IMAGE;
    });

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    const stripH = Math.round(imgW * 0.1);

    const canvas = document.createElement("canvas");
    canvas.width = imgW;
    canvas.height = imgH + stripH;
    const ctx = canvas.getContext("2d");

    // Draw the gift card image
    ctx.drawImage(img, 0, 0, imgW, imgH);

    // Draw the value text (matches page: left 36%, top 66%, gold)
    if (generated && amount) {
      const fontSize = Math.round(imgW * 0.065);
      ctx.font = `bold ${fontSize}px 'Cormorant Garamond', serif`;
      ctx.fillStyle = "#C5A059";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(parseInt(amount).toLocaleString("es-CO"), imgW * 0.40, imgH * 0.66);
    }

    // Draw the gradient strip below (matches page: #D2B395 → #B89371)
    const gradient = ctx.createLinearGradient(0, imgH, imgW, imgH + stripH);
    gradient.addColorStop(0, "#D2B395");
    gradient.addColorStop(1, "#B89371");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, imgH, imgW, stripH);

    // Draw code and date on the strip
    ctx.fillStyle = "#3A2E22";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${Math.round(imgW * 0.025)}px sans-serif`;
    ctx.fillText(code, imgW / 2, imgH + stripH * 0.38);
    ctx.font = `${Math.round(imgW * 0.018)}px sans-serif`;
    ctx.fillText(genDate ? formatDate(genDate) : "", imgW / 2, imgH + stripH * 0.68);

    // Build PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = 90;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    return pdf;
  };

  const handleDownloadPDF = async () => {
    setBusy(true);
    try {
      const pdf = await generatePDF();
      if (pdf) pdf.save(`Tarjeta-Regalo-${code}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = async () => {
    setBusy(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) return;
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `Tarjeta-Regalo-${code}.pdf`, { type: "application/pdf" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.GiftCard.create({ code, amount: parseInt(amount), pdf_url: file_url });
      const cardUrl = `${window.location.origin}/t/${code}`;
      const msg = `Hola Tami! Quisiera comprar una Tarjeta de Regalo:\n\nCodigo: ${code}\nFecha: ${formatDate(genDate)}\nValor: ${formatCOP(parseInt(amount))}\n\nVer tarjeta digital aqui: ${cardUrl}\n\nGracias!`;
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGenerated(false);
    setCode("");
    setGenDate(null);
    setAmount("");
  };

  return (
    <div className="min-h-screen pb-16 px-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-6 h-6" /> Volver al catálogo
        </Link>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-rose-gold-gradient mb-2">
            Tarjeta de Regalo
          </h1>
          <p className="text-muted-foreground">El regalo perfecto para alguien especial</p>
        </div>

        {/* Gift card with overlay + code/date strip below */}
        <div ref={cardRef} className="mx-auto max-w-sm rounded-2xl overflow-hidden shadow-2xl ring-1 ring-primary/30 mb-8 bg-background">
          <div className="relative">
            <img src={GIFT_CARD_IMAGE} alt="Tarjeta de Regalo TAMI" className="w-full h-auto block" crossOrigin="anonymous" />
            {generated &&
            <>
                {/* Value — left-aligned, right of $ sign, gold, no background */}
                <div className="absolute" style={{ top: "66%", left: "36%" }}>
                  <p
                  className="text-2xl md:text-3xl font-bold text-left"
                  style={{ color: "#C5A059", fontFamily: "Cormorant Garamond, serif" }}>
                  
                    {parseInt(amount).toLocaleString("es-CO")}
                  </p>
                </div>
              </>
            }
          </div>
          {/* Code + date — below the image, cream strip */}
          {generated &&
          <div className="px-4 py-2 text-center" style={{ background: "linear-gradient(135deg, #D2B395 0%, #B89371 100%)" }}>
              <p className="text-sm font-bold" style={{ color: "#3A2E22" }}>
                {code}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#3A2E22" }}>
                {genDate && formatDate(genDate)}
              </p>
            </div>
          }
        </div>

        {/* Controls */}
        {!generated ?
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Ingresa el valor de la tarjeta (COP)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground font-semibold">
                  $
                </span>
                <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-card border border-border text-lg text-foreground focus:border-primary focus:outline-none transition-colors" />
              
              </div>
            </div>
            <Button
            onClick={handleGenerate}
            disabled={!amount || parseInt(amount) <= 0}
            className="h-14 text-lg font-bold bg-rose-gold-gradient text-primary-foreground hover:opacity-90 disabled:opacity-40 gap-2">
            
              <Gift className="w-6 h-6" /> Generar tarjeta de regalo
            </Button>
          </div> :

        <div className="flex flex-col gap-3 max-w-sm mx-auto">
            {/* Code display */}
            <div className="flex items-center justify-between rounded-xl bg-card border border-primary/30 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Código de la tarjeta</p>
                <p className="text-lg font-mono font-bold text-rose-gold-gradient">{code}</p>
              </div>
              <button
              onClick={handleCopy}
              className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              
                {copied ?
              <Check className="w-5 h-5 text-[#25D366]" /> :

              <Copy className="w-5 h-5 text-muted-foreground" />
              }
              </button>
            </div>

            {/* Download PDF button */}
            <Button
            onClick={handleDownloadPDF}
            disabled={busy}
            variant="outline"
            className="h-12 border-primary text-primary hover:bg-primary/10 gap-2">
            
              {busy ?
            <Loader2 className="w-5 h-5 animate-spin" /> :

            <Download className="w-5 h-5" />}
              Descargar PDF
            </Button>

            {/* Large checkout button */}
            <Button
            onClick={handleCheckout}
            disabled={busy}
            className="h-20 text-xl font-bold bg-[#25D366] text-white hover:bg-[#1da851] gap-3 shadow-lg shadow-[#25D366]/30 disabled:opacity-50">
            
              {busy ?
            <Loader2 className="w-8 h-8 animate-spin" /> :

            <WhatsAppIcon className="w-8 h-8" />} Terminar Compra
            </Button>

            <Button
            onClick={handleReset}
            variant="outline"
            className="h-12 border-primary text-primary hover:bg-primary/10">
            
              Generar otra tarjeta de regalo
            </Button>
          </div>
        }


      </div>
    </div>);
}