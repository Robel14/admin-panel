"use client"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import {
  FileText,
  ImageIcon,
  Video,
  Music,
  Users,
  FileIcon,
  Home,
  Menu,
  Globe,
  BarChart2,
  Settings,
  GitBranch,
  RefreshCw,
  Search,
  UserCog,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContentForm } from "@/components/content-form"
import { DeploymentStatus } from "@/components/deployment-status"
import { Badge } from "@/components/ui/badge"
import { VercelProjectSelector } from "@/components/vercel-project-selector"
import { getRecentContent, getContentStats, getDeployments, createDeployment } from "@/app/actions/content"
import { formatTimeAgo, generateDeploymentId, generateCommitHash } from "@/lib/utils"
import { ContentTable } from "@/components/content-table"
import { WebsiteStats } from "@/components/website-stats"
import { UserTable } from "@/components/user-table"
import { WebsiteConnectionStatus } from "@/components/website-connection-status"
import { siteConfig } from "@/config/site-config"

export default function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("content")
  const [isDeploying, setIsDeploying] = useState(false)
  const [recentContent, setRecentContent] = useState<any[]>([])
  const [contentStats, setContentStats] = useState<Record<string, number>>({})
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showContentTable, setShowContentTable] = useState(false)

  const contentTypes = [
    { id: "news", label: "News", icon: FileText, color: "bg-blue-50 text-blue-600" },
    { id: "images", label: "Images", icon: ImageIcon, color: "bg-green-50 text-green-600" },
    { id: "videos", label: "Videos", icon: Video, color: "bg-purple-50 text-purple-600" },
    { id: "audios", label: "Audio", icon: Music, color: "bg-yellow-50 text-yellow-600" },
    { id: "volunteer_work", label: "Volunteer Work", icon: Users, color: "bg-pink-50 text-pink-600" },
    { id: "pdfs", label: "PDF Files", icon: FileIcon, color: "bg-red-50 text-red-600" },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch recent content
        const contentResult = await getRecentContent()
        if (contentResult.success) {
          setRecentContent(contentResult.data || [])
        }

        // Fetch content stats
        const statsResult = await getContentStats()
        if (statsResult.success) {
          setContentStats(statsResult.data || {})
        }

        // Fetch deployments
        const deploymentsResult = await getDeployments()
        if (deploymentsResult.success) {
          setDeployments(deploymentsResult.data || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (activeTab === "content" && !selectedContentType && !showContentTable) {
      fetchDashboardData()
    }
  }, [activeTab, selectedContentType, showContentTable])

  const handleDeploy = async () => {
    setIsDeploying(true)

    try {
      // Create a deployment record
      const deploymentData = {
        deployment_id: generateDeploymentId(),
        status: "building",
        branch: "main",
        commit_hash: generateCommitHash(),
        commit_message: "Manual deployment from admin panel",
        type: "Production",
        triggered_by: null, // In a real app with auth, this would be the current user's ID
      }

      const createResult = await createDeployment(deploymentData)

      if (!createResult.success) {
        throw new Error(createResult.error)
      }

      // Simulate deployment process
      setTimeout(async () => {
        try {
          // Update deployment status to ready
          const updatedDeploymentData = {
            ...deploymentData,
            status: "ready",
            deployment_id: createResult.data.deployment_id, // Use the ID from the created deployment
          }

          await createDeployment(updatedDeploymentData)

          // Refresh deployments list
          const deploymentsResult = await getDeployments()
          if (deploymentsResult.success) {
            setDeployments(deploymentsResult.data || [])
          }
        } catch (error) {
          console.error("Error updating deployment status:", error)
        } finally {
          setIsDeploying(false)
        }
      }, 3000)
    } catch (error) {
      console.error("Error deploying:", error)
      setIsDeploying(false)
    }
  }

  const getContentIcon = (type: string) => {
    const contentType = contentTypes.find((t) => t.id === type) || contentTypes[0]
    return <contentType.icon className="h-4 w-4" />
  }

  const handleContentTypeClick = (type: string) => {
    setSelectedContentType(type)
    setShowContentTable(false)
    setActiveTab("content")
  }

  const handleManageContent = (type: string) => {
    setSelectedContentType(type)
    setShowContentTable(true)
    setActiveTab("content")
  }

  const handleBackToOverview = () => {
    setSelectedContentType(null)
    setShowContentTable(false)
  }

  return (
    <div className="flex h-screen bg-muted/10">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-border transition-all duration-300 ease-in-out flex flex-col h-screen`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-[#1e8e3e] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              <span className="font-semibold text-xl">{siteConfig.name} Admin</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="h-6 w-6 bg-[#1e8e3e] rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-bold">H</span>
            </div>
          )}
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
                variant={activeTab === "content" && !selectedContentType ? "secondary" : "ghost"}
                className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                onClick={() => {
                  setSelectedContentType(null)
                  setShowContentTable(false)
                  setActiveTab("content")
                }}
              >
                <Home className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-2">Dashboard</span>}
              </Button>
            </li>

            {!isSidebarCollapsed && (
              <div className="text-xs font-medium text-muted-foreground px-3 pt-4 pb-2">Content</div>
            )}

            {contentTypes.map((item) => (
              <li key={item.id}>
                <Button
                  variant={selectedContentType === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                  onClick={() => handleContentTypeClick(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                  {!isSidebarCollapsed && <span className="ml-2">{item.label}</span>}
                </Button>
              </li>
            ))}

            {!isSidebarCollapsed && (
              <div className="text-xs font-medium text-muted-foreground px-3 pt-4 pb-2">Website</div>
            )}

            <li>
              <Button
                variant={activeTab === "deployments" ? "secondary" : "ghost"}
                className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                onClick={() => {
                  setSelectedContentType(null)
                  setShowContentTable(false)
                  setActiveTab("deployments")
                }}
              >
                <GitBranch className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-2">Deployments</span>}
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "domains" ? "secondary" : "ghost"}
                className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                onClick={() => {
                  setSelectedContentType(null)
                  setShowContentTable(false)
                  setActiveTab("domains")
                }}
              >
                <Globe className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-2">Domains</span>}
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "analytics" ? "secondary" : "ghost"}
                className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                onClick={() => {
                  setSelectedContentType(null)
                  setShowContentTable(false)
                  setActiveTab("analytics")
                }}
              >
                <BarChart2 className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-2">Analytics</span>}
              </Button>
            </li>

            {/* Add Users section */}
            <li>
              <Button
                variant={activeTab === "users" ? "secondary" : "ghost"}
                className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                onClick={() => {
                  setSelectedContentType(null)
                  setShowContentTable(false)
                  setActiveTab("users")
                }}
              >
                <UserCog className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-2">Users</span>}
              </Button>
            </li>

            <li>
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className={`w-full justify-start ${isSidebarCollapsed ? "px-2" : ""}`}
                onClick={() => {
                  setSelectedContentType(null)
                  setShowContentTable(false)
                  setActiveTab("settings")
                }}
              >
                <Settings className="h-5 w-5" />
                {!isSidebarCollapsed && <span className="ml-2">Settings</span>}
              </Button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(showContentTable || selectedContentType) && (
              <Button variant="ghost" size="sm" onClick={handleBackToOverview} className="mr-2">
                ← Back
              </Button>
            )}
            <h1 className="text-xl font-semibold">
              {showContentTable
                ? `Manage ${contentTypes.find((t) => t.id === selectedContentType)?.label}`
                : selectedContentType
                  ? `Add ${contentTypes.find((t) => t.id === selectedContentType)?.label}`
                  : activeTab === "content"
                    ? "Content Dashboard"
                    : activeTab === "deployments"
                      ? "Deployments"
                      : activeTab === "domains"
                        ? "Domains"
                        : activeTab === "analytics"
                          ? "Analytics"
                          : activeTab === "users"
                            ? "User Management"
                            : "Settings"}
            </h1>
            {deployments.length > 0 && <DeploymentStatus status={deployments[0]?.status || "ready"} />}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-[200px] pl-8 bg-muted/30" />
            </div>
            <VercelProjectSelector />
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="bg-[#1e8e3e] text-white hover:bg-[#167c2e]"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy"
              )}
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {selectedContentType && !showContentTable ? (
            <ContentForm contentType={selectedContentType} onSuccess={handleBackToOverview} />
          ) : showContentTable && selectedContentType ? (
            <ContentTable contentType={selectedContentType} />
          ) : (
            <>
              {activeTab === "content" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-4">Quick Add Content</h2>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                      {contentTypes.map((type) => (
                        <Card
                          key={type.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleContentTypeClick(type.id)}
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
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium">Recent Content</CardTitle>
                          <CardDescription>Recently added content items</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View All
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center gap-2 p-2 rounded animate-pulse">
                                <div className="h-4 w-4 bg-muted rounded-full"></div>
                                <div className="h-4 w-32 bg-muted rounded"></div>
                                <div className="h-4 w-16 bg-muted rounded ml-auto"></div>
                              </div>
                            ))}
                          </div>
                        ) : recentContent.length > 0 ? (
                          <div className="space-y-2">
                            {recentContent.map((item, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
                                {getContentIcon(item.type)}
                                <span className="text-sm">{item.title}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {formatTimeAgo(item.created_at)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No content found. Start by adding some content.
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <WebsiteConnectionStatus />

                    <WebsiteStats />
                  </div>
                </>
              )}

              {activeTab === "deployments" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deployment History</CardTitle>
                    <CardDescription>Recent deployments for your HEAL website</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="h-4 w-4 bg-muted rounded-full"></div>
                              <div>
                                <div className="h-4 w-40 bg-muted rounded mb-2"></div>
                                <div className="h-3 w-32 bg-muted rounded"></div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-20 bg-muted rounded"></div>
                              <div className="h-4 w-16 bg-muted rounded"></div>
                              <div className="h-8 w-16 bg-muted rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : deployments.length > 0 ? (
                      <div className="space-y-4">
                        {deployments.map((deployment, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DeploymentStatus status={deployment.status} />
                              <div>
                                <div className="font-medium">{deployment.commit_message || "Deployment"}</div>
                                <div className="text-sm text-muted-foreground">
                                  {deployment.branch} • {deployment.commit_hash}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={deployment.type === "Production" ? "default" : "outline"}>
                                {deployment.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTimeAgo(deployment.created_at)}
                              </span>
                              <Button variant="outline" size="sm" onClick={() => window.open(siteConfig.url, "_blank")}>
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No deployments found. Click the Deploy button to create one.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage users and their permissions</CardDescription>
                      </div>
                      <Button>Add User</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <UserTable />
                  </CardContent>
                </Card>
              )}

              {/* Keep the other content tabs */}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
