import { createFileRoute } from '@tanstack/react-router'

import { ClientForm } from '@/features/clients/components/client-form'
import { ClientList } from '@/features/clients/components/client-list'
import { useClientsQuery } from '@/features/clients/hooks/use-clients'

export const Route = createFileRoute('/_private/clients/')({
  component: ClientsPage,
})

function ClientsPage() {
  const { data: clients = [] } = useClientsQuery()

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)]">
      <ClientForm existingClients={clients} />
      <ClientList />
    </div>
  )
}
