import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
        display: [
          '"SF Pro Display"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "h1-hero": ["56px", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "h1-display": ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "h2-heading": ["40px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "h3-title": ["32px", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        "h4-sub": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        body: ["16px", { lineHeight: "1.5", letterSpacing: "0" }],
        sm: ["14px", { lineHeight: "1.5", letterSpacing: "0" }],
        xs: ["12px", { lineHeight: "1.5", letterSpacing: "0.01em" }],
        micro: ["10px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed", // Primary Deep Purple/Violet
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        cyanAccent: {
          DEFAULT: "#06B6D4",
          light: "#22D3EE",
          dark: "#0891B2",
        },
        status: {
          success: "#10B981", // Emerald Green
          warning: "#F59E0B", // Amber
          danger: "#EF4444",  // Red
          info: "#3B82F6",    // Blue
        },
        surface: {
          darkBg: "#090A10",
          card: "rgba(18, 20, 34, 0.75)",
          cardHover: "rgba(24, 26, 46, 0.85)",
          glass: "rgba(31, 41, 55, 0.5)",
          glassBorder: "rgba(255, 255, 255, 0.1)",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.1)",
        medium: "0 4px 12px rgba(0,0,0,0.15)",
        elevated: "0 12px 32px rgba(0,0,0,0.2)",
        glowPurple: "0 0 24px rgba(124, 58, 237, 0.4)",
        glowCyan: "0 0 24px rgba(6, 182, 212, 0.4)",
        glowEmerald: "0 0 24px rgba(16, 185, 129, 0.4)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      transitionDuration: {
        fast: "100ms",
        default: "200ms",
        slow: "300ms",
      },
    },
  },
  plugins: [],
};

export default config;
