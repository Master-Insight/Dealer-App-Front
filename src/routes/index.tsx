import { LoginForm } from '@/components/LoginForm'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className='grid place-items-center h-screen'>
      <LoginForm />
    </div>
  )
}
