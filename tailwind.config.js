import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "kp-pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(52, 211, 153, 0.45)" },
          "50%": { boxShadow: "0 0 0 6px rgba(52, 211, 153, 0)" },
        },
        "kp-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "kp-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "kp-fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "kp-pulse-glow": "kp-pulse-glow 2s ease-out infinite",
        "kp-float": "kp-float 4s ease-in-out infinite",
        "kp-shimmer": "kp-shimmer 2s linear infinite",
        "kp-fade-up": "kp-fade-up 0.4s ease-out backwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

