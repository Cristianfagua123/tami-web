import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OutfitCard from "../components/outfit/OutfitCard";
import EmptyOutfits from "../components/outfit/EmptyOutfits";

export default function MyOutfits() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: outfits, isLoading } = useQuery({
    queryKey: ['outfits', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Outfit.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user?.email,
  });

  const { data: items } = useQuery({
    queryKey: ['clothingItems', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ClothingItem.filter({ created_by: user.email });
    },
    initialData: [],
    enabled: !!user?.email,
  });

  const filteredOutfits = outfits.filter(outfit =>
    !searchQuery || outfit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOutfitItems = (outfit) => {
    return outfit.clothing_items?.map(itemId => 
      items.find(item => item.id === itemId)
    ).filter(Boolean) || [];
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                My Outfits
              </h1>
              <p className="text-gray-600">
                {outfits.length} saved {outfits.length === 1 ? 'combination' : 'combinations'}
              </p>
            </div>
            <Link to={createPageUrl("CreateOutfit")}>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Create Outfit
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400 bg-white/80 backdrop-blur"
            />
          </div>
        </div>

        {/* Outfits Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOutfits.length === 0 ? (
          <EmptyOutfits hasOutfits={outfits.length > 0} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit) => (
              <OutfitCard 
                key={outfit.id} 
                outfit={outfit}
                items={getOutfitItems(outfit)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}