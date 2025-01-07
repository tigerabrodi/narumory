import { useStorage } from '@liveblocks/react/suspense'
import { Copy } from 'lucide-react'
import { generatePath, Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useToast } from '~/hooks/use-toast'
import { ROUTES } from '~/lib/constants'
import { useStopGame } from '../hooks/stop-game'
import { GAME_STATES } from '../lib/constants'
import { useRoomDetail } from '../lib/room-context'

type RoomHeaderProps = {
  actions?: React.ReactNode // For flexible right-side actions
}

export function RoomHeader({ actions }: RoomHeaderProps) {
  const { toast } = useToast()
  const { roomData } = useRoomDetail()

  const copyRoomCode = () => {
    void navigator.clipboard.writeText(roomData.roomCode)

    toast({
      title: 'Room code copied to clipboard!',
    })
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="font-ninja text-2xl">{roomData.roomName}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input value={roomData.roomCode} readOnly className="w-32" />
          <Button variant="outline" size="icon" onClick={copyRoomCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        {actions}
      </div>
    </div>
  )
}

export function OwnerHeader() {
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

export function PlayerHeader() {
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
