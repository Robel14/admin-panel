"use client"

import type React from "react"

import { useState, useTransition, useEffect } from "react"
import { FileText, ImageIcon, Video, Music, Users, FileIcon, Upload, X, Check, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createContent } from "@/app/actions/content"
import { getCategories } from "@/app/actions/content"
import { WebsitePreview } from "@/components/website-preview"
import { triggerWebsiteDeployment } from "@/lib/website-service"
import { siteConfig } from "@/config/site-config"

type ContentFormProps = {
  contentType: string
  onSuccess?: () => void
}

export function ContentForm({ contentType, onSuccess }: ContentFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deployOnSave, setDeployOnSave] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [createdContentId, setCreatedContentId] = useState<number | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategories()
      if (result.success) {
        setCategories(result.data || [])
      }
    }

    if (contentType === "images" || contentType === "pdfs") {
      fetchCategories()
    }
  }, [contentType])

  const getContentTypeDetails = () => {
    switch (contentType) {
      case "news":
        return {
          title: "Add News Article",
          icon: FileText,
          color: "text-blue-600",
          acceptedFiles: ".jpg,.jpeg,.png",
          description: "Create a news article with title, content, and optional featured image.",
          fields: ["title", "content", "image", "date", "slug", "seo"],
          dbTable: "news",
        }
      case "images":
        return {
          title: "Upload Images",
          icon: ImageIcon,
          color: "text-green-600",
          acceptedFiles: ".jpg,.jpeg,.png,.gif",
          description: "Upload image files with captions and categories.",
          fields: ["title", "description", "images", "category", "alt"],
          dbTable: "images",
        }
      case "videos":
        return {
          title: "Upload Videos",
          icon: Video,
          color: "text-purple-600",
          acceptedFiles: ".mp4,.webm,.mov",
          description: "Upload video files with titles and descriptions.",
          fields: ["title", "description", "video", "thumbnail"],
          dbTable: "videos",
        }
      case "audios":
        return {
          title: "Upload Audio",
          icon: Music,
          color: "text-yellow-600",
          acceptedFiles: ".mp3,.wav,.ogg",
          description: "Upload audio files with titles and descriptions.",
          fields: ["title", "description", "audio"],
          dbTable: "audios",
        }
      case "volunteer_work":
        return {
          title: "Add Volunteer Work",
          icon: Users,
          color: "text-pink-600",
          acceptedFiles: ".jpg,.jpeg,.png",
          description: "Create volunteer opportunities with details and images.",
          fields: ["title", "description", "location", "date", "image", "slug"],
          dbTable: "volunteer_work",
        }
      case "pdfs":
        return {
          title: "Upload PDF Files",
          icon: FileIcon,
          color: "text-red-600",
          acceptedFiles: ".pdf",
          description: "Upload PDF documents with titles and categories.",
          fields: ["title", "description", "pdf", "category"],
          dbTable: "pdfs",
        }
      default:
        return {
          title: "Add Content",
          icon: FileText,
          color: "text-gray-600",
          acceptedFiles: "*",
          description: "Upload content to your website.",
          fields: ["title", "content"],
          dbTable: contentType,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Reset states
    setSuccess(false)
    setError(null)
    setCreatedContentId(null)

    // Get form data
    const formData = new FormData(e.currentTarget)
    const formValues: Record<string, any> = {}

    // Convert FormData to object
    formData.forEach((value, key) => {
      formValues[key] = value
    })

    // Add status
    formValues.status = "published"

    // Add file URL (in a real app, you would upload the file to a storage service)
    if (files.length > 0) {
      // This is a placeholder. In a real app, you would upload the file and get a URL
      formValues.file_url = `https://example.com/uploads/${files[0].name}`
    }

    // Add created_at if not present
    if (!formValues.created_at) {
      formValues.created_at = new Date().toISOString()
    }

    // Add alt_text for images if not provided
    if (contentType === "images" && !formValues.alt_text && formValues.title) {
      formValues.alt_text = formValues.title
    }

    startTransition(async () => {
      try {
        // Convert contentType to database table name
        const dbType = details.dbTable as any

        // Call the server action to create content
        const result = await createContent(dbType, formValues)

        if (result.success) {
          setSuccess(true)

          // Store the created content ID for preview
          if (result.data && result.data.id) {
            setCreatedContentId(result.data.id)
          }

          // Trigger website deployment if enabled
          if (deployOnSave) {
            setIsDeploying(true)
            const deployResult = await triggerWebsiteDeployment()
            setIsDeploying(false)

            if (!deployResult.success) {
              setError(`Content saved but deployment failed: ${deployResult.error}`)
            }
          }

          // Reset form after success
          setTimeout(() => {
            setSuccess(false)

            // Don't reset the content ID to keep the preview available
            // setCreatedContentId(null)

            setFiles([])
            setPreview(null)
            e.currentTarget.reset()

            // Call onSuccess callback if provided
            if (onSuccess) {
              onSuccess()
            }
          }, 2000)
        } else {
          setError(result.error || "An error occurred while saving content")
        }
      } catch (err) {
        console.error("Error submitting form:", err)
        setError("An unexpected error occurred")
      }
    })
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    if (files.length === 1) {
      setPreview(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <div className={`p-2 rounded-full bg-muted ${details.color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{details.title}</h2>
      </div>

      <Tabs defaultValue="edit">
        <TabsList className="mb-6">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Card>
            <CardContent className="pt-6">
              {success && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Content successfully added! {deployOnSave && "Deployment has been triggered."}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
                  <X className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <p className="text-muted-foreground mb-6">{details.description}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {details.fields.includes("title") && (
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="Enter title" required />
                  </div>
                )}

                {details.fields.includes("slug") && (
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <div className="flex items-center">
                      <span className="bg-muted px-3 py-2 text-sm border border-r-0 rounded-l-md text-muted-foreground">
                        {siteConfig.url}
                      </span>
                      <Input id="slug" name="slug" placeholder="page-url-slug" className="rounded-l-none" required />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The URL slug is used to create the page URL. Use lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>
                )}

                {details.fields.includes("content") && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Enter content"
                      className="min-h-[200px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use Markdown syntax for formatting. Images can be added using the upload button below.
                    </p>
                  </div>
                )}

                {details.fields.includes("description") && (
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter description"
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {details.fields.includes("date") && (
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="event_date" type="date" required />
                  </div>
                )}

                {details.fields.includes("location") && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" placeholder="Enter location" />
                  </div>
                )}

                {details.fields.includes("category") && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {categories.length > 0 ? (
                      <Select name="category">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select name="category">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="news">News</SelectItem>
                          <SelectItem value="events">Events</SelectItem>
                          <SelectItem value="resources">Resources</SelectItem>
                          <SelectItem value="announcements">Announcements</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {details.fields.includes("alt") && (
                  <div className="space-y-2">
                    <Label htmlFor="alt">Alt Text</Label>
                    <Input id="alt" name="alt_text" placeholder="Describe the image for accessibility" />
                    <p className="text-xs text-muted-foreground">
                      Alt text helps visually impaired users understand the content of images.
                    </p>
                  </div>
                )}

                {details.fields.includes("seo") && (
                  <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                    <h3 className="font-medium">SEO Settings</h3>
                    <div className="space-y-2">
                      <Label htmlFor="meta-title">Meta Title</Label>
                      <Input id="meta-title" name="meta_title" placeholder="SEO title (appears in search results)" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta-description">Meta Description</Label>
                      <Textarea
                        id="meta-description"
                        name="meta_description"
                        placeholder="Brief description for search engines"
                        className="min-h-[80px]"
                      />
                    </div>
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
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
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

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch id="deploy" checked={deployOnSave} onCheckedChange={setDeployOnSave} />
                    <Label htmlFor="deploy" className="cursor-pointer">
                      Deploy changes immediately
                    </Label>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline">
                      Save as Draft
                    </Button>
                    <Button type="submit" disabled={isPending || isDeploying}>
                      {isPending ? "Saving..." : isDeploying ? "Deploying..." : "Publish Content"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium">Content Preview</h3>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Open Preview
                </Button>
              </div>
              <div className="border rounded-md p-4 min-h-[400px] flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">
                  Preview will be available after you add content in the Edit tab.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Content Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Publish Status</p>
                    <p className="text-sm text-muted-foreground">Control whether this content is publicly visible</p>
                  </div>
                  <Select defaultValue="draft">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Comments</p>
                    <p className="text-sm text-muted-foreground">Allow visitors to comment on this content</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Feature Content</p>
                    <p className="text-sm text-muted-foreground">Display this content in featured sections</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Social Sharing</p>
                    <p className="text-sm text-muted-foreground">Enable social media sharing buttons</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website">
          <WebsitePreview contentType={contentType as any} contentId={createdContentId || undefined} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
