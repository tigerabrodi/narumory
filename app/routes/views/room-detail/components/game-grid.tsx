import type { ComponentProps } from 'react'
import { cn } from '~/lib/utils'

type GameGridProps = ComponentProps<'div'> & {
  className?: string
}

export function GameGrid({ className, ...props }: GameGridProps) {
  const GRID_SIZE = 8
  const CARDS = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    id: i,
    isFlipped: false,
    isMatched: false,
  }))

  return (
    <div
      className={cn(
        'grid grid-cols-5 gap-2 lg:grid-cols-6 2xl:grid-cols-8',
        className
      )}
      {...props}
    >
      {CARDS.map((card) => (
        <button
          key={card.id}
          className={cn('aspect-square rounded-lg bg-primary')}
        />
      ))}
    </div>
  )
}
