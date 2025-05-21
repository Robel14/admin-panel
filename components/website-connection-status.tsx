"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, RefreshCw, ExternalLink } from "lucide-react"
import { siteConfig } from "@/config/site-config"

export function WebsiteConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const checkConnection = async () => {
    setStatus("checking")

    try {
      // Try to fetch the website to check if it's accessible
      const response = await fetch(siteConfig.url, { method: "HEAD", mode: "no-cors" })

      // If we get here, the website is accessible
      setStatus("connected")
    } catch (error) {
      // If there's an error, the website might be down
      setStatus("disconnected")
    }

    setLastChecked(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    checkConnection()

    // Check connection every 5 minutes
    const interval = setInterval(checkConnection, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">HEAL Website Connection</CardTitle>
        <CardDescription>Status of connection to your website</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          {status === "checking" ? (
            <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
          ) : status === "connected" ? (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" />
          )}

          <h3 className="mt-4 text-lg font-medium">
            {status === "checking" ? "Checking Connection..." : status === "connected" ? "Connected" : "Disconnected"}
          </h3>

          <Badge className="mt-2" variant={status === "connected" ? "default" : "destructive"}>
            {siteConfig.url}
          </Badge>

          {lastChecked && <p className="mt-2 text-xs text-muted-foreground">Last checked: {lastChecked}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={checkConnection}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button size="sm" onClick={() => window.open(siteConfig.url, "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit Website
        </Button>
      </CardFooter>
    </Card>
  )
}
