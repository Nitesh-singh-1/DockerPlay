import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-page)",
        foreground: "var(--text-primary)",
        docker: {
          whale: "#0db7ed",
          blue: "#0284c7",
          sky: "#38bdf8",
          navy: "#080e1a",
          card: "#132238",
          cardHover: "#192c47",
          border: "#1e3352",
        },
        node: {
          container: "var(--node-container)",
          running: "var(--node-running)",
          exited: "var(--node-exited)",
          volume: "var(--node-volume)",
          network: "var(--node-network)",
          image: "var(--node-image)",
          compose: "var(--node-compose)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-sans)", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'tactile': '0 4px 0 0 rgba(0, 0, 0, 0.25)',
        'tactile-hover': '0 2px 0 0 rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
