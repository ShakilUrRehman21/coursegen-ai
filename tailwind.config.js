/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* RETHEME */ indigo:{'50':'#fef9c3','100':'#fef08a','200':'#fde047','300':'#facc15','400':'#404040','500':'#262626','600':'#111111','700':'#000000','800':'#000000','900':'#000000','950':'#000000'}, violet:{'50':'#fef9c3','100':'#fef08a','200':'#fde047','300':'#facc15','400':'#404040','500':'#262626','600':'#111111','700':'#000000','800':'#000000','900':'#000000','950':'#000000'}, slate:{'50':'#fffbea','100':'#f7f0d6','200':'#e7e0c9','300':'#cfc8b0','400':'#9a9484','500':'#6b665a','600':'#4d493f','700':'#36332c','800':'#22201b','900':'#111111','950':'#0a0a0a'},
                background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#111111",
          50: "#fef9c3", 100: "#fef08a", 200: "#fde047", 300: "#facc15", 400: "#404040",
          500: "#262626", 600: "#111111", 700: "#000000", 800: "#000000", 900: "#000000",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#ff5fa2",
          50: "#fff0f7", 100: "#ffe0ef", 600: "#e63d86",
          foreground: "#111111",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 4px 20px -2px rgba(99, 102, 241, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.25)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};