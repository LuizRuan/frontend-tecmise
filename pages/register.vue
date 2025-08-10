<template>
  <div class="center">
    <form class="card" @submit.prevent="cadastrar" novalidate>
      <!-- Marca e título -->
      <img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />
      <h2>Criar conta</h2>

      <!-- Campo Nome -->
      <div class="input-group">
        <input
          v-model="nome"
          type="text"
          placeholder="Nome completo"
          required
          autocomplete="off"
        />
      </div>

      <!-- Campo E-mail -->
      <div class="input-group">
        <input
          v-model="email"
          type="text"
          placeholder="Digite seu e-mail"
          :class="{ errorinput: emailErro }"
          @blur="validarEmail"
          @input="validarEmail"
          required
          autocomplete="off"
        />
        <p v-if="emailErro" class="erro">{{ emailErro }}</p>
      </div>

      <!-- Campo Senha com botão Olho -->
      <div class="input-group senha-group">
        <input
          v-model="senha"
          :type="mostrarSenha ? 'text' : 'password'"
          placeholder="Crie sua senha"
          :class="{ errorinput: senhaErro }"
          @blur="validarSenha"
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
          <!-- Olho aberto/fechado (SVG) -->
          <svg v-if="!mostrarSenha" xmlns="http://www.w3.org/2000/svg" height="1.34em" viewBox="0 0 24 24" fill="none" stroke="#36c0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M2.05 12C3.45 7.36 7.44 4 12 4s8.55 3.36 9.95 8c-1.4 4.64-5.39 8-9.95 8s-8.55-3.36-9.95-8z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" height="1.34em" viewBox="0 0 24 24" fill="none" stroke="#36c0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-4.56 0-8.55-3.36-9.95-8a10.11 10.11 0 0 1 1.67-2.95"/>
            <path d="M6.12 6.12A10.05 10.05 0 0 1 12 4c4.56 0 8.55 3.36 9.95 8-.43 1.44-1.14 2.77-2.09 3.91"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <p v-if="senhaErro" class="erro">{{ senhaErro }}</p>
      </div>

      <!-- Campo Confirmar Senha com botão Olho -->
      <div class="input-group senha-group">
        <input
          v-model="confirmaSenha"
          :type="mostrarConfirmaSenha ? 'text' : 'password'"
          placeholder="Confirme sua senha"
          :class="{ errorinput: confirmaSenhaErro }"
          @blur="validarConfirmaSenha"
          required
          autocomplete="off"
        />
        <button
          type="button"
          class="olho-btn"
          @click="mostrarConfirmaSenha = !mostrarConfirmaSenha"
          :aria-label="mostrarConfirmaSenha ? 'Ocultar senha' : 'Mostrar senha'"
          tabindex="-1"
        >
          <!-- Olho aberto/fechado (SVG) -->
          <svg v-if="!mostrarConfirmaSenha" xmlns="http://www.w3.org/2000/svg" height="1.34em" viewBox="0 0 24 24" fill="none" stroke="#36c0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M2.05 12C3.45 7.36 7.44 4 12 4s8.55 3.36 9.95 8c-1.4 4.64-5.39 8-9.95 8s-8.55-3.36-9.95-8z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" height="1.34em" viewBox="0 0 24 24" fill="none" stroke="#36c0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-4.56 0-8.55-3.36-9.95-8a10.11 10.11 0 0 1 1.67-2.95"/>
            <path d="M6.12 6.12A10.05 10.05 0 0 1 12 4c4.56 0 8.55 3.36 9.95 8-.43 1.44-1.14 2.77-2.09 3.91"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <p v-if="confirmaSenhaErro" class="erro">{{ confirmaSenhaErro }}</p>
      </div>

      <!-- Botão principal -->
      <button type="submit" :disabled="loading">
        <span v-if="loading">Cadastrando...</span>
        <span v-else>Cadastrar</span>
      </button>
      <p v-if="erro" class="erro">{{ erro }}</p>
      <p v-if="ok" class="ok">Cadastrado com sucesso! Redirecionando...</p>
      <p class="login-link">
        Já tem conta? <NuxtLink to="/login">Entrar</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
/**
 * Componente Register (Cadastro) da aplicação TecMise
 * - Totalmente documentado e padronizado
 * - Suporte para exibir/ocultar senha (botão olho)
 * - Validações de campos (e-mail, senha, confirmação)
 * - Mensagens de erro contextuais
 * - Envio de dados para backend (/register)
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Campos do formulário e estados reativos
const nome = ref('')
const email = ref('')
const senha = ref('')
const confirmaSenha = ref('')
const erro = ref('')
const ok = ref(false)
const loading = ref(false)
const emailErro = ref('')
const senhaErro = ref('')
const confirmaSenhaErro = ref('')
const mostrarSenha = ref(false)
const mostrarConfirmaSenha = ref(false)

// Router para navegação após cadastro
const router = useRouter()

// Adiciona fonte Montserrat ao montar componente
onMounted(() => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
})

/**
 * Validação do campo e-mail
 */
function validarEmail() {
  if (!email.value) {
    emailErro.value = 'O e-mail é obrigatório.'
  } else if (email.value !== email.value.trim()) {
    emailErro.value = 'O e-mail não pode começar ou terminar com espaço.'
  } else if (/\s/.test(email.value)) {
    emailErro.value = 'O e-mail não pode conter espaço.'
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
    emailErro.value = 'Digite um e-mail válido.'
  } else {
    emailErro.value = ''
  }
}


/**
 * Validação da senha
 */
function validarSenha() {
  if (!senha.value) {
    senhaErro.value = 'A senha é obrigatória.'
  } else if (senha.value.length < 8) {
    senhaErro.value = 'A senha deve ter no mínimo 8 caracteres.'
  } else {
    senhaErro.value = ''
  }
}

/**
 * Validação de confirmação de senha
 */
function validarConfirmaSenha() {
  if (!confirmaSenha.value) {
    confirmaSenhaErro.value = 'Confirme sua senha.'
  } else if (senha.value !== confirmaSenha.value) {
    confirmaSenhaErro.value = 'As senhas não conferem.'
  } else {
    confirmaSenhaErro.value = ''
  }
}

/**
 * Função principal de cadastro
 * - Valida campos
 * - Chama backend (/register)
 * - Exibe erros e sucesso
 */
const cadastrar = async () => {
  erro.value = ''
  ok.value = false
  validarEmail()
  validarSenha()
  validarConfirmaSenha()

  if (emailErro.value || senhaErro.value || confirmaSenhaErro.value) return

  loading.value = true
  try {
    const res = await fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome.value,
        email: email.value,
        senha: senha.value
      })
    })

    if (res.ok) {
      ok.value = true
      erro.value = ''
      setTimeout(() => router.push('/login'), 1200)
      nome.value = ''
      email.value = ''
      senha.value = ''
      confirmaSenha.value = ''
    } else if (res.status === 409) {
      erro.value = 'E-mail já cadastrado.'
    } else if (res.status === 400) {
      const msg = await res.text()
      erro.value = msg || 'Dados inválidos. Verifique e tente novamente.'
    } else {
      erro.value = 'Erro ao cadastrar. Tente novamente.'
    }
  } catch (e) {
    erro.value = 'Erro ao cadastrar. Tente novamente.'
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
.login-link { margin-top: 18px; font-size: 1.09rem; color: #c8e4ff; }
.login-link a { color: #2db6ff; transition: color .18s; }
.login-link a:hover { color: #fff; text-shadow: 0 0 8px #2db6ff80; }

/* ====== Botão Olho Senha ====== */
.senha-group {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 32px;
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

/* Garante que erro não empurre o botão olho */
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
