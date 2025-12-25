'use client'

import { Bell, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Internal Audit & Compliance System
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              <div className="px-2 py-3 hover:bg-slate-50 cursor-pointer border-b">
                <p className="text-sm font-medium">New Finding Assigned</p>
                <p className="text-xs text-slate-500 mt-1">
                  You've been assigned to finding FND-2024-001
                </p>
                <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
              </div>
              <div className="px-2 py-3 hover:bg-slate-50 cursor-pointer border-b">
                <p className="text-sm font-medium">Action Plan Overdue</p>
                <p className="text-xs text-slate-500 mt-1">
                  Action plan AP-2024-015 is overdue
                </p>
                <p className="text-xs text-slate-400 mt-1">5 hours ago</p>
              </div>
              <div className="px-2 py-3 hover:bg-slate-50 cursor-pointer">
                <p className="text-sm font-medium">Recommendation Approved</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your recommendation REC-2024-023 has been approved
                </p>
                <p className="text-xs text-slate-400 mt-1">1 day ago</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-slate-200 text-slate-700 text-xs font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-slate-500">Audit Manager</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
