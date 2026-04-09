export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      /*
        Tambahan delay animasi untuk efek stagger.
        Dipakai bersama class "animate-*" di komponen.
        Contoh: className="animate-fadeInUp delay-400"
      */
      animationDelay: {
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s',
        '400': '0.4s',
        '500': '0.5s',
      }
    }
  },
  plugins: []
}
