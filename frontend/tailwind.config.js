/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Brand Font ─────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // ── StockSense Brand Colors ─────────────────────────────
      colors: {
        // Primary — Green (main brand)
        primary: {
          DEFAULT: '#004c22',
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#10b981',
          500: '#004c22',  // ← main brand color
          600: '#003a1a',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Accent — Emerald (success, in-stock, positive)
        accent: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        // Warning — Amber (low stock alerts)
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Danger — Rose (out of stock, errors, delete)
        danger: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        // Surface — Neutral grays for backgrounds, cards, borders
        surface: {
          DEFAULT: '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          955: '#020617',
        },
        // New mockup material design tokens
        "secondary-fixed-dim": "#afceba",
        "surface-container-low": "#effaeb",
        "on-secondary-container": "#4e6b5a",
        "error-container": "#ffdad6",
        "secondary-container": "#caead6",
        "on-surface-variant": "#404940",
        "surface-container-highest": "#ccebc9",
        "on-tertiary": "#ffffff",
        "outline": "#707a6f",
        "tertiary-container": "#55585a",
        "background": "#ffffff",
        "inverse-surface": "#1e2e21",
        "on-tertiary-fixed-variant": "#444749",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#d8f0d5",
        "surface-container": "#e2f5e0",
        "on-tertiary-fixed": "#191c1e",
        "on-error": "#ffffff",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "error": "#ba1a1a",
        "primary-container": "#166534",
        "on-secondary-fixed-variant": "#314d3e",
        "secondary-fixed": "#caead6",
        "on-background": "#051f0b",
        "surface-dim": "#b8e6b3",
        "on-error-container": "#93000a",
        "outline-variant": "#bfc9bd",
        "inverse-on-surface": "#eef8eb",
        "tertiary": "#3d4143",
        "tertiary-fixed": "#e0e3e5",
        "on-primary-fixed": "#00210b",
        "tertiary-fixed-dim": "#c4c7c9",
        "inverse-primary": "#8bd79b",
        "on-surface": "#051f0b",
        "on-primary-container": "#93e0a2",
        "surface-variant": "#d8f0d5",
        "secondary": "#486554",
        "primary-fixed-dim": "#8bd79b",
        "on-primary-fixed-variant": "#005226",
        "on-tertiary-container": "#ccced0",
        "primary-fixed": "#a6f4b5",
        "on-secondary-fixed": "#042014",
        "surface-tint": "#1f6c3a",
        "surface-bright": "#f8f9ff",
      },

      // ── Custom Border Radius ────────────────────────────────
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      // ── Custom Box Shadows ──────────────────────────────────
      boxShadow: {
        'card':  '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        'glow-primary': '0 0 20px rgba(0,76,34,0.35)',
      },

      // ── Custom Screens (if needed for POS kiosk display) ────
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}