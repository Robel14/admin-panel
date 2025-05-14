"use client"

import type React from "react"

import { useState } from "react"
import { FileText, ImageIcon, Video, Music, Users, FileIcon, Upload, X, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ContentFormProps = {
  contentType: string
}

export function ContentForm({ contentType }: ContentFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const getContentTypeDetails = () => {
    switch (contentType) {
      case "news":
        return {
          title: "Add News Article",
          icon: FileText,
          color: "text-blue-600",
          acceptedFiles: ".jpg,.jpeg,.png",
          description: "Create a news article with title, content, and optional featured image.",
          fields: ["title", "content", "image", "date"],
        }
      case "images":
        return {
          title: "Upload Images",
          icon: ImageIcon,
          color: "text-green-600",
          acceptedFiles: ".jpg,.jpeg,.png,.gif",
          description: "Upload image files with captions and categories.",
          fields: ["title", "description", "images", "category"],
        }
      case "videos":
        return {
          title: "Upload Videos",
          icon: Video,
          color: "text-purple-600",
          acceptedFiles: ".mp4,.webm,.mov",
          description: "Upload video files with titles and descriptions.",
          fields: ["title", "description", "video", "thumbnail"],
        }
      case "audios":
        return {
          title: "Upload Audio",
          icon: Music,
          color: "text-yellow-600",
          acceptedFiles: ".mp3,.wav,.ogg",
          description: "Upload audio files with titles and descriptions.",
          fields: ["title", "description", "audio"],
        }
      case "volunteer":
        return {
          title: "Add Volunteer Work",
          icon: Users,
          color: "text-pink-600",
          acceptedFiles: ".jpg,.jpeg,.png",
          description: "Create volunteer opportunities with details and images.",
          fields: ["title", "description", "location", "date", "image"],
        }
      case "pdfs":
        return {
          title: "Upload PDF Files",
          icon: FileIcon,
          color: "text-red-600",
          acceptedFiles: ".pdf",
          description: "Upload PDF documents with titles and categories.",
          fields: ["title", "description", "pdf", "category"],
        }
      default:
        return {
          title: "Add Content",
          icon: FileText,
          color: "text-gray-600",
          acceptedFiles: "*",
          description: "Upload content to your website.",
          fields: ["title", "content"],
        }
    }
  }

  const details = getContentTypeDetails()
  const Icon = details.icon

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles(selectedFiles)

      // Create preview for image files
      if (selectedFiles[0].type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFiles[0])
      } else if (selectedFiles[0].type.startsWith("video/")) {
        // For video, we could create a thumbnail but for simplicity just show the name
        setPreview(null)
      } else {
        setPreview(null)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setSuccess(false)
        setFiles([])
        setPreview(null)
        const form = e.target as HTMLFormElement
        form.reset()
      }, 3000)
    }, 1500)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    if (files.length === 1) {
      setPreview(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-2 rounded-full bg-muted ${details.color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{details.title}</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertDescription>Content successfully added! It will be published shortly.</AlertDescription>
            </Alert>
          )}

          <p className="text-muted-foreground mb-6">{details.description}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {details.fields.includes("title") && (
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter title" required />
              </div>
            )}

            {details.fields.includes("content") && (
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" placeholder="Enter content" className="min-h-[150px]" required />
              </div>
            )}

            {details.fields.includes("description") && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter description" className="min-h-[100px]" />
              </div>
            )}

            {details.fields.includes("date") && (
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required />
              </div>
            )}

            {details.fields.includes("location") && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Enter location" />
              </div>
            )}

            {details.fields.includes("category") && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Enter category" />
              </div>
            )}

            {(details.fields.includes("image") ||
              details.fields.includes("images") ||
              details.fields.includes("video") ||
              details.fields.includes("audio") ||
              details.fields.includes("pdf") ||
              details.fields.includes("thumbnail")) && (
              <div className="space-y-2">
                <Label>
                  {contentType === "images"
                    ? "Upload Images"
                    : contentType === "videos"
                      ? "Upload Video"
                      : contentType === "audios"
                        ? "Upload Audio"
                        : contentType === "pdfs"
                          ? "Upload PDF"
                          : "Upload File"}
                </Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept={details.acceptedFiles}
                    multiple={contentType === "images"}
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drag and drop or click to upload</p>
                      <p className="text-xs text-muted-foreground">Accepted formats: {details.acceptedFiles}</p>
                    </div>
                  </Label>
                </div>

                {/* File preview */}
                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected files:</p>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                          <div className="flex items-center gap-2">
                            {file.type.startsWith("image/") && preview ? (
                              <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                                <img
                                  src={preview || "/placeholder.svg"}
                                  alt="Preview"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                {file.type.startsWith("video/") ? (
                                  <Video className="h-5 w-5 text-muted-foreground" />
                                ) : file.type.startsWith("audio/") ? (
                                  <Music className="h-5 w-5 text-muted-foreground" />
                                ) : file.type === "application/pdf" ? (
                                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Content"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
