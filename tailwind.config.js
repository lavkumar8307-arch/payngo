/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0070BA", // PayPal Blue
          hover: "#005EA6",
          dark: "#003087",
        },
        paypal: {
          blue: "#003087",
          lightblue: "#0070BA",
          gold: "#FFC439",
          goldHover: "#F2BA36"
        },
        accent: {
          emerald: "#10B981",
          amber: "#F59E0B",
          violet: "#8B5CF6",
          rose: "#F43F5E",
          cyan: "#06B6D4"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 1, boxShadow: "0 0 15px rgba(0, 112, 186, 0.4)" },
          "50%": { opacity: 0.7, boxShadow: "0 0 5px rgba(0, 112, 186, 0.1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 3s infinite ease-in-out",
        "float": "float 4s infinite ease-in-out",
      }
    },
  },
  plugins: [],
}
