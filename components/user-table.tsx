"use client"

import { useState } from "react"
import { MoreHorizontal, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Sample user data
const users = [
  {
    id: "1",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "Just now",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarFallback: "EW",
  },
  {
    id: "2",
    name: "Jackson Lee",
    email: "jackson.lee@example.com",
    role: "User",
    status: "Active",
    lastActive: "5 min ago",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarFallback: "JL",
  },
  {
    id: "3",
    name: "Olivia Martin",
    email: "olivia.martin@example.com",
    role: "User",
    status: "Inactive",
    lastActive: "2 hours ago",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarFallback: "OM",
  },
  {
    id: "4",
    name: "Lucas Smith",
    email: "lucas.smith@example.com",
    role: "Manager",
    status: "Active",
    lastActive: "1 day ago",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarFallback: "LS",
  },
  {
    id: "5",
    name: "Sophia Brown",
    email: "sophia.brown@example.com",
    role: "User",
    status: "Pending",
    lastActive: "3 days ago",
    avatarUrl: "/placeholder.svg?height=40&width=40",
    avatarFallback: "SB",
  },
]

export function UserTable() {
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )
      case "Inactive":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Inactive
          </Badge>
        )
      case "Pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <Button variant="ghost" onClick={() => handleSort("name")} className="flex items-center font-medium">
                User {getSortIcon("name")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("role")} className="flex items-center font-medium">
                Role {getSortIcon("role")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("status")} className="flex items-center font-medium">
                Status {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("lastActive")}
                className="flex items-center font-medium"
              >
                Last Active {getSortIcon("lastActive")}
              </Button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>{user.lastActive}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit user</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
