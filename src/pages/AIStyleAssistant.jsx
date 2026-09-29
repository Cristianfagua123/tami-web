import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wand2, Sparkles, Loader2, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SuggestionCard from "../components/ai/SuggestionCard";

export default function AIStyleAssistant() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  
  const [preferences, setPreferences] = useState({
    occasion: "",
    season: "",
    weather: "",
    eventDescription: "",
    stylePreference: "",
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['clothingItems', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.ClothingItem.filter({ created_by: user.email });
    },
    initialData: [],
    enabled: !!user?.email,
  });

  const saveOutfitMutation = useMutation({
    mutationFn: (data) => base44.entities.Outfit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
    },
  });

  const handleGenerateSuggestions = async () => {
    if (items.length === 0) {
      setError("You need to add items to your wardrobe first!");
      return;
    }

    setGenerating(true);
    setError(null);
    setSuggestions([]);

    try {
      // Prepare wardrobe data for AI
      const wardrobeData = items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        color: item.color,
        brand: item.brand,
        season: item.season,
        occasion: item.occasion,
      }));

      const prompt = `You are a professional fashion stylist. Based on the following wardrobe items, create 3 stylish outfit combinations.

Wardrobe Items:
${JSON.stringify(wardrobeData, null, 2)}

User Preferences:
${preferences.occasion ? `- Occasion: ${preferences.occasion}` : ''}
${preferences.season ? `- Season: ${preferences.season}` : ''}
${preferences.weather ? `- Weather: ${preferences.weather}` : ''}
${preferences.eventDescription ? `- Event Details: ${preferences.eventDescription}` : ''}
${preferences.stylePreference ? `- Style Preference: ${preferences.stylePreference}` : ''}

For each outfit combination:
1. Select items that work well together considering color coordination, style, and the user's preferences
2. Only use item IDs from the provided wardrobe
3. Ensure the outfit is appropriate for the occasion, season, and weather
4. Consider color theory and fashion principles
5. Include tops, bottoms (or dresses), and accessories/shoes when appropriate

Provide diverse outfit options that showcase different styles and combinations.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            outfits: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  item_ids: {
                    type: "array",
                    items: { type: "string" }
                  },
                  style_notes: { type: "string" },
                  why_it_works: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Map item IDs to actual items
      const suggestionsWithItems = result.outfits.map(outfit => ({
        ...outfit,
        items: outfit.item_ids
          .map(id => items.find(item => item.id === id))
          .filter(Boolean)
      }));

      setSuggestions(suggestionsWithItems);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setError("Failed to generate outfit suggestions. Please try again.");
    }

    setGenerating(false);
  };

  const handleSaveOutfit = async (suggestion) => {
    await saveOutfitMutation.mutateAsync({
      name: suggestion.name,
      description: `${suggestion.description}\n\n${suggestion.why_it_works}`,
      clothing_items: suggestion.items.map(item => item.id),
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                AI Style Assistant
              </h1>
              <p className="text-gray-600">
                Get personalized outfit suggestions based on your wardrobe
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white/80 backdrop-blur border-purple-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{items.length}</p>
                <p className="text-xs text-gray-500">Items in Wardrobe</p>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-pink-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">
                  {new Set(items.map(i => i.category)).size}
                </p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-orange-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {suggestions.length}
                </p>
                <p className="text-xs text-gray-500">Suggestions</p>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-green-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">AI</p>
                <p className="text-xs text-gray-500">Powered</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Preferences Form */}
          <div className="lg:col-span-1">
            <Card className="border-purple-100 bg-white/80 backdrop-blur sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="occasion">Occasion</Label>
                  <Select
                    value={preferences.occasion}
                    onValueChange={(value) => setPreferences({ ...preferences, occasion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="athletic">Athletic</SelectItem>
                      <SelectItem value="party">Party</SelectItem>
                      <SelectItem value="date">Date Night</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Select
                    value={preferences.season}
                    onValueChange={(value) => setPreferences({ ...preferences, season: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weather">Weather Condition</Label>
                  <Input
                    id="weather"
                    placeholder="e.g., Sunny, Rainy, Cold"
                    value={preferences.weather}
                    onChange={(e) => setPreferences({ ...preferences, weather: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Event Details (Optional)</Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="e.g., Outdoor brunch with friends, Job interview at tech company..."
                    value={preferences.eventDescription}
                    onChange={(e) => setPreferences({ ...preferences, eventDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stylePreference">Style Preference (Optional)</Label>
                  <Input
                    id="stylePreference"
                    placeholder="e.g., Minimalist, Colorful, Edgy"
                    value={preferences.stylePreference}
                    onChange={(e) => setPreferences({ ...preferences, stylePreference: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={generating || items.length === 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Outfits
                    </>
                  )}
                </Button>

                {items.length === 0 && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <AlertDescription className="text-orange-800 text-sm">
                      Add items to your wardrobe first to get AI suggestions!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Display */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {generating && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <Wand2 className="w-10 h-10 text-purple-400 animate-bounce" />
                  </div>
                  <Sparkles className="w-6 h-6 text-pink-400 absolute -top-2 -right-2 animate-ping" />
                </div>
                <p className="text-gray-600 font-medium">Creating perfect outfits for you...</p>
                <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
              </div>
            )}

            {!generating && suggestions.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                  <Wand2 className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to style you!
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                  Fill in your preferences and click "Generate Outfits" to get personalized outfit suggestions from our AI stylist
                </p>
              </div>
            )}

            {suggestions.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Your Personalized Outfits
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {suggestions.length} outfit{suggestions.length !== 1 ? 's' : ''} curated just for you
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleGenerateSuggestions}
                    disabled={generating}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </Button>
                </div>

                <div className="space-y-6">
                  {suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={index}
                      suggestion={suggestion}
                      onSave={handleSaveOutfit}
                      isSaving={saveOutfitMutation.isPending}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}