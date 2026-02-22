/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stainless Steel Rat sci-fi palette
        void:     '#050d1a',
        deck:     '#0a1628',
        hull:     '#0d1e35',
        plate:    '#162840',
        steel:    '#1e3550',
        // Accents
        matrix:   '#00ff88',
        cyber:    '#00d4ff',
        amber:    '#ff8c00',
        plasma:   '#ff3366',
        pulse:    '#8888ff',
        // Text
        mist:     '#c8d8e8',
        dim:      '#6a8aaa',
        ghost:    '#3a5570',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', 'monospace'],
        ui:   ['"Inter"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        matrix:  '0 0 8px #00ff8866, 0 0 20px #00ff8822',
        cyber:   '0 0 8px #00d4ff66, 0 0 20px #00d4ff22',
        amber:   '0 0 8px #ff8c0066, 0 0 20px #ff8c0022',
        plasma:  '0 0 8px #ff336666, 0 0 20px #ff336622',
        pulse:   '0 0 8px #8888ff66, 0 0 20px #8888ff22',
        card:    '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      animation: {
        'blink':      'blink 1.2s step-end infinite',
        'scanline':   'scanline 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'typewriter': 'typewriter 0.5s steps(20) forwards',
        'radar':      'radar 3s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', filter: 'brightness(1)' },
          '50%':       { opacity: '1',   filter: 'brightness(1.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-4px)' },
        },
        radar: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        'scanlines':    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
