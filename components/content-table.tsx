"use client"

import { useState, useEffect } from "react"
import { getContentByType, deleteContent, type ContentType } from "@/app/actions/content"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContentTableProps {
  contentType: string
}

export function ContentTable({ contentType }: ContentTableProps) {
  const [content, setContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getContentByType(contentType as ContentType, 100)
        if (result.success) {
          setContent(result.data || [])
        } else {
          setError(result.error || "Failed to fetch content")
        }
      } catch (err) {
        console.error(`Error fetching ${contentType}:`, err)
        setError(`An error occurred while fetching ${contentType}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [contentType])

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteContent(contentType as ContentType, id)
      if (result.success) {
        // Remove the deleted item from the content array
        setContent((prevContent) => prevContent.filter((item) => item.id !== id))
        setDeleteConfirmation(null)
      } else {
        setError(result.error || "Failed to delete content")
      }
    } catch (err) {
      console.error(`Error deleting ${contentType}:`, err)
      setError(`An error occurred while deleting ${contentType}`)
    }
  }

  const filteredContent = content.filter((item) => {
    if (!searchTerm) return true
    return (
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Published
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Draft
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Scheduled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getContentTypeLabel = () => {
    switch (contentType) {
      case "news":
        return "News Articles"
      case "images":
        return "Images"
      case "videos":
        return "Videos"
      case "audios":
        return "Audio Files"
      case "volunteer_work":
        return "Volunteer Work"
      case "pdfs":
        return "PDF Files"
      default:
        return "Content"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{getContentTypeLabel()}</CardTitle>
          <CardDescription>Manage your {contentType} content</CardDescription>
        </div>
        <Button>Add New</Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <Input
            placeholder={`Search ${contentType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted/30 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredContent.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {deleteConfirmation === item.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">Confirm delete?</span>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} className="h-8">
                          Yes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirmation(null)} className="h-8">
                          No
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteConfirmation(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No {contentType} found. Click the "Add New" button to create one.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
