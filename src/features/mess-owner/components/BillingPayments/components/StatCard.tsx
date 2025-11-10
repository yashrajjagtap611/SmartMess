import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  valueClassName?: string
  accentBgClassName?: string
  helperTop?: React.ReactNode
  helperBottom?: React.ReactNode
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  valueClassName,
  accentBgClassName,
  helperTop,
  helperBottom,
  className,
}) => {
  return (
    <Card className={cn('SmartMess-light-surface dark:SmartMess-dark-surface border border-border', className)}>
      <div className="p-2.5 sm:p-4">
        <div className="flex items-center justify-between mb-1.5 sm:mb-3 min-w-0">
          <div
            className={cn(
              'p-1.5 sm:p-2 rounded-lg',
              accentBgClassName ?? 'bg-accent/20'
            )}
            aria-hidden
          >
            {icon}
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate ml-2">{title}</span>
        </div>

        <div className={cn('text-base sm:text-xl font-bold text-foreground', valueClassName)}>{value}</div>

        {helperTop ? (
          <div className="text-xs text-muted-foreground mt-1">{helperTop}</div>
        ) : null}

        {helperBottom ? (
          <div className="text-xs mt-1">{helperBottom}</div>
        ) : null}
      </div>
    </Card>
  )
}

export default StatCard


