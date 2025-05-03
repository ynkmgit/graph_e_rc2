/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media', // 'media'はブラウザ設定に基づいて切り替わり、'class'は手動で.darkクラスを適用
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // ダークモードでも適切に表示されるカラー設定
        'background': {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        'text': {
          light: '#1a1a1a',
          dark: '#f3f4f6',
        },
      },
    },
  },
  plugins: [],
};
