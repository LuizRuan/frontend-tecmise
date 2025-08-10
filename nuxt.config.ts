// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/app.css'],

  runtimeConfig: {
    public: {
      // use o .env em produção e um fallback local
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'
    }
  }
})
