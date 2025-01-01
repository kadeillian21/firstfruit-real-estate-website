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
        forest: '#2E7D32',
        grass: '#358608',
        gold: '#FFB300',
        beige: '#F5F5DC',
        slate: '#4B5563',
        rust: '#D84315',
        mint: '#E8F5E9',
      },
    },
  },
  plugins: [],
} satisfies Config;
