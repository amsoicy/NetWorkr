import type { Config } from "tailwindcss";
import daisyui from "daisyui"

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        "customblack": {
          'primary': '#ffffff',
          'primary-focus': '#ffffff',
          'primary-content': '#000000',

          'secondary': '#ffffff',
          'secondary-focus': '#ffffff',
          'secondary-content': '#000000',

          'accent': '#ffffff',
          'accent-focus': '#ffffff',
          'accent-content': '#000000',

          'neutral': '#333333',
          'neutral-focus': '#4d4d4d',
          'neutral-content': '#ffffff',

          'base-100': '#1a1a1a',
          'base-200': '#333333',
          'base-300': '#4d4d4d',
          'base-content': '#ffffff',

          'info': '#0000ff',
          'success': '#008000',
          'warning': '#ffff00',
          'error': '#ff0000',

          '--rounded-box': '0',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1rem',

          '--animation-btn': '.25s',
          '--animation-input': '.2s',

          '--btn-text-case': 'uppercase',
          '--navbar-padding': '.5rem',
          '--border-btn': '1px',
        }
      }
    ]
  }
} satisfies Config;
