import { LiveList, LiveMap, LiveObject, type User } from '@liveblocks/client'
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useBroadcastEvent,
  useEventListener,
  useMutation,
  useOthers,
  useOthersListener,
  useOthersMapped,
  useSelf,
  useStorage,
  useUpdateMyPresence,
} from '@liveblocks/react/suspense'
import type { Route } from '@rr-views/room-detail/+types/room'
import {
  ROOM_EVENTS,
  type GameCard,
  type PlayerScore,
  type PlayerStates,
} from 'liveblocks.config'
import { useMemo } from 'react'
import { generatePath, Link, Outlet, redirect, useParams } from 'react-router'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { useToast } from '~/hooks/use-toast'
import { requireAuth } from '~/lib/auth.server'
import { ROUTES } from '~/lib/constants'
import { Countdown } from './components/countdown'
import { Cursor } from './components/cursor'
import { GameGrid } from './components/game-grid'
import { PlayerCard } from './components/player-card'
import { RoomHeader } from './components/room-header'
import { createGameCards } from './lib/cards-generation'
import {
  GAME_STATES,
  MINIMUM_PLAYERS_TO_START,
  TOTAL_PAIRS,
} from './lib/constants'
import { getRoomByOwnerId, getRoomByRoomCode } from './lib/db-queries'
import { RoomDetailProvider, useRoomDetail } from './lib/room-context'
import { getColorByConnectionId } from './lib/utils'

const LIVEBLOCKS_AUTH_ENDPOINT = '/api/liveblocks/auth'

// TODO: add join dialog
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
        <RoomEvents />
        <CursorPresence />

        <div className="container mx-auto">
          <div className="flex flex-col gap-6">
            {isOwner ? <OwnerHeader /> : <PlayerHeader />}

            <div className="grid grid-cols-[300px_1fr] gap-10">
              <PlayerList />

              <div className="relative">
                <GameGrid className="opacity-25" />
                {isOwner ? <OwnerOverlay /> : <PlayerOverlay />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// TODO: handle player leaving room
// - show dialog
// - make sure to remove the player from player states
// - if game was playing and it is their progress, move to next player
function PlayerHeader() {
  const { roomData } = useRoomDetail()

  return (
    <RoomHeader
      actions={
        <Button variant="destructive" asChild>
          <Link
            to={generatePath(ROUTES.leaveRoom, { roomCode: roomData.roomCode })}
            prefetch="intent"
          >
            Leave Room
          </Link>
        </Button>
      }
    />
  )
}

function useStopGame() {
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

function OwnerHeader() {
  const { roomData } = useRoomDetail()
  const gameState = useStorage((root) => root.state)

  const stopGame = useStopGame()

  return (
    <RoomHeader
      actions={
        gameState === GAME_STATES.IN_PROGRESS ? (
          <div className="flex gap-4">
            <Button variant="outline" disabled>
              Go to room
            </Button>
            {/* TODO: add stop game button logic */}
            <Button variant="destructive" onClick={stopGame}>
              Stop Game
            </Button>
          </div>
        ) : (
          <Button variant="outline" asChild>
            <Link
              to={generatePath(ROUTES.roomJoin, {
                roomCode: roomData.roomCode,
              })}
              prefetch="intent"
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

function useGetWinner() {
  const winnerId = useStorage((root) => root.winningPlayerId)
  const winnerState = useStorage((root) =>
    root.winningPlayerId ? root.playerStates.get(root.winningPlayerId) : null
  )

  const self = useSelf()
  const others = useOthers()

  const winner = useMemo(() => {
    if (!winnerId || !winnerState) return null

    const isWinnerSelf = String(self.connectionId) === winnerId
    const username = isWinnerSelf
      ? self.info.username
      : others.find((other) => String(other.connectionId) === winnerId)?.info
          .username

    return { state: winnerState, username, score: winnerState.pairsCount }
  }, [winnerId, winnerState, others, self])

  return winner
}

function useStartGame() {
  const broadcast = useBroadcastEvent()
  const { setShowCountdown } = useRoomDetail()

  const startGame = useMutation(
    ({ storage, self, others }) => {
      // Generate fresh shuffled cards
      const gameCards: Array<LiveObject<GameCard>> = createGameCards().map(
        (card) => new LiveObject(card)
      )

      const allPlayers = [self.id, ...others.map((other) => other.id)]
      const randomPlayerIndex = Math.floor(Math.random() * allPlayers.length)

      storage.set('state', GAME_STATES.IN_PROGRESS)

      // Might be configurable in the future
      storage.set('totalPairs', TOTAL_PAIRS)
      storage.set('totalPairsMatched', 0)
      storage.set('currentTurnPlayerId', allPlayers[randomPlayerIndex])
      storage.set('firstSelectedId', null)
      storage.set('secondSelectedId', null)
      storage.set('animatingMatchIds', [])
      storage.set('animatingErrorIds', [])
      storage.set('canSelect', true)
      storage.set('winningPlayerId', null)

      const playerStates = new LiveMap<string, LiveObject<PlayerScore>>()
      allPlayers.forEach((playerId) => {
        playerStates.set(
          playerId,
          new LiveObject<PlayerScore>({
            collectedPairIds: [],
            pairsCount: 0,
          })
        )
      })

      storage.set('playerStates', playerStates)
      storage.set('cards', new LiveList(gameCards))

      // Start countdown
      setShowCountdown(true)
      broadcast({ type: ROOM_EVENTS.GAME_STARTING })
    },
    [broadcast, setShowCountdown]
  )

  return startGame
}

// TODO: add finished overlay
// currently lobby state overlay is done
function PlayerOverlay() {
  const gameState = useStorage((root) => root.state)
  const winner = useGetWinner()

  if (gameState === GAME_STATES.LOBBY) {
    return (
      <Overlay
        title="Waiting for players..."
        description="Waiting for owner to start the game"
      />
    )
  }

  if (gameState === GAME_STATES.FINISHED && winner) {
    return (
      <Overlay
        title="Game Over!"
        description={`${winner.username} won with ${winner.score} pairs!`}
      />
    )
  }

  return null
}

// TODO: add finished overlay
// currently lobby state overlay is done
function OwnerOverlay() {
  const otherPlayers = useOthers((others) => others.length)
  const totalPlayers = otherPlayers + 1
  const isStartButtonDisabled = totalPlayers < MINIMUM_PLAYERS_TO_START

  const gameState = useStorage((root) => root.state)

  const winner = useGetWinner()

  const startGame = useStartGame()

  if (gameState === GAME_STATES.LOBBY) {
    return (
      <Overlay
        title="Waiting for players..."
        description="Minimum 2 players required to start"
        actions={
          <Button disabled={isStartButtonDisabled} onClick={startGame}>
            Start Game
          </Button>
        }
      />
    )
  }

  if (gameState === GAME_STATES.FINISHED && winner) {
    return (
      <Overlay
        title="Game Over!"
        description={`${winner.username} won with ${winner.score} pairs!`}
        actions={
          <Button disabled={isStartButtonDisabled} onClick={startGame}>
            Start New Game
          </Button>
        }
      />
    )
  }

  return null
}

function CursorPresence() {
  const others = useOthersMapped((other) => ({
    cursor: other.presence.cursor,
    username: other.info.username,
  }))

  return others.map(
    ([connectionId, presence]) =>
      presence.cursor && (
        <Cursor
          key={connectionId}
          x={presence.cursor.x}
          y={presence.cursor.y}
          username={presence.username}
          color={getColorByConnectionId(connectionId)}
        />
      )
  )
}

function getNextPlayerId(
  currentId: string,
  storage: LiveObject<{ playerStates: PlayerStates }>
) {
  // Get ordered list of players from storage
  const playerStates = storage.get('playerStates')
  const playerIds = Array.from(playerStates.keys())

  const currentIndex = playerIds.indexOf(currentId)
  const nextIndex = (currentIndex + 1) % playerIds.length

  return playerIds[nextIndex]
}

function RoomEvents() {
  const { toast } = useToast()
  const stopGame = useStopGame()

  const handleUserLeave = useMutation(
    ({ storage, others }, user: User) => {
      const remainingPlayers = others.filter(
        (other) => other.id !== user.id
      ).length

      const playerStates = storage.get('playerStates')
      playerStates.delete(user.id)

      // Move to next player if player leaving was current turn
      const wasCurrentTurn = storage.get('currentTurnPlayerId') === user.id

      if (wasCurrentTurn) {
        const nextPlayer = getNextPlayerId(user.id, storage)
        storage.set('currentTurnPlayerId', nextPlayer)
      }

      // Stop game is owner is alone
      // owner could do it themselves but why not help them
      if (remainingPlayers === 0) {
        toast({
          title: 'No players left, stopping game',
        })
        stopGame()
      }
    },
    [stopGame, toast]
  )

  useOthersListener(({ type, user }) => {
    if (!user?.info?.username) return

    if (type === 'enter') {
      toast({
        title: `${user.info.username} joined the game`,
      })
    }
    if (type === 'leave') {
      handleUserLeave(user)
    }
  })

  return null
}

function PlayerList() {
  const self = useSelf((me) => ({
    id: me.id,
    username: me.info.username,
    connectionId: me.connectionId,
  }))

  const gameState = useStorage((root) => root.state)

  const others = useOthersMapped((other) => ({
    username: other.info.username,
    id: other.id,
  }))

  const playerStates = useStorage((root) => root.playerStates)
  const currentTurnId = useStorage((root) => root.currentTurnPlayerId)
  const winningPlayerId = useStorage((root) => root.winningPlayerId)

  const allPlayers = useMemo(
    () => [
      {
        id: self.id,
        username: self.username,
        score: playerStates?.get(self.id)?.pairsCount ?? 0,
        isCurrentTurn: Boolean(currentTurnId && currentTurnId === self.id),
        isWinner: Boolean(winningPlayerId && winningPlayerId === self.id),
        color: getColorByConnectionId(self.connectionId),
        // if player state exists, all good!
        // if not, the only two cases they're allowed to not exist in case player hasn't played a game in the room yet
        // are LOBBY and FINISHED
        // FINISHED because a player might join a finished game to participate in the next game
        // FINISHED is just lobby state with a winner
        isInGame:
          playerStates.has(self.id) || gameState !== GAME_STATES.IN_PROGRESS,
      },
      ...others.map(([connectionId, { username, id }]) => ({
        id,
        username: username,
        score: playerStates?.get(id)?.pairsCount ?? 0,
        isCurrentTurn: Boolean(currentTurnId && currentTurnId === id),
        isWinner: Boolean(winningPlayerId && winningPlayerId === id),
        color: getColorByConnectionId(connectionId),
        isInGame: playerStates.has(id) || gameState !== GAME_STATES.IN_PROGRESS,
      })),
    ],
    [
      currentTurnId,
      gameState,
      others,
      playerStates,
      self.connectionId,
      self.id,
      self.username,
      winningPlayerId,
    ]
  )

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
