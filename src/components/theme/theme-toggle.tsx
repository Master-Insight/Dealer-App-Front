// src/components/theme/theme-toggle.tsx
import { MoonIcon, SunIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const label = useMemo(
    () => (theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'),
    [theme],
  )

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggleTheme}
      aria-label={label}
    >
      {theme === 'dark' ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </Button>
  )
}
