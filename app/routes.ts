import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Landing page with auth tabs
  index("routes/views/home/index.tsx"),    

  // Game room with dynamic roomId
  route("rooms/:roomId", "routes/views/room-detail/index.tsx"),

  // Liveblocks auth endpoint
  route("api/liveblocks/auth", "routes/resources/api.liveblocks.ts")
] satisfies RouteConfig;