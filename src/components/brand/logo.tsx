import logoUrl from '@/logo.svg'
import { cn } from '@/lib/utils'

interface DealerAppLogoProps {
  className?: string
  withLabel?: boolean
  labelClassName?: string
}

export function DealerAppLogo({
  className,
  withLabel = true,
  labelClassName,
}: DealerAppLogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-lg font-semibold tracking-tight',
        className,
      )}
    >
      <img src={logoUrl} alt="Dealer App" className="h-9 w-auto" />
      {withLabel ? (
        <span className={cn('text-balance text-left', labelClassName)}>
          Dealer App
        </span>
      ) : null}
    </div>
  )
}
