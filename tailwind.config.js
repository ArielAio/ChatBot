/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Ativa o modo dark baseado em classe
  theme: {
    extend: {
      screens: {
        'xxs': '360px',
        'xs': '480px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "chat-bg": "var(--chat-bg)",
        "chat-bot": "var(--chat-bot)",
        "chat-user": "var(--chat-user)",
        "input-bg": "var(--input-bg)",
        "input-border": "var(--input-border)",
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "typing": "typing 1.2s steps(12) infinite",
        "fadeIn": "fadeIn 0.5s ease-in-out",
        "slideUp": "slideUp 0.3s ease-out",
      },
      keyframes: {
        typing: {
          "0%": { width: "0%" },
          "100%": { width: "100%" }
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 }
        }
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};
