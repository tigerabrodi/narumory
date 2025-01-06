import { generatePath, Link, useNavigate } from 'react-router'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { ROUTES } from '~/lib/constants'
import { useRoomDetail } from './lib/room-context'

export default function Leave() {
  const { roomData } = useRoomDetail()

  const navigate = useNavigate()

  return (
    <Dialog
      open
      onOpenChange={() =>
        void navigate(
          generatePath(ROUTES.roomDetail, { roomCode: roomData.roomCode })
        )
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to leave the room?</DialogTitle>
          <DialogDescription>
            You can not join a room once the game has started.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex items-center gap-4">
          <Button variant="outline" asChild className="ml-auto">
            <Link
              to={generatePath(ROUTES.roomDetail, {
                roomCode: roomData.roomCode,
              })}
            >
              Cancel
            </Link>
          </Button>
          <Button variant="destructive" asChild>
            <Link
              to={generatePath(ROUTES.roomDetail, {
                roomCode: roomData.myRoomCode,
              })}
            >
              Leave room
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
