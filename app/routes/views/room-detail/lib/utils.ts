import type { LiveObject } from '@liveblocks/client'
import type { PlayerStates } from 'liveblocks.config'
import { COLORS } from './constants'

// BELOW FUNCTION IS NOT USED ANYMORE
// I had a lot of fun getting deep into a rabbithole of hashing and maintaining avalanche effect when getting index of an array
// Below is just for learning purposes
/**
 * Get a color from the COLORS array based on the key
 * We use a crypto hash to get a random index from the COLORS array
 * It's better than modulo operator since it's more random and has avalanche effect
 * Small changes in key results in VERY different hashes
 * @param key - The key to hash and use to get the color
 * @returns The color from the COLORS array
 */
export async function getColorByKeyAsync({
  key,
}: {
  key: string
}): Promise<string> {
  // Turn text into bytes
  // Turn into Uint8Array of bytes
  // Need because crypto functions work with raw bytes, not strings
  // unsigned 8-bit integers -> 0-255, only positive numbers
  const msgBuffer = new TextEncoder().encode(key) // Uint8Array [104, 101, 108, 108, 111]

  // Hash with SHA-256
  // Turns it into raw memory: ArrayBuffer
  // Hard to work with
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)

  // Turn into Uint8Array
  // We can work with it now
  // Uint8Array [232, 59, 176, ...]
  const hashAsUint8Array = new Uint8Array(hashBuffer)

  // Turn into array of numbers
  // [232, 59, 176, ...]
  const hashArray = Array.from(hashAsUint8Array)

  // toString(16) -> hex string
  // padStart(2, '0') -> ensure it's 2 characters long (because we need 2 hex digits per byte)
  // join('') -> turn into string
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  const HEX_RADIX = 16

  // Turn into number
  // parseInt(hashHex, HEX_RADIX) -> 23259176
  const colorIndex = parseInt(hashHex, HEX_RADIX) % COLORS.length

  return COLORS[colorIndex]
}

/**
 * Get a color from the COLORS array based on the id
 * @param id - The id to use to get the color
 * @returns The color from the COLORS array
 */
export function getColorByConnectionId(connectionId: number) {
  return COLORS[connectionId % COLORS.length]
}

export function getNextPlayerId({
  currentId,
  playerStates,
}: {
  currentId: string
  playerStates: PlayerStates
}) {
  // Get ordered list of players from storage
  const playerIds = Array.from(playerStates.keys())

  const currentIndex = playerIds.indexOf(currentId)
  const nextIndex = (currentIndex + 1) % playerIds.length

  return playerIds[nextIndex]
}

export function determineWinner({
  storage,
}: {
  storage: LiveObject<{ playerStates: PlayerStates }>
}) {
  const playerStates = storage.get('playerStates')
  let maxPairs = 0
  let winners: Array<string> = []

  playerStates.forEach((state, playerId) => {
    const pairs = state.get('pairsCount')
    if (pairs > maxPairs) {
      maxPairs = pairs
      winners = [playerId]
    } else if (pairs === maxPairs) {
      // Handle same score
      winners.push(playerId)
    }
  })

  // If a tie, pick random winner
  // If length is 1, this will just be the winner
  return winners[Math.floor(Math.random() * winners.length)]
}
