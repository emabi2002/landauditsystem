'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'

export default function FieldworkPage() {
  return (
    <>
      <PageHeader
        icon={FolderOpen}
        title="Fieldwork"
        subtitle="Manage workpapers, evidence, and audit testing"
        actions={
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            New Workpaper
          </Button>
        }
      />
      <PageContainer>
        <div className="space-y-6">
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
      </PageContainer>
    </>
  )
}
