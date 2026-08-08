/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#202B24",
          light: "#2E3B31",
        },
        parchment: {
          DEFAULT: "#EFE8D8",
          dim: "#E6DDC8",
        },
        amber: {
          DEFAULT: "#E2A83D",
          deep: "#B9822A",
        },
        clay: "#A8462F",
        sage: "#6B7C6D",
        coral: {
          DEFAULT: "#D6472C",
          deep: "#B23A24",
          light: "#F0A28F",
        },
        cream: "#FAF6EE",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "grain": "url('/grain.svg')",
      },
    },
  },
  plugins: [],
};
