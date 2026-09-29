import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Globe, Lock, Eye, Trash2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import OutfitMannequinViewer from "./OutfitMannequinViewer";

export default function OutfitCard({ outfit, items }) {
  const queryClient = useQueryClient();
  const [showMannequin, setShowMannequin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateOutfitMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Outfit.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
    },
  });

  const deleteOutfitMutation = useMutation({
    mutationFn: (id) => base44.entities.Outfit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] });
    },
  });

  const togglePublic = () => {
    updateOutfitMutation.mutate({
      id: outfit.id,
      data: { is_public: !outfit.is_public }
    });
  };

  const handleDelete = () => {
    deleteOutfitMutation.mutate(outfit.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group overflow-hidden border-orange-100 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300">
          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-orange-50 to-pink-50 p-6">
            {items.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 h-full">
                {items.slice(0, 4).map((item, index) => (
                  <div
                    key={item?.id || index}
                    className={`rounded-lg overflow-hidden ${
                      items.length === 1 ? 'col-span-2 row-span-2' :
                      items.length === 2 && index === 0 ? 'col-span-2' :
                      items.length === 3 && index === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    {item && (
                      <img
                        src={item.image_url}
                        alt={item.name}
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
            {items.length > 0 && (
              <Button
                size="sm"
                onClick={() => setShowMannequin(true)}
                className="absolute bottom-3 left-3 bg-purple-500 hover:bg-purple-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                3D View
              </Button>
            )}

            <div className="absolute top-3 right-3 flex gap-2">
              {outfit.favorite && (
                <div className="p-2 bg-white/90 backdrop-blur rounded-full">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
              )}
              
              {outfit.is_public && (
                <div className="p-2 bg-white/90 backdrop-blur rounded-full">
                  <Globe className="w-4 h-4 text-green-500" />
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/90 backdrop-blur rounded-full w-8 h-8 p-0 hover:bg-white"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={togglePublic}>
                    {outfit.is_public ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Make Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Make Public
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Outfit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold mb-2">{outfit.name}</h3>
            {outfit.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {outfit.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
              {outfit.is_public && (
                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
              {outfit.season && (
                <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 capitalize">
                  {outfit.season}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {showMannequin && (
        <OutfitMannequinViewer
          items={items}
          onClose={() => setShowMannequin(false)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Outfit?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{outfit.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteOutfitMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}