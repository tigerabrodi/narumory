type Props = {
  color: string
  username: string
  x: number
  y: number
}

export function Cursor({ color, username, x, y }: Props) {
  return (
    <div
      className="absolute left-0 top-0 z-10 flex items-center gap-x-2.5"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 15 22"
        className="w-5"
      >
        <path
          fill={color}
          stroke="#162137"
          strokeWidth={1.5}
          d="M6.937 15.03h-.222l-.165.158L1 20.5v-19l13 13.53H6.937Z"
        />
      </svg>
      <span
        className="rounded-full px-2 py-1.5 text-xs font-bold text-primary-foreground"
        style={{
          backgroundColor: color,
        }}
      >
        {username}
      </span>
    </div>
  )
}
