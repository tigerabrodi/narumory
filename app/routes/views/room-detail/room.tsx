import { LiveList, LiveMap } from '@liveblocks/client'
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from '@liveblocks/react'
import type { Route } from '@rr-views/room-detail/+types/room'
import { useParams } from 'react-router'
import { RoomDetailProvider } from './context'
import { getRoomWithOwner } from './db-queries'

// TODO: add join dialog

export async function loader({ params }: Route.LoaderArgs) {
  const { roomCode } = params

  const room = await getRoomWithOwner({
    roomCode,
  })

  return { room }
}

export default function RoomDetail({ loaderData }: Route.ComponentProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks/auth">
      <RoomDetailProvider room={loaderData.room}>
        <RoomWrapper />
      </RoomDetailProvider>
    </LiveblocksProvider>
  )
}

function RoomLoading() {
  return <div>Loading...</div>
}

function RoomWrapper() {
  const { roomCode } = useParams<{ roomCode: string }>()

  if (!roomCode) return <RoomLoading />

  return (
    <RoomProvider
      id={roomCode}
      // may happen for a split ms
      // otherwise liveblocks picks up the presence
      initialPresence={{
        cursor: null,
        username: '',
      }}
      // this happens the VERY first time someone joins the room
      // which will be the owner themselves after creating their account
      // and getting redirected
      initialStorage={{
        state: 'LOBBY',
        cards: new LiveList([]),
        playerStates: new LiveMap(),
        totalPairs: 32,
        totalPairsMatched: 0,
        currentTurnPlayerId: null,
        firstSelectedId: null,
        secondSelectedId: null,
        animatingMatchIds: [],
        animatingErrorIds: [],
        canSelect: true,
        winningPlayerId: null,
      }}
    >
      <ClientSideSuspense fallback={<RoomLoading />}>
        {() => <GameRoom />}
      </ClientSideSuspense>
    </RoomProvider>
  )
}

function GameRoom() {
  return <div>hello world from game room</div>
}
