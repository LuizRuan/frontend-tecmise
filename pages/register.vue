<template>
  <!--
    =====================================================================
    📄 register.vue — Cadastro de usuário
    =====================================================================
    🎯 Objetivo
      - Exibir um formulário de criação de conta (nome, e-mail, senha e confirmação).
      - Validar progressivamente enquanto o usuário digita (sem travar a digitação).
      - Enviar os dados para o backend e dar feedback visual (loading / sucesso / erros).
      - Manter o mesmo visual e experiência do seu design atual.

    🧭 Estrutura do Template
      - <div.center>     -> Container de tela inteira com gradiente de fundo.
      - <form.card>      -> Cartão com logo, título, campos, CTA e links.
      - Campos:
          • Nome:      valida comprimento mínimo (progressivo).
          • E-mail:    bloqueia espaços via feedback (não impede digitar),
                       valida formato + domínio whitelisted.
          • Senha:     mínimo 8 caracteres e sem espaços (feedback imediato).
          • Confirma:  deve coincidir com a senha e sem espaços.
      - UX:
          • Mensagens de erro por campo, somente após "touched".
          • Botões de "olho" para mostrar/ocultar senhas (com aria-label dinâmica).
          • Botão principal com estado de loading e animação de brilho.

    ♿ Acessibilidade (A11Y)
      - Logo com alt descritivo ("Logo Tecmise").
      - Mensagens de erro com aria-live="polite" para leitores de tela.
      - Botões de visibilidade de senhas possuem aria-label descritiva.

    🧪 Como testar rapidamente
      1) Rode o projeto (ex.: `npm run dev`).
      2) Vá para "/register" e teste digitar: espaços no e-mail/senha/confirmar,
         formatos inválidos e domínios fora da whitelist.
      3) Envie o formulário; em caso de sucesso, deve limpar os campos e redirecionar
         para "/login" após ~900ms.

    🛠️ Notas para seniors
      - Validação "progressiva" (mostra erro quando touched e regra falha).
      - Domínios permitidos simplificam o escopo; ajuste conforme política.
      - Injeção de fonte via onMounted evita mexer em nuxt.config.ts (trade-off:
        possível FOUT/FOIT). Em prod, prefira preconnect + inclusão estática.
  -->
  <div class="center">
    <!--
      @submit.prevent="cadastrar"
      - Previne reload.
      - Chama a função cadastrar() (definida no <script setup>).
      - novalidate: desativa a validação nativa do browser para não conflitar
        com nossas regras customizadas.
    -->
    <form class="card" @submit.prevent="cadastrar" novalidate>
      <!-- 🖼️ Identidade visual -->
      <img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />
      <h2>Criar conta</h2>

      <!-- ===========================
           🧑 Nome completo
           - v-model.trim: remove espaços nas bordas.
           - touched + validarNome: exibe erro apenas após interação.
         =========================== -->
      <div class="field">
        <div class="input-wrap">
          <input
            v-model.trim="nome"
            type="text"
            placeholder="Nome completo"
            @blur="touch('nome')"
            @input="touched.nome && validarNome()"
            :class="{ errorinput: touched.nome && !!erros.nome }"
            autocomplete="off"
          />
        </div>
        <p v-if="touched.nome && erros.nome" class="erro" aria-live="polite">{{ erros.nome }}</p>
      </div>

      <!-- ===========================
           📧 E-mail
           - Feedback imediato para espaço (onEmailSpace).
           - Formato + domínio whitelisted.
           - touched + validarEmail: evita "gritar" erro antes do usuário agir.
         =========================== -->
      <div class="field">
        <div class="input-wrap">
          <input
            v-model="email"
            type="text"
            placeholder="Digite seu e-mail"
            @keydown.space="onEmailSpace"
            @blur="touch('email'); validarEmail()"
            @input="touched.email && validarEmail()"
            :class="{ errorinput: touched.email && !!erros.email }"
            autocomplete="off"
          />
        </div>
        <p v-if="touched.email && erros.email" class="erro" aria-live="polite">{{ erros.email }}</p>
      </div>

      <!-- ===========================
           🔑 Senha
           - Mínimo 8 caracteres, sem espaços.
           - Botão "olho" com aria-label dinâmica.
         =========================== -->
      <div class="field">
        <div class="input-wrap">
          <input
            v-model="senha"
            :type="mostrarSenha ? 'text' : 'password'"
            placeholder="Crie sua senha"
            @keydown.space="onSenhaSpace"
            @blur="touch('senha'); validarSenha()"
            @input="touched.senha && validarSenha()"
            :class="{ errorinput: touched.senha && !!erros.senha }"
            autocomplete="off"
          />
          <button
            type="button"
            class="olho-btn"
            @click="mostrarSenha = !mostrarSenha"
            :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
            tabindex="-1"
          >
            <!-- Ícones inline (sem dependências externas) -->
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
        <p v-if="touched.senha && erros.senha" class="erro" aria-live="polite">{{ erros.senha }}</p>
      </div>

      <!-- ===========================
           ✅ Confirmar senha
           - Deve coincidir com a senha e não conter espaços.
           - Botão "olho" próprio.
         =========================== -->
      <div class="field">
        <div class="input-wrap">
          <input
            v-model="confirmaSenha"
            :type="mostrarConfirma ? 'text' : 'password'"
            placeholder="Confirme sua senha"
            @keydown.space="onConfirmaSpace"
            @blur="touch('confirma'); validarConfirma()"
            @input="touched.confirma && validarConfirma()"
            :class="{ errorinput: touched.confirma && !!erros.confirma }"
            autocomplete="off"
          />
          <button
            type="button"
            class="olho-btn"
            @click="mostrarConfirma = !mostrarConfirma"
            :aria-label="mostrarConfirma ? 'Ocultar senha' : 'Mostrar senha'"
            tabindex="-1"
          >
            <svg v-if="!mostrarConfirma" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
        <p v-if="touched.confirma && erros.confirma" class="erro" aria-live="polite">{{ erros.confirma }}</p>
      </div>

      <!-- ===========================
           CTA: Cadastrar
           - :disabled="loading": evita duplo envio e altera rótulo.
         =========================== -->
      <button class="cta-btn" type="submit" :disabled="loading">
        <span v-if="loading">Cadastrando...</span>
        <span v-else>Cadastrar</span>
      </button>

      <!-- Feedback de sucesso e link para login -->
      <p v-if="ok" class="ok">Cadastrado com sucesso! Redirecionando para o login…</p>

      <p class="login-link">
        Já tem conta?
        <NuxtLink to="/login">Entrar</NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
// ============================================================================
// 🧠 Lógica do componente (Vue 3 + <script setup>)
// ============================================================================
// Regras gerais de UX/validação neste componente:
// - Não bloqueamos a digitação (inclusive espaço). Em vez disso, mostramos erro
//   IMEDIATO quando apropriado, para orientar o usuário sem "quebrar" o fluxo.
// - E-mail exige formato válido + domínio pertencente à whitelist.
// - Erros aparecem após o campo ser "tocado" (touched) — validação progressiva.

import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 📥 Modelos dos campos (e sem .trim para e-mail/senhas, a fim de detectar espaços)
const nome = ref('')
const email = ref('')           // sem .trim para detectar espaços
const senha = ref('')           // idem
const confirmaSenha = ref('')   // idem

// 🧾 Estados de erro e "tocado"
const erros = reactive({ nome: '', email: '', senha: '', confirma: '' })
const touched = reactive({ nome: false, email: false, senha: false, confirma: false })

// 🎛️ Estados de UI
const loading = ref(false)
const mostrarSenha = ref(false)
const mostrarConfirma = ref(false)
const ok = ref(false)

// 📨 Domínios de e-mail permitidos (ajuste conforme política da sua aplicação)
const ALLOWED_PROVIDERS = ['gmail.com', 'icloud.com', 'hotmail.com', 'outlook.com', 'live.com', 'yahoo.com']

// Marca um campo como "tocado" (após blur, por exemplo)
function touch(k){ touched[k] = true }

// Espaço: não bloqueia; apenas sinaliza erro imediato para orientar o usuário
function onEmailSpace(){ touch('email'); erros.email = 'O e-mail não pode conter espaços.' }
function onSenhaSpace(){ touch('senha'); erros.senha = 'A senha não pode conter espaços.' }
function onConfirmaSpace(){ touch('confirma'); erros.confirma = 'A senha não pode conter espaços.' }

// -------------------------
// ✅ Validações por campo
// -------------------------
function validarNome () {
  const v = nome.value.trim()
  if (!v) { erros.nome = ''; return }                  // progressivo
  erros.nome = v.length < 2 ? 'Informe seu nome completo.' : ''
}

function validarEmail () {
  const v = String(email.value || '')
  if (!v) { erros.email = ''; return }                 // progressivo
  if (/\s/.test(v)) { erros.email = 'O e-mail não pode conter espaços.'; return }

  // Formato básico: user@dominio.ext
  const formatoOk = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/i.test(v)
  if (!formatoOk) { erros.email = 'Digite um e-mail válido.'; return }

  // Whitelist de provedores
  const domain = v.split('@')[1]?.toLowerCase() || ''
  if (!ALLOWED_PROVIDERS.includes(domain)) {
    erros.email = 'Digite um e-mail válido.'
    return
  }
  erros.email = ''
}

function validarSenha () {
  const v = String(senha.value || '')
  if (!v) { erros.senha = ''; return }                 // progressivo
  if (/\s/.test(v)) { erros.senha = 'A senha não pode conter espaços.'; return }
  erros.senha = v.length < 8 ? 'A senha deve ter no mínimo 8 caracteres.' : ''
}

function validarConfirma () {
  const v = String(confirmaSenha.value || '')
  if (!v) { erros.confirma = ''; return }              // progressivo
  if (/\s/.test(v)) { erros.confirma = 'A senha não pode conter espaços.'; return }
  erros.confirma = v !== senha.value ? 'As senhas não conferem.' : ''
}

// ---------------------------------------------------------------------------
// 🚀 Fluxo de cadastro
//   - Toca todos os campos e executa as validações.
//   - Exibe mensagens obrigatórias se algum valor estiver vazio.
//   - Se estiver tudo ok, chama o backend e trata a resposta.
// ---------------------------------------------------------------------------
async function cadastrar () {
  // Marca campos como tocados e valida
  touch('nome'); touch('email'); touch('senha'); touch('confirma')
  validarNome(); validarEmail(); validarSenha(); validarConfirma()

  // Campos obrigatórios com mensagens padronizadas
  if (!nome.value.trim()) erros.nome = 'O nome é obrigatório.'
  if (!email.value) erros.email = erros.email || 'O e-mail é obrigatório.'
  if (!senha.value) erros.senha = erros.senha || 'A senha é obrigatória.'
  if (!confirmaSenha.value) erros.confirma = erros.confirma || 'Confirme sua senha.'

  // Se alguma validação falhou, interrompe
  if (erros.nome || erros.email || erros.senha || erros.confirma) return

  loading.value = true
  ok.value = false
  try {
    const res = await fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.value.trim(), email: email.value, senha: senha.value })
    })

    // Se o backend retornar erro (HTTP != 2xx), tentamos extrair a mensagem
    if (!res.ok) {
      const msg = await res.text().catch(()=> '')
      if (/email/i.test(msg)) erros.email = msg || 'E-mail inválido.'
      else if (/nome/i.test(msg)) erros.nome = msg || 'Nome inválido.'
      else erros.nome = msg || 'Erro ao cadastrar.'
      return
    }

    // Sucesso: limpamos campos/erros, mostramos feedback e redirecionamos
    nome.value = ''; email.value = ''; senha.value = ''; confirmaSenha.value = ''
    Object.keys(erros).forEach(k => erros[k] = '')
    Object.keys(touched).forEach(k => touched[k] = false)
    ok.value = true
    setTimeout(() => router.push('/login'), 900)
  } catch {
    // Falha de rede/servidor indisponível
    erros.nome = 'Falha de conexão. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// ---------------------------------------------------------------------------
// 🅰️ Fonte (Poppins) — Injeção dinâmica no cliente
//   - Mantém seu padrão atual.
//   - Em produção, considere mover para o <head> com preconnect.
// ---------------------------------------------------------------------------
onMounted(() => {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
})
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilos com escopo (scoped)
   - Mantêm o visual original sem vazar estilos para outros componentes.
   ========================================================================== */

/* 🌅 Fundo com gradiente + tipografia padrão desta tela */
.center{
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#233e6b 70%,#2479cc 100%);
  font-family:'Poppins',system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
}

/* 🗂️ Cartão do formulário com sombra e animação de entrada */
.card{
  background:rgba(35,55,110,.97);
  border-radius:24px;
  box-shadow:0 8px 36px #17366a34;
  width:100%; max-width:540px;
  padding:2.6rem 2.6rem 2.2rem;
  text-align:center; animation:fadein .7s;
  display:flex; flex-direction:column; align-items:center;
}

/* 🎞️ Animação de entrada (fade + leve translateY) */
@keyframes fadein{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}

/* 🖼️ Logo e título */
.logo-img{ width:290px; height:auto; }
h2{ color:#fff; font-weight:700; margin:8px 0 18px; letter-spacing:.2px; }

/* ===========================
   📦 Grupos de campos
   - field: bloco do campo + mensagem de erro.
   - input-wrap: controla altura e posicionamento do botão "olho".
   =========================== */
.field{ width:100%; margin-bottom:8px; }
.input-wrap{ position:relative; display:block; height:48px; }

/* ✍️ Inputs — cores, bordas, foco e espaçamentos */
input{
  width:100%; height:100%; box-sizing:border-box;
  padding:0 44px 0 16px;
  border-radius:14px; border:1.6px solid #2a4770;
  background:#26456f; color:#f7faff; font-size:1.05rem; outline:none;
  transition:border .18s, background .18s, box-shadow .18s;
}
input::placeholder{ color:#ffffff; opacity:.8; }
input:focus{ border-color:#3cc1ff; background:#2b5488; box-shadow:0 0 0 3px rgba(60,193,255,.18); }

/* 🚨 Estado de erro do input */
.errorinput{ border-color:#ff6b6b !important; background:#3a1f1f !important; }

/* 🧾 Texto de erro (logo abaixo do input) */
.erro{ margin:6px 0 0; line-height:1.1; font-size:.90rem; color:#ff6b6b; text-align:left; }

/* 👁️ Botão "olho" para visibilidade de senha/confirmar */
.olho-btn{
  position:absolute; top:50%; right:12px; transform:translateY(-50%);
  width:36px; height:36px; display:flex; align-items:center; justify-content:center;
  border:none; background:transparent; cursor:pointer;
  border-radius:50%; transition:background .15s;
}
.olho-btn:hover{ background:rgba(60,193,255,.15); }
.olho-btn svg{ width:22px; height:22px; fill:none; stroke:#36c0ff; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

/* 🔘 Botão principal (CTA) — com brilho e "lift" no hover */
.cta-btn{
  width:100%; padding:.95rem 0; margin-top:6px;
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
  background:linear-gradient(115deg,rgba(255,255,255,.0) 10%,rgba(255,255,255,.55) 45%,rgba(255,255,255,.0) 70%);
  transform:rotate(25deg) translateX(-120%);
}
/* 🖱️ Hover: levanta e aciona brilho */
.cta-btn:hover{ transform:translateY(-1px); box-shadow:0 8px 26px rgba(10,53,95,.45); }
.cta-btn:hover::after{ animation:shine .9s ease-out; }
@keyframes shine{ to { transform:rotate(25deg) translateX(240%); } }

/* ⛔ Estado desabilitado durante loading */
.cta-btn:disabled{ opacity:.7; cursor:wait; }

/* ✅ Mensagem de sucesso pós-cadastro */
.ok{ color:#1edd9d; font-size:1rem; margin-top:10px; }

/* 🔗 Link para login */
.login-link{ margin-top:18px; font-size:1.02rem; color:#e7f3ff; }
.login-link a{ color:#40dbff; text-decoration:underline; }
.login-link a:hover{ color:#fff; text-shadow:0 0 8px rgba(64,219,255,.6); }
</style>
