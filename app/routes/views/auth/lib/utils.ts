import type { PrismaClient } from '@prisma/client-generated'

export async function generateUniqueRoomCode(
  prisma: PrismaClient
): Promise<string> {
  const MAX_ATTEMPTS = 5

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const words = ['LEAF', 'WIND', 'FIRE', 'SAND', 'MIST', 'RAIN']

    const word = words[Math.floor(Math.random() * words.length)]

    const group1 = Math.floor(100 + Math.random() * 900)
    const group2 = Math.floor(100 + Math.random() * 900)

    const code = `${word}-${group1}-${group2}` // LEAF-123-456

    // eslint-disable-next-line no-await-in-loop
    const room = await prisma.room.findUnique({
      where: { code },
    })

    if (!room) return code
  }

  throw new Error('Failed to generate unique room code, please try again.')
}
