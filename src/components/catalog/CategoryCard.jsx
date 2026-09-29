import React from "react";

export default function CategoryCard({ label, icon: Icon, image, active, onClick, contain, objectPosition, scale }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 group focus:outline-none"
    >
      <div
        className={`relative w-[72px] h-[72px] md:w-40 md:h-40 rounded-full overflow-hidden border-2 transition-all duration-300 ${
          active
            ? "border-primary scale-105 shadow-[0_0_22px_rgba(197,143,118,0.55)]"
            : "border-primary/30 group-hover:scale-105 group-hover:border-primary/60"
        }`}
        style={{ backgroundColor: contain ? "#1a1614" : "hsl(var(--card))" }}
      >
        {image ? (
          <img
            src={image}
            alt={label}
            className={`absolute inset-0 w-full h-full ${contain ? "object-contain" : "object-cover"}`}
            style={{ objectPosition: objectPosition || undefined, transform: scale ? `scale(${scale})` : undefined }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <Icon className="w-10 h-10 text-primary/70" />
          </div>
        )}
      </div>
      <span
        className={`text-xs md:text-sm tracking-[0.18em] uppercase font-medium transition-colors ${
          active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        }`}
      >
        {label}
      </span>
    </button>
  );
}