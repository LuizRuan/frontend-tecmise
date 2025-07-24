<template>
  <div class="center">
    <form class="card" @submit.prevent="cadastrar" novalidate>
      <h1 class="brand">TecMise</h1>
      <h2>Criar conta</h2>
      <div class="input-group">
        <input
          v-model="nome"
          type="text"
          placeholder="Nome completo"
          required
          autocomplete="off"
        />
      </div>

      <div class="input-group">
        <input
          v-model="email"
          type="email"
          placeholder="Digite seu e-mail"
          :class="{ errorinput: emailErro && !emailFocus }"
          @blur="() => { emailFocus = false; validarEmail() }"
          @focus="emailFocus = true"
          required
          autocomplete="off"
        />
        <p v-if="emailErro && !emailFocus" class="erro">{{ emailErro }}</p>
      </div>

      <div class="input-group">
        <input
          v-model="senha"
          type="password"
          placeholder="Crie sua senha"
          :class="{ errorinput: senhaErro && !senhaFocus }"
          @blur="() => { senhaFocus = false; validarSenha() }"
          @focus="senhaFocus = true"
          required
          autocomplete="off"
        />
        <p v-if="senhaErro && !senhaFocus" class="erro">{{ senhaErro }}</p>
      </div>

      <div class="input-group">
        <input
          v-model="confirmaSenha"
          type="password"
          placeholder="Confirme sua senha"
          :class="{ errorinput: confirmaSenhaErro && !confirmaSenhaFocus }"
          @blur="() => { confirmaSenhaFocus = false; validarConfirmaSenha() }"
          @focus="confirmaSenhaFocus = true"
          required
          autocomplete="off"
        />
        <p v-if="confirmaSenhaErro && !confirmaSenhaFocus" class="erro">{{ confirmaSenhaErro }}</p>
      </div>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// ADICIONE AQUI 👇
const nome = ref('')           // <-- Adicione ESTA LINHA!

onMounted(() => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
  
})

const email = ref('')
const senha = ref('')
const confirmaSenha = ref('')
const erro = ref('')
const ok = ref(false)
const loading = ref(false)

const emailErro = ref('')
const senhaErro = ref('')
const confirmaSenhaErro = ref('')

const emailFocus = ref(false)
const senhaFocus = ref(false)
const confirmaSenhaFocus = ref(false)

// Só mostra erro após tentar enviar ou sair do campo
let touched = ref(false)

function validarEmail() {
  if (!email.value) {
    emailErro.value = 'O e-mail é obrigatório.'
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
  } else {
    senhaErro.value = ''
  }
}
function validarConfirmaSenha() {
  if (!confirmaSenha.value) {
    confirmaSenhaErro.value = 'Confirme sua senha.'
  } else if (senha.value !== confirmaSenha.value) {
    confirmaSenhaErro.value = 'As senhas não conferem.'
  } else {
    confirmaSenhaErro.value = ''
  }
}

const cadastrar = async () => {
  touched.value = true
  erro.value = ''
  ok.value = false
  validarEmail()
  validarSenha()
  validarConfirmaSenha()

  if (emailErro.value || senhaErro.value || confirmaSenhaErro.value) return

  loading.value = true
  try {
  // Chama o backend para cadastrar
  const res = await fetch('http://localhost:8080/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: nome.value,
      email: email.value,
      senha: senha.value
    })
  }); // <-- Fecha aqui!

  if (res.ok) {
    ok.value = true
    erro.value = ''
    setTimeout(() => router.push('/login'), 1200)
    email.value = ''
    senha.value = ''
    confirmaSenha.value = ''
  } else if (res.status === 409) {
    erro.value = 'E-mail já cadastrado.'
  } else if (res.status === 400) {
    erro.value = 'Dados inválidos. Verifique e tente novamente.'
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
button {
  width: 100%;
  padding: 0.86rem 0;
  border-radius: 8px;
  background: linear-gradient(90deg, #33aaff 30%, #256cbb 100%);
  color: #fff; border: none; font-weight: 600; cursor: pointer; font-size: 1.12rem;
  margin-top: 8px; transition: background .19s, transform .19s, box-shadow .19s;
  box-shadow: 0 2px 18px #19345a44;
  font-family: 'Montserrat', Arial, sans-serif;
}
button:hover:enabled {
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
</style>
