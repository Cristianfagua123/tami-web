import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Save, ArrowLeft, Layers, Maximize2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import OutfitCanvas from "../components/outfit/OutfitCanvas";
import ItemSelector from "../components/outfit/ItemSelector";
import Outfit3DViewer from "../components/outfit/Outfit3DViewer";

export default function CreateOutfit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [outfitName, setOutfitName] = useState("");
  const [outfitDescription, setOutfitDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [viewMode, setViewMode] = useState("2d");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['clothingItems', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ClothingItem.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
    enabled: !!user?.email,
  });

  const createOutfitMutation = useMutation({
    mutationFn: (data) => base44.entities.Outfit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
      navigate(createPageUrl("MyOutfits"));
    },
  });

  const handleAddItem = (item) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const handleSaveOutfit = () => {
    if (selectedItems.length === 0 || !outfitName) return;

    createOutfitMutation.mutate({
      name: outfitName,
      description: outfitDescription,
      clothing_items: selectedItems.map(item => item.id),
      is_public: isPublic,
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("MyOutfits"))}
          className="mb-6 hover:bg-orange-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Outfit
          </h1>
          <p className="text-gray-600">Mix and match items from your wardrobe</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Canvas Area */}
          <div className="space-y-6">
            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur border border-orange-100">
                <TabsTrigger value="2d" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <Layers className="w-4 h-4 mr-2" />
                  2D View
                </TabsTrigger>
                <TabsTrigger value="3d" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <Maximize2 className="w-4 h-4 mr-2" />
                  3D View
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Display based on view mode */}
            {viewMode === "2d" ? (
              <OutfitCanvas 
                selectedItems={selectedItems}
                onRemoveItem={handleRemoveItem}
              />
            ) : (
              <Outfit3DViewer selectedItems={selectedItems} />
            )}

            {/* Outfit Details */}
            <Card className="border-orange-100 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Outfit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="outfit_name">Outfit Name *</Label>
                  <Input
                    id="outfit_name"
                    placeholder="e.g., Casual Friday Look"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outfit_description">Description</Label>
                  <Textarea
                    id="outfit_description"
                    placeholder="Add notes about this outfit..."
                    value={outfitDescription}
                    onChange={(e) => setOutfitDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-3">
                    {isPublic ? (
                      <Globe className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <Label htmlFor="is_public" className="cursor-pointer font-semibold">
                        {isPublic ? "Public Outfit" : "Private Outfit"}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {isPublic 
                          ? "Everyone can see this outfit in the gallery" 
                          : "Only you can see this outfit"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="is_public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                <Button
                  onClick={handleSaveOutfit}
                  disabled={selectedItems.length === 0 || !outfitName || createOutfitMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createOutfitMutation.isPending ? "Saving..." : "Save Outfit"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Item Selector */}
          <ItemSelector
            items={items}
            isLoading={isLoading}
            onSelectItem={handleAddItem}
            selectedItemIds={selectedItems.map(i => i.id)}
          />
        </div>
      </div>
    </div>
  );
}