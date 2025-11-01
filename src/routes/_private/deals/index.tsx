import { createFileRoute } from '@tanstack/react-router'

import { DealForm } from '@/features/deals/components/deal-form'
import { DealList } from '@/features/deals/components/deal-list'

export const Route = createFileRoute('/_private/deals/')({
  component: DealsPage,
})

function DealsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)]">
      <DealForm />
      <DealList />
    </div>
  )
}
