import cardMatchSoundEffect from '~/assets/sound-effects/card-match.mp3'
import cardMismatchSoundEffect from '~/assets/sound-effects/card-mismatch.mp3'
import gameFinishedSoundEffect from '~/assets/sound-effects/game-finished.mp3'
import gameStartingSoundEffect from '~/assets/sound-effects/game-start.mp3'

const SOUND_EFFECTS = {
  CARD_MATCH: 'cardMatch',
  CARD_MISMATCH: 'cardMismatch',
  GAME_FINISHED: 'gameFinished',
  GAME_STARTING: 'gameStarting',
} as const

type SingleSoundEffectType =
  | typeof SOUND_EFFECTS.CARD_MATCH
  | typeof SOUND_EFFECTS.CARD_MISMATCH
  | typeof SOUND_EFFECTS.GAME_FINISHED
  | typeof SOUND_EFFECTS.GAME_STARTING

type SoundEffectConfig = {
  [SOUND_EFFECTS.CARD_MATCH]: string
  [SOUND_EFFECTS.CARD_MISMATCH]: string
  [SOUND_EFFECTS.GAME_FINISHED]: string
  [SOUND_EFFECTS.GAME_STARTING]: string
}

class SoundEffectManager {
  private singleSounds: Map<SingleSoundEffectType, HTMLAudioElement> = new Map()
  private volume: number = 0.5

  constructor(config: SoundEffectConfig) {
    Object.entries(config).forEach(([type, src]) => {
      this.singleSounds.set(
        type as SingleSoundEffectType,
        this.createAudio({ src })
      )
    })

    this.preloadAll()
  }

  private createAudio({ src }: { src: string }): HTMLAudioElement {
    const audio = new Audio(src)
    audio.volume = this.volume
    return audio
  }

  play({ type }: { type: SingleSoundEffectType }) {
    const sound = this.singleSounds.get(type)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch((e) => console.error('Error playing sound effect:', e))
    }
  }

  setVolume({ volume }: { volume: number }) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.singleSounds.forEach((sound) => (sound.volume = this.volume))
  }

  getVolume(): number {
    return this.volume
  }

  preloadAll() {
    this.singleSounds.forEach((sound) => sound.load())
  }
}

let soundEffectManager: SoundEffectManager | null = null

function getSoundEffectManager(): SoundEffectManager {
  if (typeof window !== 'undefined' && !soundEffectManager) {
    soundEffectManager = new SoundEffectManager({
      [SOUND_EFFECTS.CARD_MATCH]: cardMatchSoundEffect,
      [SOUND_EFFECTS.CARD_MISMATCH]: cardMismatchSoundEffect,
      [SOUND_EFFECTS.GAME_FINISHED]: gameFinishedSoundEffect,
      [SOUND_EFFECTS.GAME_STARTING]: gameStartingSoundEffect,
    })
  }

  if (!soundEffectManager) {
    throw new Error('Sound effect manager not initialized')
  }

  return soundEffectManager
}

export { SOUND_EFFECTS, getSoundEffectManager }
