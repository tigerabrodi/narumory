import type { User } from '@liveblocks/client'
import { useMutation, useOthersListener } from '@liveblocks/react'
import { useToast } from '~/hooks/use-toast'
import { useStopGame } from '../hooks/stop-game'
import { getNextPlayerId } from '../lib/utils'

export function RoomPresenceEvents() {
  const { toast } = useToast()
  const stopGame = useStopGame()

  const handleUserLeave = useMutation(
    ({ storage, others }, user: User) => {
      const remainingPlayers = others.filter(
        (other) => other.id !== user.id
      ).length

      const playerStates = storage.get('playerStates')
      playerStates.delete(user.id)

      // Move to next player if player leaving was current turn
      const wasCurrentTurn = storage.get('currentTurnPlayerId') === user.id

      if (wasCurrentTurn) {
        const nextPlayer = getNextPlayerId({
          currentId: user.id,
          playerStates,
        })
        storage.set('currentTurnPlayerId', nextPlayer)
      }

      // Stop game is owner is alone
      // owner could do it themselves but why not help them
      if (remainingPlayers === 0) {
        toast({
          title: 'No players left, stopping game',
        })
        stopGame()
      }
    },
    [stopGame, toast]
  )

  useOthersListener(({ type, user }) => {
    if (!user?.info?.username) return

    if (type === 'enter') {
      toast({
        title: `${user.info.username} joined the game`,
      })
    }
    if (type === 'leave') {
      handleUserLeave(user)
    }
  })

  return null
}
