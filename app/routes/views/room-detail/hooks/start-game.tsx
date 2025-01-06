import { LiveList, LiveMap, LiveObject } from '@liveblocks/client'
import { useBroadcastEvent, useMutation } from '@liveblocks/react/suspense'
import { ROOM_EVENTS, type GameCard, type PlayerScore } from 'liveblocks.config'
import { createGameCards } from '../lib/cards-generation'
import { GAME_STATES, TOTAL_PAIRS } from '../lib/constants'
import { useRoomDetail } from '../lib/room-context'

export function useStartGame() {
  const broadcast = useBroadcastEvent()
  const { setShowCountdown } = useRoomDetail()

  const startGame = useMutation(
    ({ storage, self, others }) => {
      // Generate fresh shuffled cards
      const gameCards: Array<LiveObject<GameCard>> = createGameCards().map(
        (card) => new LiveObject(card)
      )

      const allPlayers = [self.id, ...others.map((other) => other.id)]
      const randomPlayerIndex = Math.floor(Math.random() * allPlayers.length)

      storage.set('state', GAME_STATES.IN_PROGRESS)

      // Might be configurable in the future
      storage.set('totalPairs', TOTAL_PAIRS)
      storage.set('totalPairsMatched', 0)
      storage.set('currentTurnPlayerId', allPlayers[randomPlayerIndex])
      storage.set('firstSelectedId', null)
      storage.set('secondSelectedId', null)
      storage.set('animatingMatchIds', [])
      storage.set('animatingErrorIds', [])
      storage.set('canSelect', true)
      storage.set('winningPlayerId', null)

      const playerStates = new LiveMap<string, LiveObject<PlayerScore>>()
      allPlayers.forEach((playerId) => {
        playerStates.set(
          playerId,
          new LiveObject<PlayerScore>({
            collectedPairIds: [],
            pairsCount: 0,
          })
        )
      })

      storage.set('playerStates', playerStates)
      storage.set('cards', new LiveList(gameCards))

      // Start countdown
      setShowCountdown(true)
      broadcast({ type: ROOM_EVENTS.GAME_STARTING })
    },
    [broadcast, setShowCountdown]
  )

  return startGame
}
