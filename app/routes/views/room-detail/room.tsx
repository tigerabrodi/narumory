import { LiveList, LiveMap } from '@liveblocks/client'
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useEventListener,
  useSelf,
  useUpdateMyPresence,
} from '@liveblocks/react/suspense'
import type { Route } from '@rr-views/room-detail/+types/room'
import { ROOM_EVENTS } from 'liveblocks.config'
import { generatePath, Outlet, redirect, useParams } from 'react-router'
import { requireAuth } from '~/lib/auth.server'
import { ROUTES } from '~/lib/constants'
import { Countdown } from './components/countdown'
import { CursorPresence } from './components/cursor'
import { GameGrid } from './components/game-grid'
import { OwnerOverlay, PlayerOverlay } from './components/overlay'
import { PlayerList } from './components/player-list'
import { OwnerHeader, PlayerHeader } from './components/room-header'
import { RoomPresenceEvents } from './events/room-presence'
import { GAME_STATES } from './lib/constants'
import { getRoomByOwnerId, getRoomByRoomCode } from './lib/db-queries'
import { RoomDetailProvider, useRoomDetail } from './lib/room-context'

const LIVEBLOCKS_AUTH_ENDPOINT = '/api/liveblocks/auth'

export async function loader({ params, request }: Route.LoaderArgs) {
  const requireAuthResult = await requireAuth({ request })

  if (requireAuthResult.type === 'redirect') throw requireAuthResult.response

  const user = requireAuthResult.user

  const { roomCode } = params

  const myRoom = await getRoomByOwnerId({
    ownerId: user.id,
  })

  const room = await getRoomByRoomCode({
    roomCode,
  })

  if (!room || !myRoom) {
    return redirect(generatePath(ROUTES.login))
  }

  return {
    ownerEmail: room.owner.email,
    roomCode: room.code,
    roomName: room.name,
    myRoomCode: myRoom.code,
  }
}

export default function RoomDetail({ loaderData }: Route.ComponentProps) {
  return (
    <LiveblocksProvider authEndpoint={LIVEBLOCKS_AUTH_ENDPOINT}>
      <RoomDetailProvider roomData={loaderData}>
        <RoomWrapper />
        <Outlet />
      </RoomDetailProvider>
    </LiveblocksProvider>
  )
}

// TODO: show something nice e.g. logo animatining in the middle
function RoomLoading() {
  return <div>Loading...</div>
}

function RoomWrapper() {
  const { roomCode } = useParams<{ roomCode: string }>()

  if (!roomCode) return <RoomLoading />

  // TODO: add error boundary using package react-error-boundary

  return (
    <RoomProvider
      id={roomCode}
      // may happen for a split ms
      // otherwise liveblocks picks up the presence quickly
      initialPresence={{
        cursor: null,
        username: '',
      }}
      // this happens the VERY first time someone joins the room
      // which will be the owner themselves after creating their account
      // and getting redirected
      initialStorage={{
        state: GAME_STATES.LOBBY,
        cards: new LiveList([]),
        playerStates: new LiveMap(),
        totalPairs: 32,
        totalPairsMatched: 0,
        currentTurnPlayerId: null,
        firstSelectedId: null,
        secondSelectedId: null,
        animatingMatchIds: [],
        animatingErrorIds: [],
        canSelect: false,
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
  const { roomData, showCountdown, setShowCountdown } = useRoomDetail()

  // we use emails as ids
  const myEmail = useSelf((self) => self.info.email)
  const isOwner = roomData.ownerEmail === myEmail

  const updateMyPresence = useUpdateMyPresence()

  useEventListener(({ event }) => {
    if (event.type === ROOM_EVENTS.GAME_STARTING) {
      setShowCountdown(true)
    }
  })

  return (
    <>
      {showCountdown && (
        <Countdown onFinished={() => setShowCountdown(false)} />
      )}
      <div
        className="min-h-screen p-8"
        onPointerMove={(event) => {
          updateMyPresence({
            cursor: {
              x: Math.round(event.clientX),
              y: Math.round(event.clientY),
            },
          })
        }}
        onPointerLeave={() =>
          updateMyPresence({
            cursor: null,
          })
        }
      >
        <RoomPresenceEvents />
        <CursorPresence />

        <div className="container mx-auto">
          <div className="flex flex-col gap-6">
            {isOwner ? <OwnerHeader /> : <PlayerHeader />}

            <div className="grid grid-cols-[300px_1fr] gap-10">
              <PlayerList />

              <div className="relative">
                <GameGrid />
                {isOwner ? <OwnerOverlay /> : <PlayerOverlay />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
