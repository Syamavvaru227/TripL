/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        saffron: { DEFAULT: "#E8621A", light: "#F08040", dark: "#C44E10" },
        indigo: { DEFAULT: "#1E1B4B", light: "#3730A3", dark: "#12103A" },
        peacock: { DEFAULT: "#006B75", light: "#0E9090", dark: "#004B52" },
        emerald: { DEFAULT: "#15803D", light: "#22C55E", dark: "#0F5C2C" },
        terracotta: { DEFAULT: "#C2410C", light: "#EA5820", dark: "#9A330A" },
        sand: { DEFAULT: "#F5ECD7", light: "#FAF4E8", dark: "#E8D8B8" },
        ivory: { DEFAULT: "#FAFAF5", light: "#FFFFFF", dark: "#F0F0E8" },
        charcoal: { DEFAULT: "#1C1917", light: "#292524", dark: "#0F0E0D" },
        muted: "#78716C",
        border: "#E8E0D5",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
        devanagari: ["Noto Sans Devanagari", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1E1B4B 0%, #006B75 50%, #E8621A 100%)",
        "card-gradient": "linear-gradient(145deg, #FAFAF5 0%, #F5ECD7 100%)",
        "saffron-gradient": "linear-gradient(135deg, #E8621A 0%, #C2410C 100%)",
        "peacock-gradient": "linear-gradient(135deg, #006B75 0%, #1E1B4B 100%)",
      },
      boxShadow: {
        card: "0 2px 20px rgba(28,25,23,0.08), 0 1px 4px rgba(28,25,23,0.04)",
        "card-hover": "0 8px 40px rgba(28,25,23,0.12), 0 2px 8px rgba(28,25,23,0.06)",
        cta: "0 4px 20px rgba(232,98,26,0.35)",
        "cta-hover": "0 6px 30px rgba(232,98,26,0.5)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      animation: {
        "mandala-spin": "mandala-spin 12s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "slide-in": "slide-in 0.5s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "draw-line": "draw-line 1s ease-out forwards",
      },
      keyframes: {
        "mandala-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: 0, transform: "translateX(-20px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
        "draw-line": {
          from: { strokeDashoffset: 1000 },
          to: { strokeDashoffset: 0 },
        },
      },
    },
  },
  plugins: [],
}
