import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#012030',
        seaBlue: '#026873',
        turquoise: '#04BF8A',
        forest: '#025940',
        grass: '#03A64A',
      },
    },
  },
  plugins: [],
} satisfies Config;
