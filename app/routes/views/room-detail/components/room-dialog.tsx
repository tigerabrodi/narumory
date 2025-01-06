import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface RoomDialogProps {
  disabled?: boolean
}

export function RoomDialog({ disabled }: RoomDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          Go to Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input id="roomCode" placeholder="Enter room code..." />
          </div>
          <Button className="w-full bg-[#FF6B00] hover:bg-[#FF8533]">
            Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
