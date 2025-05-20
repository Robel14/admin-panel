"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { siteConfig } from "@/config/site-config"

export function WebsiteStats() {
  const [isLoading, setIsLoading] = useState(false)

  const refreshStats = () => {
    setIsLoading(true)
    // In a real implementation, this would fetch the latest stats from your website
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">HEAL Website Stats</CardTitle>
        <Button variant="ghost" size="sm" onClick={refreshStats} disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {siteConfig.stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
