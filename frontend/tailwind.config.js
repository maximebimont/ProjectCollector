/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        collector: {
          cream: '#f7f1e8',
          sand: '#eadfce',
          ink: '#1f2937',
          bronze: '#9a6b3f',
          olive: '#5f6f52',
          rose: '#f6e7e7'
        }
      },
      boxShadow: {
        collector: '0 20px 45px rgba(31, 41, 55, 0.10)'
      },
      backgroundImage: {
        paper: 'radial-gradient(circle at top left, rgba(154, 107, 63, 0.18), transparent 35%), linear-gradient(180deg, #f7f1e8 0%, #fffdf9 100%)'
      }
    }
  },
  plugins: []
};
