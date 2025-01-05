import type { Route } from '@rr-resources/+types/api.liveblocks'

export function loader({ request }: Route.LoaderArgs) {
  console.log('request', request)

  return null
}
