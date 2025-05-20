"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, AlertCircle } from "lucide-react"
import { seedInitialData } from "../actions/content"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleSeed = async () => {
    setIsLoading(true)
    try {
      const seedResult = await seedInitialData()
      setResult(seedResult)
    } catch (error) {
      setResult({
        success: false,
        error: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>This will add sample data to your database for testing purposes.</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert
              className={`mb-4 ${
                result.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {result.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{result.message || result.error}</AlertDescription>
            </Alert>
          )}
          <p className="text-muted-foreground mb-4">The following sample data will be added:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>3 news articles</li>
            <li>3 images</li>
            <li>1 deployment record</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSeed} disabled={isLoading} className="w-full">
            {isLoading ? "Seeding..." : "Seed Database"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
