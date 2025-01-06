import { prisma } from '~/lib/db.server'

export async function getRoomWithOwner({ roomCode }: { roomCode: string }) {
  return prisma.room.findUnique({
    where: {
      code: roomCode,
    },
    select: {
      code: true,
      name: true,
      owner: {
        select: {
          email: true,
        },
      },
    },
  })
}
