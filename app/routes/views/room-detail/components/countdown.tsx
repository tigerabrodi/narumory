import { useEffect, useState } from 'react'
import { getSoundEffectManager, SOUND_EFFECTS } from '../lib/sound-manager'

type CountdownProps = {
  onFinished: () => void
}

export function Countdown({ onFinished }: CountdownProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    const soundEffectManager = getSoundEffectManager()

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          soundEffectManager.play({ type: SOUND_EFFECTS.GAME_STARTING })
          onFinished()
        }
        if (prev <= 1) clearInterval(timer)
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onFinished])

  if (count <= 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="animate-bounce text-9xl font-bold text-white">
        {count}
      </div>
    </div>
  )
}
