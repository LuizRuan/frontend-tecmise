<!--
  ===========================================================
  EstudanteModal.vue
  ===========================================================
  🎯 Responsabilidade
    - Modal para cadastrar **ou** editar um estudante.
    - Coleta/edita: nome, CPF, e-mail, data de nascimento, telefone, ano/turma e foto.
    - Valida campos (live + blur + submit), previne duplicidade (CPF/e-mail) e normaliza dados antes de enviar.

  🧭 Fluxo resumido
    1) Pai abre o modal (prop `show` = true) e fornece `form` (em edição) ou objeto vazio (novo).
    2) `syncFromProps()` clona `form` → `local`, ajusta data para BR (se ISO), zera estados e foca no modal.
    3) Usuário edita:
       - Máscaras visuais (CPF/tel/data) nos inputs.
       - Validações em tempo real (`live/blur`) populam `msg` e `touched`.
       - Duplicidade (CPF/e-mail) checada com **debounce** via `checkCpf/checkEmail` (se fornecidas).
    4) Envio (`onSubmit`):
       - Marca todos campos como tocados, valida tudo e re-checa duplicidade.
       - Se houver erro → foca primeiro campo com `.erroInput`.
       - Se ok → normaliza (`cpf/telefone` só dígitos; `email` lower/trim) e emite:
         • `update:form` (dados prontos) e • `salvar` (pai persiste).
    5) Fechar:
       - Botão "Cancelar", clique no overlay (`@click.self`) ou tecla ESC → `onFechar()` emite `fechar` + `update:show(false)`.

  📥 Props
    - show:Boolean       • visibilidade do modal
    - editando:Boolean   • modo edição (true) ou cadastro (false)
    - form:Object        • dados vindos do pai (ex.: { id, nome, ... })
    - erros:Object       • erros externos (mantido por compat)
    - anosTurmas:Array   • opções { id, nome } para o select de Ano/Turma
    - defaultAvatar:String • URL do avatar padrão
    - checkCpf:Function  • async(cpf, ignoreId?) ⇒ boolean (duplicado?)
    - checkEmail:Function• async(email, ignoreId?) ⇒ boolean (duplicado?)

  🔄 Eventos emitidos
    - salvar           → pai deve persistir os dados
    - fechar           → pai deve fechar o modal
    - update:form      → envia objeto normalizado (pronto para salvar)
    - update:show      → sugere fechar (false) ao pai

  🛡️ Estados internos
    - local:Object     • snapshot editável do `form`
    - touched:Object   • campos tocados para UX progressiva
    - msg:Object       • mensagens de erro por campo
    - salvando:Boolean • trava botão/estilo durante envio
    - original:Object  • guarda CPF/e-mail originais (modo edição) p/ evitar falso-positivo de duplicidade
    - previewFoto      • computed: mostra `local.fotoUrl` ou `defaultAvatar`
    - disableSalvar    • computed: desabilita botão quando `salvando` = true

  🧰 Utilitários
    - onlyDigits       • remove tudo que não é dígito
    - cpfMask/telMask  • máscaras visuais
    - dataMaskBR       • máscara dd/mm/aaaa
    - isoToBR / parseBrDateToISO / isValidISODate / isFutureISO
    - coerceInvalidOrFutureToToday • evita datas inválidas/futuras
    - basicEmailOk / isValidEmailStrict / normalizeEmail
    - isValidCPF       • valida dígitos verificadores (DV)
    - debounce         • limita chamadas de duplicidade

  ♿ Acessibilidade
    - role="dialog", aria-modal="true", aria-labelledby
    - foco automático no container ao abrir
    - fecha com ESC e clique no backdrop

  ⚠️ Notas de implementação
    - Comentários **não** alteram a lógica; layout, classes e comportamento permanecem iguais.
    - Tamanho máximo de foto: 5MB (silenciosamente ignorado se exceder).
-->
<template>
  <transition name="modal">
    <!-- Overlay do modal: fecha ao clicar fora do card -->
    <div v-if="show" class="modal-bg" @click.self="onFechar">
      <!-- Card do modal (bloqueia propagação) -->
      <div
        ref="modalRef"
        class="modal-card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="0"
        @click.stop
      >
        <!-- Título dinâmico: novo x edição -->
        <h3 :id="titleId" class="modal-title">
          {{ editando ? 'Editar estudante' : 'Novo estudante' }}
        </h3>

        <!-- Avatar + botão para trocar a foto -->
        <div class="avatar-edit">
          <label for="foto-estudante">
            <img :src="previewFoto" class="avatar-img" alt="Foto do estudante" />
            <input id="foto-estudante" type="file" accept="image/*" @change="onFotoChange" hidden />
          </label>
          <button type="button" class="avatar-upload-text" @click="abrirSeletorFoto">
            Adicionar / Alterar foto
          </button>
        </div>

        <!-- Form principal (sem recarregar; validações client-side) -->
        <form @submit.prevent="onSubmit" class="form-grid" autocomplete="off" novalidate>
          <!-- Nome -->
          <input
            v-model="local.nome"
            type="text"
            placeholder="Nome completo"
            aria-label="Nome completo"
            :class="{ erroInput: touched.nome && msg.nome }"
            @input="live('nome')"
            @blur="validarCampo('nome')"
            autocapitalize="words"
          />
          <p v-if="touched.nome && msg.nome" class="erro-msg">{{ msg.nome }}</p>

          <!-- CPF (mascarado na view; valor real em `local.cpf`) -->
          <input
            :value="cpfMask(local.cpf)"
            placeholder="CPF"
            aria-label="CPF"
            inputmode="numeric"
            :class="{ erroInput: touched.cpf && msg.cpf }"
            @input="onCpfInput"
            @blur="onCpfBlur"
          />
          <p v-if="touched.cpf && msg.cpf" class="erro-msg">{{ msg.cpf }}</p>

          <!-- E-mail -->
          <input
            v-model="local.email"
            type="text"
            placeholder="E-mail"
            aria-label="E-mail"
            :class="{ erroInput: touched.email && msg.email }"
            @input="onEmailInput"
            @blur="onEmailBlur"
            autocomplete="off"
            spellcheck="false"
          />
          <p v-if="touched.email && msg.email" class="erro-msg">{{ msg.email }}</p>

          <!-- Data de nascimento (dd/mm/aaaa) -->
          <input
            v-model="local.dataNascimento"
            type="text"
            placeholder="dd/mm/aaaa"
            aria-label="Data de nascimento"
            inputmode="numeric"
            :class="{ erroInput: false }"
            @input="onDataInput"
            @blur="onDataBlur"
          />

          <!-- Telefone (mascarado na view; valor real em `local.telefone`) -->
          <input
            :value="telMask(local.telefone)"
            placeholder="Telefone"
            aria-label="Telefone"
            inputmode="numeric"
            :class="{ erroInput: touched.telefone && msg.telefone }"
            @input="onTelInput"
            @blur="validarCampo('telefone')"
          />
          <p v-if="touched.telefone && msg.telefone" class="erro-msg">{{ msg.telefone }}</p>

          <!-- Ano/Turma (CustomSelect controlado por v-model) -->
          <CustomSelect
            v-model="local.anoTurmaId"
            :options="anosTurmas"
            placeholder="Selecione Ano e Turma"
            aria-label="Ano e Turma"
            @blur="validarCampo('anoTurmaId')"
          />
          <p v-if="touched.anoTurmaId && msg.anoTurmaId" class="erro-msg">{{ msg.anoTurmaId }}</p>

          <!-- Ações -->
          <div class="modal-btns">
            <button type="submit" class="btn-salvar" :disabled="disableSalvar">
              {{ salvando ? 'Salvando...' : (editando ? 'Salvar' : 'Cadastrar') }}
            </button>
            <button type="button" class="btn-cancelar" @click="onFechar">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
/* --------------------------------------------------------------------------
   Imports
-------------------------------------------------------------------------- */
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import CustomSelect from './CustomSelect.vue'

/* --------------------------------------------------------------------------
   Props & Emits
   - `checkCpf`/`checkEmail` são funções opcionais do pai para checar duplicidade.
-------------------------------------------------------------------------- */
const props = defineProps({
  show: Boolean,
  editando: Boolean,
  form: { type: Object, default: () => ({}) },
  erros: { type: Object, default: () => ({}) },
  anosTurmas: { type: Array, default: () => [] },
  defaultAvatar: { type: String, default: '' },
  checkCpf: { type: Function, default: null },
  checkEmail: { type: Function, default: null }
})
const emit = defineEmits(['salvar', 'fechar', 'update:form', 'update:show'])

/* --------------------------------------------------------------------------
   Estado do formulário (local) e validações
-------------------------------------------------------------------------- */
const local = reactive({ id:null, nome:'', cpf:'', email:'', dataNascimento:'', telefone:'', fotoUrl:'', anoTurmaId:'' })
const touched = reactive({ nome:false, cpf:false, email:false, dataNascimento:false, telefone:false, anoTurmaId:false })
const msg     = reactive({ nome:'', cpf:'', email:'', dataNascimento:'', telefone:'', anoTurmaId:'' })

/* --------------------------------------------------------------------------
   Metadados e refs
-------------------------------------------------------------------------- */
const salvando = ref(false)
const titleId = 'modal-estudante'
const modalRef = ref(null)

/* Guarda valores originais (modo edição) para evitar duplicidade desnecessária */
const original = reactive({ cpf:'', email:'' })

/* --------------------------------------------------------------------------
   Computeds de interface
-------------------------------------------------------------------------- */
const previewFoto  = computed(() => local.fotoUrl || props.defaultAvatar)
const disableSalvar= computed(() => salvando.value)

/* --------------------------------------------------------------------------
   Utilitários de máscara e data
-------------------------------------------------------------------------- */
const onlyDigits = s => String(s || '').replace(/\D/g, '')
const cpfMask = d => {
  const x = onlyDigits(d).slice(0, 11)
  return x.replace(/^(\d{3})(\d)/,'$1.$2')
          .replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3')
          .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/,'$1.$2.$3-$4')
}
const telMask = d => {
  const x = onlyDigits(d).slice(0,11)
  if(!x) return ''
  if(x.length<=2) return `(${x}`
  if(x.length<=7) return `(${x.slice(0,2)}) ${x.slice(2)}`
  return `(${x.slice(0,2)}) ${x.slice(2,7)}-${x.slice(7)}`
}
const dataMaskBR = s => {
  const d = onlyDigits(s).slice(0,8)
  if(!d) return ''
  if(d.length<=2) return d
  if(d.length<=4) return `${d.slice(0,2)}/${d.slice(2)}`
  return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`
}
const isISO = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s||''))
const isoToBR = iso => (isISO(iso) ? `${iso.slice(8,10)}/${iso.slice(5,7)}/${iso.slice(0,4)}` : iso)
const parseBrDateToISO = br => {
  const m = String(br||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}
const todayISO = () => { const d=new Date(); d.setHours(0,0,0,0); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const todayBR = () => isoToBR(todayISO())
const isFutureISO = (iso) => { if(!iso) return false; const t=new Date(); t.setHours(0,0,0,0); return new Date(`${iso}T00:00:00`).getTime() > t.getTime() }
function isValidISODate(iso) {
  if (!isISO(iso)) return false
  const d = new Date(`${iso}T00:00:00`)
  if (isNaN(d.getTime())) return false
  const y = d.getUTCFullYear(), m = String(d.getUTCMonth()+1).padStart(2,'0'), da = String(d.getUTCDate()).padStart(2,'0')
  return `${y}-${m}-${da}` === iso
}
function coerceInvalidOrFutureToToday(br) {
  const iso = parseBrDateToISO(br)
  if (!iso || !isValidISODate(iso) || isFutureISO(iso)) return todayBR()
  return br
}

/* --------------------------------------------------------------------------
   Validação de e-mail e domínio permitido
-------------------------------------------------------------------------- */
const allowedDomains = [
  'gmail.com','hotmail.com','outlook.com','live.com','icloud.com','yahoo.com','proton.me',
  'bol.com.br','uol.com.br','terra.com.br','yahoo.com.br','outlook.com.br'
]
const normalizeEmail = e => String(e||'').trim().toLowerCase()
const basicEmailOk = e => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)
function isValidEmailStrict(e){
  const v = normalizeEmail(e)
  if (!v || /\s/.test(v)) return false
  if (!basicEmailOk(v)) return false
  const domain = v.split('@')[1] || ''
  return allowedDomains.includes(domain)
}

/* --------------------------------------------------------------------------
   Validação de CPF (dígitos verificadores)
-------------------------------------------------------------------------- */
const isValidCPF = cpf => {
  const s = onlyDigits(cpf)
  if (s.length!==11 || /^(\d)\1+$/.test(s)) return false
  let soma=0; for(let i=0;i<9;i++) soma+=+s[i]*(10-i)
  let resto=(soma*10)%11; if(resto===10) resto=0; if(resto!==+s[9]) return false
  soma=0; for(let i=0;i<10;i++) soma+=+s[i]*(11-i)
  resto=(soma*10)%11; if(resto===10) resto=0
  return resto===+s[10]
}

/* --------------------------------------------------------------------------
   Debounce utilitário
-------------------------------------------------------------------------- */
function debounce(fn, wait=350){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait) } }

/* --------------------------------------------------------------------------
   Handlers: CPF (máscara, validação, duplicidade)
-------------------------------------------------------------------------- */
function onCpfInput(e){
  local.cpf = onlyDigits(e.target.value).slice(0,11)
  e.target.value = cpfMask(local.cpf)
  touched.cpf = true
  validarCampo('cpf')
  if (onlyDigits(local.cpf).length === 11 && isValidCPF(local.cpf)) checkCpfDuplicateDebounced()
}
const checkCpfDuplicateDebounced = debounce(async () => {
  if (!props.checkCpf) return
  const atual = onlyDigits(local.cpf)
  if (props.editando && atual === original.cpf) return
  const existe = await props.checkCpf(atual, local.id || null)
  if (existe) msg.cpf = 'Este CPF já está cadastrado para outro estudante.'
}, 220)
async function onCpfBlur(){
  validarCampo('cpf')
  if (msg.cpf) return
  if (props.checkCpf && onlyDigits(local.cpf).length === 11) {
    const atual = onlyDigits(local.cpf)
    if (props.editando && atual === original.cpf) return
    const existe = await props.checkCpf(atual, local.id || null)
    if (existe) msg.cpf = 'Este CPF já está cadastrado para outro estudante.'
  }
}

/* --------------------------------------------------------------------------
   Handlers: E-mail (live, blur, duplicidade)
-------------------------------------------------------------------------- */
const checkEmailDuplicateDebounced = debounce(async () => {
  if (!props.checkEmail) return
  const val = normalizeEmail(local.email)
  if (!isValidEmailStrict(val)) return
  if (props.editando && val === original.email) return
  const existe = await props.checkEmail(val, local.id || null)
  if (existe) msg.email = 'Este e-mail já está cadastrado para outro estudante.'
}, 250)

function onEmailInput () {
  touched.email = true
  const v = String(local.email || '')
  if (/\s/.test(v)) { msg.email = 'O e-mail não pode conter espaços.'; return }
  if (!v) { msg.email = ''; return }
  if (!basicEmailOk(v)) { msg.email = 'Digite um e-mail válido.'; return }
  const domain = v.split('@')[1]?.toLowerCase() || ''
  if (!allowedDomains.includes(domain)) { msg.email = 'Digite um e-mail válido.'; return }
  msg.email = ''
  checkEmailDuplicateDebounced()
}

async function onEmailBlur(){
  validarCampo('email')
  if (msg.email) return
  if (props.checkEmail) {
    const val = normalizeEmail(local.email)
    if (!isValidEmailStrict(val)) return
    if (props.editando && val === original.email) return
    const existe = await props.checkEmail(val, local.id || null)
    if (existe) msg.email = 'Este e-mail já está cadastrado para outro estudante.'
  }
}

/* --------------------------------------------------------------------------
   Handlers: Telefone (máscara + validação progressiva)
-------------------------------------------------------------------------- */
function onTelInput(e){
  local.telefone = onlyDigits(e.target.value).slice(0,11)
  e.target.value = telMask(local.telefone)
  touched.telefone = true
  validarCampo('telefone')
}

/* --------------------------------------------------------------------------
   Handlers: Data de nascimento (máscara + coerção)
-------------------------------------------------------------------------- */
function onDataInput(e){
  const masked = dataMaskBR(e.target.value).slice(0,10)
  local.dataNascimento = masked
  e.target.value = masked
  if (masked.length === 10) {
    const coerced = coerceInvalidOrFutureToToday(masked)
    if (coerced !== masked) {
      local.dataNascimento = coerced
      e.target.value = coerced
    }
  }
}
function onDataBlur(){
  if (!local.dataNascimento) return
  const coerced = coerceInvalidOrFutureToToday(local.dataNascimento)
  local.dataNascimento = coerced
}

/* --------------------------------------------------------------------------
   UX: marca campo como tocado e valida
-------------------------------------------------------------------------- */
function live(campo){ touched[campo] = true; validarCampo(campo) }

/* --------------------------------------------------------------------------
   Foto: abre seletor e gera preview (base64)
-------------------------------------------------------------------------- */
function abrirSeletorFoto(){ document.getElementById('foto-estudante')?.click() }
function onFotoChange(e){
  const file = e.target.files?.[0]
  if(!file) return
  if(file.size > 5*1024*1024){ return }
  const reader = new FileReader()
  reader.onload = evt => local.fotoUrl = evt.target.result
  reader.readAsDataURL(file)
}

/* --------------------------------------------------------------------------
   Validação por campo (mensagens em `msg`)
-------------------------------------------------------------------------- */
function validarCampo(campo){
  switch(campo){
    case 'nome':
      msg.nome = !local.nome.trim() ? 'Informe o nome.' : ''
      break
    case 'cpf':
      msg.cpf  = !local.cpf ? 'Informe o CPF.' : (!isValidCPF(local.cpf) ? 'CPF inválido.' : '')
      break
    case 'email': {
      const v = String(local.email || '')
      if (!v) { msg.email = 'Informe o e-mail.'; break }
      if (/\s/.test(v)) { msg.email = 'O e-mail não pode conter espaços.'; break }
      if (!basicEmailOk(v)) { msg.email = 'Digite um e-mail válido.'; break }
      const domain = v.split('@')[1]?.toLowerCase() || ''
      msg.email = allowedDomains.includes(domain) ? '' : 'Digite um e-mail válido.'
      break
    }
    case 'dataNascimento':
      if ((local.dataNascimento || '').length) local.dataNascimento = coerceInvalidOrFutureToToday(local.dataNascimento)
      msg.dataNascimento = ''
      break
    case 'telefone':
      msg.telefone = local.telefone && local.telefone.length!==11 ? 'Telefone inválido.' : ''
      break
    case 'anoTurmaId':
      msg.anoTurmaId = !local.anoTurmaId ? 'Selecione Ano/Turma.' : ''
      break
  }
}

/* --------------------------------------------------------------------------
   Submit: valida tudo, re-checa duplicidade e emite eventos
-------------------------------------------------------------------------- */
async function onSubmit(){
  Object.keys(touched).forEach(k => touched[k] = true)
  Object.keys(touched).forEach(c => validarCampo(c))

  // Duplicidade de CPF (final)
  if (!msg.cpf && props.checkCpf && onlyDigits(local.cpf).length === 11 && isValidCPF(local.cpf)) {
    const atual = onlyDigits(local.cpf)
    if (!(props.editando && atual === original.cpf)) {
      const existe = await props.checkCpf(atual, local.id || null)
      if (existe) msg.cpf = 'Este CPF já está cadastrado para outro estudante.'
    }
  }
  // Duplicidade de e-mail (final)
  if (!msg.email && props.checkEmail) {
    const val = normalizeEmail(local.email)
    if (isValidEmailStrict(val) && !(props.editando && val === original.email)) {
      const existe = await props.checkEmail(val, local.id || null)
      if (existe) msg.email = 'Este e-mail já está cadastrado para outro estudante.'
    }
  }

  // Se tem erro, foca primeiro campo inválido
  if (Object.values(msg).some(Boolean)) {
    nextTick(() => document.querySelector('.erroInput')?.focus())
    return
  }

  // Normaliza e envia
  salvando.value = true
  const normalizado = {
    ...local,
    cpf: onlyDigits(local.cpf),
    telefone: onlyDigits(local.telefone),
    email: normalizeEmail(local.email)
  }
  emit('update:form', normalizado)
  emit('salvar')
}

/* --------------------------------------------------------------------------
   Fechamento e acessibilidade (ESC)
-------------------------------------------------------------------------- */
function onFechar(){ emit('fechar'); emit('update:show', false) }
function onEsc(e){ if(e.key==='Escape' && props.show) onFechar() }

/* --------------------------------------------------------------------------
   Sincroniza estado local a partir das props quando abre/atualiza
-------------------------------------------------------------------------- */
function syncFromProps(){
  const f = { ...(props.form || {}) }
  const iso = f.data_nascimento || f.dataNascimento || ''
  const br  = isISO(iso) ? isoToBR(iso) : (f.dataNascimento || '')
  Object.assign(local, {
    id: f.id ?? null,
    nome: f.nome || '',
    cpf: f.cpf || '',
    email: f.email || '',
    dataNascimento: br || '',
    telefone: f.telefone || '',
    fotoUrl: f.foto_url || f.fotoUrl || '',
    anoTurmaId: f.anoTurmaId ?? f.ano_id ?? ''
  })
  original.cpf   = onlyDigits(local.cpf || '')
  original.email = normalizeEmail(local.email || '')
  Object.keys(touched).forEach(k => touched[k] = false)
  Object.keys(msg).forEach(k => msg[k] = '')
  salvando.value = false
  nextTick(() => modalRef.value?.focus())
}

/* --------------------------------------------------------------------------
   Watchers e ciclo de vida
-------------------------------------------------------------------------- */
watch(() => props.show, v => { if(v) syncFromProps() })
watch(() => props.form, () => { if(props.show) syncFromProps() }, { deep:true })
onMounted(() => { document.addEventListener('keydown', onEsc); if(props.show) syncFromProps() })
onBeforeUnmount(() => document.removeEventListener('keydown', onEsc))
</script>

<style scoped>
/* ===========================================================
   Overlay e Card
   -----------------------------------------------------------
   - .modal-bg: backdrop escuro (fecha ao clicar fora)
   - .modal-card: container central com sombra e animação
=========================================================== */
.modal-bg{ position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:99; }
.modal-card{ background:#183765; border-radius:15px; width:min(92vw,540px); padding:2rem; box-shadow:0 12px 50px #0004; animation:pop .28s ease-out; }
@keyframes pop{ from{opacity:0; transform:scale(.94)} to{opacity:1; transform:scale(1)} }
.modal-title{ color:#32e0ff; font-size:1.4rem; font-weight:800; margin-bottom:12px; text-align:center; }

/* ===========================================================
   Avatar / Upload
=========================================================== */
.avatar-edit{ display:flex; flex-direction:column; align-items:center; margin-bottom:16px; }
.avatar-img{ width:86px; height:86px; border-radius:50%; object-fit:cover; margin-bottom:8px; border:3px solid #36c5ff44; background:#193255; cursor:pointer; }
.avatar-upload-text{ color:#3bc7ff; font-weight:700; cursor:pointer; background:none; border:none; }

/* ===========================================================
   Formulário e inputs
=========================================================== */
.form-grid{ display:flex; flex-direction:column; gap:10px; }
input{ width:100%; padding:.66rem .95rem; border-radius:8px; border:1.2px solid #3b5998; background:#25447b; color:#fff; font-size:.97rem; }
input::placeholder{ color:#9fb4d8; }
input:focus{ border-color:#3bc7ff; background:#295291; box-shadow:0 0 0 3px rgba(60,193,255,.18); outline:none; }
.erroInput{ border-color:#ff5b5b !important; background:#331c1c !important; }
.erro-msg{ color:#ff5b5b; font-size:.91rem; margin:-6px 0 6px; }

/* ===========================================================
   Ações do modal (botões)
=========================================================== */
.modal-btns{ display:flex; gap:12px; justify-content:center; margin-top:8px; }

/* Botão salvar (gradiente/hover/focus) */
.btn-salvar{
  padding:.62rem 1.09rem; border-radius:7px; border:none; font-size:1rem; font-weight:700;
  background:linear-gradient(90deg,#32e0ff 30%, #2956a6 100%);
  background-size:200% 100%; background-position:0 0;
  color:#fff; cursor:pointer;
  transition: transform .17s, filter .17s, box-shadow .17s, background-position .35s;
  box-shadow:0 6px 16px rgba(50,224,255,.15);
}
.btn-salvar:hover:not([disabled]),
.btn-salvar:focus-visible:not([disabled]){
  transform: translateY(-1px) scale(1.02);
  filter: brightness(1.06);
  background-position:100% 0;
  box-shadow:0 10px 24px rgba(50,224,255,.28);
  outline:none;
}
.btn-salvar:active:not([disabled]){
  transform: translateY(0) scale(.98);
  filter: brightness(.98);
  box-shadow:0 4px 12px rgba(50,224,255,.2);
}
.btn-salvar[disabled]{ opacity:.65; cursor:not-allowed; filter:none; transform:none; box-shadow:none; }

/* Botão cancelar (tema escuro/vermelho) */
.btn-cancelar{
  padding:.62rem 1.09rem; border-radius:7px; border:none; font-size:1rem; font-weight:700;
  background:#2b334b; color:#f64f61; cursor:pointer;
  transition: transform .16s, background .18s, color .18s, box-shadow .16s, filter .16s;
  box-shadow:0 6px 16px rgba(15,25,45,.25);
}
.btn-cancelar:hover,
.btn-cancelar:focus-visible{
  background:#ff5b5b; color:#fff;
  transform: translateY(-1px);
  box-shadow:0 10px 22px rgba(255,91,91,.25);
  outline:none;
}
.btn-cancelar:active{
  transform: translateY(0) scale(.98);
  filter: brightness(.98);
}
</style>
