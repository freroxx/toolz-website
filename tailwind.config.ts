import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Google Sans Text", "Roboto Flex", "system-ui", "sans-serif"],
        display: ["Google Sans Display", "Roboto Flex", "sans-serif"],
        google: ["Google Sans", "sans-serif"],
      },
      colors: {
        /* Shadcn bridge tokens */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          container: "hsl(var(--md-primary-container))",
          "on-container": "hsl(var(--md-on-primary-container))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          container: "hsl(var(--md-secondary-container))",
          "on-container": "hsl(var(--md-on-secondary-container))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--md-tertiary))",
          container: "hsl(var(--md-tertiary-container))",
          "on-container": "hsl(var(--md-on-tertiary-container))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        /* M3 surface tokens */
        surface: {
          DEFAULT: "hsl(var(--md-surface))",
          dim: "hsl(var(--md-surface-dim))",
          bright: "hsl(var(--md-surface-bright))",
          "container-lowest": "hsl(var(--md-surface-container-lowest))",
          "container-low": "hsl(var(--md-surface-container-low))",
          container: "hsl(var(--md-surface-container))",
          "container-high": "hsl(var(--md-surface-container-high))",
          "container-highest": "hsl(var(--md-surface-container-highest))",
        },
        "on-surface": "hsl(var(--md-on-surface))",
        "on-surface-variant": "hsl(var(--md-on-surface-variant))",
        outline: {
          DEFAULT: "hsl(var(--md-outline))",
          variant: "hsl(var(--md-outline-variant))",
        },
        /* Sidebar (keep compat) */
        sidebar: {
          DEFAULT: "hsl(var(--md-surface-container-low))",
          foreground: "hsl(var(--md-on-surface))",
          primary: "hsl(var(--md-primary))",
          "primary-foreground": "hsl(var(--md-on-primary))",
          accent: "hsl(var(--md-surface-container-high))",
          "accent-foreground": "hsl(var(--md-on-surface))",
          border: "hsl(var(--md-outline-variant))",
          ring: "hsl(var(--md-primary))",
        },
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "28px",
        "2xl": "40px",
        full: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(1deg)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "blob-morph": {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" },
          "50%": { borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%" },
          "75%": { borderRadius: "67% 33% 47% 53% / 37% 20% 80% 63%" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "slide-in-up": {
          from: { transform: "translateY(24px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s cubic-bezier(0.05, 0.7, 0.1, 1) forwards",
        float: "float 7s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "blob-morph": "blob-morph 8s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "slide-in-up": "slide-in-up 0.5s cubic-bezier(0.05, 0.7, 0.1, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
