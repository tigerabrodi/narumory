import {
  useBroadcastEvent,
  useMutation,
  useStorage,
} from '@liveblocks/react/suspense'
import { ROOM_EVENTS, type GameCard } from 'liveblocks.config'
import type { ComponentProps } from 'react'
import { cn } from '~/lib/utils'
import { TOTAL_CARDS } from '../lib/constants'
import { getSoundEffectManager, SOUND_EFFECTS } from '../lib/sound-manager'
import { determineWinner, getNextPlayerId } from '../lib/utils'
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

const ANIMATION_DURATION_RESET_TIMEOUT = 1500

// We need to let the card animation happen before we do the sound + animation
// Otherwise it's not in sync
const ANIMATION_START_DELAY = 350

export function GameGrid({ className, ...props }: GameGridProps) {
  const cards = useStorage((root) => root.cards)
  const firstSelectedCardId = useStorage((root) => root.firstSelectedId)
  const secondSelectedCardId = useStorage((root) => root.secondSelectedId)
  const animatingMatchIds = useStorage((root) => root.animatingMatchIds)
  const animatingErrorIds = useStorage((root) => root.animatingErrorIds)
  const broadcast = useBroadcastEvent()

  const handleErrorCards = useMutation(
    ({ storage }) => {
      const soundEffectManager = getSoundEffectManager()

      const firstSelectedCardId = storage.get('firstSelectedId')
      const secondSelectedCardId = storage.get('secondSelectedId')
      const cards = storage.get('cards')

      if (!firstSelectedCardId || !secondSelectedCardId) return

      const errorIds = [firstSelectedCardId, secondSelectedCardId]

      // Animate cards and play sound effect
      setTimeout(() => {
        storage.set('animatingErrorIds', errorIds)
        soundEffectManager.play({ type: SOUND_EFFECTS.CARD_MISMATCH })
        broadcast({ type: ROOM_EVENTS.ERROR_SOUND })
      }, ANIMATION_START_DELAY)

      setTimeout(() => {
        // Turn cards back
        errorIds.forEach((id) => {
          const cardIndex = cards.findIndex((card) => card.get('id') === id)
          if (cardIndex === -1) return
          cards.get(cardIndex)?.update({ isMatched: false })
        })

        storage.set('animatingErrorIds', [])
        storage.set('firstSelectedId', null)
        storage.set('secondSelectedId', null)

        // Reset selection
        storage.set('canSelect', true)

        const currentPlayerId = storage.get('currentTurnPlayerId')
        if (!currentPlayerId) return

        // Move to next player
        const nextPlayerId = getNextPlayerId({
          currentId: currentPlayerId,
          playerStates: storage.get('playerStates'),
        })
        storage.set('currentTurnPlayerId', nextPlayerId)
      }, ANIMATION_DURATION_RESET_TIMEOUT)
    },
    [broadcast]
  )

  const handleMatchedCards = useMutation(
    ({ storage }) => {
      const soundEffectManager = getSoundEffectManager()
      const currentUserId = storage.get('currentTurnPlayerId')
      // Should never happen in this case
      if (!currentUserId) return

      const cards = storage.get('cards')

      const totalPairsMatched = storage.get('totalPairsMatched')
      const firstSelectedCardId = storage.get('firstSelectedId')
      const secondSelectedCardId = storage.get('secondSelectedId')

      if (!firstSelectedCardId || !secondSelectedCardId) return

      const firstCard = cards.find(
        (card) => card.get('id') === firstSelectedCardId
      )
      const secondCard = cards.find(
        (card) => card.get('id') === secondSelectedCardId
      )

      if (!firstCard || !secondCard) return

      const matchedCardIds = [firstSelectedCardId, secondSelectedCardId]

      // update cards to be matched
      matchedCardIds.forEach((id) => {
        const cardIndex = cards.findIndex((card) => card.get('id') === id)
        if (cardIndex === -1) return
        cards.get(cardIndex)?.update({ isMatched: true })
      })

      // Update player's score
      const playerStates = storage.get('playerStates')
      const playerScore = playerStates.get(currentUserId)
      if (!playerScore) return
      playerScore.update({
        collectedPairIds: [
          ...playerScore.get('collectedPairIds'),
          firstCard.get('pairId'),
        ],
        pairsCount: playerScore.get('pairsCount') + 1,
      })

      // Animate cards plus sound effect
      setTimeout(() => {
        storage.set('animatingMatchIds', matchedCardIds)
        soundEffectManager.play({ type: SOUND_EFFECTS.CARD_MATCH })
        broadcast({ type: ROOM_EVENTS.MATCH_SOUND })
      }, ANIMATION_START_DELAY)

      // Check if game ended
      // is it the last pair?
      const newTotalMatched = totalPairsMatched + 1
      storage.set('totalPairsMatched', newTotalMatched)
      const isGameFinished = newTotalMatched === storage.get('totalPairs')
      if (isGameFinished) {
        setTimeout(() => {
          soundEffectManager.play({ type: SOUND_EFFECTS.GAME_FINISHED })
          // Broadcast for others
          broadcast({ type: ROOM_EVENTS.GAME_FINISHED })

          storage.set('state', 'FINISHED')
          storage.set('winningPlayerId', determineWinner({ storage }))
        }, ANIMATION_DURATION_RESET_TIMEOUT)
      }

      // Reset selection
      // Since card matched, same player can select again
      setTimeout(() => {
        storage.set('animatingMatchIds', [])
        storage.set('firstSelectedId', null)
        storage.set('secondSelectedId', null)
        storage.set('canSelect', true)
      }, ANIMATION_DURATION_RESET_TIMEOUT)
    },
    [broadcast]
  )

  const handleMatchedOrErrorCards = useMutation(
    ({ storage }) => {
      const firstId = storage.get('firstSelectedId')
      const secondId = storage.get('secondSelectedId')

      const cards = storage.get('cards')
      const firstCard = cards.find((card) => card.get('id') === firstId)
      const secondCard = cards.find((card) => card.get('id') === secondId)

      if (firstCard?.get('pairId') === secondCard?.get('pairId')) {
        handleMatchedCards()
      } else {
        handleErrorCards()
      }
    },
    [handleMatchedCards, handleErrorCards]
  )

  const handleCardClick = useMutation(
    ({ storage, self }, cardId: string) => {
      // Prevent clicks during card handling
      if (!storage.get('canSelect')) return

      // Not your turn
      if (storage.get('currentTurnPlayerId') !== self.id) return

      // Already has two cards
      if (storage.get('firstSelectedId') && storage.get('secondSelectedId'))
        return

      const firstSelected = storage.get('firstSelectedId')
      if (!firstSelected) {
        storage.set('firstSelectedId', cardId)
      } else {
        storage.set('secondSelectedId', cardId)

        // Prevent further selection while handling cards
        storage.set('canSelect', false)
        handleMatchedOrErrorCards()
      }
    },
    [handleMatchedOrErrorCards]
  )

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
