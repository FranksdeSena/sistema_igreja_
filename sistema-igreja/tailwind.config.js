/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores modernas do sistema
        primary: {
          yellow: '#FBBF24',   // Amarelo moderno
          orange: '#F97316',   // Laranja
          red: '#DC2626',      // Vermelho
          blue: '#2563EB',     // Azul
          dark: '#1F2937',     // Cinza escuro
        },
        accent: {
          yellow: '#FCD34D',   // Amarelo claro
          orange: '#FB923C',   // Laranja claro
          red: '#EF4444',      // Vermelho claro
          blue: '#3B82F6',     // Azul claro
        },
        background: {
          light: '#FFFFFF',    // Branco
          dark: '#111827',     // Preto profundo
          gray: '#F3F4F6',     // Cinza claro
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
