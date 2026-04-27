/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070b15',
        neon: '#22d3ee',
        ember: '#f97316',
        // LogiCore Design System
        'logi-red': '#C0392B',
        'logi-red-deep': '#922B21',
        'logi-gold': '#D4AC0D',
        'logi-navy': '#0D1B2A',
        'logi-charcoal': '#1C2833',
        'logi-off-white': '#F5F5F0',
        'logi-card-border': '#E8E0D5'
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
