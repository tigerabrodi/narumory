import { LiveList, LiveMap, LiveObject } from '@liveblocks/client'

type GameCard = {
  id: string
  pairId: number
  image: string
  isMatched: boolean
}

type PlayerScore = {
  collectedPairIds: Array<number>
  pairsCount: number
}

declare global {
  interface Liveblocks {
    // Each user's Presence
    Presence: {
      cursor: { x: number; y: number } | null
      username: string
    }

    // Room Storage
    Storage: {
      state: 'LOBBY' | 'IN_PROGRESS' | 'FINISHED'
      cards: LiveList<LiveObject<GameCard>>
      playerStates: LiveMap<string, LiveObject<PlayerScore>>

      // Game configuration
      totalPairs: number
      totalPairsMatched: number

      // Turn & Selection state
      currentTurnPlayerId: string | null
      firstSelectedId: string | null
      secondSelectedId: string | null

      // Animation states
      animatingMatchIds: Array<string>
      animatingErrorIds: Array<string>
      canSelect: boolean

      // Game outcome
      winningPlayerId: string | null
    }

    // Broadcast events for sounds
    RoomEvent:
      | { type: 'GAME_STARTING' }
      | { type: 'GAME_FINISHED' }
      | { type: 'MATCH_SOUND' }
      | { type: 'ERROR_SOUND' }

    // User metadata from auth
    UserMeta: {
      id: string
      info: {
        username: string
        email: string
      }
    }
  }
}

export {}
