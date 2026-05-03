import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        space: ['var(--font-space-grotesk)', 'sans-serif'],
        orbitron: ['var(--font-syne)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aurora-gradient': 'linear-gradient(135deg, #7c3aed, #4f46e5, #06b6d4)',
        'aurora-border': 'conic-gradient(from 180deg at 50% 50%, #7c3aed, #4f46e5, #06b6d4, #7c3aed)',
        'amber-gradient': 'linear-gradient(135deg, #f59e0b, #ef4444)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // V4 Aurora Palette
        aurora: {
          violet: '#7c3aed',
          indigo: '#4f46e5',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          surface: '#0d0d14',
          deep: '#050508',
        },
        // Neon Palette
        neon: {
          cyan: '#06b6d4',
          magenta: '#d946ef',
          lime: '#84cc16',
          yellow: '#eab308',
        },
        // Legacy compatibility aliases
        cyber: {
          teal: '#06b6d4',
          blue: '#4f46e5',
          purple: '#7c3aed',
          pink: '#f43f5e',
        },
      },
      boxShadow: {
        'glow-violet': '0 0 15px rgba(124,58,237,0.2), 0 0 40px rgba(124,58,237,0.08)',
        'glow-indigo': '0 0 15px rgba(79,70,229,0.2), 0 0 40px rgba(79,70,229,0.08)',
        'glow-cyan': '0 0 15px rgba(6,182,212,0.2), 0 0 40px rgba(6,182,212,0.08)',
        'glow-amber': '0 0 15px rgba(245,158,11,0.2), 0 0 40px rgba(245,158,11,0.08)',
        'aurora': '0 0 30px rgba(124,58,237,0.1), 0 0 60px rgba(79,70,229,0.05)',
        // Neon Shadows
        'neon-cyan': '0 0 8px rgba(6, 182, 212, 0.25)',
        'neon-magenta': '0 0 8px rgba(217, 70, 239, 0.25)',
        'neon-lime': '0 0 8px rgba(132, 204, 22, 0.25)',
        'neon-yellow': '0 0 8px rgba(234, 179, 8, 0.25)',
        // Legacy aliases
        'neon-teal': '0 0 10px rgba(6,182,212,0.5), 0 0 20px rgba(6,182,212,0.3)',
        'neon-blue': '0 0 10px rgba(79,70,229,0.5), 0 0 20px rgba(79,70,229,0.3)',
        'neon-purple': '0 0 10px rgba(124,58,237,0.5), 0 0 20px rgba(124,58,237,0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'aurora-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% - 1.5rem))' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(calc(-100% - 1.5rem))' },
          '100%': { transform: 'translateX(0)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'aurora-pulse': 'aurora-pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'marquee': 'marquee 40s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
        'scan': 'scan 8s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
