<!--
  Dashboard.vue

  🎯 Responsabilidade:
    - Tela principal da TecMise para gerenciar Estudantes, Anos/Turmas e Perfil.
    - Orquestra os modais (Adicionar Ano, Estudante, Perfil, Ampliar Foto, Confirmações).
    - Integra o Tutorial de Onboarding para 1ª visita.

  📦 Como funciona:
    - Ao montar, carrega o usuário via querystring (?email=...), estudantes e anos/turmas.
    - Usa um estado "carregando" para evitar flicker de "não autenticado" ao dar F5.
    - Exibe o tutorial apenas se o usuário ainda não tiver marcado como visto.
    - Passa props e escuta emits dos modais/childs (Filtros, Tabela, etc).

  🛡️ Estados importantes:
    - usuario: { id, nome, email, fotoUrl, tutorialVisto }
    - carregando: true/false — controla render inicial (evita flicker ao recarregar a página).
    - showTutorial / lockDemo: controla o onboarding e o bloqueio de interações durante a demo.

  🔗 API usadas:
    - GET  /api/usuario?email=...
    - PUT  /api/usuario/{id}/tutorial
    - GET  /api/estudantes
    - (POST/PUT/DELETE) /api/estudantes
    - (GET/POST/DELETE) /api/anos
    - PUT  /api/perfil

  💡 Boas práticas aplicadas:
    - Debounce para busca local.
    - Normalização de data (dd/mm/yyyy → yyyy-mm-dd) antes de salvar.
    - Fechamento centralizado de popups com proteção quando o tutorial estiver ativo.
    - Idempotência ao marcar tutorial como visto (marca local e no backend).

  📋 Projeto: TecMise - Gestão Escolar
-->

<template>
  <!-- Enquanto carrega, não mostra nada (ou poderia exibir um skeleton/spinner) -->
  <div v-if="carregando"></div>

  <!-- App carregado e usuário autenticado -->
  <div v-else-if="usuario.id" class="dashboard-bg" @click="fecharPopups">
    <div class="dashboard-container expandido" @click.stop>
      <!-- HEADER -->
      <header class="header">
        <div class="logo-flex" data-tutorial="btn-ano">
          <img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />
        </div>
        <div class="user-info">
          <div class="avatar">
            <img :src="usuario.fotoUrl || defaultAvatar" alt="avatar" />
          </div>
          <span class="user-name">
            Olá, <strong>{{ usuario.nome || 'Usuário' }}</strong>
          </span>
          <!-- alvo do tutorial -->
          <button
            class="profile-btn"
            data-tutorial="btn-perfil"
            type="button"
            @click.stop="abrirPerfil"
          >
            Perfil
          </button>
        </div>
      </header>

      <!-- MAIN -->
      <main class="main-content expandido-main">
        <section class="clientes-section">
          <div class="clientes-header">
            <FiltrosEstudante
              :anoTurmaList="anosTurmas"
              :selecionado="anoTurmaSelecionado"
              :dropdownAberto="dropdownAnoTurmaAberto"
              @toggle-dropdown="toggleDropdown"
              @selecionar="selecionarAnoTurma"
              @abrir-modal-ano-turma="abrirModalAnoTurma"
              @atualizar-lista-anos="carregarAnosTurmasDoBackend"
              @remover-ano-turma="removerAnoTurma"
            />
            <div style="display: flex; gap: 11px;">
              <button class="search-btn" type="button" data-tutorial="btn-busca" @click.stop="abrirModalBusca">
                🔍 Buscar Estudante
              </button>
              <button
                class="add-btn"
                type="button"
                data-tutorial="btn-aluno"
                @click.stop="abrirModalAdicionar"
              >
                + Novo Estudante
              </button>
            </div>
          </div>

          <EstudantesTable
            :clientes="clientesFiltradosBusca"
            :anosTurmas="anosTurmas"
            :defaultAvatar="defaultAvatar"
            @editar="editar"
            @excluir="abrirConfirmarExcluir"
            @ampliar-foto="abrirModalFoto"
          />
        </section>
      </main>

      <!-- ============= MODAIS ============= -->
      <ModalAdicionarAno
        :show="showModalAnoTurma"
        :nome="novoAnoTurmaNome"
        @salvar="adicionarAnoTurma"
        @cancelar="fecharModalAnoTurma"
      />

            <EstudanteModal
        :show="showModal"
        :editando="editando"
        v-model:form="clienteForm"
        v-model:erros="errosEstudante"
        :anosTurmas="anosTurmas"
        :defaultAvatar="defaultAvatar"
        :user-email="usuario.email"             
        @salvar="salvarCliente"
        @fechar="fecharModal"
      />

      <PerfilModal
        :show="showPerfil"
        :form="perfilForm"
        :erros="errosPerfil"
        :erro="erroPerfil"
        :defaultAvatar="defaultAvatar"
        @update:form="onPerfilUpdateForm"
        @update:erros="onPerfilUpdateErros"
        @salvar="salvarPerfil"
        @fechar="fecharPerfil"
        @logout="confirmarLogout"
      />

      <ConfirmarExclusaoModal
        :show="showConfirmarExcluir"
        :estudante="estudanteExcluir"
        @confirmar="confirmarExcluir"
        @cancelar="cancelarExcluir"
      />

      <AmpliarFotoModal
        :show="showFotoModal"
        :foto="estudanteFotoModal.foto"
        :nome="estudanteFotoModal.nome"
        :ano="estudanteFotoModal.ano"
        @fechar="fecharModalFoto"
      />

      <ConfirmarLogoutModal
        :show="showConfirmarLogout"
        @confirmar="sairConta"
        @cancelar="showConfirmarLogout = false"
      />

      <!-- MODAL BUSCA -->
      <transition name="modal">
        <div v-if="showModalBusca" class="modal-bg" @click.self="fecharModalBusca">
          <div class="modal-card" style="max-width:520px;min-width:340px;" @click.stop>
            <h3 class="modal-title">Buscar Estudante</h3>
            <input
              v-model="buscaTermo"
              type="text"
              placeholder="Digite nome ou email"
              class="input-busca"
              @input="fazerBusca" 
              style="margin-bottom:20px;"
            />
            <div v-if="buscaTermo.length > 0">
              <div v-if="resultadosBusca !== null && resultadosBusca.length > 0">
                <ul>
                  <li v-for="aluno in resultadosBusca" :key="aluno.id" class="item-busca">  
                    <strong>{{ aluno.nome }}</strong>
                    <span style="color:#68e6fa;">{{ aluno.email }}</span>
                    <span style="color:#fff6;font-size:12px;">
                      (Ano/Turma: {{ anoTurmaNome(aluno.ano_id ?? aluno.anoTurmaId) }})
                    </span>
                  </li>
                </ul>
              </div>
              <!-- nenhum encontrado (só depois que a busca terminar) -->
            <div v-else-if="resultadosBusca !== null && resultadosBusca.length === 0"
                style="color:#ffb5b5;padding:15px;text-align:center;">
              Nenhum estudante encontrado com esse nome ou email.
            </div>
            </div>
            <div class="modal-btns" style="margin-top:20px;">
              <button @click="fecharModalBusca" type="button">Fechar</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ================== TUTORIAL ================== -->
      <TutorialOnboarding
        :show="showTutorial"
        :user-id="usuario.id || 0"
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
        seletor-ano-turma-btn="#btnNovoAno"
      />

      <!-- Overlay de bloqueio durante o tutorial -->
      <div
        v-if="lockDemo"
        style="position:fixed; inset:0; z-index:9998; pointer-events:auto;"
        @click.stop
      ></div>
    </div>
  </div>

  <!-- App carregado e usuário NÃO autenticado -->
  <div v-else class="nao-autenticado">
    <h2>Usuário não autenticado ou sessão expirada.</h2>
    <p><a href="/login" style="color:#2db6ff;">Fazer login</a></p>
  </div>
</template>

<script setup>
const { $api } = useNuxtApp()

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import EstudantesTable from '../components/EstudantesTable.vue'
import EstudanteModal from '../components/EstudanteModal.vue'
import PerfilModal from '../components/PerfilModal.vue'
import ConfirmarExclusaoModal from '../components/ConfirmarExclusaoModal.vue'
import ConfirmarLogoutModal from '../components/ConfirmarLogoutModal.vue'
import FiltrosEstudante from '../components/FiltrosEstudante.vue'
import AmpliarFotoModal from '../components/AmpliarFotoModal.vue'
import ModalAdicionarAno from '../components/ModalAdicionarAno.vue'
import TutorialOnboarding from '../components/TutorialOnboarding.vue'

const route = useRoute()
const router = useRouter()

/** Lista completa trazida do backend (filtrada depois em memória) */
const clientes = ref([])

/** Estado do usuário logado */
const usuario = reactive({
  id: null,
  nome: '',
  email: '',
  fotoUrl: '',
  tutorialVisto: false,
})

/** Evita flicker ao dar F5 — só decide o que mostrar depois do carregamento inicial */
const carregando = ref(true)

/** Avatar padrão */
const defaultAvatar = "https://ui-avatars.com/api/?background=2db6ff&color=fff&name=U"

/** Tutorial */
const showTutorial = ref(false)
const lockDemo = ref(false)

onMounted(async () => {
  const email = route.query.email
  if (!email) { router.replace('/login'); return }

  try {
    // 1) Carrega usuário
    const res = await fetch(`http://localhost:8080/api/usuario?email=${encodeURIComponent(email)}`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    usuario.id = data.id
    usuario.nome = data.nome
    usuario.email = data.email
    usuario.fotoUrl = data.fotoUrl
    usuario.tutorialVisto = !!data.tutorial_visto
  } catch {
    router.replace('/login')
    return
  } finally {
    // definimos carregando=false somente depois de tentar ler o usuário
    // (isso elimina o flash de "não autenticado" durante o F5)
    carregando.value = false
  }

  // 2) Carrega dados de apoio
  await carregarEstudantesDoBackend()
  await carregarAnosTurmasDoBackend()

  // 3) Tutorial: só exibe se ainda não foi visto
  showTutorial.value = !usuario.tutorialVisto

  // (opcional e idempotente) Se for a primeira visita, já marca como visto no banco
  // pra evitar reaparecer no próximo F5, e atualiza local imediatamente.
  if (showTutorial.value && usuario.id) {
    fetch(`http://localhost:8080/api/usuario/${usuario.id}/tutorial`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorial_visto: true })
    }).catch(() => {})
    usuario.tutorialVisto = true
  }
})

/** Quando o TutorialOnboarding confirma o PUT com sucesso */
function onTutorialMarkSeen () {
  usuario.tutorialVisto = true
  showTutorial.value = false
}

/** ---------- API: Estudantes ---------- */
async function carregarEstudantesDoBackend() {
  try {
    const res = await fetch('http://localhost:8080/api/estudantes', {
      headers: { 'Content-Type': 'application/json', 'X-User-Email': usuario.email }
    })
    clientes.value = res.ok ? await res.json() : []
  } catch { clientes.value = [] }
}

/** ---------- Filtros / anosTurmas ---------- */
const anosTurmas = ref([
  { id: 1, nome: '6º ano - A' },
  { id: 2, nome: '6º ano - B' },
  { id: 3, nome: '7º ano - C' }
])
const anoTurmaSelecionado = ref({ id: null, nome: 'Todos' })
const dropdownAnoTurmaAberto = ref(false)

const clientesFiltrados = computed(() => {
  if (anoTurmaSelecionado.value.id !== null) {
    return clientes.value.filter(c => c.ano_id === anoTurmaSelecionado.value.id)
  }
  return clientes.value
})

/** Busca local (com debounce) */
const busca = ref('')
let _debounceTimer = null
function debounce(fn, wait = 180) {
  return (...args) => {
    clearTimeout(_debounceTimer)
    _debounceTimer = setTimeout(() => fn(...args), wait)
  }
}
const clientesFiltradosBusca = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return clientesFiltrados.value
  return clientesFiltrados.value.filter(cli =>
    (cli.nome && cli.nome.toLowerCase().includes(termo)) ||
    (cli.email && cli.email.toLowerCase().includes(termo))
  )
})

/** ---------- Estado de modais ---------- */
const estudanteFotoModal = ref({ foto: '', nome: '', ano: '' })
const showFotoModal = ref(false)
const alunoModal = ref(null)
const showModalAnoTurma = ref(false)
const novoAnoTurmaNome = ref('')

const showModal = ref(false)
const editando = ref(false)

/** v-model do EstudanteModal */
const clienteForm = reactive({
  id: null, nome: '', cpf: '', email: '', dataNascimento: '', telefone: '', fotoUrl: '', anoTurmaId: null
})
const errosEstudante = ref({})
function resetErrosEstudante() {
  errosEstudante.nome = ''
  errosEstudante.cpf = ''
  errosEstudante.email = ''
  errosEstudante.dataNascimento = ''
  errosEstudante.telefone = ''
  errosEstudante.anoTurmaId = ''
  errosEstudante.geral = ''
}

/** Perfil */
const showPerfil = ref(false)
const perfilForm = reactive({ nome: '', email: '', fotoUrl: '', senha: '' })
const errosPerfil = reactive({})
const erroPerfil = ref('')

/** Confirmações/Logout */
const showConfirmarExcluir = ref(false)
const estudanteExcluir = ref(null)
const showConfirmarLogout = ref(false)

/** Modal de busca */
const showModalBusca = ref(false)
const buscaTermo = ref('')
const resultadosBusca = ref(null) 

/** ---------- Interações globais ---------- */
function fecharPopups() {
  if (lockDemo.value) return
  dropdownAnoTurmaAberto.value = false
  showPerfil.value = false
  showModal.value = false
  showModalAnoTurma.value = false
  showConfirmarExcluir.value = false
  showConfirmarLogout.value = false
  showModalBusca.value = false
}

function toggleDropdown() { dropdownAnoTurmaAberto.value = !dropdownAnoTurmaAberto.value }
function selecionarAnoTurma(item) { anoTurmaSelecionado.value = item; dropdownAnoTurmaAberto.value = false }

/** ---------- Modais: Ano/Turma ---------- */
function abrirModalAnoTurma() {
  fecharPopups()
  novoAnoTurmaNome.value = ''
  showModalAnoTurma.value = true
}
async function adicionarAnoTurma(nomeDigitado) {
  if (!nomeDigitado.trim()) return;
  try {
    const res = await fetch('http://localhost:8080/api/anos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nomeDigitado.trim() }),
    });
    if (!res.ok) throw new Error(await res.text());
    await carregarAnosTurmasDoBackend();
    showModalAnoTurma.value = false;
  } catch (e) {
    alert("Erro ao salvar ano/turma: " + e.message);
  }
}
async function carregarAnosTurmasDoBackend() {
  try {
    const res = await fetch('http://localhost:8080/api/anos', { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    anosTurmas.value = res.ok ? await res.json() : []
  } catch { anosTurmas.value = [] }
}
function fecharModalAnoTurma() { showModalAnoTurma.value = false }

/** ---------- Modais: Estudante ---------- */
function abrirModalAdicionar() {
  fecharPopups()
  editando.value = false
  Object.assign(clienteForm, {
    id: null, nome: '', cpf: '', email: '', dataNascimento: '', telefone: '', fotoUrl: '',
    anoTurmaId: anosTurmas.value[0]?.id || null
  })
  errosEstudante.value = { nome:'', cpf:'', email:'', dataNascimento:'', telefone:'', anoTurmaId:'', geral:'' }
  showModal.value = true
}


function editar(cli) {
  fecharPopups()
  editando.value = true
  Object.assign(clienteForm, {
    id: cli.id,
    nome: cli.nome,
    cpf: cli.cpf,
    email: cli.email,
    dataNascimento: (cli.data_nascimento || cli.dataNascimento || '').slice(0,10),
    telefone: cli.telefone || '',
    fotoUrl: cli.foto_url || cli.fotoUrl || '',
    anoTurmaId: cli.ano_id || cli.anoTurmaId || ''
  })
  Object.assign(errosEstudante, { nome:'', cpf:'', email:'', dataNascimento:'', telefone:'', anoTurmaId:'', geral:'' }) // <-- LIMPA ERROS
  showModal.value = true
}


import { nextTick } from 'vue'

// ...
async function salvarCliente () {
  errosEstudante.value.nome = ''
  errosEstudante.value.cpf = ''
  errosEstudante.value.email = ''
  errosEstudante.value.dataNascimento = ''
  errosEstudante.value.anoTurmaId = ''

  // validação mínima de obrigatórios (inline)
  let temErro = false
  if (!clienteForm.nome) { errosEstudante.nome = 'Informe o nome'; temErro = true }
  if (!clienteForm.cpf)  { errosEstudante.cpf = 'CPF é obrigatório'; temErro = true }
  if (!clienteForm.email){ errosEstudante.email = 'E-mail é obrigatório'; temErro = true }
  if (!clienteForm.dataNascimento) { errosEstudante.dataNascimento = 'Data é obrigatória'; temErro = true }
  if (!clienteForm.anoTurmaId && clienteForm.anoTurmaId !== 0) {
    errosEstudante.anoTurmaId = 'Selecione o Ano/Turma'; temErro = true
  }
  if (temErro) {
    await nextTick()
    // foca no primeiro campo com erro
    const selectorMap = {
      nome: 'input[placeholder="Nome"]',
      cpf: 'input[placeholder="CPF (apenas números)"]',
      email: 'input[placeholder="E-mail"]',
      dataNascimento: 'input[type="date"]',
      anoTurmaId: 'select'
    }
    for (const k of ['nome','cpf','email','dataNascimento','anoTurmaId']) {
      if (errosEstudante.value[k]) { document.querySelector(selectorMap[k])?.focus(); break }
    }
    return
  }

  // normaliza data (dd/mm/aaaa -> aaaa-mm-dd)
  let dataIso = clienteForm.dataNascimento
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clienteForm.dataNascimento)) {
    const [d, m, a] = clienteForm.dataNascimento.split('/')
    dataIso = `${a}-${m}-${d}`
  }

  const payload = {
    id: clienteForm.id,
    nome: clienteForm.nome,
    cpf: clienteForm.cpf,
    email: clienteForm.email,
    data_nascimento: dataIso,
    telefone: clienteForm.telefone,
    foto_url: clienteForm.fotoUrl,
    ano_id: clienteForm.anoTurmaId
  }

  try {
    const isEdicao = editando.value && clienteForm.id
    const url = isEdicao
      ? `http://localhost:8080/api/estudantes/${clienteForm.id}`
      : 'http://localhost:8080/api/estudantes'
    const method = isEdicao ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-User-Email': usuario.email },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const txt = await res.text()
      let msg = txt
      let obj
      try { obj = JSON.parse(txt); msg = obj?.error || txt } catch {}

      // 409 de CPF duplicado -> erro bonito no campo CPF
      if (res.status === 409 && /cpf/i.test(msg)) {
        errosEstudante.value.cpf = 'CPF já cadastrado.'
        await nextTick()
        document.querySelector('input[placeholder="CPF (apenas números)"]')?.focus()
        return
      }

      // Se vier erro de campo específico do backend: { field: "email", error: "E-mail inválido" }
      if (res.status === 400 && obj?.field && obj?.error) {
        if (errosEstudante.value.hasOwnProperty(obj.field)) {
          errosEstudante.value[obj.field] = obj.error
          await nextTick()
          const selectorMap = {
            nome: 'input[placeholder="Nome"]',
            cpf: 'input[placeholder="CPF (apenas números)"]',
            email: 'input[placeholder="E-mail"]',
            dataNascimento: 'input[type="date"]',
            anoTurmaId: 'select'
          }
          document.querySelector(selectorMap[obj.field])?.focus()
          return
        }
      }

      // fallback para outros erros
      alert('Erro ao salvar estudante: ' + msg)
      return
    }

    await carregarEstudantesDoBackend()
    showModal.value = false
  } catch (e) {
    alert('Erro ao salvar estudante: ' + e.message)
  }
}

/** ---------- Exclusão ---------- */
function abrirConfirmarExcluir(estudante) { estudanteExcluir.value = estudante; showConfirmarExcluir.value = true }
async function confirmarExcluir() {
  try {
    const id = estudanteExcluir.value.id
    const res = await fetch(`http://localhost:8080/api/estudantes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': usuario.email },
    });
    if (!res.ok) throw new Error(await res.text());
    await carregarEstudantesDoBackend();
  } catch (e) { alert("Erro ao excluir estudante: " + e.message) }
  finally { showConfirmarExcluir.value = false }
}
function cancelarExcluir() { showConfirmarExcluir.value = false }

/** ---------- Perfil ---------- */
function fecharModal() { showModal.value = false }
function fecharPerfil() { showPerfil.value = false }
function abrirPerfil() {
  fecharPopups()
  Object.assign(perfilForm, { ...usuario, senha: '' })
  showPerfil.value = true
}
async function salvarPerfil() {
  try {
    if (!perfilForm.nome) { errosPerfil.nome = "Nome é obrigatório"; return }
    const payload = {
      nome: perfilForm.nome,
      foto_url: perfilForm.fotoUrl,
      senha: perfilForm.senha ? perfilForm.senha : undefined
    };
    const res = await fetch('http://localhost:8080/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': usuario.email },
      body: JSON.stringify(payload)
    });
    if (!res.ok) { erroPerfil.value = await res.text(); return }
    usuario.nome = perfilForm.nome; usuario.fotoUrl = perfilForm.fotoUrl;
    showPerfil.value = false; erroPerfil.value = '';
  } catch (e) { erroPerfil.value = 'Erro ao salvar perfil: ' + e.message }
}
function confirmarLogout() { showConfirmarLogout.value = true }

/** ---------- Sincronização PerfilModal ---------- */
function onPerfilUpdateForm(novo) { Object.assign(perfilForm, novo || {}) }
function onPerfilUpdateErros(novos) { Object.assign(errosPerfil, novos || {}) }

/** ---------- Busca ---------- */
function abrirModalBusca() {
  fecharPopups()
  showModalBusca.value = true
  buscaTermo.value = ''
  resultadosBusca.value = null
}
function fecharModalBusca() {
  showModalBusca.value = false
  buscaTermo.value = ''
  resultadosBusca.value = null
  clearTimeout(_debounceTimer)
}
const _doBuscar = debounce(() => {
  const termo = buscaTermo.value.trim().toLowerCase()
  if (!termo) { resultadosBusca.value = []; return }
  resultadosBusca.value = clientes.value.filter(
    c => (c.nome && c.nome.toLowerCase().includes(termo)) || (c.email && c.email.toLowerCase().includes(termo))
  )
}, 120)
function fazerBusca() {
  // Marca como "ainda buscando" até o debounce rodar
  resultadosBusca.value = null
  _doBuscar()
}
function anoTurmaNome(id) { return anosTurmas.value.find(a => a.id === id)?.nome || '' }

/** ---------- Outras ---------- */
function sairConta() { window.location.href = '/login' }
function fecharModalFoto() { showFotoModal.value = false; alunoModal.value = null }
function abrirModalFoto({ foto, nome, ano }) { estudanteFotoModal.value = { foto, nome, ano }; showFotoModal.value = true }
async function removerAnoTurma(ano) {
  if (!ano.id) return;
  try {
    const res = await fetch(`http://localhost:8080/api/anos/${ano.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
    if (!res.ok) throw new Error(await res.text());
    await carregarAnosTurmasDoBackend(); await carregarEstudantesDoBackend();
  } catch (e) { alert("Erro ao excluir ano/turma: " + e.message) }
}
</script>

<style scoped>
/* =============================================================
   TecMise Dashboard - Style Guide
   Padrão: Azul escuro, gradiente, responsivo e moderno
   ============================================================= */

/* --------- MODAL DE ANO --------- */
.modal-card-ano {
  max-width: 400px;
  min-width: 290px;
  min-height: 180px;
  background: #183765;
  border-radius: 15px;
  box-shadow: 0 12px 50px #16213a42;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem 2.1rem 1.4rem 2.1rem;
  text-align: center;
}

/* Input dentro do modal de Ano */
.input-ano {
  width: 100%;
  max-width: 200px;
  padding: 13px 16px;
  border-radius: 10px;
  border: none;
  background: #223f6c;
  color: #c6f3ff;
  font-size: 1.08rem;
  font-family: inherit;
  margin-bottom: 0;
  transition: background .15s, color .15s;
}
.input-ano:focus {
  background: #3282b8;
  color: #fff;
  outline: none;
}

.modal-title {
  color: #32e0ff;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

/* --------- MODAL DE TURMA --------- */
.modal-card-turma {
  max-width: 520px;
  min-width: 420px;
  min-height: 330px;
  padding: 2.1rem 2.2rem 2.1rem 2.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.modal-title {
  color: #32e0ff;
  font-size: 1.34rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 18px;
  margin-top: 6px;
}

.modal-inputs-row {
  width: 100%;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 28px;
}
.input-turma-select,
.input-turma {
  padding: 13px 16px;
  border-radius: 10px;
  border: none;
  background: #223f6c;
  color: #c6f3ff;
  font-size: 1.07rem;
  font-family: inherit;
  transition: background .15s, color .15s;
  margin: 0;
}
.input-turma-select {
  min-width: 180px;
  max-width: 210px;
}
.input-turma {
  flex: 1;
  min-width: 100px;
  max-width: 160px;
}
.input-turma-select:focus,
.input-turma:focus {
  background: #3282b8;
  outline: none;
  color: #fff;
}

/* Seta azul moderna para select */
.modal-inputs-row select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='7' viewBox='0 0 12 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 2L6 6L10 2' stroke='%2332e0ff' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 38px;
  box-shadow: 0 2px 18px #12285425;
  background: #223e70;
  color: #c6f4ff;
}
.modal-inputs-row input {
  background: #223e70;
  color: #c6f4ff;
}
.modal-inputs-row select:focus,
.modal-inputs-row input:focus {
  background: #295eb1;
  color: #fff;
  outline: none;
}

/* Responsivo: colunas viram linhas */
@media (max-width: 540px) {
  .modal-card-turma {
    padding: 1.4rem 0.7rem 1.4rem 0.7rem;
    min-width: 0;
    width: 96vw;
  }
  .modal-inputs-row {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}

/* --------- BOTÕES MODAIS --------- */
.modal-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}
.modal-btns button {
  min-width: 110px;
  padding: 11px 0;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.04rem;
  background: linear-gradient(90deg, #16e0ff 30%, #2956a6 100%);
  color: #fff;
  cursor: pointer;
  transition: background .18s, filter .15s;
  box-shadow: 0 1px 7px #1b456250;
}
.modal-btns button[type="button"] {
  background: #223a5c;
  color: #d3f5ff;
}
.modal-btns button:hover {
  filter: brightness(1.15);
  transform: scale(1.04);
}
.modal-btns button[type="button"]:hover {
  background: #335e97;
  color: #fff;
}

/* ===================================================
   BOTÕES PRINCIPAIS DO DASHBOARD (BUSCA & ADICIONAR)
   =================================================== */
.search-btn {
  background: #224e7a;
  color: #40dbff;
  border-radius: 7px;
  border: none;
  padding: 9px 22px;
  font-size: 1.02rem;
  margin-right: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 7px #1b456240;
  transition: background .15s, color .15s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.search-btn:hover {
  background: #40dbff;
  color: #25477b;
}

.add-btn {
  background: linear-gradient(90deg, #33aaff 40%, #256cbb 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 26px;
  font-size: 1.01rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 8px #22437740;
  transition: background .16s, box-shadow .16s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.add-btn:hover {
  background: linear-gradient(90deg, #43c8ff 40%, #4185e6 100%);
  box-shadow: 0 6px 24px #0a355f60;
}

/* Agrupamento dos botões na horizontal */
.clientes-header > div { display: flex; gap: 11px; }
@media (max-width: 500px) {
  .clientes-header > div { flex-direction: column; gap: 12px; align-items: stretch; }
}

/* ===================================================
   MODAL BUSCA & RESULTADOS DE BUSCA
   =================================================== */
.busca-modal-conteudo {
  width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.input-busca {
  width: 100%; max-width: 420px;
  padding: 14px 18px; border-radius: 8px;
  border: 1.5px solid #223f6c;
  background: #224477; color: #e6f7ff;
  font-size: 1.07rem; margin: 0 auto 20px auto;
  box-sizing: border-box;
  box-shadow: 0 1px 7px #1b456240;
  transition: border .18s, box-shadow .15s, background .13s;
  outline: none;
}
.input-busca:focus { border: 1.7px solid #35afff; background: #1d335c; outline: none; }
.item-busca {
  background: #182b4c; border-radius: 7px; margin-bottom: 11px;
  padding: 12px 13px; color: #fff; font-size: 1.03rem;
  display: flex; flex-direction: column; gap: 2px;
  width: 96%; max-width: 380px; margin-left: auto; margin-right: auto;
  box-sizing: border-box; text-align: center;
}
.item-busca strong { font-size: 1.09rem; color: #50e5ff; }

/* --------- MODAIS GERAIS --------- */
.modal-bg {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(23,40,64,0.78);
  display: flex; align-items: center; justify-content: center;
  z-index: 99;
}
.modal-card {
  margin: 0 auto; background: #183765; border-radius: 15px;
  width: 100%; max-width: 480px;
  box-shadow: 0 12px 50px #16213a42;
  text-align: center; padding: 2.5rem 2.3rem 2.1rem 2.3rem;
  min-height: 220px; max-height: 90vh; overflow-y: auto;
  animation: modal-pop 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
@keyframes modal-pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* ===================================================
   DASHBOARD LAYOUT & HEADER
   =================================================== */
.dashboard-bg {
  min-height: 100vh;
  background: radial-gradient(ellipse at 80% 60%, #2d80c4 30%, #224277 100%);
  font-family: 'Montserrat', Arial, sans-serif;
  padding-bottom: 40px;
}
.dashboard-container.expandido { max-width: 1440px; margin: 0 auto; padding: 0 28px 36px 28px; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 8px 0 0 0; height: 100px; }
.logo-flex { display: flex; align-items: center; height: 100px; }
.logo-img { width: 220px; height: auto; max-height: 90px; object-fit: contain; background: transparent; box-shadow: none; border-radius: 0; margin: 0; padding: 0; }
.logo-text { font-size: 2.3rem; font-weight: 700; color: #39c4ff; letter-spacing: 1.5px; }
.logo-area { display: flex; align-items: center; gap: 16px; }

/* --------- PERFIL E USUÁRIO HEADER --------- */
.user-info { display: flex; align-items: center; gap: 12px; }
.avatar { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; margin-right: 10px; background: #193255; display: flex; align-items: center; justify-content: center; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-name { color: #e7f3ff; font-size: 1.09rem; }
.profile-btn {
  margin-left: 7px; background: #1f3558; color: #35afff; border: none; border-radius: 8px;
  padding: 7px 17px; font-weight: 500; cursor: pointer; font-size: 1.02rem;
  box-shadow: 0 3px 12px #16213a20; transition: background .17s, color .17s;
}
.profile-btn:hover { background: #2570b1; color: #fff; }

/* --------- PRINCIPAL --------- */
.main-content.expandido-main {
  background: rgba(33, 55, 110, 0.97);
  border-radius: 26px; padding: 40px 52px 30px 52px; min-height: 590px;
  box-shadow: 0 4px 38px #10254b20; display: flex; flex-direction: column;
}
.clientes-section { width: 100%; }
.clientes-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 26px; flex-wrap: wrap; gap: 2.4rem;
}
.filtros-flex { display: flex; align-items: center; gap: 27px; flex-wrap: wrap; }
.clientes-header h2 { color: #f4faff; font-size: 1.24rem; font-weight: 600; letter-spacing: 1px; margin-right: 16px; }
.ano-turma-box { display: flex; align-items: center; gap: 14px; }
.dropdown-wrap { position: relative; }
.filtro-label { color: #fff; font-weight: 600; font-size: 1.01rem; margin-right: 5px; }
.ano-btn { background: #25447b; color: #caf3ff; border-radius: 7px; border: 1.2px solid #3bc7ff; padding: 7px 19px; cursor: pointer; font-weight: 600; }
.ano-btn:hover { background: #3bc7ff; color: #183765; }
.dropdown-ano {
  position: absolute; top: 41px; left: 0; background: #183765; border-radius: 10px;
  box-shadow: 0 2px 16px #0005; min-width: 150px; z-index: 40; padding: 4px 0;
}
.dropdown-item {
  width: 100%; box-sizing: border-box; display: block; padding: 10px 18px; text-align: left;
  color: #caf3ff; cursor: pointer; border: none; background: transparent; transition: background .14s, color .14s;
}
.dropdown-item:hover { background: #25447b; color: #fff; font-weight: bold; }
.selected-todos { background: #25447b; color: #4dffa8 !important; font-weight: bold; }

/* --------- NÃO AUTENTICADO --------- */
.nao-autenticado {
  min-height: 60vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #1d3557;
}
.nao-autenticado h2 { color: #fff; font-size: 2rem; margin-bottom: 12px; }
.nao-autenticado a { color: #00bbff; font-weight: bold; text-decoration: underline; }

/* --------- LISTA NO MODAL DE BUSCA --------- */
.modal-card ul {
  padding: 0; margin: 0 auto 0 auto; list-style: none; width: 100%;
  display: flex; flex-direction: column; align-items: center;
}
/* Centraliza e limita o LI (duplicado propositalmente para preservar seu estilo original) */
.item-busca {
  background: #182b4c; border-radius: 7px; margin-bottom: 11px; padding: 12px 13px; color: #fff;
  font-size: 1.03rem; display: flex; flex-direction: column; gap: 2px; width: 96%; max-width: 380px;
  margin-left: auto; margin-right: auto; box-sizing: border-box; text-align: center;
}

/* --------- AJUSTE EXTRAS --------- */
.modal-close-btn:hover { background: #2570b1; color: #fff; }
</style>
