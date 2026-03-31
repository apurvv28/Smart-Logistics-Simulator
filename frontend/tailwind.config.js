/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070b15',
        neon: '#22d3ee',
        ember: '#f97316'
      }
    }
  },
  plugins: []
};
