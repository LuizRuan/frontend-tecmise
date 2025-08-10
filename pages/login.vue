<template>
  <div class="center">
    <!-- Formulário de login -->
    <form class="card" @submit.prevent="login" novalidate>
      <!-- Marca e título -->
<img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />

      <h2>Login</h2>

      <!-- Campo de E-mail -->
      <div class="input-group">
        <input
          v-model.trim="email"
          type="text"
          placeholder="Digite seu e-mail"
          :class="{ errorinput: emailErro }"
          @focus="clearErro('email')"
          @input="validarEmail"
          required
          autocomplete="off"
        />
        <p v-if="emailErro" class="erro">{{ emailErro }}</p>
      </div>

      <!-- Campo de Senha + Botão Olho -->
      <div class="input-group senha-group">
        <input
          v-model.trim="senha"
          :type="mostrarSenha ? 'text' : 'password'"
          placeholder="Digite sua senha"
          :class="{ errorinput: senhaErro }"
          @focus="clearErro('senha')"
          @input="validarSenha"
          required
          autocomplete="off"
        />
        <button
          type="button"
          class="olho-btn"
          @click="mostrarSenha = !mostrarSenha"
          :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
          tabindex="-1"
        >
          <!-- Ícones olho -->
          <svg v-if="!mostrarSenha" xmlns="http://www.w3.org/2000/svg" height="1.35em" viewBox="0 0 24 24" fill="none" stroke="#36c0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M2.05 12C3.45 7.36 7.44 4 12 4s8.55 3.36 9.95 8c-1.4 4.64-5.39 8-9.95 8s-8.55-3.36-9.95-8z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" height="1.35em" viewBox="0 0 24 24" fill="none" stroke="#36c0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-4.56 0-8.55-3.36-9.95-8a10.11 10.11 0 0 1 1.67-2.95"/>
            <path d="M6.12 6.12A10.05 10.05 0 0 1 12 4c4.56 0 8.55 3.36 9.95 8-.43 1.44-1.14 2.77-2.09 3.91"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <p v-if="senhaErro" class="erro">{{ senhaErro }}</p>
      </div>

      <!-- Botão de Login -->
      <button type="submit" :disabled="loading">
        <span v-if="loading">Entrando...</span>
        <span v-else>Entrar</span>
      </button>

      <!-- Mensagens de feedback -->
      <p v-if="ok" class="ok">Login realizado! Redirecionando...</p>
      <p class="register-link">
        Não tem conta?
        <NuxtLink to="/register">Cadastre-se</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()

/**
 * Página de Login — TecMise
 * - Valida campos de e-mail e senha
 * - Envia requisição POST para o backend
 * - Redireciona para o dashboard em caso de sucesso
 * - Exibe mensagens de erro do backend (quando disponíveis)
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estado dos campos e mensagens
const email = ref('')
const senha = ref('')
const emailErro = ref('')
const senhaErro = ref('')
const mostrarSenha = ref(false)
const ok = ref(false)
const loading = ref(false)

/* ==========================
   Funções de Validação
========================== */
function validarEmail() {
  if (!email.value) {
    emailErro.value = 'O e-mail é obrigatório.'
  } else if (/\s/.test(email.value)) {
    emailErro.value = 'O e-mail não pode conter espaços.'
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
    emailErro.value = 'Digite um e-mail válido.'
  } else {
    emailErro.value = ''
  }
}

function validarSenha() {
  if (!senha.value) {
    senhaErro.value = 'A senha é obrigatória.'
  } else if (senha.value.length < 8) {
    senhaErro.value = 'A senha deve ter no mínimo 8 caracteres.'
  } else if (/\s/.test(senha.value)) {
    senhaErro.value = 'A senha não pode conter espaços.'
  } else {
    senhaErro.value = ''
  }
}

function clearErro(field) {
  if (field === 'email') emailErro.value = ''
  if (field === 'senha') senhaErro.value = ''
}

/* ==========================
   Ações
========================== */
onMounted(() => {
  // Carregar fonte de forma programática
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
})

const login = async () => {
  validarEmail()
  validarSenha()
  ok.value = false

  if (emailErro.value || senhaErro.value) return

  loading.value = true
  try {
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        senha: senha.value
      })
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      ok.value = true
      senhaErro.value = ''
      // Se o backend retorna dados válidos
      if (data.id && data.nome && data.email) {
        setTimeout(() => {
          router.push({
            path: '/dashboard',
            query: { email: data.email }
          })
        }, 200)
      } else {
        senhaErro.value = 'Erro ao carregar dados do usuário.'
        ok.value = false
      }
    } else {
      senhaErro.value = data?.error || 'E-mail ou senha incorretos.'
      ok.value = false
    }
  } catch (e) {
    senhaErro.value = 'Erro ao conectar com o servidor.'
    ok.value = false
  }
  loading.value = false
}
</script>

<style scoped>
.logo-img {
  width: 290px;
  height: auto;
}

.center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #233e6b 70%, #2479cc 100%);
  font-family: 'Montserrat', Arial, sans-serif;
}
.card {
  background: rgba(35, 55, 110, 0.97);
  border-radius: 22px;
  padding: 2.6rem 2.6rem 2.2rem 2.6rem;
  box-shadow: 0 8px 36px #17366a34;
  border: 0px solid transparent;
  text-align: center;
  min-width: 340px;
  width: 100%;
  max-width: 410px;
  animation: fadein 0.7s;
  display: flex;
  flex-direction: column;
  align-items: center;
}
@keyframes fadein { 0%{opacity:0; transform:translateY(40px);} 100%{opacity:1; transform:translateY(0);} }
.brand {
  color: #2db6ff;
  font-weight: bold;
  margin-bottom: 18px;
  font-size: 2.1rem;
  letter-spacing: 2px;
  font-family: 'Montserrat', Arial, sans-serif;
}
h2 {
  color: #e0eaf5;
  margin-bottom: 26px;
  font-weight: 400;
  font-family: 'Montserrat', Arial, sans-serif;
}
.input-group {
  width: 100%;
  margin-bottom: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0.72rem 1.07rem;
  margin-bottom: 0px;
  border-radius: 8px;
  border: 1.2px solid #314e6b;
  background: #182e4a;
  color: #f7faff;
  font-size: 1.07rem;
  outline: none;
  transition: border .22s, background .22s;
  font-family: 'Montserrat', Arial, sans-serif;
}
input:focus {
  border: 1.8px solid #2db6ff;
  background: #243e69;
}
.errorinput {
  border: 1.8px solid #ff4a4a;
  background: #331c1c;
}
button[type="submit"] {
  width: 100%;
  padding: 0.86rem 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #33aaff 30%, #256cbb 100%);
  color: #fff; border: none; font-weight: 600; cursor: pointer; font-size: 1.12rem;
  margin-top: 8px; transition: background .19s, transform .19s, box-shadow .19s;
  box-shadow: 0 2px 18px #19345a44;
  font-family: 'Montserrat', Arial, sans-serif;
}
button[type="submit"]:hover:enabled {
  background: linear-gradient(90deg, #43c8ff 30%, #4185e6 100%);
  transform: scale(1.04);
  box-shadow: 0 8px 28px #0a355f60;
}
button:disabled { opacity: .7; cursor: wait; }
.erro {
  color: #ff5b5b;
  font-size: 0.97rem;
  margin-bottom: 0px;
  margin-top: 3px;
  text-align: left;
  width: 100%;
  padding-left: 3px;
  transition: opacity .2s;
}
.ok { color: #1edd9d; font-size: 1rem; margin-top: 10px; }
.register-link { margin-top: 18px; font-size: 1.09rem; color: #c8e4ff; }
.register-link a { color: #2db6ff; transition: color .18s; }
.register-link a:hover { color: #fff; text-shadow: 0 0 8px #2db6ff80; }

/* ========== Olho de mostrar senha ========== */
.senha-group {
  position: relative;
  display: flex;
  align-items: center;
}
.senha-group input {
  padding-right: 44px !important;
}
.olho-btn {
  position: absolute;
  top: 50%;
  right: 13px;
  transform: translateY(-50%);
  background: none;
  border: none;
  outline: none;
  font-size: 1.3rem;
  color: #36c0ff;
  cursor: pointer;
  padding: 0 2px;
  z-index: 2;
  display: flex;
  align-items: center;
  transition: color .17s;
}
.olho-btn:hover { color: #24a7e6; }

.input-group .erro {
  position: absolute;
  left: 3px;
  bottom: -21px;
  width: calc(100% - 6px);
  margin: 0;
  padding: 0;
  font-size: 0.97rem;
  color: #ff5b5b;
  text-align: left;
  transition: opacity .2s;
  pointer-events: none;
}
</style>
