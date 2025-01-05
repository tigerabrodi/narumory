import type { Prisma } from '@prisma/client-generated'
import { prisma } from '~/lib/db.server'
import { PasswordService } from '~/lib/password-service.server.'
import { generateUniqueRoomCode } from '~/lib/room.server'

export async function getUserByEmailOrUsername({
  email,
  username,
}: {
  email: string
  username: string
}) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  })

  return { existingUser }
}

export async function createUser({
  username,
  email,
  password,
}: {
  username: string
  email: string
  password: string
}) {
  const { hash, salt } = await PasswordService.hashPassword(password)

  const roomCode = await generateUniqueRoomCode(prisma)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: {
        create: {
          hash,
          salt,
        },
      },
      room: {
        create: {
          name: `${username}'s room`,
          code: roomCode,
        },
      },
    },
    include: {
      room: true,
    },
  })

  return { user }
}

export async function getUserByEmail({
  email,
  include,
}: {
  email: string
  include: Prisma.UserInclude
}) {
  const user = await prisma.user.findUnique({
    where: { email },
    include,
  })

  return { user }
}
