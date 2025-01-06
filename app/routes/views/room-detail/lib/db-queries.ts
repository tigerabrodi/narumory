import { prisma } from '~/lib/db.server'

export async function getRoomByRoomCode({ roomCode }: { roomCode: string }) {
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

export async function getRoomByOwnerId({ ownerId }: { ownerId: string }) {
  return prisma.room.findUnique({
    where: {
      ownerId,
    },
  })
}
