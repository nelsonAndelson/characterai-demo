"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, MessageSquare, Settings } from "lucide-react"

const navItems = [
  { name: "Chat Logs", href: "/dashboard", icon: MessageSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-card text-card-foreground">
      <div className="flex items-center justify-center h-16 border-b">
        <span className="text-2xl font-semibold">AI Debug</span>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
                  pathname === item.href ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

