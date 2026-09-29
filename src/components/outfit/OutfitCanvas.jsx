import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OutfitCanvas({ selectedItems, onRemoveItem }) {
  const getCategoryOrder = (category) => {
    const order = { outerwear: 0, tops: 1, dresses: 2, bottoms: 3, shoes: 4, accessories: 5 };
    return order[category] ?? 999;
  };

  const sortedItems = [...selectedItems].sort((a, b) => 
    getCategoryOrder(a.category) - getCategoryOrder(b.category)
  );

  return (
    <Card className="border-orange-100 bg-white/80 backdrop-blur min-h-[500px]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          Your Outfit
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-orange-400" />
            </div>
            <p className="text-gray-500 mb-2">Start building your outfit</p>
            <p className="text-sm text-gray-400">Select items from the right panel</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {sortedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-orange-200 bg-white">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <p className="text-xs text-center mt-2 text-gray-600 line-clamp-1">
                    {item.name}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}