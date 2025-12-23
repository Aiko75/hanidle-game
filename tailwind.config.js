/** @type {import('tailwindcss').Config} */
const config = {
  // Khóa Dark Mode theo class thay vì hệ thống
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    // Thêm các đường dẫn khác nếu bạn có folder đặt tên khác
  ],
  theme: {
    extend: {
      // Bạn có thể định nghĩa màu sắc thương hiệu ở đây nếu muốn
    },
  },
  plugins: [],
};

export default config;
