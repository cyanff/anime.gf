/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans]
      },
      maxWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "2/4": "50%",
        "3/4": "75%"
      },
      backgroundImage: {
        none: "none",
        "logo-grad": "linear-gradient(112.84deg, var(--logo-from), var(--logo-to))",
        "chat-user-grad": "linear-gradient(45deg, var(--chat-user-from), var(--chat-user-to))",
        "chat-character-grad": "linear-gradient(45deg, var(--chat-character-from), var(--chat-character-to))"
      },

      colors: {
        background: "var(--background)",
        nav: {
          primary: "var(--nav-primary)",
          secondary: "var(--nav-secondary)"
        },
        container: {
          primary: "var(--container-primary)",
          secondary: "var(--container-secondary)",
          tertiary: "var(--container-tertiary)"
        },
        tx: {
          primary: "var(--tx-primary)",
          secondary: "var(--tx-secondary)",
          tertiary: "var(--tx-tertiary)"
        },
        input: {
          primary: "var(--input-primary)",
          secondary: "var(--input-secondary)",
          tertiary: "var(--input-tertiary)"
        },
        chat: {
          "user-blockquote-bar": "var(--chat-user-blockquote-bar)",
          "character-blockquote-bar": "var(--chat-character-blockquote-bar)"
        },
        "collection-card": {
          DEFAULT: "var(--collection-card)",
          hover: "var(--collection-card-hover)",
          tag: "var(--collection-card-tag)"
        },
        action: {
          primary: "var(--action-primary)",
          secondary: "var(--action-secondary)",
          tertiary: "var(--action-tertiary)"
        },
        line: "var(--line)",
        accent: "var(--accent)",
        float: "var(--float)",
        muted: "var(--muted)",

        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        }
      },
      borderRadius: {
        "3xl": "calc(var(--radius) + 10px)",
        "2xl": "calc(var(--radius) + 4px)",
        xl: "calc(var(--radius) + 2px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
