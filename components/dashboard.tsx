"use client"

import { useState } from "react"
import { FileText, ImageIcon, Video, Music, Users, FileIcon, Home, PlusCircle, Menu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContentForm } from "@/components/content-form"

export default function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)

  const contentTypes = [
    { id: "news", label: "News", icon: FileText, color: "bg-blue-50 text-blue-600" },
    { id: "images", label: "Images", icon: ImageIcon, color: "bg-green-50 text-green-600" },
    { id: "videos", label: "Videos", icon: Video, color: "bg-purple-50 text-purple-600" },
    { id: "audios", label: "Audio", icon: Music, color: "bg-yellow-50 text-yellow-600" },
    { id: "volunteer", label: "Volunteer Work", icon: Users, color: "bg-pink-50 text-pink-600" },
    { id: "pdfs", label: "PDF Files", icon: FileIcon, color: "bg-red-50 text-red-600" },
  ]

  return (
    <div className="flex h-screen bg-muted/10">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-border transition-all duration-300 ease-in-out flex flex-col h-screen`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {!isSidebarCollapsed && <span className="font-semibold text-xl">Content Admin</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="ml-auto"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                onClick={() => setSelectedContentType(null)}
              >
                <Home className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-2">Dashboard</span>}
              </Button>
            </li>
            {contentTypes.map((item) => (
              <li key={item.id}>
                <Button
                  variant={selectedContentType === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                  onClick={() => setSelectedContentType(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                  {!isSidebarCollapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {selectedContentType
              ? `Add ${contentTypes.find((t) => t.id === selectedContentType)?.label}`
              : "Content Dashboard"}
          </h1>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {selectedContentType ? (
            <ContentForm contentType={selectedContentType} />
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Quick Add Content</h2>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  {contentTypes.map((type) => (
                    <Card
                      key={type.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedContentType(type.id)}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className={`p-3 rounded-full ${type.color} mb-3`}>
                          <type.icon className="h-6 w-6" />
                        </div>
                        <p className="font-medium">{type.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recent Content</CardTitle>
                    <CardDescription>Recently added content items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Latest News Update</span>
                        <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                        <ImageIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Community Event Photos</span>
                        <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                        <Video className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Promotional Video</span>
                        <span className="text-xs text-muted-foreground ml-auto">Yesterday</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Content Stats</CardTitle>
                    <CardDescription>Overview of your content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {contentTypes.map((type) => (
                        <div key={type.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span className="text-sm">{type.label}</span>
                          </div>
                          <span className="text-sm font-medium">{Math.floor(Math.random() * 20)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Quick Tips</CardTitle>
                    <CardDescription>Help for content management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <PlusCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Use high-quality images (recommended: 1200×800px)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PlusCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Keep video files under 100MB for faster uploads</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PlusCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Add descriptive titles to help with search</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
