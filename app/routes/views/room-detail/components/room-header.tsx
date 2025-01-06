import { Copy } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useToast } from '~/hooks/use-toast'
import { useRoomDetail } from '../lib/context'

type RoomHeaderProps = {
  actions?: React.ReactNode // For flexible right-side actions
}

export function RoomHeader({ actions }: RoomHeaderProps) {
  const { toast } = useToast()
  const { roomData } = useRoomDetail()

  const copyRoomCode = () => {
    void navigator.clipboard.writeText(roomData.roomCode ?? '')

    toast({
      title: 'Room code copied to clipboard!',
    })
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{roomData.roomName}</h1>
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
