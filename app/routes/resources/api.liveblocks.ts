import { Liveblocks } from '@liveblocks/node'
import type { Route } from '@rr-resources/+types/api.liveblocks'
import { data } from 'react-router'
import { z } from 'zod'
import { requireAuth } from '~/lib/auth.server'
import { serverEnv } from '~/lib/env.server'

const liveblocks = new Liveblocks({
  secret: serverEnv.LIVEBLOCKS_SECRET_KEY,
})

const jsonSchema = z.object({
  room: z.string(),
})

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth({ request })

  if (!user || user instanceof Response) return

  const json = jsonSchema.safeParse(await request.json())

  if (!json.success) throw data('Invalid request', { status: 400 })

  const { room: roomCode } = json.data

  // Create Liveblocks session
  const session = liveblocks.prepareSession(user.email, {
    userInfo: {
      username: user.username,
      email: user.email,
    },
  })

  // Give access to requested room
  session.allow(roomCode, session.FULL_ACCESS)

  const { body, status } = await session.authorize()
  return new Response(body, { status })
}
