import { useOthers, useSelf } from '@liveblocks/react'
import { useStorage } from '@liveblocks/react/suspense'
import { useMemo } from 'react'

export function useGetWinner() {
  const winnerId = useStorage((root) => root.winningPlayerId)
  const winnerState = useStorage((root) =>
    root.winningPlayerId ? root.playerStates.get(root.winningPlayerId) : null
  )

  const self = useSelf()
  const others = useOthers()

  const winner = useMemo(() => {
    if (!winnerId || !winnerState || !self) return null

    const isWinnerSelf = self.id === winnerId
    const username = isWinnerSelf
      ? self.info.username
      : others.find((other) => other.id === winnerId)?.info.username

    return { state: winnerState, username, score: winnerState.pairsCount }
  }, [winnerId, winnerState, others, self])

  return winner
}
