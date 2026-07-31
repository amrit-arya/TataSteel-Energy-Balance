/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: {
          DEFAULT: '#141B2D',
          hover: '#1E293B',
          border: '#1E293D',
        },
        sidebar: '#0F172A',
        card: '#131C31',
        primary: {
          DEFAULT: '#3B82F6', // Blue
          hover: '#2563EB',
        },
        gas: {
          bf: '#3B82F6', // BF Gas Blue
          co: '#10B981', // CO Gas Emerald
          ld: '#F59E0B', // LD Gas Amber
        },
        industrial: {
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
