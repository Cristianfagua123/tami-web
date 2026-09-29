import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Shirt, CloudRain, Layers, Footprints } from "lucide-react";
import ProductCard from "@/components/catalog/ProductCard";
import CategoryCard from "@/components/catalog/CategoryCard";

const CATEGORIES = [
{ value: "chaquetas", label: "Chaquetas", icon: Shirt, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/67a0db4a5_generated_image.png" },
{ value: "gabanes", label: "Gabanes", icon: CloudRain, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/524582aeb_generated_image.png" },
{ value: "chalecos", label: "Chalecos", icon: Layers, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/d6f7a841a_generated_image.png" },
{ value: "pantalones", label: "Pantalones", icon: Footprints, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/7462857fa_generated_image.png" },
{ value: "parka", label: "Parka", icon: CloudRain, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/97a2bbdb6_generated_image.png" },
{ value: "sudaderas", label: "Sudaderas", icon: Shirt, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/1644a9ae8_generated_image.png" },
{ value: "blusas", label: "Blusas", icon: Shirt, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/c0c291c4a_generated_image.png" },
{ value: "vestidos", label: "Vestidos", icon: Shirt, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/119e19c6f_generated_image.png" },
{ value: "blazer", label: "Blazer", icon: Shirt, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/15376f3b6_generated_image.png" },
{ value: "faldas", label: "Faldas", icon: Shirt, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/f52028882_generated_image.png" },
{ value: "calzado", label: "Calzado", icon: Footprints, image: "https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/5a5fb692a_generated_image.png", objectPosition: "center 65%", scale: 1.1 }];


export default function Wardrobe() {
  const [selectedCategory, setSelectedCategory] = useState("chaquetas");
  const [showAll, setShowAll] = useState(true);

  const { data: items, isLoading } = useQuery({
    queryKey: ["clothingItems"],
    queryFn: () => base44.entities.ClothingItem.list("-created_date"),
    initialData: []
  });

  // Group variants by product name → unified products with color carousel
  const products = useMemo(() => {
    const groups = {};
    items.forEach((it) => {
      const key = it.name;
      if (!groups[key]) {
        groups[key] = {
          name: it.name,
          category: it.category,
          price: it.price,
          fabric: it.fabric,
          sizes: it.sizes,
          detail: it.detail,
          variants: []
        };
      }
      groups[key].variants.push({ color: it.color, image_url: it.image_url, id: it.id });
    });
    return Object.values(groups);
  }, [items]);

  const CATEGORY_ORDER = { parka: 0, chaquetas: 1, pantalones: 2 };
  const filteredProducts = showAll
    ? [...products].sort((a, b) => (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99))
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="hero-image-wrap w-full">
        <img
          src="https://media.base44.com/images/public/6a9c689c765c88a4dffb0dc0/3c92fdf7b_Gemini_Generated_Image_q78n04q78n04q78n.jpg"
          alt="Tami — Diseño de alta calidad"
          loading="eager" />
      </div>
      <div className="md:p-10 py-4 md:mx-8 px-4 pt-8">
        <div className="max-w-7xl mx-auto">
        {/* Header: title below banner */}
        <div className="mb-8 mt-6 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-rose-gold-gradient mb-2 leading-tight">
            DISEÑO DE ALTA CALIDAD
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Descubre nuestras prendas exclusivas. Desliza para ver los colores disponibles.
          </p>
          <p className="text-rose-gold-gradient font-display text-lg md:text-xl font-semibold mt-2">
            Somos fabricantes de ropa femenina al por mayor y al detal.
          </p>
        </div>

        {/* Categories */}
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-2.5 md:gap-6">
            {CATEGORIES.map((cat) =>
              <CategoryCard
                key={cat.value}
                label={cat.label}
                icon={cat.icon}
                image={cat.image}
                contain={cat.contain}
                objectPosition={cat.objectPosition}
                scale={cat.scale}
                active={!showAll && selectedCategory === cat.value}
                onClick={() => { setShowAll(false); setSelectedCategory(cat.value); }} />

              )}
          </div>

          {/* Ver todo el catálogo */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className={`cta-glow px-8 py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${
                showAll
                  ? "bg-rose-gold-gradient text-primary-foreground"
                  : "border border-primary/40 text-primary hover:bg-primary/10"
              }`}>
              Ver todo el catálogo
            </button>
          </div>
        </div>

        {/* Products */}
        {isLoading ?
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array(4).fill(0).map((_, i) =>
            <div key={i} className="aspect-[3/4] bg-card rounded-2xl animate-pulse" />
            )}
          </div> :
          filteredProducts.length === 0 ?
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-primary/30 bg-card">
              <Shirt className="w-12 h-12 text-primary" />
            </div>
            <h3 className="font-display text-3xl font-semibold text-foreground mb-2">
              Próximamente
            </h3>
            <p className="text-muted-foreground max-w-md">
              Estamos preparando esta categoría. Mientras tanto, explora nuestros productos disponibles.
            </p>
          </div> :

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mx-1 mt-10 md:mt-14">
            {filteredProducts.map((product) =>
            <ProductCard key={product.name} product={product} />
            )}
          </div>
          }
        </div>
      </div>
    </div>);

}