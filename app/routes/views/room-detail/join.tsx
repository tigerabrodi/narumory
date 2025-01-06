import { useNavigate } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

export default function Join() {
  const navigation = useNavigate()

  return (
    <Dialog open onOpenChange={() => void navigation('..')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input id="roomCode" placeholder="Enter room code..." />
          </div>
          <Button>Join Room</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
