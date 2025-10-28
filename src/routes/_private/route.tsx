import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_private')({
  // beforeLoad: ({ context }) => {
  //   // Si no hay usuario autenticado, redirige al login
  //   if (!context.auth?.user) {
  //     throw redirect({ to: '/' })
  //   }
  // },
  component: PrivateLayout
})

function PrivateLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-muted/40 px-24">
          <Outlet />
        </main>
      </div>
    </div>
  )
}