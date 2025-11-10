/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
          light: 'hsl(var(--primary-light))',
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
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // Legacy SmartMess colors for backward compatibility
        'SmartMess': {
          'light-bg': 'hsl(var(--background))',
          'light-surface': 'hsl(var(--card))',
          'light-primary': 'hsl(var(--primary))',
          'light-primary-light': 'hsl(var(--primary-light))',
          'light-primary-dark': 'hsl(var(--primary))',
          'light-darkest': 'hsl(var(--foreground))',
          'light-accent': 'hsl(var(--accent))',
          'light-text': 'hsl(var(--foreground))',
          'light-text-secondary': 'hsl(var(--muted-foreground))',
          'light-text-muted': 'hsl(var(--muted-foreground))',
          'light-border': 'hsl(var(--border))',
          'light-input-bg': 'hsl(var(--input))',
          'light-hover': 'hsl(var(--accent))',
          'light-success': '#10b981',
          'light-warning': '#f59e0b',
          'light-error': 'hsl(var(--destructive))',
          'light-info': '#3b82f6',
          'light-secondary': 'hsl(var(--secondary))',
          
          'dark-bg': 'hsl(var(--background))',
          'dark-surface': 'hsl(var(--card))',
          'dark-primary': 'hsl(var(--primary))',
          'dark-primary-light': 'hsl(var(--primary-light))',
          'dark-primary-dark': 'hsl(var(--primary))',
          'dark-accent': 'hsl(var(--accent))',
          'dark-text': 'hsl(var(--foreground))',
          'dark-text-secondary': 'hsl(var(--muted-foreground))',
          'dark-text-muted': 'hsl(var(--muted-foreground))',
          'dark-border': 'hsl(var(--border))',
          'dark-input-bg': 'hsl(var(--input))',
          'dark-hover': 'hsl(var(--accent))',
          'dark-success': '#34d399',
          'dark-warning': '#fbbf24',
          'dark-error': 'hsl(var(--destructive))',
          'dark-info': '#60a5fa',
          'dark-secondary': 'hsl(var(--secondary))',
          
          'primary': 'hsl(var(--primary))',
          'primary-light': 'hsl(var(--primary-light))',
          'primary-dark': 'hsl(var(--primary))',
          'accent': 'hsl(var(--accent))',
          'text': 'hsl(var(--foreground))',
          'text-secondary': 'hsl(var(--muted-foreground))',
          'text-muted': 'hsl(var(--muted-foreground))',
          'border': 'hsl(var(--border))',
          'input-bg': 'hsl(var(--input))',
          'hover': 'hsl(var(--accent))',
          'background': 'hsl(var(--background))',
          'surface': 'hsl(var(--card))',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 


