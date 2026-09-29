import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Video, 
  Plus, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Upload,
  Loader2
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ManageVideos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    category: "getting_started",
    duration: "",
    order: 0,
    is_published: false,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videoTutorials'],
    queryFn: () => base44.entities.VideoTutorial.list('order'),
    initialData: [],
  });

  const createVideoMutation = useMutation({
    mutationFn: (data) => base44.entities.VideoTutorial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoTutorials'] });
      resetForm();
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VideoTutorial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoTutorials'] });
      resetForm();
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id) => base44.entities.VideoTutorial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoTutorials'] });
      setDeleteTarget(null);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      video_url: "",
      thumbnail_url: "",
      category: "getting_started",
      duration: "",
      order: 0,
      is_published: false,
    });
    setEditingVideo(null);
    setShowForm(false);
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || "",
      description: video.description || "",
      video_url: video.video_url || "",
      thumbnail_url: video.thumbnail_url || "",
      category: video.category || "getting_started",
      duration: video.duration || "",
      order: video.order || 0,
      is_published: video.is_published || false,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVideo) {
      updateVideoMutation.mutate({ id: editingVideo.id, data: formData });
    } else {
      createVideoMutation.mutate(formData);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, thumbnail_url: file_url });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    }
    setUploadingThumbnail(false);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert("Video file is too large. Maximum size is 100MB.");
      return;
    }

    setUploadingVideo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, video_url: file_url });
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video. Please try again.");
    }
    setUploadingVideo(false);
  };

  const togglePublish = (video) => {
    updateVideoMutation.mutate({
      id: video.id,
      data: { is_published: !video.is_published }
    });
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => navigate(createPageUrl("Help"))}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Help"))}
          className="mb-6 hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Manage Video Tutorials
            </h1>
            <p className="text-gray-600">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'} • {videos.filter(v => v.is_published).length} published
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>

        {/* Videos List */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="aspect-video bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card className="p-12 text-center">
            <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos yet</h3>
            <p className="text-gray-600 mb-6">Add your first video tutorial to help users</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="border-blue-100 bg-white/80 backdrop-blur">
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
                  {!video.is_published && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Draft
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.description}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {video.category?.replace('_', ' ')}
                    </Badge>
                    {video.duration && (
                      <Badge variant="outline" className="text-xs">
                        {video.duration}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(video)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublish(video)}
                      className="flex-1"
                    >
                      {video.is_published ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(video)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? 'Edit Video Tutorial' : 'Add Video Tutorial'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Getting Started with StyleBoard"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what the tutorial covers..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_file">Video File *</Label>
              {formData.video_url ? (
                <div className="relative border-2 border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Video uploaded successfully</p>
                        <p className="text-xs text-green-700">Ready to publish</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, video_url: "" })}
                    >
                      Change Video
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    id="video_file"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={uploadingVideo}
                  />
                  <label htmlFor="video_file" className="cursor-pointer">
                    {uploadingVideo ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 mx-auto text-blue-500 mb-2 animate-spin" />
                        <p className="text-gray-600 font-medium">Uploading video...</p>
                        <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">Click to upload video</p>
                        <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI (max 100MB)</p>
                      </>
                    )}
                  </label>
                </div>
              )}
              {!formData.video_url && !editingVideo && (
                <p className="text-xs text-orange-600">
                  * Required field - Please upload a video file
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              {formData.thumbnail_url ? (
                <div className="relative">
                  <img 
                    src={formData.thumbnail_url} 
                    alt="Thumbnail" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setFormData({ ...formData, thumbnail_url: "" })}
                    className="absolute top-2 right-2"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                  <label htmlFor="thumbnail" className="cursor-pointer">
                    {uploadingThumbnail ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 mx-auto text-blue-500 mb-2 animate-spin" />
                        <p className="text-gray-600">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">Click to upload thumbnail</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (recommended 16:9 ratio)</p>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="getting_started">Getting Started</SelectItem>
                    <SelectItem value="wardrobe">Wardrobe</SelectItem>
                    <SelectItem value="outfits">Outfits</SelectItem>
                    <SelectItem value="ai_assistant">AI Assistant</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 5:30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                placeholder="0"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <Label htmlFor="is_published" className="font-semibold">
                  {formData.is_published ? "Published" : "Draft"}
                </Label>
                <p className="text-xs text-gray-600">
                  {formData.is_published 
                    ? "Video is visible to all users" 
                    : "Video is only visible to admins"}
                </p>
              </div>
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createVideoMutation.isPending || 
                  updateVideoMutation.isPending || 
                  uploadingVideo ||
                  (!editingVideo && !formData.video_url)
                }
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                {editingVideo ? 'Update Video' : 'Add Video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVideoMutation.mutate(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}