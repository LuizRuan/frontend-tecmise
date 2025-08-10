// plugins/api.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = String(config.public.apiBase || '')

  const api = $fetch.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
  })

  return { provide: { api } }
})
