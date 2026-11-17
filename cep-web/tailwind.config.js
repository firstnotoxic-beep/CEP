/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F5',
        card: '#FFFFFF',
        rule: '#E5E3DC',
        'rule-strong': '#C9C6BC',
        ink: '#141615',
        muted: '#5B5F59',
        faint: '#8D9089',
        rust: '#9A4A24',
        'rust-soft': '#F3E9E1',
        olive: '#55603A',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
