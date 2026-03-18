'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen } from 'lucide-react'

export default function FieldworkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Fieldwork</h1>
          <p className="text-slate-500 mt-1">
            Manage workpapers, evidence, and audit testing
          </p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          New Workpaper
        </Button>
      </div>

      <Card className="p-12 bg-white border-slate-200 text-center">
        <FolderOpen className="h-16 w-16 mx-auto text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-900 mt-4">
          Fieldwork Module
        </h3>
        <p className="text-slate-600 mt-2 max-w-md mx-auto">
          This module allows auditors to create workpapers, attach evidence, and
          document testing procedures.
        </p>
      </Card>
    </div>
  )
}
