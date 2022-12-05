module.exports = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'white-100': 'rgba(200,200,200,.6)',
        primary: '#00A8B3',
        'gray-dark': '#55606A',
        'gray-light': '#778594',
        secondary: '#222c3c'
      },
      gridTemplateColumns: {
        content: '15rem 1fr'
      },
      maxWidth: {
        content: '15rem'
      }
    }
  },
  variants: {
    extend: {
      cursor: ['active'],
      blur: ['hover']
    }
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })]
}
