'use client'

import { LifeBuoy } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { HelpCentre } from '@/components/help/HelpCentre'

export default function HelpPage() {
  return (
    <>
      <PageHeader
        icon={LifeBuoy}
        title="Help & Training Centre"
        subtitle="Guides, guided tours and best practice for every module"
      />
      <PageContainer>
        <HelpCentre />
      </PageContainer>
    </>
  )
}
