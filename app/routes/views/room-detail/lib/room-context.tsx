import type { Route } from '@rr-views/room-detail/+types/room'
import { createContext, useContext, useState } from 'react'

type RoomDetailContextType = {
  roomData: Route.ComponentProps['loaderData']
  showCountdown: boolean
  setShowCountdown: (show: boolean) => void
}

export const RoomDetailContext = createContext<RoomDetailContextType | null>(
  null
)

export function RoomDetailProvider({
  roomData,
  children,
}: {
  roomData: Route.ComponentProps['loaderData']
  children: React.ReactNode
}) {
  const [showCountdown, setShowCountdown] = useState(false)

  return (
    <RoomDetailContext.Provider
      value={{ roomData, showCountdown, setShowCountdown }}
    >
      {children}
    </RoomDetailContext.Provider>
  )
}

export function useRoomDetail() {
  const context = useContext(RoomDetailContext)

  if (!context) {
    throw new Error('useRoomDetail must be used within a RoomDetailProvider')
  }

  return context
}
