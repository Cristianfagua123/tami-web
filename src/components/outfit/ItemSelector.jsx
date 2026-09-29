import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ItemSelector({ items, isLoading, onSelectItem, selectedItemIds }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: "All" },
    { value: "tops", label: "Tops" },
    { value: "bottoms", label: "Bottoms" },
    { value: "dresses", label: "Dresses" },
    { value: "outerwear", label: "Outer" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Access." },
  ];

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <Card className="border-orange-100 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg">Select Items</CardTitle>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mt-4">
          <TabsList className="bg-orange-50 grid grid-cols-4 lg:grid-cols-7">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="text-xs data-[state=active]:bg-white"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No items in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative group cursor-pointer ${
                      isSelected ? 'opacity-50' : ''
                    }`}
                    onClick={() => !isSelected && onSelectItem(item)}
                  >
                    <div className={`aspect-[3/4] rounded-lg overflow-hidden border-2 ${
                      isSelected ? 'border-green-400' : 'border-gray-200 group-hover:border-orange-300'
                    } transition-all`}>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {!isSelected && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Button
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-orange-600 hover:bg-orange-50"
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-600 line-clamp-1">
                      {item.name}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}