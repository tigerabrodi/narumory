import type { Route } from '@rr-views/room-detail/+types/room'
import { createContext, useContext } from 'react'

type RoomDetailContextType = {
  room: Route.ComponentProps['loaderData']['room']
}

export const RoomDetailContext = createContext<RoomDetailContextType>({
  room: null,
})

export function RoomDetailProvider({
  room,
  children,
}: {
  room: Route.ComponentProps['loaderData']['room']
  children: React.ReactNode
}) {
  return (
    <RoomDetailContext.Provider value={{ room }}>
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
