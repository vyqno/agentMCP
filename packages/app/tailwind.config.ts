import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        apple: {
          black: '#000000',
          white: '#ffffff',
          gray: '#f5f5f7',
          gray2: '#e8e8ed',
          text: '#1d1d1f',
          sub: '#6e6e73',
          blue: '#0071e3',
          bluehov: '#0077ed',
          green: '#34c759',
          red: '#ff3b30',
          yellow: '#ff9f0a',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        modal: '20px',
        pill: '980px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        hover: '0 8px 30px rgba(0,0,0,0.12)',
        modal: '0 20px 60px rgba(0,0,0,0.18)',
      },
      animation: {
        'pulse-dot': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
