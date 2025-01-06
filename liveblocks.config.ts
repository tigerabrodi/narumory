import { LiveList, LiveMap, LiveObject } from '@liveblocks/client'

export type GameCard = {
  id: string
  pairId: number
  image: string
  isMatched: boolean
}

export type PlayerScore = {
  collectedPairIds: Array<number>
  pairsCount: number
}

export const ROOM_EVENTS = {
  GAME_STARTING: 'GAME_STARTING',
  GAME_FINISHED: 'GAME_FINISHED',
  MATCH_SOUND: 'MATCH_SOUND',
  ERROR_SOUND: 'ERROR_SOUND',
} as const

export type PlayerStates = LiveMap<string, LiveObject<PlayerScore>>

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
      playerStates: PlayerStates

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
      | { type: typeof ROOM_EVENTS.GAME_STARTING }
      | { type: typeof ROOM_EVENTS.GAME_FINISHED }
      | { type: typeof ROOM_EVENTS.MATCH_SOUND }
      | { type: typeof ROOM_EVENTS.ERROR_SOUND }

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
