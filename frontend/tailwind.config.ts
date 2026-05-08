import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'warm-white': '#FDFCFB',
        'soft-teal': '#E0F2F1',
        'brand-teal': '#008080',
      },
      boxShadow: {
        'glass': '0 4px 6px -1px rgba(0, 128, 128, 0.1), 0 2px 4px -1px rgba(0, 128, 128, 0.06)',
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'mono': ['Courier New', 'monospace'],
      },
    },
  },
} satisfies Config
