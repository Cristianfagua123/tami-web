import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, Link as LinkIcon, ArrowLeft, Sparkles, Loader2, Camera } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddItem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addMethod, setAddMethod] = useState("url");
  const [itemUrl, setItemUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [extractedWithoutImage, setExtractedWithoutImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    image_url: "",
    source_url: "",
    brand: "",
    color: "",
    season: [],
    occasion: [],
    notes: "",
  });

  const createItemMutation = useMutation({
    mutationFn: (data) => base44.entities.ClothingItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clothingItems'] });
      navigate(createPageUrl("Wardrobe"));
    },
  });

  const handleExtractFromUrl = async () => {
    if (!itemUrl) return;
    
    setExtracting(true);
    setExtractedWithoutImage(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract clothing item information from this product page: ${itemUrl}
        
        Please provide:
        - name: the product name
        - category: one of: tops, bottoms, dresses, outerwear, shoes, accessories
        - image_url: the main product image URL (full URL, must be a direct image link)
        - brand: the brand name
        - color: the primary color
        - description: a brief description
        
        Return only the information you can find, leave fields empty if not available.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            image_url: { type: "string" },
            brand: { type: "string" },
            color: { type: "string" },
            description: { type: "string" }
          }
        }
      });

      const hasValidImage = result.image_url && result.image_url.startsWith('http');
      if (!hasValidImage) {
        setExtractedWithoutImage(true);
        setUploadMethod("upload");
      }

      setFormData({
        name: result.name || "",
        category: result.category || "",
        image_url: hasValidImage ? result.image_url : "",
        source_url: itemUrl,
        brand: result.brand || "",
        color: result.color || "",
        season: [],
        occasion: [],
        notes: result.description || "",
      });
      
      setAddMethod("manual");
    } catch (error) {
      console.error("Error extracting item:", error);
    }
    setExtracting(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      setExtractedWithoutImage(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setUploading(false);
  };

  const handleSeasonToggle = (season) => {
    setFormData(prev => ({
      ...prev,
      season: prev.season.includes(season)
        ? prev.season.filter(s => s !== season)
        : [...prev.season, season]
    }));
  };

  const handleOccasionToggle = (occasion) => {
    setFormData(prev => ({
      ...prev,
      occasion: prev.occasion.includes(occasion)
        ? prev.occasion.filter(o => o !== occasion)
        : [...prev.occasion, occasion]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createItemMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Wardrobe"))}
          className="mb-6 hover:bg-orange-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wardrobe
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Add New Item
          </h1>
          <p className="text-gray-600">Add clothing from any website to your digital wardrobe</p>
        </div>

        {/* Add Method Selection */}
        {addMethod === "url" && (
          <Card className="border-orange-100 bg-white/80 backdrop-blur mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Add Item from Website</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item_url">Product URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="item_url"
                    placeholder="https://example.com/product"
                    value={itemUrl}
                    onChange={(e) => setItemUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleExtractFromUrl}
                    disabled={!itemUrl || extracting}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Extract Info
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Paste a link from any clothing website and we'll automatically extract the details
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setAddMethod("manual")}
                className="w-full"
              >
                Add Manually
              </Button>
            </CardContent>
          </Card>
        )}

        {addMethod === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alert if image wasn't extracted */}
            {extractedWithoutImage && (
              <Alert className="bg-orange-50 border-orange-200">
                <Camera className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  We couldn't extract an image from the URL. Please upload your own photo of the item below.
                </AlertDescription>
              </Alert>
            )}

            {/* Image Upload */}
            <Card className="border-orange-100 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">
                  Item Image
                  {formData.source_url && !formData.image_url && (
                    <span className="text-sm font-normal text-orange-600 ml-2">* Required</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={uploadMethod} onValueChange={setUploadMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-orange-50">
                    <TabsTrigger value="url" className="data-[state=active]:bg-white">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Image URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="data-[state=active]:bg-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {uploadMethod === "url" ? (
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setExtractedWithoutImage(false);
                      }}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Paste the direct link to the product image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="file_upload">Upload Your Photo</Label>
                    <div className="border-2 border-dashed border-orange-200 rounded-xl p-8 text-center hover:border-orange-400 transition-colors cursor-pointer">
                      <input
                        id="file_upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="file_upload" className="cursor-pointer">
                        {uploading ? (
                          <>
                            <Loader2 className="w-12 h-12 mx-auto mb-4 text-orange-400 animate-spin" />
                            <p className="text-gray-600">Uploading your photo...</p>
                          </>
                        ) : formData.image_url ? (
                          <>
                            <Camera className="w-12 h-12 mx-auto mb-4 text-green-400" />
                            <p className="text-gray-600">Photo uploaded! Click to change</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                            <p className="text-gray-600">Click to upload a photo of the item</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Take a photo or choose from your device
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {formData.image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Preview:</p>
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          setExtractedWithoutImage(true);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, image_url: "" });
                        setUploadMethod("upload");
                      }}
                      className="mt-2 w-full"
                    >
                      Change Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card className="border-orange-100 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Black Leather Jacket"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="dresses">Dresses</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      placeholder="e.g., Black, Navy Blue"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Zara, H&M"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source_url">Source URL</Label>
                    <Input
                      id="source_url"
                      placeholder="https://shop.com/product"
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card className="border-orange-100 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Seasons</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["spring", "summer", "fall", "winter"].map(season => (
                      <div key={season} className="flex items-center space-x-2">
                        <Checkbox
                          id={season}
                          checked={formData.season.includes(season)}
                          onCheckedChange={() => handleSeasonToggle(season)}
                        />
                        <label
                          htmlFor={season}
                          className="text-sm font-medium capitalize cursor-pointer"
                        >
                          {season}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Occasions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {["casual", "business", "formal", "athletic", "party"].map(occasion => (
                      <div key={occasion} className="flex items-center space-x-2">
                        <Checkbox
                          id={occasion}
                          checked={formData.occasion.includes(occasion)}
                          onCheckedChange={() => handleOccasionToggle(occasion)}
                        />
                        <label
                          htmlFor={occasion}
                          className="text-sm font-medium capitalize cursor-pointer"
                        >
                          {occasion}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this item..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (formData.name || formData.category) {
                    navigate(createPageUrl("Wardrobe"));
                  } else {
                    setAddMethod("url");
                  }
                }}
                className="flex-1"
              >
                {formData.name || formData.category ? "Cancel" : "Back"}
              </Button>
              <Button
                type="submit"
                disabled={createItemMutation.isPending || !formData.name || !formData.category || !formData.image_url}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {createItemMutation.isPending ? "Adding..." : "Add to Wardrobe"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}