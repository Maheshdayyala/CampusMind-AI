import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/components/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Satoshi', 'Inter', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        surface2: 'var(--color-surface-2)',
        offset: 'var(--color-surface-offset)',
        border: 'var(--color-border)',
        divider: 'var(--color-divider)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        faint: 'var(--color-text-faint)',
        inverse: 'var(--color-text-inverse)',
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-highlight': 'var(--color-primary-highlight)',
      },
      boxShadow: {
        'card': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'sm': 'var(--shadow-sm)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
