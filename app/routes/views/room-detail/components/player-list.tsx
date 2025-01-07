import {
  useOthersMapped,
  useSelf,
  useStorage,
} from '@liveblocks/react/suspense'
import { useMemo } from 'react'
import { ScrollArea } from '~/components/ui/scroll-area'
import { GAME_STATES } from '../lib/constants'
import { getColorByConnectionId } from '../lib/utils'
import { PlayerCard } from './player-card'

export function PlayerList() {
  const self = useSelf((me) => ({
    id: me.id,
    username: me.info.username,
    connectionId: me.connectionId,
  }))

  const gameState = useStorage((root) => root.state)

  const others = useOthersMapped((other) => ({
    username: other.info.username,
    id: other.id,
  }))

  const playerStates = useStorage((root) => root.playerStates)
  const currentTurnId = useStorage((root) => root.currentTurnPlayerId)
  const winningPlayerId = useStorage((root) => root.winningPlayerId)

  const allPlayers = useMemo(
    () => [
      {
        id: self.id,
        username: self.username,
        score: playerStates?.get(self.id)?.pairsCount ?? 0,
        isCurrentTurn: Boolean(currentTurnId && currentTurnId === self.id),
        isWinner: Boolean(winningPlayerId && winningPlayerId === self.id),
        color: getColorByConnectionId(self.connectionId),
        // if player state exists, all good!
        // if not, the only two cases they're allowed to not exist in case player hasn't played a game in the room yet
        // are LOBBY and FINISHED
        // FINISHED because a player might join a finished game to participate in the next game
        // FINISHED is just lobby state with a winner
        isInGame:
          playerStates.has(self.id) || gameState !== GAME_STATES.IN_PROGRESS,
      },
      ...others.map(([connectionId, { username, id }]) => ({
        id,
        username: username,
        score: playerStates?.get(id)?.pairsCount ?? 0,
        isCurrentTurn: Boolean(currentTurnId && currentTurnId === id),
        isWinner: Boolean(winningPlayerId && winningPlayerId === id),
        color: getColorByConnectionId(connectionId),
        isInGame: playerStates.has(id) || gameState !== GAME_STATES.IN_PROGRESS,
      })),
    ],
    [
      currentTurnId,
      gameState,
      others,
      playerStates,
      self.connectionId,
      self.id,
      self.username,
      winningPlayerId,
    ]
  )

  return (
    <ScrollArea className="h-[600px] max-h-full rounded-lg border p-4">
      <div className="flex flex-col gap-4">
        {allPlayers.map((player) => (
          <PlayerCard key={player.id} {...player} />
        ))}
      </div>
    </ScrollArea>
  )
}
