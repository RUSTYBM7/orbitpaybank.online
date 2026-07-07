/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // OrbitPay Brand Colors (from design tokens)
      colors: {
        // Primary Navy Blue Palette
        orbit: {
          900: '#06152B',
          800: '#0A1F44',
          700: '#0E2B5E',
          600: '#123878',
          500: '#164592',
          400: '#3A6AB5',
          300: '#6E94D0',
          200: '#A2BEE5',
          100: '#D6E4F5',
          50: '#EFF4FB',
        },
        // Accent Blue
        accent: {
          600: '#3570C0',
          500: '#4A90E2',
          400: '#6BA5E7',
          300: '#8CBAEC',
        },
        // Neutral Grays
        neutral: {
          900: '#0F1115',
          800: '#1A1D24',
          700: '#2A2E3A',
          600: '#3E4450',
          500: '#5A6070',
          400: '#7A8295',
          300: '#A0A8B8',
          200: '#C8CDD6',
          100: '#E4E7EC',
          50: '#F5F6F8',
          0: '#FFFFFF',
        },
        // Semantic Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Surface Colors
        surface: {
          dark: '#0A1F44',
          // Bright palette — used by the redesigned landing/home screens.
          // Inspired by the OrbitPay 2025 brand template (green-glass +
          // yellow gradient accents).
          mint: {
            50: '#F2FBF4',
            100: '#E1F6E5',
            200: '#C2ECC8',
            300: '#94DCA0',
            400: '#5DC370',
            500: '#38A84D',
            600: '#26863B',
            700: '#1F6A30',
            800: '#1B5528',
            900: '#174521',
          },
          lime: {
            50: '#FBFFE3',
            100: '#F7FFC2',
            200: '#EEFF8C',
            300: '#E1FF47',
            400: '#D5FA1E',
            500: '#C2E600',
            600: '#9CB800',
            700: '#778B02',
            800: '#5F6F08',
            900: '#4F5B0B',
          },
          butter: {
            50: '#FFFDE8',
            100: '#FFFAB6',
            200: '#FFF578',
            300: '#FFEF3A',
            400: '#FFE500',
            500: '#E6C900',
            600: '#B89D00',
            700: '#8C7600',
            800: '#6B5A00',
            900: '#524500',
          },
          light: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#F8FAFC',
        },
        // Legacy support with HSL variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      // OrbitPay Border Radius (from design tokens)
      borderRadius: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      // OrbitPay Shadows (from design tokens)
      boxShadow: {
        'orbit-sm': '0 1px 2px rgba(10, 31, 68, 0.05)',
        'orbit-md': '0 4px 12px rgba(10, 31, 68, 0.08)',
        'orbit-lg': '0 8px 24px rgba(10, 31, 68, 0.12)',
        'orbit-xl': '0 16px 48px rgba(10, 31, 68, 0.16)',
        'orbit-glow': '0 0 24px rgba(74, 144, 226, 0.24)',
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      // OrbitPay Font Family
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter Display', 'Inter', 'sans-serif'],
      },
      // Spacing Scale (from design tokens - 4px unit)
      spacing: {
        'orbit-0': '0px',
        'orbit-1': '4px',
        'orbit-2': '8px',
        'orbit-3': '12px',
        'orbit-4': '16px',
        'orbit-5': '20px',
        'orbit-6': '24px',
        'orbit-8': '32px',
        'orbit-10': '40px',
        'orbit-12': '48px',
        'orbit-16': '64px',
        'orbit-20': '80px',
        'orbit-24': '96px',
        'orbit-32': '128px',
      },
      // Animation Keyframes
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "orbit-float": {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "orbit-pulse": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        "orbit-shimmer": {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        "marquee": {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "orbit-float": "orbit-float 6s ease-in-out infinite",
        "orbit-pulse": "orbit-pulse 2s ease-in-out infinite",
        "orbit-shimmer": "orbit-shimmer 2s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
      },
      // Typography Scale (from design tokens)
      fontSize: {
        'hero': ['64px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h1': ['48px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h3': ['28px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['22px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h5': ['18px', { lineHeight: '1.35', letterSpacing: '0', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'label': ['11px', { lineHeight: '1.3', letterSpacing: '0.04em', fontWeight: '600' }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
