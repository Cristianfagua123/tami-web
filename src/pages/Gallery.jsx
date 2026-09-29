import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Globe, Search, User, Heart, TrendingUp, LogIn, Plus, Eye, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import OutfitMannequinViewer from "../components/outfit/OutfitMannequinViewer";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  const { data: publicOutfits, isLoading: outfitsLoading } = useQuery({
    queryKey: ['publicOutfits'],
    queryFn: async () => {
      const allOutfits = await base44.entities.Outfit.list('-created_date');
      return allOutfits.filter(outfit => outfit.is_public);
    },
    initialData: [],
  });

  const { data: items } = useQuery({
    queryKey: ['clothingItems'],
    queryFn: () => base44.entities.ClothingItem.list(),
    initialData: [],
  });

  const getOutfitItems = (outfit) => {
    return outfit.clothing_items?.map(itemId => 
      items.find(item => item.id === itemId)
    ).filter(Boolean) || [];
  };

  const filteredOutfits = publicOutfits.filter(outfit => {
    const matchesSearch = !searchQuery || 
      outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outfit.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterBy === "all") return true;
    if (filterBy === "popular") return outfit.favorite;
    if (filterBy === "recent") return true;
    
    return true;
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Public Gallery
                </h1>
                <p className="text-gray-600">
                  Discover outfit inspiration from the community
                </p>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="flex gap-2">
                <Button
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Gallery"))}
                  variant="outline"
                  className="border-orange-300 hover:bg-orange-50"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Gallery"))}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Welcome Banner for Non-Authenticated Users */}
          {!isAuthenticated && (
            <Card className="mb-6 p-6 bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 border-orange-200">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Welcome to StyleBoard! 👋
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Create your digital wardrobe, get AI-powered outfit suggestions, and share your style with the community. Sign up to get started!
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => base44.auth.redirectToLogin(createPageUrl("Wardrobe"))}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up Free
                    </Button>
                    <Button
                      onClick={() => base44.auth.redirectToLogin(createPageUrl("Gallery"))}
                      variant="outline"
                      className="border-orange-300"
                    >
                      Sign In
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center">
                    <Globe className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white/80 backdrop-blur border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{publicOutfits.length}</p>
                  <p className="text-xs text-gray-500">Public Outfits</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(publicOutfits.map(o => o.created_by)).size}
                  </p>
                  <p className="text-xs text-gray-500">Contributors</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {publicOutfits.filter(o => o.favorite).length}
                  </p>
                  <p className="text-xs text-gray-500">Favorites</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {publicOutfits.filter(o => {
                      const createdDate = new Date(o.created_date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdDate > weekAgo;
                    }).length}
                  </p>
                  <p className="text-xs text-gray-500">This Week</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-400 bg-white/80 backdrop-blur"
              />
            </div>
            <Tabs value={filterBy} onValueChange={setFilterBy}>
              <TabsList className="bg-white/80 backdrop-blur border border-orange-100">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Gallery Grid */}
        {outfitsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
              <Globe className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No outfits found" : "No public outfits yet"}
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              {searchQuery 
                ? "Try adjusting your search query"
                : "Be the first to share your outfit with the community!"
              }
            </p>
            {!isAuthenticated && (
              <Button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("CreateOutfit"))}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up & Create Your First Outfit
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutfits.map((outfit) => {
              const outfitItems = getOutfitItems(outfit);
              return (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group overflow-hidden border-orange-100 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300">
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-orange-50 to-pink-50 p-6">
                      {outfitItems.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 h-full">
                          {outfitItems.slice(0, 4).map((item, index) => (
                            <div
                              key={index}
                              className={`rounded-lg overflow-hidden shadow-sm ${
                                outfitItems.length === 1 ? 'col-span-2 row-span-2' :
                                outfitItems.length === 2 && index === 0 ? 'col-span-2' :
                                outfitItems.length === 3 && index === 0 ? 'col-span-2' : ''
                              }`}
                            >
                              {item && item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={item.name || 'Clothing item'}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400">No items</p>
                        </div>
                      )}

                      {/* 3D View Button */}
                      {outfitItems.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedOutfit({ outfit, items: outfitItems })}
                          className="absolute bottom-3 left-3 bg-purple-500 hover:bg-purple-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          3D View
                        </Button>
                      )}

                      {/* Public badge */}
                      <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-700">Public</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold flex-1">{outfit.name}</h3>
                        {outfit.favorite && (
                          <Heart className="w-4 h-4 text-red-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                      
                      {outfit.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {outfit.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-orange-400 to-pink-500 text-white">
                              {outfit.created_by?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">
                            {outfit.created_by?.split('@')[0] || 'Anonymous'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700">
                            {outfitItems.length} {outfitItems.length === 1 ? 'item' : 'items'}
                          </Badge>
                          {outfit.season && (
                            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 capitalize">
                              {outfit.season}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOutfit && (
        <OutfitMannequinViewer
          items={selectedOutfit.items}
          onClose={() => setSelectedOutfit(null)}
        />
      )}
    </div>
  );
}