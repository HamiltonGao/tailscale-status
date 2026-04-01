import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        h1: ['28px / 34px', { fontWeight: '600' }],
        h2: ['20px / 28px', { fontWeight: '600' }],
        h3: ['16px / 24px', { fontWeight: '500' }],
        h4: ['14px / 20px', { fontWeight: '500' }],
        body: ['14px / 20px', { fontWeight: '400' }],
        small: ['12px / 16px', { fontWeight: '400' }],
        tiny: ['11px / 14px', { fontWeight: '500' }],
      },
      colors: {
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          default: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.15)',
        },
        background: {
          base: '#09090b',
          surface: '#121214',
          elevated: '#1a1a1e',
          input: '#1e1e22',
          hover: '#252529',
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.95)',
          secondary: 'rgba(255, 255, 255, 0.70)',
          tertiary: 'rgba(255, 255, 255, 0.50)',
          disabled: 'rgba(255, 255, 255, 0.30)',
        },
        status: {
          online: '#22c55e',
          offline: '#ef4444',
          unknown: '#6b7280',
          direct: '#22c55e',
          derp: '#f59e0b',
          peerRelay: '#8b5cf6',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 4px 12px rgba(0, 0, 0, 0.25)',
        floating: '0 8px 24px rgba(0, 0, 0, 0.4)',
        'glow-primary': '0 0 20px rgba(45, 212, 191, 0.15)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.15)',
      },
      animationDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
