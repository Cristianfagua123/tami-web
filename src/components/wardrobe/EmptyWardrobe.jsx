import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyWardrobe({ hasItems }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-primary/30 bg-card">
        <Shirt className="w-12 h-12 text-primary" />
      </div>

      <h3 className="font-display text-3xl font-semibold text-foreground mb-2">
        {hasItems ? "No hay coincidencias" : "Tu catálogo está vacío"}
      </h3>

      <p className="text-muted-foreground text-center max-w-md mb-6">
        {hasItems
          ? "Ajusta tu búsqueda o filtros para ver más prendas."
          : "Agrega tu primera prenda para empezar a construir el catálogo de THASMI."}
      </p>

      {!hasItems && (
        <Link to={createPageUrl("AddItem")}>
          <Button className="bg-rose-gold-gradient hover:opacity-90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Agregar primera prenda
          </Button>
        </Link>
      )}
    </div>
  );
}