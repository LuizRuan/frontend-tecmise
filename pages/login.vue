<template>
  <!--
    =====================================================================
    📄 login.vue — Autenticação
    =====================================================================
    🎯 Objetivo
      - Exibir um formulário de login com validação progressiva (em tempo real).
      - Enviar e-mail e senha para o backend e, em caso de sucesso, redirecionar.
      - Manter o mesmo visual/UX do seu design (gradiente, card, botão com brilho).

    🧭 Estrutura do Template
      - <div.center>       -> Container de tela inteira com gradiente de fundo.
      - <form.card>        -> Cartão com logo, título, campos e CTA.
      - Campos:
          • E-mail: validação imediata para espaços, formato e domínio permitido.
          • Senha: mínimo de 8 caracteres, sem espaços; botão para mostrar/ocultar.
      - Mensagens:
          • Erros específicos abaixo de cada campo.
          • Sucesso: "Login realizado! Redirecionando..."
      - Links:
          • CTA (submit) — botão "Entrar".
          • Link para cadastro ("/register").

    ♿ Acessibilidade (A11Y)
      - Logo com alt descritivo ("Logo Tecmise").
      - Botão de mostrar/ocultar senha tem aria-label dinâmica.
      - Mensagens de erro aparecem logo após o campo, facilitando leitura por leitores
        de tela (ordem lógica do DOM).

    🔐 Segurança/UX
      - type="password" com alternância visual:
        evita deixar a senha exposta por padrão.
      - novalidate no <form>:
        desativa a validação nativa do browser para não conflitar com as suas regras
        customizadas (controlamos tudo via Vue).
  -->
  <div class="center">
    <!--
      @submit.prevent="login"
      - Previne o reload da página.
      - Chama a função login() (definida no <script setup>).
      - novalidate: desliga validação nativa do navegador.
    -->
    <form class="card" @submit.prevent="login" novalidate>
      <!-- 🖼️ Logo/identidade -->
      <img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />
      <h2>Login</h2>

      <!-- ===========================
           📧 Campo: E-MAIL
           - v-model: email            -> estado controlado.
           - @input: validarEmail      -> valida enquanto digita (progressivo).
           - @focus: clearErro('email')-> limpa mensagens ao focar no campo.
           - :class: errorinput        -> borda/vermelho quando há erro.
           - autocomplete=off          -> evita sugestão automática do navegador
                                         (mantém seu comportamento).
           - spellcheck=false          -> não sublinha como erro ortográfico.
         =========================== -->
      <div class="input-group">
        <div class="input-wrap">
          <input
            v-model="email"
            type="text"
            placeholder="Digite seu e-mail"
            :class="{ errorinput: !!emailErro }"
            @focus="clearErro('email')"
            @input="validarEmail"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
        <!-- Mensagem de erro específica do e-mail -->
        <p v-if="emailErro" class="erro">{{ emailErro }}</p>
      </div>

      <!-- ===========================
           🔒 Campo: SENHA
           - v-model: senha
           - :type condicional: 'password' | 'text' (mostrar/ocultar)
           - Ícone/btn com aria-label (A11Y): comunica ação atual.
           - @input: validarSenha -> valida enquanto digita.
         =========================== -->
      <div class="input-group senha-group">
        <div class="input-wrap">
          <input
            v-model="senha"
            :type="mostrarSenha ? 'text' : 'password'"
            placeholder="Digite sua senha"
            :class="{ errorinput: !!senhaErro }"
            @focus="clearErro('senha')"
            @input="validarSenha"
            autocomplete="off"
            spellcheck="false"
          />
          <!--
            Botão "olho" para alternar visibilidade da senha.
            tabindex="-1": não entra na ordem natural do tab;
            mantém o foco no input, permitindo digitar sem pular foco ao clicar.
          -->
          <button
            type="button"
            class="olho-btn"
            @click="mostrarSenha = !mostrarSenha"
            :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
            tabindex="-1"
          >
            <!-- Ícones SVG inline (sem dependências externas) -->
            <svg v-if="!mostrarSenha" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <path d="M2.05 12C3.45 7.36 7.44 4 12 4s8.55 3.36 9.95 8c-1.4 4.64-5.39 8-9.95 8s-8.55-3.36-9.95-8z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-4.56 0-8.55-3.36-9.95-8a10.11 10.11 0 0 1 1.67-2.95"/>
              <path d="M6.12 6.12A10.05 10.05 0 0 1 12 4c4.56 0 8.55 3.36 9.95 8-.43 1.44-1.14 2.77-2.09 3.91"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <!-- Mensagem de erro específica da senha -->
        <p v-if="senhaErro" class="erro">{{ senhaErro }}</p>
      </div>

      <!-- ===========================
           CTA: Entrar
           - :disabled="loading": impede duplo clique e mostra "Entrando...".
           - Mesma animação de brilho do index/login que você já usa.
         =========================== -->
      <button class="cta-btn" type="submit" :disabled="loading">
        <span v-if="loading">Entrando...</span>
        <span v-else>Entrar</span>
      </button>

      <!-- Mensagem de sucesso após autenticar -->
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
/*
  ============================================================================
  🧠 Lógica do componente (Composition API com <script setup>)
  ============================================================================
  Por que <script setup>?
    - Sintaxe concisa; imports/refs ficam no escopo do componente automaticamente.
    - Melhor treeshaking; menos boilerplate.
*/
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/*
  🔁 Router
  - Usado para navegar para o /dashboard após login bem-sucedido.
*/
const router = useRouter()

/*
  💾 Estados reativos
  - email, senha: dados digitados.
  - mostrarSenha: alterna visibilidade do campo de senha.
  - loading: evita múltiplos envios e muda rótulo do botão.
  - ok: controla mensagem de sucesso pós-login.
  - emailErro, senhaErro: mensagens de erro por campo (strings vazias = sem erro).
*/
const email = ref('')
const senha = ref('')
const mostrarSenha = ref(false)
const loading = ref(false)
const ok = ref(false)

const emailErro = ref('')
const senhaErro = ref('')

/*
  📮 Provedores de e-mail permitidos
  - Regra de domínio simples para evitar endereços não comuns.
  - Ajuste conforme sua política (ex.: aceitar domínios corporativos).
*/
const ALLOWED_PROVIDERS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'yahoo.com',
  'proton.me'
]

/*
  🅰️ Fonte
  - Mantemos o padrão atual: injetar a família "Montserrat" via onMounted.
  - Em produção: considere mover para o head (nuxt.config.ts/app.html) com preconnect.
*/
onMounted(() => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
})

/*
  ✅ validarEmail()
  - Validação progressiva: só mostra erro quando:
      • há espaços em qualquer posição; ou
      • formato básico inválido; ou
      • domínio fora de ALLOWED_PROVIDERS.
  - Se vazio, não exibe erro (para não "travar" o usuário enquanto começa a digitar).
*/
function validarEmail () {
  const v = String(email.value || '')

  if (/\s/.test(v)) {                 // espaço em qualquer lugar
    emailErro.value = 'O e-mail não pode conter espaços.'
    return
  }
  if (!v) { emailErro.value = ''; return }   // progressivo: vazio não acusa

  const basicOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)
  if (!basicOk) { emailErro.value = 'Digite um e-mail válido.'; return }

  const domain = v.split('@')[1]?.toLowerCase() || ''
  if (!ALLOWED_PROVIDERS.includes(domain)) {
    emailErro.value = 'Digite um e-mail válido.'
    return
  }
  emailErro.value = ''
}

/*
  🔑 validarSenha()
  - Regras:
      • mínimo de 8 caracteres;
      • não pode conter espaços (permite digitar, mas acusa).
  - Se vazio, não exibe erro (progressivo).
*/
function validarSenha () {
  const v = String(senha.value || '')
  if (!v) { senhaErro.value = ''; return }
  if (v.length < 8) { senhaErro.value = 'A senha deve ter no mínimo 8 caracteres.'; return }
  if (/\s/.test(v)) { senhaErro.value = 'A senha não pode conter espaços.'; return }
  senhaErro.value = ''
}

/*
  🧽 clearErro(field)
  - Limpa a mensagem de erro do campo informado ao focar nele.
*/
function clearErro (field) {
  if (field === 'email') emailErro.value = ''
  if (field === 'senha') senhaErro.value = ''
}

/*
  🚪 login()
  - Fluxo:
      1) Zera "ok".
      2) Valida campos obrigatórios e regras específicas.
      3) Se houver erros, aborta.
      4) Faz POST para o backend em http://localhost:8080/login
         (Content-Type: application/json)
      5) Se resposta OK e com { id, nome, email }:
           • exibe "ok" e redireciona p/ /dashboard?email=...
         Senão: mostra mensagem de erro vinda do backend ou genérica.
      6) Captura falhas de rede e encerra loading.
  - Importante:
      • Mantemos seu endpoint e formato de carga como estão (compatibilidade).
      • Redirecionamento com pequeno delay (220ms) para experiência suave.
*/
const login = async () => {
  ok.value = false

  // Validação obrigatória antes de enviar
  if (!email.value) emailErro.value = 'O e-mail é obrigatório.'
  else validarEmail()

  if (!senha.value) senhaErro.value = 'A senha é obrigatória.'
  else validarSenha()

  // Se houver erros, interrompe o fluxo
  if (emailErro.value || senhaErro.value) return

  loading.value = true
  try {
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, senha: senha.value })
    })

    // Tenta parsear JSON; se falhar, usa objeto vazio.
    const data = await res.json().catch(() => ({}))

    if (res.ok && data?.id && data?.nome && data?.email) {
      ok.value = true
      // Pequeno atraso para o usuário perceber o feedback visual
      setTimeout(() => router.push({ path: '/dashboard', query: { email: data.email } }), 220)
    } else {
      // Mensagem do backend (se existir) ou fallback
      senhaErro.value = data?.error || 'E-mail ou senha incorretos.'
    }
  } catch {
    // Erros de rede/servidor indisponível
    senhaErro.value = 'Erro ao conectar com o servidor.'
  }
  loading.value = false
}
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilos com escopo (scoped)
   - Mantêm o visual original sem vazar estilos para outros componentes.
   ========================================================================== */

/* 🖼️ Logo */
.logo-img{ width:290px; height:auto; }

/* 🌅 Container de fundo com gradiente e tipografia padrão desta página */
.center{
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#233e6b 70%,#2479cc 100%);
  font-family:'Montserrat', Arial, sans-serif;
}

/* 🗂️ Card do formulário: dimensões, sombra e animação de entrada */
.card{
  background:rgba(35,55,110,.97);
  border-radius:22px;
  padding:2.8rem 3rem 2.4rem;
  box-shadow:0 8px 36px #17366a34;
  text-align:center; min-width:360px; width:100%; max-width:520px;
  animation:fadein .7s;
  display:flex; flex-direction:column; align-items:center;
}

/* 🎞️ Animação de entrada (fade + leve translateY) */
@keyframes fadein{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}

/* 🏷️ Título */
h2{ color:#fff; font-weight:700; margin-bottom:26px; }

/* ===========================
   📦 Grupos de campos
   - input-group: controla fluxo vertical e posição das mensagens.
   - input-wrap: caixa para controlar altura e posicionamento do botão "olho".
   =========================== */
.input-group{ width:100%; margin-bottom:12px; position:relative; display:flex; flex-direction:column; }
.input-wrap{ position:relative; display:block; height:48px; }

/* ✍️ Inputs (e-mail/senha) — cores, bordas e foco */
input{
  width:100%; height:100%; box-sizing:border-box;
  padding:0 44px 0 16px;               /* espaço à direita para o botão "olho" */
  border-radius:14px;
  border:1.6px solid #2a4770;
  background:#26456f;
  color:#f7faff; font-size:1.05rem; outline:none;
  transition:border .18s, background .18s, box-shadow .18s;
}
input::placeholder{ color:#ffffff; opacity:.9; }
input:focus{
  border-color:#3cc1ff;
  background:#2b5488;
  box-shadow:0 0 0 3px rgba(60,193,255,.18);
}

/* 🚨 Estado de erro do input */
.errorinput{ border-color:#ff6b6b !important; background:#3a1f1f !important; }

/* 🧾 Texto de erro do campo (logo abaixo do input) */
.erro{ color:#ff5b5b; font-size:.92rem; margin:6px 0 0; text-align:left; width:100%; line-height:1.15; }

/* 👁️ Grupo de senha e botão "olho" */
.senha-group .input-wrap{ height:48px; }
.olho-btn{
  position:absolute; top:50%; right:12px; transform:translateY(-50%);
  width:36px; height:36px; display:flex; align-items:center; justify-content:center;
  border:none; background:transparent; cursor:pointer; border-radius:50%;
  transition:background .15s;
}
.olho-btn:hover{ background:rgba(60,193,255,.15); }
.olho-btn svg{ width:22px; height:22px; fill:none; stroke:#36c0ff; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

/* 🔘 Botão principal (CTA) — com brilho e "lift" no hover */
.cta-btn{
  width:100%; padding:.95rem 0; margin-top:8px;
  border:none; border-radius:12px; font-weight:700; font-size:1.08rem; color:#fff;
  background:linear-gradient(90deg,#33aaff 30%,#256cbb 100%);
  box-shadow:0 3px 14px rgba(13,51,94,.35);
  cursor:pointer; position:relative; overflow:hidden;
  transition:transform .15s, box-shadow .15s;
}
/* ✨ Brilho deslizante */
.cta-btn::after{
  content:""; position:absolute; top:-120%; left:-30%;
  width:60%; height:300%;
  background:linear-gradient(115deg,rgba(255,255,255,0) 10%,rgba(255,255,255,.55) 45%,rgba(255,255,255,0) 70%);
  transform:rotate(25deg) translateX(-120%);
}
/* 🖱️ Hover: levanta e aciona brilho */
.cta-btn:hover{ transform:translateY(-1px); box-shadow:0 8px 26px rgba(10,53,95,.45); }
.cta-btn:hover::after{ animation:shine .9s ease-out; }
@keyframes shine{ to { transform:rotate(25deg) translateX(240%); } }

/* ⛔ Estado desabilitado durante o loading */
.cta-btn:disabled{ opacity:.7; cursor:wait; }

/* ✅ Mensagem de sucesso pós-login */
.ok{ color:#1edd9d; font-size:1rem; margin-top:10px; }

/* 🔗 Link para registro */
.register-link{ margin-top:18px; font-size:1.09rem; color:#ffffff; }
.register-link a{ color:#2db6ff; transition:color .18s; }
.register-link a:hover{ color:#fff; text-shadow:0 0 8px rgba(45,182,255,.5); }
</style>
