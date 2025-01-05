import type { Route } from '@rr-views/auth/+types/root'
import { generatePath, Link, Outlet, redirect, useLocation } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { getUserIdFromRequest } from '~/lib/auth.server'
import { ROUTES } from '~/lib/constants'
import { prisma } from '~/lib/db.server'

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserIdFromRequest(request)
  const path = new URL(request.url).pathname
  const isOnLoginPage = path === '/login'
  const isOnRegisterPage = path === '/register'

  if (!userId && !isOnLoginPage && !isOnRegisterPage) return redirect('/login')
  if (!userId) return null

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

export default function AuthPage() {
  const location = useLocation()
  const value = location.pathname === '/login' ? 'login' : 'register'

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-center text-2xl">
            Naruto Memory Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={value} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger asChild value="login">
                <Link to={generatePath(ROUTES.login)} prefetch="render">
                  Login
                </Link>
              </TabsTrigger>
              <TabsTrigger asChild value="register">
                <Link to={generatePath(ROUTES.register)} prefetch="render">
                  Register
                </Link>
              </TabsTrigger>
            </TabsList>

            <Outlet />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
