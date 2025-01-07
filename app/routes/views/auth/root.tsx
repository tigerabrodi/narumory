import type { Route } from '@rr-views/auth/+types/root'
import { generatePath, Link, Outlet, redirect, useLocation } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { getUserIdFromRequest, redirectAuthUserToRoom } from '~/lib/auth.server'
import { ROUTES } from '~/lib/constants'
import { TAB_VALUES } from './lib/constants'

export function meta() {
  return [
    { title: 'Narumory - Naruto Memory Game' },
    {
      name: 'description',
      content:
        'Challenge your memory with Naruto characters in this multiplayer memory game. Join rooms and play with friends!',
    },
    {
      name: 'keywords',
      content:
        'naruto, memory game, multiplayer game, anime games, ninja games, browser game, card matching',
    },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Narumory - Naruto Memory Game' },
    {
      property: 'og:description',
      content:
        'Challenge your memory with Naruto characters in this multiplayer memory game. Join rooms and play with friends!',
    },
    { property: 'og:image', content: '/assets/meta.png' },
    { property: 'og:url', content: 'https://narumory.com' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Narumory - Naruto Memory Game' },
    {
      name: 'twitter:description',
      content:
        'Challenge your memory with Naruto characters in this multiplayer memory game. Join rooms and play with friends!',
    },
    { name: 'twitter:image', content: '/assets/meta.png' },

    // Additional meta tags for better SEO
    { name: 'theme-color', content: '#FF8C00' }, // A Naruto-themed orange color
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserIdFromRequest({ request })
  const path = new URL(request.url).pathname
  const isOnLoginPage = path === ROUTES.login
  const isOnRegisterPage = path === ROUTES.register

  if (!userId && !isOnLoginPage && !isOnRegisterPage)
    return redirect(generatePath(ROUTES.login))

  if (!userId) return null

  return redirectAuthUserToRoom({ userId })
}

export default function AuthPage() {
  const location = useLocation()
  const value =
    location.pathname === '/login' ? TAB_VALUES.LOGIN : TAB_VALUES.REGISTER

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-center font-ninja text-2xl text-primary">
            Narumory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={value} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger asChild value="login">
                <Link to={generatePath(ROUTES.login)} prefetch="intent">
                  Login
                </Link>
              </TabsTrigger>
              <TabsTrigger asChild value="register">
                <Link to={generatePath(ROUTES.register)} prefetch="intent">
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
