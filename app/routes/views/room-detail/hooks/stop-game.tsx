import { LiveList } from '@liveblocks/client'
import { useMutation } from '@liveblocks/react/suspense'
import { GAME_STATES } from '../lib/constants'

export function useStopGame() {
  return useMutation(({ storage }) => {
    storage.set('state', GAME_STATES.LOBBY)
    storage.set('cards', new LiveList([]))
    storage.set('currentTurnPlayerId', null)
    storage.set('firstSelectedId', null)
    storage.set('secondSelectedId', null)
    storage.set('animatingMatchIds', [])
    storage.set('animatingErrorIds', [])
    storage.set('canSelect', true)
    storage.set('totalPairsMatched', 0)
    storage.set('winningPlayerId', null)

    const playerStates = storage.get('playerStates')
    playerStates.forEach((state) => {
      state.update({
        collectedPairIds: [],
        pairsCount: 0,
      })
    })
  }, [])
}
