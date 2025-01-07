import { useStorage } from '@liveblocks/react/suspense'
import { type GameCard } from 'liveblocks.config'
import type { ComponentProps } from 'react'
import { cn } from '~/lib/utils'
import { useCardHandling } from '../hooks/card-handling'
import { TOTAL_CARDS } from '../lib/constants'
import { FlipCard } from './flip-card'

type GameGridProps = ComponentProps<'div'> & {
  className?: string
}

const PLACEHOLDER_CARDS: Array<GameCard> = Array.from(
  { length: TOTAL_CARDS },
  (_, i) =>
    ({
      id: i.toString(),
      pairId: i,
      image: '',
      isMatched: false,
    }) satisfies GameCard
)

export function GameGrid({ className, ...props }: GameGridProps) {
  const cards = useStorage((root) => root.cards)
  const firstSelectedCardId = useStorage((root) => root.firstSelectedId)
  const secondSelectedCardId = useStorage((root) => root.secondSelectedId)
  const animatingMatchIds = useStorage((root) => root.animatingMatchIds)
  const animatingErrorIds = useStorage((root) => root.animatingErrorIds)

  const { handleCardClick } = useCardHandling()

  return (
    <div
      className={cn(
        'grid grid-cols-5 gap-2 lg:grid-cols-6 2xl:grid-cols-8',
        className
      )}
      {...props}
    >
      {(cards.length > 0 ? cards : PLACEHOLDER_CARDS).map((card) => (
        <FlipCard
          key={card.id}
          onClick={() => handleCardClick(card.id)}
          isFlipped={
            card.isMatched ||
            card.id === firstSelectedCardId ||
            card.id === secondSelectedCardId
          }
          className={cn({
            'animate-match-card': animatingMatchIds.includes(card.id),
            'animate-error-card': animatingErrorIds.includes(card.id),
          })}
          front={<span className="text-2xl">🍥</span>}
          back={
            <div className="size-full p-4">
              <img
                src={card.image}
                alt={card.id}
                className="h-full w-full object-contain"
              />
            </div>
          }
        />
      ))}
    </div>
  )
}
