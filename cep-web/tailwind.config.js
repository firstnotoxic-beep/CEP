/** @type {import('tailwindcss').Config} */
// White + green palette, all neutrals derived from the same green hue.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F7F5', // tinted panel inside a white card
        card: '#FFFFFF',
        rule: '#E1E8E3',
        'rule-strong': '#C7D2CA',
        ink: '#142019',
        muted: '#4E5D54',
        faint: '#87948C',
        accent: '#17694A', // the one green: emphasis, links, active states
        'accent-soft': '#E7F1EB',
        olive: '#5E7A52', // shell / soil-repair branch
        warn: '#A8492A', // only for "wrong method" and Na⁺
        'warn-soft': '#F6E9E3',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
