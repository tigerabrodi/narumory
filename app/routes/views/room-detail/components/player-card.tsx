import { Trophy } from 'lucide-react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Card } from '~/components/ui/card'
import { cn } from '~/lib/utils'
import type { COLORS } from '../lib/constants'

type PlayerCardProps = {
  username: string
  score: number
  isCurrentTurn: boolean
  isWinner: boolean
  color: (typeof COLORS)[number]
}

export function PlayerCard({
  username,
  score,
  isCurrentTurn,
  isWinner,
  color,
}: PlayerCardProps) {
  const initials = username
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card
      className={cn('flex items-center gap-4 p-4', {
        'bg-primary/10': isCurrentTurn,
      })}
    >
      <Avatar className="ring-2 ring-green-500">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-ninja text-base" style={{ color }}>
          {username}
        </p>
        <p className="text-sm text-muted-foreground">Pairs: {score}</p>
      </div>

      {isWinner && <Trophy className="ml-auto size-8 text-yellow-500" />}
    </Card>
  )
}
