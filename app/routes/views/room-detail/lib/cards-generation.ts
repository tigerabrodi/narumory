import type { GameCard } from 'liveblocks.config'
import image1 from '~/assets/images/image-1.png'
import image10 from '~/assets/images/image-10.png'
import image11 from '~/assets/images/image-11.png'
import image12 from '~/assets/images/image-12.png'
import image13 from '~/assets/images/image-13.png'
import image14 from '~/assets/images/image-14.png'
import image15 from '~/assets/images/image-15.png'
import image16 from '~/assets/images/image-16.png'
import image17 from '~/assets/images/image-17.png'
import image18 from '~/assets/images/image-18.png'
import image19 from '~/assets/images/image-19.png'
import image2 from '~/assets/images/image-2.png'
import image20 from '~/assets/images/image-20.png'
import image21 from '~/assets/images/image-21.png'
import image22 from '~/assets/images/image-22.png'
import image23 from '~/assets/images/image-23.png'
import image24 from '~/assets/images/image-24.png'
import image25 from '~/assets/images/image-25.png'
import image26 from '~/assets/images/image-26.png'
import image27 from '~/assets/images/image-27.png'
import image28 from '~/assets/images/image-28.png'
import image29 from '~/assets/images/image-29.png'
import image3 from '~/assets/images/image-3.png'
import image30 from '~/assets/images/image-30.png'
import image31 from '~/assets/images/image-31.png'
import image32 from '~/assets/images/image-32.png'
import image4 from '~/assets/images/image-4.png'
import image5 from '~/assets/images/image-5.png'
import image6 from '~/assets/images/image-6.png'
import image7 from '~/assets/images/image-7.png'
import image8 from '~/assets/images/image-8.png'
import image9 from '~/assets/images/image-9.png'

const CARD_IMAGES = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
  image17,
  image18,
  image19,
  image20,
  image21,
  image22,
  image23,
  image24,
  image25,
  image26,
  image27,
  image28,
  image29,
  image30,
  image31,
  image32,
] as const

type CardDefinition = {
  pairId: number
  image: string
}

const CARD_DEFINITIONS: Array<CardDefinition> = CARD_IMAGES.map(
  (image, index) => ({
    pairId: index + 1,
    image,
  })
)

// Fisher-Yates shuffle
function shuffleCards<T>(array: Array<T>): Array<T> {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function createGameCards(): Array<GameCard> {
  // Create two cards for each definition
  const cards = CARD_DEFINITIONS.flatMap((def) => [
    {
      id: crypto.randomUUID(),
      pairId: def.pairId,
      image: def.image,
      isMatched: false,
    } satisfies GameCard,
    {
      id: crypto.randomUUID(),
      pairId: def.pairId,
      image: def.image,
      isMatched: false,
    } satisfies GameCard,
  ])

  return shuffleCards(cards)
}
