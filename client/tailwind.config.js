/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        background: '#F9FAFB',
        surface: '#FFFFFF',
        primary: '#3B82F6',
        secondary: '#F59E0B',
        accent: '#10B981',
        accentHover: '#18cc91',
        muted: '#6B7280',
        border: '#E5E7EB',
      },
      textColor: {
        primary: '#111827',
        secondary: '#374151',
        muted: '#6B7280',
      },
    },
  },

  plugins: [],
};

export default config;
