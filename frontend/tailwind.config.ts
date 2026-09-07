import type { Config } from 'tailwindcss';

/**
 * Every colour, radius, shadow and duration resolves to a CSS variable declared
 * in `src/styles/tokens.css`, so light/dark mode and future theming never
 * require touching component code.
 *
 * The `resume-*` scale is deliberately separate: resume output must stay
 * print-white and physically sized regardless of the app theme.
 */
/** Resolve a token to `rgb(<channels> / <alpha>)` so opacity modifiers work. */
const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: token('--color-background'),
        surface: token('--color-surface'),
        'surface-raised': token('--color-surface-raised'),
        'surface-sunken': token('--color-surface-sunken'),
        foreground: token('--color-foreground'),
        muted: token('--color-muted'),
        'muted-foreground': token('--color-muted-foreground'),
        border: token('--color-border'),
        'border-strong': token('--color-border-strong'),
        ring: token('--color-ring'),
        primary: {
          DEFAULT: token('--color-primary'),
          foreground: token('--color-primary-foreground'),
          hover: token('--color-primary-hover'),
          subtle: token('--color-primary-subtle'),
        },
        accent: {
          DEFAULT: token('--color-accent'),
          foreground: token('--color-accent-foreground'),
          subtle: token('--color-accent-subtle'),
          strong: token('--color-accent-strong'),
        },
        success: {
          DEFAULT: token('--color-success'),
          subtle: token('--color-success-subtle'),
          foreground: token('--color-success-foreground'),
        },
        warning: {
          DEFAULT: token('--color-warning'),
          subtle: token('--color-warning-subtle'),
          foreground: token('--color-warning-foreground'),
        },
        danger: {
          DEFAULT: token('--color-danger'),
          subtle: token('--color-danger-subtle'),
          foreground: token('--color-danger-foreground'),
        },
        info: {
          DEFAULT: token('--color-info'),
          subtle: token('--color-info-subtle'),
          foreground: token('--color-info-foreground'),
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        ring: 'var(--shadow-ring)',
        none: 'none',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
        serif: 'var(--font-serif)',
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.9375rem', { lineHeight: '1.5rem' }],
        lg: ['1.0625rem', { lineHeight: '1.625rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.375rem', { lineHeight: '2.625rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '3.125rem', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '3.75rem', letterSpacing: '-0.035em' }],
        '7xl': ['4.5rem', { lineHeight: '4.5rem', letterSpacing: '-0.04em' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '9.5': '2.375rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '112': '28rem',
        '128': '32rem',
        '156': '39rem',
      },
      maxWidth: {
        prose: '68ch',
        content: '1200px',
        wide: '1400px',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        drawer: 'var(--z-drawer)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        toast: 'var(--z-toast)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-base)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        out: 'var(--ease-out)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in var(--duration-base) var(--ease-out) both',
        'fade-up': 'fade-up var(--duration-slow) var(--ease-spring) both',
        'scale-in': 'scale-in var(--duration-base) var(--ease-spring) both',
        'slide-in-right': 'slide-in-right var(--duration-slow) var(--ease-spring) both',
        'slide-in-bottom': 'slide-in-bottom var(--duration-slow) var(--ease-spring) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 2s var(--ease-out) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
