/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Mở rộng hệ thống màu của Tailwind với các token của chúng ta
      colors: {
        background: {
          primary: '#FFFFFF', // bg-background-primary
          secondary: '#F7F7F7', // bg-background-secondary
        },
        text: {
          primary: '#000000', // text-text-primary
          secondary: '#555555', // text-text-secondary
        },
        accent: {
          primary: '#28A745', // bg-accent-primary, border-accent-primary, text-accent-primary
          hover: '#218838', // hover:bg-accent-hover
        },
        status: {
          danger: '#DC3545', // bg-status-danger, text-status-danger
          warning: '#FFC107', // bg-status-warning
        },
      },
      // Mở rộng hệ thống font chữ
      fontFamily: {
        // Giờ đây class `font-sans` sẽ sử dụng font 'Inter'
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
