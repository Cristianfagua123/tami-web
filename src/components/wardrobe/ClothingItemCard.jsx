import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WHATSAPP_NUMBER = "573214498931";

const formatCOP = (value) => {
  if (value == null) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ClothingItemCard({ item }) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => base44.entities.ClothingItem.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clothingItems'] });
    },
  });

  const handleDelete = () => {
    deleteItemMutation.mutate(item.id);
    setShowDeleteDialog(false);
  };

  const sizes = item.sizes ? item.sizes.split(/\s+/).filter(Boolean) : [];

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola THASMI ✨, me interesa la ${item.name} (${item.color || "color disponible"}) ¿está disponible?`
  )}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group overflow-hidden border-border bg-card backdrop-blur hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
          <div className="aspect-[3/4] relative overflow-hidden bg-black">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {item.color && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/70 text-foreground border border-primary/40 backdrop-blur text-[11px] tracking-wide">
                  {item.color}
                </Badge>
              </div>
            )}

            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full w-8 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <h3 className="font-display text-lg font-semibold leading-tight line-clamp-2 text-foreground">
              {item.name}
            </h3>

            {item.price != null && (
              <p className="text-rose-gold-gradient text-xl font-semibold">
                {formatCOP(item.price)}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {item.fabric && <span><span className="text-foreground/70">Tela:</span> {item.fabric}</span>}
              {item.category && <span className="capitalize">· {item.category}</span>}
            </div>

            {sizes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Tallas:</span>
                <div className="flex gap-1">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="min-w-6 h-6 px-1.5 inline-flex items-center justify-center rounded-md border border-primary/40 text-[11px] font-medium text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.detail && (
              <p className="text-xs text-muted-foreground italic leading-snug">
                {item.detail}
              </p>
            )}

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center justify-center gap-2 w-full h-9 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar
            </a>
          </div>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteItemMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}