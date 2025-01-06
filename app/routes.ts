import { type RouteConfig, route } from '@react-router/dev/routes'

export default [
  // Landing page with auth tabs
  route('/', 'routes/views/auth/root.tsx', [
    route('login', 'routes/views/auth/login.tsx'),
    route('register', 'routes/views/auth/register.tsx'),
  ]),

  // Rooms
  route('rooms/:roomCode', 'routes/views/room-detail/room.tsx', [
    route('join', 'routes/views/room-detail/join.tsx'),
    route('leave', 'routes/views/room-detail/leave.tsx'),
  ]),

  // API
  route('api/liveblocks/auth', 'routes/resources/api.liveblocks.ts'),
] satisfies RouteConfig
