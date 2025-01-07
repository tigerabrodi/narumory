import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import plugin from 'tailwindcss/plugin'

export const CSS_VARS = {
  cursor: {
    x: '--cursor-x',
    y: '--cursor-y',
    fill: '--cursor-fill',
  },
} as const

export default {
  darkMode: ['class'],
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'match-card': {
          '0%': {
            boxShadow: '0 0 0 rgba(34, 197, 94, 0)',
            transform: 'scale(1)',
          },
          '25%': {
            boxShadow: '0 0 12px rgba(34, 197, 94, 0.7)',
            transform: 'scale(1.02)',
          },
          '50%': {
            boxShadow: '0 0 5px rgba(34, 197, 94, 0.3)',
            transform: 'scale(1)',
          },
          '75%': {
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
            transform: 'scale(1.01)',
          },
          '100%': {
            boxShadow: '0 0 0 rgba(34, 197, 94, 0)',
            transform: 'scale(1)',
          },
        },
        'error-card': {
          '0%, 100%': {
            transform: 'translateX(0)',
            boxShadow: '0 0 0 rgba(239, 68, 68, 0)',
          },
          '20%': {
            transform: 'translateX(-5px)',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
          },
          '40%': {
            transform: 'translateX(5px)',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
          },
          '60%': {
            transform: 'translateX(-5px)',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
          },
          '80%': {
            transform: 'translateX(3px)',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)',
          },
        },
      },
      fontFamily: {
        ninja: ['Ninja', 'sans-serif'], // custom ninja font
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      dropShadow: {
        cursor: '0 0 1px var(--cursor-fill)',
      },
      colors: {
        cursor: {
          stroke: 'hsl(var(--cursor))', // Fixed dark blue
          fill: `var(${CSS_VARS.cursor.fill})`, // Dynamic user color
          badge: `var(${CSS_VARS.cursor.fill})`,
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },

      animation: {
        'match-card': 'match-card 0.75s ease-in-out',
        'error-card': 'error-card 0.75s ease-in-out',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    // Not sure why this happens
    // annoying
    // See https://typescript-eslint.io/rules/unbound-method/
    // i tried this: void and arrow function
    // still doesn't work
    // eslint-disable-next-line @typescript-eslint/unbound-method
    plugin(({ addUtilities }) => {
      addUtilities({
        '.transform-style-preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
      })
    }),
  ],
} satisfies Config
