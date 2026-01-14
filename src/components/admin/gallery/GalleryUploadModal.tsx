/**
 * Gallery Upload Modal
 * 
 * Modal component for uploading media files to the gallery.
 * Supports drag-and-drop, file preview, and progress tracking.
 * 
 * @package Lovable/src/components/admin/gallery
 */

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Video, File, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import attachmentService, { CreateAttachmentPayload } from "@/services/attachment.service";

interface GalleryUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GalleryUploadModal({
  open,
  onOpenChange,
}: GalleryUploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (payload: CreateAttachmentPayload) => {
      // Create a temporary ID for the gallery item
      const tempId = `gallery-${Date.now()}`;
      
      return attachmentService.create({
        ...payload,
        related_id: tempId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", "gallery"] });
      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleClose = () => {
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setUploadProgress(0);
    onOpenChange(false);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    
    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the media",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress(0);

    // Simulate progress (since we can't track actual upload progress with current API)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        related_type: "gallery",
        related_id: `gallery-${Date.now()}`,
      });
      setUploadProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    
    if (selectedFile.type.startsWith('image/')) {
      return <ImageIcon className="h-12 w-12 text-primary" />;
    } else if (selectedFile.type.startsWith('video/')) {
      return <Video className="h-12 w-12 text-primary" />;
    }
    return <File className="h-12 w-12 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload photos or videos to the gallery. Supported formats: JPG, PNG, GIF, WebP, MP4, WebM
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/25 hover:border-primary/50"}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                Images or Videos (max 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getFileIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter media title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={uploadMutation.isPending}
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter media description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={uploadMutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || !title.trim()}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

