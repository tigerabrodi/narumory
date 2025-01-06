import { LiveList, LiveMap } from '@liveblocks/client'
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useOthers,
  useOthersListener,
  useOthersMapped,
  useSelf,
  useStorage,
  useUpdateMyPresence,
} from '@liveblocks/react/suspense'
import type { Route } from '@rr-views/room-detail/+types/room'
import { generatePath, Link, Outlet, useParams } from 'react-router'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { useToast } from '~/hooks/use-toast'
import { ROUTES } from '~/lib/constants'
import { Cursor } from './components/cursor'
import { GameGrid } from './components/game-grid'
import { PlayerCard } from './components/player-card'
import { RoomHeader } from './components/room-header'
import { GAME_STATES, MINIMUM_PLAYERS_TO_START } from './lib/constants'
import { RoomDetailProvider, useRoomDetail } from './lib/context'
import { getRoomWithOwner } from './lib/db-queries'
import { getColorById, toPlayerStateKey } from './lib/utils'

// TODO: add join dialog

export async function loader({ params }: Route.LoaderArgs) {
  const { roomCode } = params

  const room = await getRoomWithOwner({
    roomCode,
  })

  return {
    ownerEmail: room?.owner.email,
    roomCode: room?.code,
    roomName: room?.name,
  }
}

export default function RoomDetail({ loaderData }: Route.ComponentProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks/auth">
      <RoomDetailProvider roomData={loaderData}>
        <RoomWrapper />
        <Outlet />
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
      // otherwise liveblocks picks up the presence quickly
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
  const gameState = useStorage((root) => root.state)
  const { roomData } = useRoomDetail()

  // we use emails as ids
  const myEmail = useSelf((self) => self.info.email)
  const isOwner = roomData.ownerEmail === myEmail

  const updateMyPresence = useUpdateMyPresence()

  return (
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
      <RoomEvents />
      <CursorPresence />

      <div className="container mx-auto">
        <div className="flex flex-col gap-6">
          {isOwner ? <OwnerHeader /> : <PlayerHeader />}

          <div className="grid grid-cols-[300px_1fr] gap-10">
            <PlayerList />

            <div className="relative">
              <GameGrid className="opacity-25" />
              {gameState === GAME_STATES.LOBBY &&
                (isOwner ? <OwnerOverlay /> : <PlayerOverlay />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// TODO: handle player leaving room
// - show dialog
// - make sure to remove the player from player states
// - if game was playing and it is their progress, move to next player
function PlayerHeader() {
  return (
    <RoomHeader actions={<Button variant="destructive">Leave Room</Button>} />
  )
}

function OwnerHeader() {
  const { roomData } = useRoomDetail()
  const gameState = useStorage((root) => root.state)

  if (!roomData.roomCode) return null

  return (
    <RoomHeader
      actions={
        gameState === GAME_STATES.IN_PROGRESS ? (
          <div className="flex gap-4">
            <Button variant="outline" disabled>
              Go to room
            </Button>
            {/* TODO: add stop game button logic */}
            <Button variant="destructive">Stop Game</Button>
          </div>
        ) : (
          <Button variant="outline" asChild>
            <Link
              to={generatePath(ROUTES.roomJoin, {
                roomCode: roomData.roomCode,
              })}
            >
              Go to room
            </Link>
          </Button>
        )
      }
    />
  )
}

function Overlay({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 flex justify-center bg-background/90">
      <div className="fixed top-[35%] flex flex-col items-center gap-4 text-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {actions}
      </div>
    </div>
  )
}

// TODO: add finished overlay
// currently lobby state overlay is done
function PlayerOverlay() {
  return (
    <Overlay
      title="Waiting for players..."
      description="Waiting for owner to start the game"
    />
  )
}

// TODO: add finished overlay
// currently lobby state overlay is done
function OwnerOverlay() {
  const playersCount = useOthers((others) => others.length)
  const isStartButtonDisabled = playersCount < MINIMUM_PLAYERS_TO_START

  return (
    <Overlay
      title="Waiting for players..."
      description="Minimum 2 players required to start"
      actions={<Button disabled={isStartButtonDisabled}>Start Game</Button>}
    />
  )
}

function CursorPresence() {
  const others = useOthersMapped((other) => ({
    cursor: other.presence.cursor,
    username: other.presence.username,
  }))

  return others.map(
    ([connectionId, presence]) =>
      presence.cursor && (
        <Cursor
          key={connectionId}
          x={presence.cursor.x}
          y={presence.cursor.y}
          username={presence.username}
          color={getColorById(connectionId)}
        />
      )
  )
}

function RoomEvents() {
  const toast = useToast()

  useOthersListener(({ type, user }) => {
    if (!user?.info?.username) return

    switch (type) {
      case 'enter':
        toast.toast({
          title: `${user.info.username} joined the game`,
        })
        break
      case 'leave':
        toast.toast({
          title: `${user.info.username} left the game`,
        })
        break
    }
  })

  return null
}

function PlayerList() {
  const self = useSelf((me) => ({
    connectionId: me.connectionId,
    username: me.info.username,
  }))

  const others = useOthersMapped((other) => ({
    username: other.info.username,
  }))

  const playerStates = useStorage((root) => root.playerStates)
  const currentTurnId = useStorage((root) => root.currentTurnPlayerId)
  const winningPlayerId = useStorage((root) => root.winningPlayerId)

  const allPlayers = [
    {
      id: toPlayerStateKey(self.connectionId),
      username: self.username,
      score:
        playerStates?.get(toPlayerStateKey(self.connectionId))?.pairsCount ?? 0,
      isCurrentTurn: Boolean(
        currentTurnId && currentTurnId === toPlayerStateKey(self.connectionId)
      ),
      isWinner: Boolean(
        winningPlayerId &&
          winningPlayerId === toPlayerStateKey(self.connectionId)
      ),
      color: getColorById(self.connectionId),
    },
    ...others.map(([connectionId, { username }]) => ({
      id: toPlayerStateKey(connectionId),
      username: username,
      score: playerStates?.get(toPlayerStateKey(connectionId))?.pairsCount ?? 0,
      isCurrentTurn: Boolean(
        currentTurnId && currentTurnId === toPlayerStateKey(connectionId)
      ),
      isWinner: Boolean(
        winningPlayerId && winningPlayerId === toPlayerStateKey(connectionId)
      ),
      color: getColorById(connectionId),
    })),
  ]

  return (
    <ScrollArea className="h-[600px] max-h-full rounded-lg border p-4">
      <div className="flex flex-col gap-4">
        {allPlayers.map((player) => (
          <PlayerCard key={player.id} {...player} />
        ))}
      </div>
    </ScrollArea>
  )
}
