import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Check, Sparkles, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function SuggestionCard({ suggestion, onSave, isSaving }) {
  const [saved, setSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSave = async () => {
    await onSave(suggestion);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-purple-100 bg-white/80 backdrop-blur overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {suggestion.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{suggestion.description}</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || saved}
              size="sm"
              className={`${
                saved 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {suggestion.items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize bg-purple-50 text-purple-700">
                      {item.category}
                    </Badge>
                    {item.color && (
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.color.toLowerCase() }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Style Notes */}
          {suggestion.style_notes && (
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm font-medium text-purple-900 mb-1">Style Notes</p>
              <p className="text-sm text-purple-700">{suggestion.style_notes}</p>
            </div>
          )}

          {/* Why It Works - Collapsible */}
          {suggestion.why_it_works && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between border-purple-200 hover:bg-purple-50"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-500" />
                    Why this outfit works
                  </span>
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {suggestion.why_it_works}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Item Count Badge */}
          <div className="flex justify-center mt-4">
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
              {suggestion.items.length} items in this outfit
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}