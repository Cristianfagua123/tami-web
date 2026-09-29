import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyOutfits({ hasOutfits }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-12 h-12 text-orange-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {hasOutfits ? "No outfits found" : "No outfits yet"}
      </h3>
      
      <p className="text-gray-600 text-center max-w-md mb-6">
        {hasOutfits 
          ? "Try adjusting your search to find what you're looking for"
          : "Start creating outfit combinations from your wardrobe items"
        }
      </p>

      {!hasOutfits && (
        <Link to={createPageUrl("CreateOutfit")}>
          <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Outfit
          </Button>
        </Link>
      )}
    </div>
  );
}