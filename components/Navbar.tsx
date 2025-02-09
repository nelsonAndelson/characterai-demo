"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "./mode-toggle"

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center w-full max-w-md">
        <Input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button variant="ghost" size="icon" className="ml-2">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filters</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Date Range</DropdownMenuItem>
            <DropdownMenuItem>Response Time</DropdownMenuItem>
            <DropdownMenuItem>Error Types</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
      </div>
    </nav>
  )
}

