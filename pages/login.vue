<template>
  <!-- Container centralizado para o formulário de login -->
  <div class="center">
    <!-- Card do formulário -->
    <form class="card" @submit.prevent="login" novalidate>
      <h1 class="brand">TecMise</h1>
      <h2>Entrar</h2>

      <!-- Campo de E-mail -->
      <div class="input-group">
        <input
          v-model="email"
          type="email"
          placeholder="Digite seu e-mail"
          :class="{ errorinput: emailErro }"
          @focus="clearErro('email')"
          required
          autocomplete="off"
        />
        <p v-if="emailErro" class="erro">{{ emailErro }}</p>
      </div>

      <!-- Campo de Senha -->
      <div class="input-group">
        <input
          v-model="senha"
          type="password"
          placeholder="Digite sua senha"
          :class="{ errorinput: senhaErro }"
          @focus="clearErro('senha')"
          required
          autocomplete="off"
        />
        <p v-if="senhaErro" class="erro">{{ senhaErro }}</p>
      </div>

      <!-- Botão de Login -->
      <button type="submit" :disabled="loading">
        <span v-if="loading">Entrando...</span>
        <span v-else>Entrar</span>
      </button>
      <!-- Mensagem de sucesso -->
      <p v-if="ok" class="ok">Login realizado! Redirecionando...</p>
      <!-- Link para cadastro -->
      <p class="register-link">
        Não tem conta?
        <NuxtLink to="/register">Cadastre-se</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
/**
 * Script utilizando Composition API (Vue 3)
 * Funções e variáveis para o login de usuário
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Instância do roteador Vue Router
const router = useRouter()

/**
 * onMounted: adiciona fonte Montserrat ao head do documento ao montar o componente
 */
onMounted(() => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
})

// Estados reativos para campos e status
const email = ref('')         // E-mail do usuário
const senha = ref('')         // Senha do usuário
const ok = ref(false)         // Status de login realizado
const loading = ref(false)    // Status de carregamento do login
const emailErro = ref('')     // Erro relacionado ao campo de e-mail
const senhaErro = ref('')     // Erro relacionado ao campo de senha

/**
 * Limpa a mensagem de erro do campo ao focar
 * @param {string} field - Nome do campo a ser limpo ('email' ou 'senha')
 */
function clearErro(field) {
  if (field === 'email') emailErro.value = ''
  if (field === 'senha') senhaErro.value = ''
}

/**
 * Função de login, chamada ao submeter o formulário
 * Faz validação dos campos, chama backend e trata respostas
 */
const login = async () => {
  // Limpa erros anteriores
  emailErro.value = ''
  senhaErro.value = ''
  ok.value = false
  let hasError = false

  // Validação do e-mail
  if (!email.value) {
    emailErro.value = 'O e-mail é obrigatório.'
    hasError = true
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
    emailErro.value = 'Digite um e-mail válido.'
    hasError = true
  }
  // Validação da senha
  if (!senha.value) {
    senhaErro.value = 'A senha é obrigatória.'
    hasError = true
  } else if (senha.value.length < 8) {
    senhaErro.value = 'A senha deve ter no mínimo 8 caracteres.'
    hasError = true
  }
  if (hasError) return

  loading.value = true
  try {
    // Chama a rota /login do backend com método POST
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, senha: senha.value })
    })

    if (res.ok) {
      const data = await res.json()
      // Salva dados do usuário autenticado no localStorage
      localStorage.setItem('usuario', JSON.stringify({
        id: data.id,
        email: data.email,
        nome: data.nome || 'Usuário'
      }))
      ok.value = true
      senhaErro.value = ''
      // Redireciona após 1,1 segundos para o dashboard
      setTimeout(() => router.push('/dashboard'), 1100)
    } else {
      // Mensagem padrão de erro (credenciais inválidas)
      senhaErro.value = 'E-mail ou senha incorretos.'
      ok.value = false
    }
  } catch (e) {
    // Erro na requisição (falha de conexão, etc)
    senhaErro.value = 'E-mail ou senha incorretos.'
    ok.value = false
  }
  loading.value = false
}
</script>

<style scoped>
/* 
  Estilos do componente de login 
  - Layout centralizado, card com efeito de sombra, cores, transições
  - Responsividade para largura máxima
*/
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
.register-link { margin-top: 18px; font-size: 1.09rem; color: #c8e4ff; }
.register-link a { color: #2db6ff; transition: color .18s; }
.register-link a:hover { color: #fff; text-shadow: 0 0 8px #2db6ff80; }
</style>
