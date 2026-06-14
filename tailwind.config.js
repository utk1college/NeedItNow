/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:  '#FF9900',
          dark:    '#1A1A2E',
          navy:    '#16213E',
          blue:    '#0F3460',
          aiblue:  '#E8F4FF',
          surface: '#F7F8FC',
        },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Syne"', '"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-hero':    'linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)',
        'brand-orange':  'linear-gradient(135deg, #FF9900 0%, #FF6B00 100%)',
        'brand-ai':      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'brand-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'brand-red':     'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
        'brand-missions':'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      },
      boxShadow: {
        'card':    '0 2px 12px rgba(0,0,0,0.06)',
        'card-md': '0 4px 20px rgba(0,0,0,0.10)',
        'orange':  '0 4px 20px rgba(255,153,0,0.30)',
        'navy':    '0 4px 20px rgba(26,26,46,0.25)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'scale-in':   'scaleIn 0.3s ease-out',
        'pulse-red':  'pulseRed 1.5s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.8)' },
          to:   { opacity: 1, transform: 'scale(1)' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(220,38,38,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
