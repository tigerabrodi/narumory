export const COLORS = [
  // Red
  '#E57373',
  // Deep Purple
  '#9575CD',
  // Light Blue
  '#4FC3F7',
  // Light Green
  '#81C784',
  // Yellow
  '#FFF176',
  // Deep Orange
  '#FF8A65',
  // Pink
  '#F06292',
  // Indigo
  '#7986CB',
  // Teal
  '#009688',
  // Amber
  '#FFC107',
  // Blue Grey
  '#607D8B',
  // Cyan
  '#00BCD4',
  // Lime
  '#CDDC39',
  // Purple
  '#9C27B0',
  // Orange
  '#FF9800',
] as const

export const GAME_STATES = {
  LOBBY: 'LOBBY',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
} as const

export const MINIMUM_PLAYERS_TO_START = 2
