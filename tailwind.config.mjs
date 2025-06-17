/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f8f3',
          100: '#e6f1e8',
          200: '#cde3d2',
          300: '#a7cbb0',
          400: '#7baf89',
          500: '#559469',
          600: '#437a54',
          700: '#366144',
          800: '#2c4d37',
          900: '#23402d',
          950: '#0d1911',
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'rgb(31, 41, 55)',
            lineHeight: '1.75',
            'h1, h2, h3, h4': {
              color: 'rgb(17, 24, 39)',
              fontWeight: '700',
            },
            a: {
              color: 'rgb(37, 99, 235)',
              '&:hover': {
                color: 'rgb(29, 78, 216)',
              },
            },
            // 表格对齐样式
            'table th[align="left"], table td[align="left"]': {
              textAlign: 'left',
            },
            'table th[align="center"], table td[align="center"]': {
              textAlign: 'center',
            },
            'table th[align="right"], table td[align="right"]': {
              textAlign: 'right',
            },
          },
        },
        dark: {
          css: {
            color: 'rgb(229, 231, 235)',
            'h1, h2, h3, h4': {
              color: 'rgb(243, 244, 246)',
            },
            a: {
              color: 'rgb(96, 165, 250)',
              '&:hover': {
                color: 'rgb(147, 197, 253)',
              },
            },
            blockquote: {
              color: 'rgb(229, 231, 235)',
              borderLeftColor: 'rgb(75, 85, 99)',
            },
            table: {
              color: 'rgb(229, 231, 235)',
            },
            'thead th': {
              color: 'rgb(243, 244, 246)',
              borderBottomColor: 'rgb(75, 85, 99)',
            },
            'tbody tr': {
              borderBottomColor: 'rgb(75, 85, 99)',
            },
            'tbody tr:hover': {
              backgroundColor: 'rgb(31, 41, 55)',
            },
            'tbody td': {
              color: 'rgb(229, 231, 235)',
            },
            strong: {
              color: 'rgb(243, 244, 246)',
            },
            'ul li': {
              color: 'rgb(229, 231, 235)',
            },
            'ol li': {
              color: 'rgb(229, 231, 235)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
