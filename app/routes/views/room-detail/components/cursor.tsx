import { useOthersMapped } from '@liveblocks/react/suspense'
import { CSS_VARS } from 'tailwind.config'
import { getColorByConnectionId } from '../lib/utils'

type Props = {
  color: string
  username: string
  x: number
  y: number
}

function Cursor({ color, username, x, y }: Props) {
  return (
    <div
      className="absolute left-0 top-0 z-10 flex items-center gap-x-2.5"
      style={
        {
          [CSS_VARS.cursor.x]: `${x}px`,
          [CSS_VARS.cursor.y]: `${y}px`,
          [CSS_VARS.cursor.fill]: color,
          transform: `translateX(var(${CSS_VARS.cursor.x})) translateY(var(${CSS_VARS.cursor.y}))`,
        } as React.CSSProperties
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 15 22"
        className="w-5 drop-shadow-cursor"
      >
        <path
          className="fill-cursor-fill stroke-cursor-stroke"
          strokeWidth={1.5}
          d="M6.937 15.03h-.222l-.165.158L1 20.5v-19l13 13.53H6.937Z"
        />
      </svg>
      <span className="rounded-full bg-cursor-badge px-1.5 py-1 text-xs font-bold text-cursor-stroke">
        {username}
      </span>
    </div>
  )
}

export function CursorPresence() {
  const others = useOthersMapped((other) => ({
    cursor: other.presence.cursor,
    username: other.info.username,
  }))

  return others.map(
    ([connectionId, presence]) =>
      presence.cursor && (
        <Cursor
          key={connectionId}
          x={presence.cursor.x}
          y={presence.cursor.y}
          username={presence.username}
          color={getColorByConnectionId(connectionId)}
        />
      )
  )
}
