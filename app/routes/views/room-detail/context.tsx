import type { Route } from '@rr-views/room-detail/+types/room'
import { createContext, useContext } from 'react'

type RoomDetailContextType = {
  roomData: Route.ComponentProps['loaderData']
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
  return (
    <RoomDetailContext.Provider value={{ roomData }}>
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
