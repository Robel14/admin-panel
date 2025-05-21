"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X } from "lucide-react"
import { createUser, updateUser } from "@/app/actions/users"

type UserFormProps = {
  user?: {
    id: string
    name: string
    email: string
    role: string
    status: string
  }
  onSuccess?: () => void
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Reset states
    setSuccess(false)
    setError(null)

    // Get form data
    const formData = new FormData(e.currentTarget)
    const formValues: Record<string, any> = {}

    // Convert FormData to object
    formData.forEach((value, key) => {
      formValues[key] = value
    })

    startTransition(async () => {
      try {
        let result

        if (user?.id) {
          // Update existing user
          result = await updateUser(user.id, formValues)
        } else {
          // Create new user
          result = await createUser(formValues)
        }

        if (result.success) {
          setSuccess(true)

          // Reset form after success
          setTimeout(() => {
            setSuccess(false)
            if (!user?.id) {
              e.currentTarget.reset()
            }

            // Call onSuccess callback if provided
            if (onSuccess) {
              onSuccess()
            }
          }, 2000)
        } else {
          setError(result.error || "An error occurred while saving user")
        }
      } catch (err) {
        console.error("Error submitting form:", err)
        setError("An unexpected error occurred")
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <Check className="h-4 w-4" />
            <AlertDescription>User successfully {user?.id ? "updated" : "added"}!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="Enter full name" required defaultValue={user?.name || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              required
              defaultValue={user?.email || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={user?.role || "User"}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={user?.status || "Active"}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!user?.id && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : user?.id ? "Update User" : "Add User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
