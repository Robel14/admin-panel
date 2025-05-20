"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, RefreshCw } from "lucide-react"
import { siteConfig } from "@/config/site-config"
import { fetchWebsiteContent } from "@/lib/website-service"
import type { ContentType } from "@/app/actions/content"

interface WebsitePreviewProps {
  contentType: ContentType
  contentId?: number
}

export function WebsitePreview({ contentType, contentId }: WebsitePreviewProps) {
  const [previewData, setPreviewData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contentTypeConfig = siteConfig.contentTypes.find((type) => type.id === contentType)
  const previewUrl = contentId
    ? `${siteConfig.url}${contentTypeConfig?.path}/${contentId}`
    : `${siteConfig.url}${contentTypeConfig?.path}`

  const loadPreviewData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchWebsiteContent(contentType, contentId, 1)

      if (result.success) {
        setPreviewData(result.data)
      } else {
        setError(result.error || "Failed to load preview data")
      }
    } catch (err) {
      console.error("Error loading preview:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contentId) {
      loadPreviewData()
    }
  }, [contentId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Website Preview</span>
          <Button variant="outline" size="sm" onClick={loadPreviewData} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>Preview how this content will appear on your HEAL website</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
        ) : isLoading ? (
          <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : previewData ? (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-[#1e8e3e] p-4 text-white">
              <div className="flex items-center gap-2">
                <img src="/placeholder.svg?height=30&width=30" alt="HEAL Logo" className="h-8 w-8" />
                <span className="font-bold">{siteConfig.name}</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold mb-2">{previewData.title}</h3>
              {previewData.content && (
                <p className="text-sm text-gray-600 mb-4">{previewData.content.substring(0, 200)}...</p>
              )}
              {previewData.description && (
                <p className="text-sm text-gray-600 mb-4">{previewData.description.substring(0, 200)}...</p>
              )}
              {previewData.file_url && (
                <div className="bg-gray-100 p-2 rounded-md text-sm flex items-center gap-2">
                  <span className="truncate">{previewData.file_url}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">
              {contentId ? "No preview available" : "Save content to see preview"}
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.open(previewUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Open on Website
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
