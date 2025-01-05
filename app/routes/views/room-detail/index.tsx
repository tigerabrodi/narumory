
import type { Route } from "@rr-views/room-detail/+types/index";

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_VERCEL };
}


export default function RoomDetail() {
  return <div>RoomDetail</div>;
}
