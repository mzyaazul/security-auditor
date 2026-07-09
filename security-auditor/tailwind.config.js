/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F14",       // near-black graphite, not pure black
        panel: "#121821",     // card/panel surface
        line: "#232C38",      // hairline borders
        mist: "#8A97A8",      // muted secondary text
        paper: "#E8EDF3",     // primary text
        signal: {
          pass: "#4FD1A5",    // desaturated phosphor green — "clear"
          warn: "#E8A23D",    // amber — "flagged"
          fail: "#E8574A",    // signal red — "exposed"
          crit: "#B23A3A",    // deeper red — "critical"
        },
        accent: "#4A9EFF",    // electric blue — primary interactive accent
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        scanlines:
          "repeating-linear-gradient(180deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
      },
      animation: {
        sweep: "sweep 2.2s ease-in-out infinite",
        blink: "blink 1.6s step-start infinite",
      },
    },
  },
  plugins: [],
};
