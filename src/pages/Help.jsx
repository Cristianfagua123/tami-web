
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Shirt, 
  Plus, 
  Sparkles, 
  Wand2, 
  Globe,
  Eye,
  Camera,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Video,
  Mail,
  Play,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Help() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['videoTutorials'],
    queryFn: async () => {
      const allVideos = await base44.entities.VideoTutorial.list('order');
      return allVideos.filter(v => v.is_published || user?.role === 'admin');
    },
    initialData: [],
  });

  const features = [
    {
      icon: Shirt,
      title: "My Wardrobe",
      description: "Your personal digital closet",
      steps: [
        "Click 'Add New Item' to add clothing from any website",
        "Paste the product URL and our AI will extract all the details",
        "Or add items manually with your own photos",
        "Organize items by category, color, season, and occasion",
        "Search and filter your collection easily"
      ],
      tips: [
        "Take clear photos for best results",
        "Add detailed notes to remember where you bought items",
        "Use seasons and occasions to help AI suggest better outfits"
      ]
    },
    {
      icon: Wand2,
      title: "AI Style Assistant",
      description: "Get personalized outfit suggestions",
      steps: [
        "Select your occasion (casual, business, formal, etc.)",
        "Choose the season and weather conditions",
        "Add event details for more tailored suggestions",
        "Click 'Generate Outfits' to get AI recommendations",
        "Save your favorite combinations to your outfits"
      ],
      tips: [
        "The more items in your wardrobe, the better the suggestions",
        "Be specific about your event for best results",
        "Try different style preferences to explore new looks"
      ]
    },
    {
      icon: Sparkles,
      title: "Create Outfit",
      description: "Mix and match your items manually",
      steps: [
        "Browse your wardrobe items on the right panel",
        "Click items to add them to your outfit",
        "Switch between 2D and 3D view to preview",
        "Name your outfit and add a description",
        "Toggle 'Public' to share with the community"
      ],
      tips: [
        "Use 3D view to see how items layer together",
        "Create outfits for specific events to save time",
        "Make outfits public to inspire others"
      ]
    },
    {
      icon: Eye,
      title: "3D Virtual Try-On",
      description: "Visualize outfits on a mannequin",
      steps: [
        "Click '3D View' on any outfit card",
        "Drag to rotate the mannequin 360°",
        "See how clothing items layer realistically",
        "View from all angles to check the full look"
      ],
      tips: [
        "The mannequin shows proper clothing placement",
        "Great for checking color coordination",
        "Use this before buying similar items online"
      ]
    },
    {
      icon: Globe,
      title: "Public Gallery",
      description: "Browse community outfits",
      steps: [
        "Explore outfits shared by other users",
        "Filter by recent or popular",
        "Search for specific styles or occasions",
        "Click '3D View' to see outfits in detail",
        "Get inspired for your own combinations"
      ],
      tips: [
        "No account needed to browse the gallery",
        "Sign up to create and share your own outfits",
        "Check contributor profiles for style inspiration"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do I add items to my wardrobe?",
      answer: "Click 'Add New Item' from your wardrobe. You can paste a URL from any clothing website and our AI will extract the details automatically, or add items manually by uploading your own photos."
    },
    {
      question: "Can I upload my own photos of clothes?",
      answer: "Yes! When adding an item, you can choose to upload your own photo instead of using a URL. This is perfect for items you already own or thrifted pieces."
    },
    {
      question: "How does the AI Style Assistant work?",
      answer: "The AI analyzes your wardrobe items and creates outfit combinations based on color theory, style principles, and your preferences. It considers season, occasion, weather, and personal style to suggest the best matches."
    },
    {
      question: "Are my wardrobe items visible to others?",
      answer: "No, your wardrobe items are completely private. They're only visible to you unless you include them in a public outfit. When you make an outfit public, only those specific items become visible in the gallery."
    },
    {
      question: "What's the difference between public and private outfits?",
      answer: "Private outfits are only visible to you. Public outfits appear in the community gallery where anyone can view them for inspiration. You can change this setting anytime from the outfit menu."
    },
    {
      question: "How do I delete items or outfits?",
      answer: "For wardrobe items, hover over the item card and click the trash icon. For outfits, click the three-dot menu and select 'Delete Outfit'. Both require confirmation to prevent accidents."
    },
    {
      question: "Can I use StyleBoard without signing up?",
      answer: "Yes! You can browse the public gallery without an account. However, to create your wardrobe, get AI suggestions, and save outfits, you'll need to sign up (it's free!)."
    },
    {
      question: "What's the 3D view feature?",
      answer: "The 3D view displays your outfit on a virtual mannequin. You can rotate it 360° to see how items layer together. It helps visualize the complete look before wearing it in real life."
    }
  ];

  const quickStart = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up for free to get started with your digital wardrobe"
    },
    {
      step: 2,
      title: "Add Your First Items",
      description: "Upload 5-10 items from your wardrobe to get the best AI suggestions"
    },
    {
      step: 3,
      title: "Try AI Suggestions",
      description: "Use the AI Style Assistant to discover new outfit combinations"
    },
    {
      step: 4,
      title: "Create & Share",
      description: "Create your own outfits and share your favorites with the community"
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Help & Support
                </h1>
                <p className="text-gray-600">
                  Everything you need to know about StyleBoard
                </p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <Link to={createPageUrl("ManageVideos")}>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <Video className="w-4 h-4 mr-2" />
                  Manage Videos
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Video Tutorials Section */}
        {videos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-500" />
              Video Tutorials
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card 
                  key={video.id} 
                  className="border-blue-100 bg-white/80 backdrop-blur hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-100 to-cyan-100">
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Video className="w-12 h-12 text-blue-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-500 ml-1" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      {video.duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {video.duration}
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs capitalize">
                        {video.category?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start Guide */}
        <Card className="mb-8 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStart.map((item) => (
                <div key={item.step} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Guide */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Feature Guides
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-indigo-100 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-lg">{feature.title}</div>
                      <p className="text-sm text-gray-500 font-normal">{feature.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">How to use:</h4>
                    <ol className="space-y-2">
                      {feature.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-600">
                          <span className="text-indigo-500 font-semibold">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Pro Tips:</h4>
                    <ul className="space-y-1">
                      {feature.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-600">
                          <span className="text-indigo-400">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
            Frequently Asked Questions
          </h2>
          <Card className="border-indigo-100 bg-white/80 backdrop-blur">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:text-indigo-600">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Still need help?</h3>
                  <p className="text-gray-600 text-sm">Our support team is here to assist you</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-black">
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
              {selectedVideo.description && (
                <p className="text-gray-600">{selectedVideo.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                {selectedVideo.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {selectedVideo.duration}
                  </div>
                )}
                <Badge variant="secondary" className="capitalize">
                  {selectedVideo.category?.replace('_', ' ')}
                </Badge>
              </div>
              <Button
                onClick={() => setSelectedVideo(null)}
                variant="outline"
                className="mt-4 w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
