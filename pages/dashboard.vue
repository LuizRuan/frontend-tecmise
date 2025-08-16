<template>
  <!--
    =====================================================================
    📄 Dashboard.vue — Área logada (Gestão de Estudantes / Ano-Turma / Perfil)
    =====================================================================
    🎯 Objetivo
      - Exibir cabeçalho com identidade e usuário logado.
      - Listar estudantes com filtros por Ano/Turma e busca textual.
      - Abrir modais: adicionar/editar estudante, perfil, ampliar foto,
        confirmação de exclusão (estudante e ano/turma), logout, tutorial.
      - Integrar com backend para CRUD e verificação de duplicidades.

    🧭 Mapa do Template
      - Splash de carregamento (evita flicker durante onMounted).
      - Wrapper autenticado/Não autenticado.
      - Header com logo + info do usuário + botão Perfil.
      - Main com título, filtros, ações (“+ Novo”, “Buscar Estudante”) e tabela.
      - Montagem de todos os modais (controlados por refs/booleans).
      - Tutorial de onboarding (com lock de demo).
      - Componente de busca montado ao final via ref (modal controlado pelo pai).

    ♿ Acessibilidade (A11Y)
      - Imagens com alt.
      - Botões com rótulos claros; estados visuais nos focos/hover.
      - Mensagens de erro exibidas nos modais específicos.
  -->

  <!-- Splash de carregamento (evita flicker de "não autenticado" ao montar) -->
  <div v-if="carregando"></div>

  <!-- App -->
  <div v-else class="dashboard-bg" @click="fecharPopups">
    <!-- Autenticado -->
    <div v-if="isAutenticado" class="dashboard-container expandido" @click.stop>
      <!-- Header -->
      <header class="header">
        <div class="logo-flex">
          <img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />
        </div>
        <div class="user-info">
          <span class="user-name">Olá, <strong>{{ usuario.nome || 'Usuário' }}</strong></span>
          <button class="profile-btn" type="button" data-tutorial="btn-perfil" @click.stop="abrirPerfil">Perfil</button>
        </div>
      </header>

      <!-- Conteúdo principal -->
      <main class="main-content expandido-main">
        <section class="clientes-section">
          <div class="clientes-header">
            <h2 class="titulo-lista">Estudantes</h2>

            <div class="acoes-header">
              <!-- 🎛️ Filtro Ano/Turma -->
              <FiltrosEstudante
                :anoTurmaList="anosTurmas || []"
                :selecionado="anoTurmaSelecionado || defaultSelecao"
                @selecionar="selecionarAnoTurma"
                @abrir-modal-ano-turma="abrirModalAnoTurma"
                @remover-ano-turma="abrirConfirmarExcluirAno"   
              />

              <!-- ➕ Novo Estudante -->
              <button class="add-btn" type="button" data-tutorial="btn-aluno" @click.stop="abrirModalAdicionar">
                + Novo Estudante
              </button>

              <!-- 🔍 Buscar Estudante (abre modal do componente BuscarEstudante) -->
              <button class="add-btn" type="button" data-tutorial="btn-busca" @click="abrirBusca" style="margin-left:auto">
                🔍 Buscar Estudante
              </button>
            </div>
          </div>

          <!-- 🧾 Tabela de estudantes -->
          <EstudantesTable
            :clientes="clientesFiltradosBusca"
            :anosTurmas="anosTurmas || []"
            :defaultAvatar="defaultAvatar"
            @editar="editar"
            @excluir="abrirConfirmarExcluir"
            @ampliar-foto="abrirModalFoto"
          />
        </section>
      </main>

      <!-- ============================
           🧩 Modais montados no root
           - Controlados por booleans/refs.
           ============================ -->

      <!-- Adicionar Ano/Turma -->
      <ModalAdicionarAno
        :show="showModalAnoTurma"
        :nome="novoAnoTurmaNome"
        @salvar="adicionarAnoTurma"
        @cancelar="fecharModalAnoTurma"
      />

      <!-- Estudante: criar/editar -->
      <EstudanteModal
        :show="showModal"
        :editando="editando"
        :form="clienteForm"
        :erros="errosEstudante"
        :anosTurmas="anosTurmas || []"
        :defaultAvatar="defaultAvatar"
        :key="modalKey"
        :checkCpf="checkCpfNoServidor" 
        :checkEmail="checkEmailNoServidor"
        @update:form="(v) => { console.log('[Pai] update:form', v); Object.assign(clienteForm, v) }"
        @salvar="salvarCliente"
        @fechar="fecharModal"
      />

      <!-- Perfil do usuário -->
      <PerfilModal
        :show="showPerfil"
        :form="perfilForm"
        :erros="errosPerfil"
        :erro="erroPerfil"
        :defaultAvatar="defaultAvatar"
        @salvar="salvarPerfil"
        @fechar="fecharPerfil"
        @logout="confirmarLogout"
      />

      <!-- Confirmação de exclusão de ESTUDANTE -->
      <ConfirmarExclusaoModal
        :show="showConfirmarExcluir"
        :estudante="estudanteExcluir"
        @confirmar="confirmarExcluir"
        @cancelar="cancelarExcluir"
      />

      <!-- ✅ Confirmação de exclusão de ANO/TURMA -->
      <ConfirmarExclusaoModal
        :show="showConfirmarExcluirAno"
        :nomeAlvo="anoTurmaExcluir?.nome || ''"
        :mensagem="'Tem certeza que deseja remover'"
        :submensagem="'Apenas o vínculo dos estudantes com este Ano/Turma será removido.'"
        @confirmar="confirmarExcluirAno"
        @cancelar="cancelarExcluirAno"
      />

      <!-- Ampliar foto do estudante -->
      <AmpliarFotoModal
        :show="showFotoModal"
        :foto="estudanteFotoModal.foto"
        :nome="estudanteFotoModal.nome"
        :ano="estudanteFotoModal.ano"
        @fechar="fecharModalFoto"
      />

      <!-- Sair da conta -->
      <ConfirmarLogoutModal
        :show="showConfirmarLogout"
        @confirmar="sairConta"
        @cancelar="showConfirmarLogout = false"
      />

      <!-- Tutorial de onboarding (primeiro acesso) -->
      <TutorialOnboarding
        :show="showTutorial"
        :user-id="(usuario && usuario.id) || 0"
        :api-base="'http://localhost:8080'"
        @demo-lock="(v) => lockDemo = v"
        @marcado="onTutorialMarkSeen"
        @abrir-modal-ano="abrirModalAnoTurma"
        @fechar-modal-ano="fecharModalAnoTurma"
        @abrir-modal-estudante="abrirModalAdicionar"
        @fechar-modal-estudante="fecharModal"
        @abrir-modal-perfil="abrirPerfil"
        @fechar-modal-perfil="fecharPerfil"
        @close="showTutorial = false"
        seletor-ano-turma-btn='[data-tutorial="btn-ano"]'
      />

      <!-- Trava de interação durante a demo do tutorial -->
      <div v-if="lockDemo" class="lock-overlay" @click.stop></div>
    </div>

    <!-- Não autenticado -->
    <div v-else class="nao-autenticado">
      <h2>Usuário não autenticado ou sessão expirada.</h2>
      <p><a href="/login" style="color:#2db6ff;">Fazer login</a></p>
    </div>
  </div>

  <!-- Modal de busca (controlado por ref; montado aqui para fácil acesso) -->
  <BuscarEstudante ref="buscaRef" :alunos="clientes" :anosTurmas="anosTurmas || []" />
</template>

<script setup>
/**
 * =====================================================================
 * 🧠 Script (Vue 3 + <script setup>)
 * =====================================================================
 * Mantido TODO o fluxo original. Comentários explicam responsabilidades
 * por seção (helpers, base, dados, modais, backend, filtros, CRUD, etc.).
 */

import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/* -------------------------------
   📦 Componentes filhos utilizados
   ------------------------------- */
import EstudantesTable from '../components/EstudantesTable.vue'
import EstudanteModal from '../components/EstudanteModal.vue'
import PerfilModal from '../components/PerfilModal.vue'
import ConfirmarExclusaoModal from '../components/ConfirmarExclusaoModal.vue'
import ConfirmarLogoutModal from '../components/ConfirmarLogoutModal.vue'
import FiltrosEstudante from '../components/FiltrosEstudante.vue'
import AmpliarFotoModal from '../components/AmpliarFotoModal.vue'
import ModalAdicionarAno from '../components/ModalAdicionarAno.vue'
import TutorialOnboarding from '../components/TutorialOnboarding.vue'
import BuscarEstudante from '../components/BuscarEstudante.vue'

/* ===== Helpers utilitários de formatação/validação de data ===== */
const trim = (v) => String(v ?? '').trim()
const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
const brToISO = (br) => {
  const m = String(br||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return br || ''
  return `${m[3]}-${m[2]}-${m[1]}`
}
const isFutureISO = (iso) => {
  if (!iso) return false
  const t = new Date(); t.setHours(0,0,0,0)
  return new Date(`${iso}T00:00:00`).getTime() > t.getTime()
}

/* ===== Base: roteamento, avatar default e usuário logado ===== */
const route = useRoute()
const router = useRouter()
const defaultAvatar = "https://ui-avatars.com/api/?background=2db6ff&color=fff&name=U"

const usuario = reactive({ id:null, nome:'', email:'', fotoUrl:'', tutorialVisto:false })
const carregando = ref(true)           // controla splash de carregamento inicial
const showTutorial = ref(false)        // exibe tutorial se usuário ainda não viu
const lockDemo = ref(false)            // bloqueia UI durante demonstração do tutorial
const isAutenticado = computed(() => !!(usuario && usuario.id))

/* ===== Dados principais (sempre arrays/objetos) ===== */
const clientes = ref([])         // lista de estudantes
const anosTurmas = ref([])       // lista de anos/turmas para filtro e vínculo
const defaultSelecao = { id:null, nome:'Todos' }
const anoTurmaSelecionado = ref(defaultSelecao)

/* ===== Busca textual simples (opcional) ===== */
const busca = ref('')
const clientesFiltrados = computed(() => {
  const selId = (anoTurmaSelecionado.value && anoTurmaSelecionado.value.id) ?? null
  return selId !== null
    ? (clientes.value || []).filter(c => (c?.ano_id ?? c?.anoTurmaId ?? null) === selId)
    : (clientes.value || [])
})
const clientesFiltradosBusca = computed(() => {
  const t = trim(busca.value).toLowerCase()
  if (!t) return clientesFiltrados.value
  return clientesFiltrados.value.filter(cli =>
    (cli?.nome && cli.nome.toLowerCase().includes(t)) ||
    (cli?.email && cli.email.toLowerCase().includes(t))
  )
})

/* ===== Estados/refs de modais ===== */
const estudanteFotoModal = ref({ foto:'', nome:'', ano:'' })
const showFotoModal = ref(false)

const showModalAnoTurma = ref(false)
const novoAnoTurmaNome = ref('')

const showModal = ref(false)
const editando = ref(false)
const modalKey = ref(0) // força reset do componente EstudanteModal ao reabrir
const clienteForm = reactive({ id:null, nome:'', cpf:'', email:'', dataNascimento:'', telefone:'', fotoUrl:'', anoTurmaId:null })
const errosEstudante = reactive({ geral:'' })

const showPerfil = ref(false)
const perfilForm = reactive({ nome:'', email:'', fotoUrl:'', senha:'' })
const errosPerfil = reactive({})
const erroPerfil = ref('')

const showConfirmarExcluir = ref(false)
const estudanteExcluir = ref(null)
const showConfirmarLogout = ref(false)

/* ===== Confirmação de Ano/Turma ===== */
const showConfirmarExcluirAno = ref(false)
const anoTurmaExcluir = ref(null)

/* ===== Componente de busca (controlado por ref) ===== */
const buscaRef = ref(null)
function abrirBusca(){ buscaRef.value?.open() }

/* ------------------------------------------------------------------ */
/* 🔁 onMounted: carrega usuário, estudantes e anos/turmas; tutorial.  */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  const email = route.query.email
  if (!email) { router.replace('/login'); return }

  // 1) Carrega dados do usuário logado
  try {
    const res = await fetch(`http://localhost:8080/api/usuario?email=${encodeURIComponent(email)}`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    usuario.id = data?.id ?? null
    usuario.nome = data?.nome ?? ''
    usuario.email = data?.email ?? ''
    usuario.fotoUrl = data?.fotoUrl ?? ''
    usuario.tutorialVisto = !!data?.tutorial_visto
  } catch {
    router.replace('/login'); return
  } finally { carregando.value = false }

  // 2) Carrega listas iniciais
  await Promise.all([carregarEstudantesDoBackend(), carregarAnosTurmasDoBackend()])

  // 3) Exibe tutorial uma única vez
  showTutorial.value = !usuario.tutorialVisto
  if (showTutorial.value && usuario.id) {
    fetch(`http://localhost:8080/api/usuario/${usuario.id}/tutorial`, {
      method:'PUT',
      headers:{ 'Content-Type':'application/json', 'X-User-Email': usuario.email || '' },
      body: JSON.stringify({ tutorial_visto: true })
    }).catch(()=>{})
    usuario.tutorialVisto = true
  }
})

/* -----------------------------
   🔎 Verificações de duplicidade
   ----------------------------- */
async function checkCpfNoServidor(cpf, ignoreId) {
  // cpf deve ir sem máscara
  const url = `http://localhost:8080/api/estudantes/check-cpf?cpf=${cpf}&ignoreId=${ignoreId ?? ''}`
  const res = await fetch(url, { headers: { 'X-User-Email': usuario.email || '' }, cache:'no-store' })
  if (!res.ok) return false
  const { exists } = await res.json().catch(() => ({ exists:false }))
  return !!exists
}
async function checkEmailNoServidor(email, ignoreId) {
  const url = `http://localhost:8080/api/estudantes/check-email?email=${encodeURIComponent(email)}&ignoreId=${ignoreId ?? ''}`
  const res = await fetch(url, { headers: { 'X-User-Email': usuario.email || '' }, cache:'no-store' })
  if (!res.ok) return false
  const { exists } = await res.json().catch(() => ({ exists:false }))
  return !!exists
}
function onTutorialMarkSeen(){ usuario.tutorialVisto = true; showTutorial.value = false }

/* -----------------------------
   🌐 Backend: carregamento listas
   ----------------------------- */
async function carregarEstudantesDoBackend(){
  try{
    const res = await fetch(`http://localhost:8080/api/estudantes?t=${Date.now()}`, {
      headers:{ 'Content-Type':'application/json', 'X-User-Email': usuario.email || '' },
      cache: 'no-store'
    })
    const data = res.ok ? await res.json() : []
    clientes.value = Array.isArray(data) ? data : []
  }catch{ clientes.value = [] }
}
async function carregarAnosTurmasDoBackend(){
  try{
    const res = await fetch(`http://localhost:8080/api/anos?t=${Date.now()}`, {
      method:'GET',
      headers:{ 'Content-Type':'application/json', 'X-User-Email': usuario.email || '' },
      cache: 'no-store'
    })
    const data = res.ok ? await res.json() : []
    anosTurmas.value = Array.isArray(data) ? data : []

    // se o selecionado foi removido, volta para "Todos"
    const selId = anoTurmaSelecionado.value?.id ?? null
    if (selId !== null && !anosTurmas.value.some(a => a.id === selId)) {
      anoTurmaSelecionado.value = defaultSelecao
    }
  }catch{ anosTurmas.value = [] }
}

/* -----------------------------
   🎛️ Filtros e modal Ano/Turma
   ----------------------------- */
function selecionarAnoTurma(item){ anoTurmaSelecionado.value = item || defaultSelecao }
function abrirModalAnoTurma(){ fecharPopups(); novoAnoTurmaNome.value=''; showModalAnoTurma.value = true }
async function adicionarAnoTurma(nome){
  if(!trim(nome)) return
  try{
    const res = await fetch('http://localhost:8080/api/anos', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'X-User-Email': usuario.email || '' },
      body: JSON.stringify({ nome: trim(nome) })
    })
    if(!res.ok) throw new Error(await res.text())
    await carregarAnosTurmasDoBackend()
    showModalAnoTurma.value = false
  }catch(e){ alert("Erro ao salvar ano/turma: " + e.message) }
}
function fecharModalAnoTurma(){ showModalAnoTurma.value = false }

/* -----------------------------
   👩‍🎓 Estudante: CRUD principal
   ----------------------------- */
function abrirModalAdicionar(){
  fecharPopups()
  editando.value = false
  const primeiroAnoId = anosTurmas.value?.[0]?.id ?? null
  Object.assign(clienteForm, {
    id:null, nome:'', cpf:'', email:'', dataNascimento:'', telefone:'', fotoUrl:'',
    anoTurmaId: (anoTurmaSelecionado.value?.id ?? primeiroAnoId)
  })
  errosEstudante.geral = ''
  showModal.value = true
  modalKey.value++ // garante reset de estado interno do modal
}
function editar(cli){
  fecharPopups(); editando.value = true
  Object.assign(clienteForm, {
    id: cli?.id ?? null,
    nome: cli?.nome ?? '',
    cpf: cli?.cpf ?? '',
    email: cli?.email ?? '',
    dataNascimento: (cli?.data_nascimento || cli?.dataNascimento || '').slice(0,10),
    telefone: cli?.telefone || '',
    fotoUrl: cli?.foto_url || cli?.fotoUrl || '',
    anoTurmaId: cli?.ano_id || cli?.anoTurmaId || ''
  })
  errosEstudante.geral = ''
  showModal.value = true
  modalKey.value++
}
async function salvarCliente(){
  console.log('[Pai] salvarCliente chamado com:', JSON.stringify(clienteForm))
  errosEstudante.geral = '' // limpa erro global

  // fallback de ano/turma
  if(!(clienteForm.anoTurmaId || clienteForm.anoTurmaId===0)){
    clienteForm.anoTurmaId = (anoTurmaSelecionado.value?.id) ?? (anosTurmas.value?.[0]?.id) ?? null
  }

  // normaliza data (DD/MM/AAAA -> ISO) e evita datas futuras
  let dataIso = /^\d{2}\/\d{2}\/\d{4}$/.test(clienteForm.dataNascimento)
    ? brToISO(clienteForm.dataNascimento)
    : clienteForm.dataNascimento
  if (isFutureISO(dataIso)) dataIso = todayISO()

  const payload = {
    id:clienteForm.id,
    nome:trim(clienteForm.nome),
    cpf:clienteForm.cpf,
    email:trim(clienteForm.email),
    data_nascimento:dataIso,
    telefone:clienteForm.telefone,
    foto_url:clienteForm.fotoUrl,
    ano_id:clienteForm.anoTurmaId
  }

  try{
    const isEdicao = !!(editando.value && clienteForm.id)
    const url = isEdicao ? `http://localhost:8080/api/estudantes/${clienteForm.id}` : 'http://localhost:8080/api/estudantes'
    const method = isEdicao ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers:{ 'Content-Type':'application/json', 'X-User-Email': usuario.email || '' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    if(!res.ok){
      const txt = await res.text().catch(()=> '')
      throw new Error(txt || `Falha ${res.status}`)
    }

    // Em alguns casos o backend pode retornar 204 (sem body)
    let atualizado = null
    try{ if (res.status !== 204) atualizado = await res.json() }catch{}

    const novoRegistro = atualizado || {
      id: clienteForm.id,
      nome: clienteForm.nome,
      cpf: clienteForm.cpf,
      email: clienteForm.email,
      data_nascimento: dataIso,
      telefone: clienteForm.telefone,
      foto_url: clienteForm.fotoUrl,
      ano_id: clienteForm.anoTurmaId
    }

    // Atualiza localmente de forma otimista
    const sameId = (a,b) => String(a) === String(b)
    if (isEdicao) {
      const idx = (clientes.value || []).findIndex(c => sameId(c.id, novoRegistro.id))
      if (idx !== -1) {
        const copia = clientes.value.slice()
        copia[idx] = {
          ...copia[idx],
          ...novoRegistro,
          dataNascimento: novoRegistro.data_nascimento || novoRegistro.dataNascimento,
          fotoUrl: novoRegistro.foto_url || novoRegistro.fotoUrl,
          anoTurmaId: novoRegistro.ano_id ?? novoRegistro.anoTurmaId
        }
        clientes.value = copia
      } else {
        clientes.value = [novoRegistro, ...clientes.value]
      }
    } else {
      clientes.value = [novoRegistro, ...clientes.value]
    }

    // Sincroniza com backend e fecha modal
    await carregarEstudantesDoBackend()
    showModal.value=false                 // fecha SOMENTE após sucesso
  }catch(e){
    // Mostra erro e mantém modal aberto para correção
    errosEstudante.geral = 'Erro ao salvar estudante: ' + e.message
  }
}

/* -----------------------------
   🗑️ Exclusão & Perfil (Estudante)
   ----------------------------- */
function abrirConfirmarExcluir(estudante){ estudanteExcluir.value = estudante; showConfirmarExcluir.value = true }
async function confirmarExcluir(){
  try{
    const id = estudanteExcluir.value?.id
    if(!id) throw new Error('Estudante inválido')
    const res = await fetch(`http://localhost:8080/api/estudantes/${id}`,{
      method:'DELETE',
      headers:{ 'Content-Type':'application/json','X-User-Email': usuario.email || '' },
      cache: 'no-store'
    })
    if(!res.ok) throw new Error(await res.text())
    await carregarEstudantesDoBackend()
  }catch(e){ alert("Erro ao excluir estudante: " + e.message) }
  finally{ showConfirmarExcluir.value=false }
}
function cancelarExcluir(){ showConfirmarExcluir.value=false }

/* Perfil do usuário logado */
function fecharModal(){ showModal.value=false }
function fecharPerfil(){ showPerfil.value=false }
function abrirPerfil(){ fecharPopups(); Object.assign(perfilForm,{ ...usuario, senha:'' }); showPerfil.value = true }
async function salvarPerfil(){
  try{
    if(!trim(perfilForm.nome)){ errosPerfil.nome="Nome é obrigatório"; return }
    const payload = { nome:trim(perfilForm.nome), foto_url:perfilForm.fotoUrl, senha: perfilForm.senha ? perfilForm.senha : undefined }
    const res = await fetch('http://localhost:8080/api/perfil', {
      method:'PUT',
      headers:{'Content-Type':'application/json','X-User-Email': usuario.email || ''},
      body:JSON.stringify(payload)
    })
    if(!res.ok){ erroPerfil.value = await res.text(); return }
    usuario.nome = trim(perfilForm.nome); usuario.fotoUrl = perfilForm.fotoUrl; showPerfil.value=false; erroPerfil.value=''
  }catch(e){ erroPerfil.value='Erro ao salvar perfil: ' + e.message }
}
function confirmarLogout(){ showConfirmarLogout.value = true }
function sairConta(){ window.location.href = '/login' }

/* Ampliar foto */
function fecharModalFoto(){ showFotoModal.value=false; estudanteFotoModal.value={foto:'',nome:'',ano:''} }
function abrirModalFoto({ foto, nome, ano }){ estudanteFotoModal.value = { foto, nome, ano }; showFotoModal.value = true }

/* -----------------------------
   🧹 Remoção de Ano/Turma
   ----------------------------- */
/* (mantida opção direta, caso seja chamada fora do fluxo com modal) */
async function removerAnoTurma(ano){
  if(!ano?.id) return
  try{
    const res = await fetch(`http://localhost:8080/api/anos/${ano.id}`,{
      method:'DELETE',
      headers:{
        'Content-Type':'application/json',
        'X-User-Email': usuario.email || ''
      },
      cache:'no-store'
    })
    if(!res.ok){
      const msg = await res.text().catch(()=> '')
      throw new Error(msg || `Falha ao excluir (status ${res.status})`)
    }
    await carregarAnosTurmasDoBackend()
    await carregarEstudantesDoBackend()
  }catch(e){
    alert("Erro ao excluir ano/turma: " + e.message)
  }
}

/* ✅ Fluxo com modal de confirmação */
function abrirConfirmarExcluirAno(ano){
  anoTurmaExcluir.value = ano || null
  showConfirmarExcluirAno.value = !!ano
}
async function confirmarExcluirAno(){
  const ano = anoTurmaExcluir.value
  if(!ano?.id){ cancelarExcluirAno(); return }
  try{
    const res = await fetch(`http://localhost:8080/api/anos/${ano.id}`,{
      method:'DELETE',
      headers:{
        'Content-Type':'application/json',
        'X-User-Email': usuario.email || ''
      },
      cache:'no-store'
    })
    if(!res.ok){
      const msg = await res.text().catch(()=> '')
      throw new Error(msg || `Falha ao excluir (status ${res.status})`)
    }
    await carregarAnosTurmasDoBackend()
    await carregarEstudantesDoBackend()
    // Se o item removido era o selecionado, volta para "Todos"
    if (anoTurmaSelecionado.value?.id === ano.id) {
      anoTurmaSelecionado.value = defaultSelecao
    }
  }catch(e){
    alert("Erro ao excluir ano/turma: " + e.message)
  }finally{
    cancelarExcluirAno()
  }
}
function cancelarExcluirAno(){
  showConfirmarExcluirAno.value = false
  anoTurmaExcluir.value = null
}

/* -----------------------------
   🧯 Fechar todos os popups/modais
   ----------------------------- */
function fecharPopups(){
  if(lockDemo.value) return
  showPerfil.value=false; showModal.value=false; showModalAnoTurma.value=false;
  showConfirmarExcluir.value=false; showConfirmarLogout.value=false;
  showConfirmarExcluirAno.value=false
}
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilos (mantidos como no original)
   ========================================================================== */
.dashboard-bg{ min-height:100vh; background:radial-gradient(ellipse at 80% 60%, #2d80c4 30%, #224277 100%); font-family:var(--app-font,'Montserrat'), Arial, sans-serif; padding-bottom:40px; }
.dashboard-container.expandido{ max-width:1440px; margin:0 auto; padding:0 28px 36px; }

.header{ display:flex; align-items:center; justify-content:space-between; padding:8px 0 0; height:100px; }
.logo-flex{ display:flex; align-items:center; height:100px; }
.logo-img{ width:220px; max-height:90px; object-fit:contain; }
.user-info{ display:flex; align-items:center; gap:12px; }
.user-name{ color:#e7f3ff; font-size:1.06rem; }
.profile-btn{ background: linear-gradient(90deg,#33aaff 40%,#256cbb 100%); color:#fff; border:none; border-radius:12px; padding:10px 20px; font-weight:700; font-size:1.01rem; cursor:pointer; box-shadow:0 1px 8px #22437740; transition:filter .16s, transform .12s; }
.profile-btn:hover{ filter:brightness(1.1); transform:translateY(-1px); }

.main-content.expandido-main{ background:rgba(33,55,110,.97); border-radius:26px; padding:40px 52px 30px; min-height:590px; box-shadow:0 4px 38px #10254b20; display:flex; flex-direction:column; }
.clientes-header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:26px; flex-wrap:wrap; gap:1rem; }
.titulo-lista{ color:#fff; font-size:1.6rem; font-weight:800; margin:0; }
.acoes-header{ display:flex; align-items:center; gap:14px; }

.add-btn{ background: linear-gradient(90deg,#33aaff 40%,#256cbb 100%); color:#fff; border:none; border-radius:12px; padding:12px 26px; font-size:1.02rem; font-weight:700; cursor:pointer; box-shadow:0 1px 8px #22437740; transition:filter .16s, box-shadow .16s, transform .12s; }
.add-btn:hover{ filter:brightness(1.1); box-shadow:0 6px 24px #0a355f60; transform:translateY(-1px); }

.lock-overlay{ position:fixed; inset:0; z-index:9998; pointer-events:auto; }
.nao-autenticado{ min-height:60vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1d3557; }
.nao-autenticado h2{ color:#fff; font-size:2rem; margin-bottom:12px; }
.nao-autenticado a{ color:#00bbff; font-weight:bold; text-decoration:underline; }
</style>
