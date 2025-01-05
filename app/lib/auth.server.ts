import {
  createCookieSessionStorage,
  generatePath,
  redirect,
  type SessionIdStorageStrategy,
} from 'react-router'
import { createTypedSessionStorage } from 'remix-utils/typed-session'
import { z } from 'zod'
import { ROUTES } from './constants'
import { prisma } from './db.server'
import { serverEnv } from './env.server'

const authCookie: SessionIdStorageStrategy['cookie'] = {
  name: '__session',
  secrets: [serverEnv.SESSION_SECRET],
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
  httpOnly: true,
  secure: serverEnv.NODE_ENV === 'production',
}

const cookieSchema = z.object({
  userId: z.string().optional(),
})

const sessionStorage = createCookieSessionStorage({ cookie: authCookie })

const typedAuthSessionStorage = createTypedSessionStorage({
  sessionStorage,
  schema: cookieSchema,
})

export async function requireAuth({ request }: { request: Request }) {
  const session = await typedAuthSessionStorage.getSession(
    request.headers.get('Cookie')
  )
  const userId = session.get('userId')

  if (!userId) {
    return redirect(generatePath(ROUTES.home))
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { room: true },
  })

  if (!user) {
    return redirect(generatePath(ROUTES.home))
  }

  return user
}

export async function getUserIdFromRequest({ request }: { request: Request }) {
  const session = await typedAuthSessionStorage.getSession(
    request.headers.get('Cookie')
  )
  const userId = session.get('userId')
  return userId ?? null
}

export async function logout({ request }: { request: Request }) {
  const session = await typedAuthSessionStorage.getSession(
    request.headers.get('Cookie')
  )

  return redirect('/', {
    headers: {
      'Set-Cookie': await typedAuthSessionStorage.destroySession(session),
    },
  })
}

export async function redirectAuthUserToRoom({ userId }: { userId: string }) {
  const userRoom = await prisma.room.findUnique({
    where: {
      ownerId: userId,
    },
  })

  // Should never happen
  // Users are always created with a room
  // just safety net
  if (!userRoom) {
    return redirect('/login')
  }

  return redirect(generatePath(ROUTES.roomDetail, { roomCode: userRoom.code }))
}

export { typedAuthSessionStorage }
