import { useEventListener } from '@liveblocks/react'
import { ROOM_EVENTS } from 'liveblocks.config'
import { getSoundEffectManager, SOUND_EFFECTS } from '../lib/sound-manager'

export function GameSoundEffectsEvents() {
  useEventListener(({ event }) => {
    const soundEffectManager = getSoundEffectManager()

    switch (event.type) {
      case ROOM_EVENTS.MATCH_SOUND:
        soundEffectManager.play({ type: SOUND_EFFECTS.CARD_MATCH })
        break
      case ROOM_EVENTS.ERROR_SOUND:
        soundEffectManager.play({ type: SOUND_EFFECTS.CARD_MISMATCH })
        break
      case ROOM_EVENTS.GAME_FINISHED:
        soundEffectManager.play({ type: SOUND_EFFECTS.GAME_FINISHED })
        break
    }
  })

  return null
}
