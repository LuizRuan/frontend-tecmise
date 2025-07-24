<template>
  <!-- Área principal do dashboard -->
  <div class="dashboard-bg" @click="fecharPopups">
    <div class="dashboard-container expandido" @click.stop>
      <!-- HEADER -->
      <header class="header">
        <div class="logo">TecMise</div>
        <div class="user-info">
          <!-- Avatar do usuário -->
          <div class="avatar">
            <img :src="usuario.fotoUrl || defaultAvatar" alt="avatar" />
          </div>
          <!-- Saudação ao usuário -->
          <span class="user-name">Olá, <strong>{{ usuario.nome }}</strong></span>
          <!-- Botão para abrir o modal de perfil -->
          <button class="profile-btn" @click.stop="abrirPerfil">Perfil</button>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="main-content expandido-main">
        <section class="clientes-section">
          <!-- Cabeçalho da seção de estudantes com filtros -->
          <div class="clientes-header">
            <div class="filtros-flex">
              <h2>Estudantes</h2>
              <div class="ano-turma-box">
                <!-- Filtro por ano -->
                <span class="filtro-label">Ano:</span>
                <div class="dropdown-wrap">
                  <button class="ano-btn" @click.stop="toggleDropdown('ano')" :aria-expanded="dropdownAnoAberto">
                    {{ anoSelecionado ? (anoSelecionado.id === null ? 'Todos' : anoSelecionado.nome) : 'Selecione' }}
                  </button>
                  <!-- Lista de opções de anos -->
                  <div v-if="dropdownAnoAberto" class="dropdown-ano" @mousedown.stop>
                    <div class="dropdown-item" @click="selecionarAno({id: null, nome: 'Todos'})" :class="{'selected-todos': anoSelecionado && anoSelecionado.id === null}">
                      Todos os anos
                    </div>
                    <div v-for="ano in anos" :key="ano.id" class="dropdown-item">
                      <span class="dropdown-item" @click="selecionarAno(ano)">{{ ano.nome }}</span>
                    </div>
                  </div>
                </div>

                <!-- Filtro por turma -->
                <span class="filtro-label" style="margin-left:18px;">Turma:</span>
                <div class="dropdown-wrap">
                  <button class="ano-btn" @click.stop="toggleDropdown('turma')" :aria-expanded="dropdownTurmaAberto">
                    {{ turmaSelecionada ? (turmaSelecionada.id === null ? 'Todas' : turmaSelecionada.nome) : 'Selecione' }}
                  </button>
                  <!-- Lista de opções de turmas -->
                  <div v-if="dropdownTurmaAberto" class="dropdown-ano" @mousedown.stop>
                    <div class="dropdown-item" @click="selecionarTurma({id: null, nome: 'Todas'})" :class="{'selected-todos': turmaSelecionada && turmaSelecionada.id === null}">
                      Todas as turmas
                    </div>
                    <div v-for="turma in turmasFiltradas" :key="turma.id" class="dropdown-item">
                      <span class="dropdown-item" @click="selecionarTurma(turma)">{{ turma.nome }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Botão para abrir modal de novo estudante -->
            <button class="add-btn" @click.stop="abrirModalAdicionar">+ Novo Estudante</button>
          </div>

          <!-- TABELA DE ESTUDANTES -->
          <div class="table-scroll expandido-tabela">
            <table class="clientes-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Data Nasc.</th>
                  <th>Telefone</th>
                  <th>Ano</th>
                  <th>Turma</th>
                  <th class="acoes-th">Ações</th>
                </tr>
              </thead>
              <tbody>
                <!-- Linha para cada estudante -->
                <tr v-for="c in clientesFiltradosOrdenados" :key="c.id">
                  <td class="col-nome">
                    <div class="nome-flex">
                      <img
                        :src="c.fotoUrl || defaultAvatar"
                        class="estudante-foto-tabela"
                        @click="abrirModalFoto(c.fotoUrl || defaultAvatar, c.nome)"
                        title="Clique para ampliar"
                      />
                      <span>{{ c.nome }}</span>
                    </div>
                  </td>
                  <td class="center">{{ formatarCpf(c.cpf) }}</td>
                  <td class="center">{{ c.email }}</td>
                  <td class="center">{{ formatarDataBrasileira(c.dataNascimento) }}</td>
                  <td class="center">{{ c.telefone || '-' }}</td>
                  <td class="center">{{ getAnoNome(c.anoId) }}</td>
                  <td class="center">{{ getTurmaNome(c.anoId, c.turmaId) }}</td>
                  <td style="text-align:right;">
                    <!-- Botões de ação para cada estudante -->
                    <button class="edit-btn" @click.stop="editar(c)">Editar</button>
                    <button class="del-btn" @click.stop="abrirConfirmarExcluir(c)">Excluir</button>
                  </td>
                </tr>
                <!-- Mensagem caso não existam estudantes -->
                <tr v-if="clientesFiltradosOrdenados.length === 0">
                  <td colspan="8" class="empty-row">Nenhum estudante cadastrado para este ano/turma.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <!-- MODAL ESTUDANTE -->
      <transition name="modal">
  <div v-if="showModal" class="modal-bg">
    <div class="modal-card">
      <h3 class="modal-title">{{ editando ? 'Editar estudante' : 'Novo estudante' }}</h3>
      <form @submit.prevent="salvarCliente">
        <div class="avatar-edit">
          <label for="foto-estudante">
            <img :src="clienteForm.fotoUrl || defaultAvatar" class="avatar-img" alt="Foto do estudante" />
            <input id="foto-estudante" type="file" accept="image/*" @change="onFotoEstudanteChange" style="display:none" />
          </label>
          <span class="avatar-upload-text" @click="dispararInputEstudante()">Adicionar / Alterar foto</span>
        </div>
        
        <input v-model="clienteForm.nome" type="text" placeholder="Nome" required autocomplete="off" :class="{ erroInput: erroNome }" @input="erroNome = ''" />
        <p v-if="erroNome" class="erro-msg">{{ erroNome }}</p>

        <input
          v-model="clienteForm.cpf"
          type="text"
          maxlength="11"
          placeholder="CPF (apenas números)"
          required
          autocomplete="off"
          :class="{ erroInput: erroCpf }"
          @input="limparCpf"
        />
        <p v-if="erroCpf" class="erro-msg">{{ erroCpf }}</p>

        <input v-model="clienteForm.email" type="email" placeholder="E-mail" required autocomplete="off" :class="{ erroInput: erroEmail }" @input="erroEmail = ''" />
        <p v-if="erroEmail" class="erro-msg">{{ erroEmail }}</p>

        <input v-model="clienteForm.dataNascimento" type="date" placeholder="Data de nascimento" required :class="{ erroInput: erroDataNascimento }" @input="erroDataNascimento = ''" />
        <p v-if="erroDataNascimento" class="erro-msg">{{ erroDataNascimento }}</p>

        <input v-model="clienteForm.telefone" type="text" placeholder="Telefone (opcional)" autocomplete="off" :class="{ erroInput: erroTelefone }" @input="erroTelefone = ''" />
        <p v-if="erroTelefone" class="erro-msg">{{ erroTelefone }}</p>

        <!-- Restante do seu modal... -->
        <div class="modal-btns">
          <button type="submit">{{ editando ? 'Salvar' : 'Cadastrar' }}</button>
          <button type="button" @click="fecharModal">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</transition>


      <!-- MODAL PERFIL -->
      <transition name="modal">
        <div v-if="showPerfil" class="modal-bg">
          <div class="modal-card">
            <h3 class="modal-title">Editar Perfil</h3>
            <p v-if="erroEstudante" class="erro-msg">{{ erroEstudante }}</p>

            <form @submit.prevent="salvarPerfil">
              <div class="avatar-edit">
                <label for="foto-perfil">
                  <img :src="perfilForm.fotoUrl || defaultAvatar" class="avatar-img" alt="Foto de perfil" />
                  <input id="foto-perfil" type="file" accept="image/*" @change="onFotoPerfilChange" style="display:none" />
                </label>
                <span class="avatar-upload-text" @click="dispararInputPerfil()">Alterar foto</span>
              </div>
              <input v-model="perfilForm.nome" type="text" placeholder="Nome de usuário" required />
              <input v-model="perfilForm.email" type="email" placeholder="E-mail" required />
              <div class="modal-btns">
                <button type="submit">Salvar</button>
                <button type="button" @click="fecharPerfil">Cancelar</button>
              </div>
              <button class="logout-btn" type="button" @click="confirmarLogout">Sair da conta</button>
            </form>
          </div>
        </div>
      </transition>

      <!-- MODAL EXCLUIR CLIENTE -->
      <transition name="modal">
        <div v-if="showConfirmarExcluir" class="modal-bg">
          <div class="modal-card">
            <h3 class="modal-title">Confirmar Exclusão</h3>
            <p style="color:#fff; margin-bottom: 18px;">
              Tem certeza que deseja excluir <strong>{{ estudanteExcluir?.nome }}</strong>?
            </p>
            <div class="modal-btns">
              <button @click="confirmarExcluir" style="background:#ff5b5b;">Excluir</button>
              <button type="button" @click="cancelarExcluir">Cancelar</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- MODAL CONFIRMAR LOGOUT -->
      <transition name="modal">
        <div v-if="showConfirmarLogout" class="modal-bg">
          <div class="modal-card">
            <h3 class="modal-title">Sair da Conta</h3>
            <p style="color:#fff; margin-bottom: 18px;">
              Tem certeza que deseja sair da conta?
            </p>
            <div class="modal-btns">
              <button @click="sairConta" style="background:#ff5b5b;">Sair</button>
              <button type="button" @click="showConfirmarLogout=false">Cancelar</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const erroEstudante = ref('');
const erroCpf = ref('');
const erroEmail = ref('');

const defaultAvatar = "https://ui-avatars.com/api/?background=2db6ff&color=fff&name=U"
import { reactive, onMounted } from 'vue'

async function carregarEstudantes() {

  if (!usuario) return
  console.log('usuario:', usuario); // <- Veja o valor no console
console.log('payload:', {
  nome: clienteForm.nome,
  cpf: clienteForm.cpf,
  email: clienteForm.email,
  data_nascimento: clienteForm.dataNascimento,
  telefone: clienteForm.telefone,
  foto_url: clienteForm.fotoUrl,
  ano_id: clienteForm.anoId,
  turma_id: clienteForm.turmaId,
  usuario_id: usuario.id
});

  const res = await fetch(`http://localhost:8080/estudantes?usuario_id=${usuario.id}`)
  if (res.ok) {
    const data = await res.json()
    clientes.value = data.map(est => ({
      id: est.id,
      nome: est.nome,
      cpf: est.cpf,
      email: est.email,
      dataNascimento: est.data_nascimento,
      telefone: est.telefone,
      fotoUrl: est.foto_url,
      anoId: est.ano_id,
      turmaId: est.turma_id,
    }))
  }
}
async function salvarEstudante() {
  // Se for edição
  if (editando.value && clienteForm.id) {
    try {
      const res = await fetch(`http://localhost:8080/estudantes/${clienteForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: clienteForm.nome,
          cpf: clienteForm.cpf,
          email: clienteForm.email,
          data_nascimento: clienteForm.dataNascimento,
          telefone: clienteForm.telefone,
          foto_url: clienteForm.fotoUrl,
          ano_id: clienteForm.anoId,
          turma_id: clienteForm.turmaId,
          usuario_id: clienteForm.usuario_id
        })
      });
      if (!res.ok) {
  const msg = await res.text();
  if (res.status === 409) {
  erroEstudante.value = msg; // mostra a mensagem bonita
} else {
  erroEstudante.value = "Erro ao atualizar estudante";
}

  return;
}

      await carregarEstudantes();
      fecharModal();
    } catch (err) {
      alert("Erro ao atualizar estudante");
    }
    return;
  }

  // Se for novo cadastro...
  // (Seu código atual de cadastro, método POST)
}

async function salvarCliente() {
  erroEstudante.value = ''; // Sempre começa limpando o erro

  // Validação de ano/turma
  if (!clienteForm.anoId || !clienteForm.turmaId) {
    erroEstudante.value = 'Selecione o ano e a turma.';
    return;
  }

  try {
    let res;
    const payload = {
      nome: clienteForm.nome,
      cpf: clienteForm.cpf,
      email: clienteForm.email,
      data_nascimento: clienteForm.dataNascimento,
      telefone: clienteForm.telefone,
      foto_url: clienteForm.fotoUrl,
      ano_id: clienteForm.anoId,
      turma_id: clienteForm.turmaId,
      usuario_id: usuario.id
    };

    if (editando.value && clienteForm.id) {
      // Atualizar estudante (PUT)
      res = await fetch(`http://localhost:8080/estudantes/${clienteForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Cadastrar novo estudante (POST)
      res = await fetch('http://localhost:8080/estudantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    const msg = await res.text();
if (!res.ok) {
  if (msg.includes('E-mail já cadastrado')) {
    erroEmail.value = msg;
    erroCpf.value = '';
  } else if (msg.includes('CPF já cadastrado')) {
    erroCpf.value = msg;
    erroEmail.value = '';
  } else {
    erroEmail.value = '';
    erroCpf.value = '';
    erroEstudante.value = "Erro ao salvar estudante";
  }
  return;
}


    await carregarEstudantes();
    fecharModal();
    erroEstudante.value = '';
  } catch (err) {
    erroEstudante.value = err.message || 'Erro ao salvar estudante';
  }
}


import { useRoute } from 'vue-router'

const route = useRoute()

const usuario = reactive({
  id: Number(route.query.id) || null,
  nome: route.query.nome || '',
  email: route.query.email || '',
  fotoUrl: route.query.fotoUrl || ''
})

// Verifica se o ID realmente veio
if (!usuario.id) {
  alert('Usuário não identificado.')
}

onMounted(async () => {
  
  const id = route.query.id

  if (!id) {
    alert("Usuário não identificado.")
    return
  }

  try {
    const res = await fetch(`http://localhost:8080/usuario?id=${id}`)

    if (!res.ok) throw new Error("Erro ao buscar usuário")

    const data = await res.json()
    console.log('dados do usuário carregado:', data)
    console.log('route.query:', route.query)


    usuario.id = data.id
    usuario.nome = data.nome
    usuario.email = data.email
    usuario.fotoUrl = data.foto_url || ''
    
    await carregarEstudantes()
  } catch (err) {
    console.error("Erro ao carregar dados do usuário:", err)
    alert("Erro ao carregar dados do usuário")
  }
})



function limparCpf() {
  clienteForm.cpf = clienteForm.cpf.replace(/\D/g, '').slice(0,11)
  erroCpf.value = ''
}
import * as yup from 'yup';

const dominiosPermitidos = [
  'gmail.com',
  'icloud.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'uol.com.br',
  'bol.com.br',
  // adicione outros domínios que quiser permitir
];

const emailSchema = yup.string()
  .email('E-mail inválido')
  .test('dominio-permitido', 'Domínio de e-mail não permitido', (value) => {
    if (!value) return false;
    const dominio = value.split('@')[1];
    return dominiosPermitidos.includes(dominio);
  })
  .required('E-mail é obrigatório');

function formatarDataBrasileira(dataIso) {
  if (!dataIso) return ''
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}


const anos = ref([
  { id: 1, nome: '6º ano' },
  { id: 2, nome: '7º ano' }
])

const turmas = ref([
  { id: 1, nome: 'A', anoId: 1 },
  { id: 2, nome: 'B', anoId: 1 },
  { id: 3, nome: 'A', anoId: 2 },
])

const clientes = ref([])


const dropdownAnoAberto = ref(false)
const dropdownTurmaAberto = ref(false)
const showPerfil = ref(false)
const showConfirmarLogout = ref(false)
const showConfirmarExcluir = ref(false)
const estudanteExcluir = ref(null)

function abrirConfirmarExcluir(estudante) {
  estudanteExcluir.value = estudante
  showConfirmarExcluir.value = true
}
function cancelarExcluir() {
  showConfirmarExcluir.value = false
}

function toggleDropdown(tipo) {
  if (tipo === 'ano') {
    dropdownAnoAberto.value = !dropdownAnoAberto.value
    dropdownTurmaAberto.value = false
  } else if (tipo === 'turma') {
    dropdownTurmaAberto.value = !dropdownTurmaAberto.value
    dropdownAnoAberto.value = false
  }
}
function fecharPopups() {
  dropdownAnoAberto.value = false
  dropdownTurmaAberto.value = false
  showPerfil.value = false
  showModal.value = false
}

const anoSelecionado = ref({id: null, nome: 'Todos'})
const turmaSelecionada = ref({id: null, nome: 'Todas'})

function selecionarAno(ano) {
  anoSelecionado.value = ano
  turmaSelecionada.value = {id: null, nome: 'Todas'}
  dropdownAnoAberto.value = false
}
function selecionarTurma(turma) {
  turmaSelecionada.value = turma
  dropdownTurmaAberto.value = false
}
const turmasFiltradas = computed(() => {
  if (!anoSelecionado.value || anoSelecionado.value.id === null) return turmas.value
  return turmas.value.filter(t => t.anoId === anoSelecionado.value.id)
})
const clientesFiltrados = computed(() =>
  clientes.value.filter(c =>
    (anoSelecionado.value.id !== null ? c.anoId === anoSelecionado.value.id : true) &&
    (turmaSelecionada.value.id !== null ? c.turmaId === turmaSelecionada.value.id : true)
  )
)
function getAnoNome(anoId) {
  return anos.value.find(a => a.id === anoId)?.nome || ""
}
function getTurmaNome(anoId, turmaId) {
  return turmas.value.find(t => t.id === turmaId && t.anoId === anoId)?.nome || ""
}

// --- CRUD DE ESTUDANTES (MODAL PRINCIPAL) --- //
const showModal = ref(false)
const editando = ref(false)
const clienteForm = reactive({ id: null, nome: '', cpf: '', email: '', dataNascimento: '', telefone: '', fotoUrl: "", anoId: null, turmaId: null })
const erroNome = ref('')

const erroDataNascimento = ref('')
const erroTelefone = ref('')


function formatarCpf(cpf) {
  if (!cpf) return ''
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11) return cpf
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
function abrirModalAdicionar() {
  fecharPopups()
  editando.value = false
  Object.assign(clienteForm, { id: null, nome: '', cpf: '', email: '', dataNascimento: '', telefone: '', fotoUrl: "", anoId: anos.value[0]?.id || null, turmaId: null })
  erroNome.value = ''
  erroCpf.value = ''
  erroEmail.value = ''
  erroDataNascimento.value = ''
  erroTelefone.value = ''
  showModal.value = true
}
function editar(cli) {
  fecharPopups()
  editando.value = true
  Object.assign(clienteForm, cli)
  erroNome.value = ''
  erroCpf.value = ''
  erroEmail.value = ''
  erroDataNascimento.value = ''
  erroTelefone.value = ''
  showModal.value = true
}
function fecharModal() { showModal.value = false }
function validarCpf(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let soma = 0; let resto
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i)
  resto = (soma * 10) % 11
  if ((resto === 10) || (resto === 11)) resto = 0
  if (resto !== parseInt(cpf.substring(9, 10))) return false
  soma = 0
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i)
  resto = (soma * 10) % 11
  if ((resto === 10) || (resto === 11)) resto = 0
  if (resto !== parseInt(cpf.substring(10, 11))) return false
  return true
}
const emailsPermitidos = [
  '@gmail.com',
  '@hotmail.com',
  '@outlook.com',
  '@yahoo.com.br',
  '@uol.com.br'
]
// FOTO
function onFotoEstudanteChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { alert("A imagem deve ter até 5MB!"); return }
  const reader = new FileReader()
  reader.onload = (evt) => { clienteForm.fotoUrl = evt.target.result }
  reader.readAsDataURL(file)
}
function dispararInputEstudante() {
  document.getElementById('foto-estudante')?.click()
}
const turmasDoAnoModal = computed(() => {
  return turmas.value.filter(t => t.anoId === clienteForm.anoId)
})
watch(() => clienteForm.anoId, (novoAnoId) => {
  if (!turmas.value.find(t => t.id === clienteForm.turmaId && t.anoId === novoAnoId)) {
    clienteForm.turmaId = null
  }
})

// ORDENAÇÃO
const ordenacao = reactive({
  campo: 'nome',
  crescente: true,
})

function ordenarPor(campo) {
  if (ordenacao.campo === campo) {
    ordenacao.crescente = !ordenacao.crescente
  } else {
    ordenacao.campo = campo
    ordenacao.crescente = true
  }
}
const clientesOrdenados = computed(() => {
  let lista = [...clientes.value]
  if (ordenacao.campo === 'nome') {
    lista.sort((a, b) => {
      if (a.nome.toLowerCase() < b.nome.toLowerCase()) return ordenacao.crescente ? -1 : 1
      if (a.nome.toLowerCase() > b.nome.toLowerCase()) return ordenacao.crescente ? 1 : -1
      return 0
    })
  } else if (ordenacao.campo === 'email') {
    lista.sort((a, b) => {
      if (a.email.toLowerCase() < b.email.toLowerCase()) return ordenacao.crescente ? -1 : 1
      if (a.email.toLowerCase() > b.email.toLowerCase()) return ordenacao.crescente ? 1 : -1
      return 0
    })
  }
  return lista
})
const clientesFiltradosOrdenados = computed(() => {
  // Aplica filtro e ordenação ao mesmo tempo
  return clientesOrdenados.value.filter(c =>
    (anoSelecionado.value.id !== null ? c.anoId === anoSelecionado.value.id : true) &&
    (turmaSelecionada.value.id !== null ? c.turmaId === turmaSelecionada.value.id : true)
  )
})

// --- MODAL PERFIL --- //
const perfilForm = reactive({ nome: '', email: '', fotoUrl: '', senha: '' })
function abrirPerfil() {
  fecharPopups()
  Object.assign(perfilForm, { ...usuario, senha: '' })
  showPerfil.value = true
}
function fecharPerfil() {
  showPerfil.value = false
}
function salvarPerfil() {
  usuario.nome = perfilForm.nome
  usuario.email = perfilForm.email
  usuario.fotoUrl = perfilForm.fotoUrl

    // Fecha o modal de perfil
  showPerfil.value = false

  fecharPerfil()
}


function onFotoPerfilChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => { perfilForm.fotoUrl = evt.target.result }
  reader.readAsDataURL(file)
}
function dispararInputPerfil() {
  document.getElementById('foto-perfil')?.click()
}

// --- EXCLUIR CLIENTE --- //
async function confirmarExcluir() {
  try {
    const res = await fetch(`http://localhost:8080/estudantes/${estudanteExcluir.value.id}`, {
      method: 'DELETE'
    })

    if (!res.ok) throw new Error('Erro ao excluir')

    clientes.value = clientes.value.filter(c => c.id !== estudanteExcluir.value.id)
    cancelarExcluir()
  } catch (err) {
    alert('Erro ao excluir estudante')
  }
}

// --- LOGOUT --- //
function confirmarLogout() {
  showConfirmarLogout.value = true
}
function sairConta() {
  // Limpe dados de usuário se necessário
  window.location.href = '/login';
}
</script>

<style scoped>
.dashboard-bg {
  min-height: 100vh;
  background: radial-gradient(ellipse at 80% 60%, #2d80c4 30%, #224277 100%);
  font-family: 'Montserrat', Arial, sans-serif;
  padding-bottom: 40px;
}
.dashboard-container.expandido {
  max-width: 1440px;
  margin: 0 auto;
  padding: 35px 48px 70px 48px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 22px;
  margin-bottom: 18px;
}
.logo {
  color: #34b9ff;
  font-size: 2.1rem;
  font-weight: 700;
  letter-spacing: 2px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 42px; height: 42px; border-radius: 50%; overflow: hidden; margin-right: 10px; background: #193255;
  display: flex; align-items: center; justify-content: center;
}
.avatar img {
  width: 100%; height: 100%; object-fit: cover;
}
.user-name {
  color: #e7f3ff;
  font-size: 1.09rem;
}
.profile-btn {
  margin-left: 7px;
  background: #1f3558;
  color: #35afff;
  border: none;
  border-radius: 8px;
  padding: 7px 17px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1.02rem;
  box-shadow: 0 3px 12px #16213a20;
  transition: background .17s, color .17s;
}
.profile-btn:hover {
  background: #2570b1;
  color: #fff;
}
/* Main content */
.main-content.expandido-main {
  background: rgba(33, 55, 110, 0.97);
  border-radius: 26px;
  padding: 40px 52px 30px 52px;
  min-height: 590px;
  box-shadow: 0 4px 38px #10254b20;
  display: flex;
  flex-direction: column;
}
.clientes-section { width: 100%; }
.clientes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
  flex-wrap: wrap;
  gap: 1.1rem;
}
.filtros-flex {
  display: flex;
  align-items: center;
  gap: 27px;
  flex-wrap: wrap;
}
.clientes-header h2 {
  color: #f4faff;
  font-size: 1.24rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-right: 16px;
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
}
.add-btn:hover {
  background: linear-gradient(90deg, #43c8ff 40%, #4185e6 100%);
  box-shadow: 0 6px 24px #0a355f60;
}

/* Filtros e Dropdowns */
.ano-turma-box {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dropdown-wrap { position: relative; }
.filtro-label {
  color: #fff;
  font-weight: 600;
  font-size: 1.01rem;
  margin-right: 5px;
}
.ano-btn {
  background: #25447b;
  color: #caf3ff;
  border-radius: 7px;
  border: 1.2px solid #3bc7ff;
  padding: 7px 19px;
  cursor: pointer;
  font-weight: 600;
}
.ano-btn:hover { background: #3bc7ff; color: #183765; }
.dropdown-ano {
  position: absolute;
  top: 41px;
  left: 0;
  background: #183765;
  border-radius: 10px;
  box-shadow: 0 2px 16px #0005;
  min-width: 150px;
  z-index: 40;
  padding: 4px 0;
}
.dropdown-item {
  width: 100%;
  box-sizing: border-box;
  display: block;
  padding: 10px 18px;
  text-align: left;
  color: #caf3ff;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: background .14s, color .14s;
}
.dropdown-item:hover {
  background: #25447b;
  color: #fff;
  font-weight: bold;
}
.selected-todos {
  background: #25447b;
  color: #4dffa8 !important;
  font-weight: bold;
}
/* Tabela */
.table-scroll.expandido-tabela {
  max-width: 100vw;
  max-height: 440px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #28aaff #1c3259;
}
.table-scroll::-webkit-scrollbar { width: 8px; }
.table-scroll::-webkit-scrollbar-track { background: #1c3259; }
.table-scroll::-webkit-scrollbar-thumb { background: #28aaff; border-radius: 8px; }
.clientes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.02rem;
  background: transparent;
}
.clientes-table th, .clientes-table td {
  padding: 12px 12px;
  text-align: left;
  border-bottom: 1.5px solid #24548e;
  color: #fff;
}
.clientes-table thead th {
  background: #274b7c;
  color: #caf3ff;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
  user-select: none;
}
.clientes-table th.sortable { cursor: pointer; }
.clientes-table th.active {
  color: #42bfff;
  text-decoration: underline;
}
.clientes-table tbody tr { transition: background 0.18s; }
.clientes-table tbody tr:hover { background: rgba(80,180,255,0.10); }
.empty-row { text-align: center !important; color: #fff; font-style: italic; }
.estudante-foto-tabela {
  width: 34px; height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3bc7ff;
  transition: transform .13s;
  background: #193255;
}
.estudante-foto-tabela:hover { transform: scale(1.10); }
.col-nome .nome-flex {
  display: flex; align-items: center; gap: 10px;
}
.col-nome .nome-flex span {
  color: #fff !important;
  font-size: 0.98rem !important;
  font-weight: 500 !important;
}
.center {
  text-align: center;
}
.edit-btn, .del-btn {
  background: none; border: none; border-radius: 6px;
  color: #3bc7ff; font-weight: 600; cursor: pointer;
  margin-right: 8px; font-size: 1.01rem; transition: all .18s;
  padding: 2px 7px;
}
.edit-btn:hover { color: #3bffc1; background: #12344a40;}
.del-btn { color: #ff6c75; }
.del-btn:hover { color: #ff3939; background: #43232823;}

/* Modais */
.modal-enter-active, .modal-leave-active { transition: opacity 0.23s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-bg {
  position: fixed; top:0; left:0; width:100%; height:100%;
  background: rgba(23,40,64,0.74);
  display: flex; align-items: center; justify-content: center;
  z-index: 99;
}
.modal-card {
  background: #183765;
  border-radius: 15px;
  width: 90%;
  max-width: 430px;
  box-shadow: 0 12px 50px #16213a42;
  text-align: center;
  padding: 2.1rem 1.5rem 1.7rem 1.5rem;
  animation: modal-pop 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
@keyframes modal-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.modal-title {
  color: #3bc7ff;
  font-weight: 700;
  font-size: 1.16rem;
  margin-bottom: 17px;
}
.modal-card form {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.modal-card input, .modal-card select {
  width: 100%; box-sizing: border-box;
  padding: 0.57rem 1rem;
  margin-bottom: 14px;
  border-radius: 8px;
  border: 1.2px solid #3b5998;
  background: #25447b;
  color: #fff;
  font-size: 0.97rem;
  outline: none;
  transition: border .19s, background .19s;
}
.modal-card input::placeholder { color: #a2cfff; }
.modal-card input:focus, .modal-card select:focus { border-color: #3bc7ff; }
.erroInput { border-color: #ff5b5b !important; }
.erro-msg { color: #ff5b5b; font-size: 0.91rem; margin: -8px 0 10px 0; text-align: left; }
.avatar-edit {
  display: flex; flex-direction: column;
  align-items: center; margin-bottom: 18px;
}
.avatar-img {
  width: 70px; height: 70px; border-radius: 50%;
  object-fit: cover; margin-bottom: 5px;
  border: 3px solid #36c5ff44;
  background: #193255; cursor: pointer;
}
.avatar-upload-text {
  color: #3bc7ff; font-size: 0.96rem;
  cursor: pointer; transition: color .16s;
}
.avatar-upload-text:hover { color: #fff; }
.modal-btns {
  display: flex; gap: 12px;
  justify-content: center; margin-top: 6px;
}
.modal-btns button {
  padding: 0.62rem 1.09rem; border-radius: 7px; border: none;
  font-size: 1.01rem; font-weight: 600; cursor: pointer;
  background: linear-gradient(90deg, #32e0ff 30%, #2956a6 100%);
  color: #fff; transition: all .17s;
}
.modal-btns button:hover { transform: scale(1.03); filter: brightness(1.1); }
.modal-btns button[type="button"] { background: #223a5c; color: #d3f5ff;}
.modal-btns button[type="button"]:hover { background: #335e97; color: #fff; }
.logout-btn {
  width: 100%; margin-top: 21px; padding: 0.63rem 0;
  border-radius: 7px; border: none;
  background: #ff5b5b; color: #fff;
  font-size: 1rem; font-weight: 600;
  cursor: pointer; transition: background .16s;
}
.logout-btn:hover { background: #e04a4a; }
@media (max-width: 1100px) {
  .dashboard-container.expandido { padding: 20px 3vw; }
  .main-content.expandido-main { padding: 20px 2vw; }
}
@media (max-width: 700px) {
  .dashboard-container.expandido { padding: 12px 2vw; }
  .main-content.expandido-main { padding: 8px 1vw; }
  .clientes-header { flex-direction: column; align-items: flex-start; gap: 0.6rem; }
  .table-scroll.expandido-tabela { max-height: 320px; }
  .clientes-table th, .clientes-table td { padding: 8px 4px; }
}
.acoes-th {
  text-align: center !important;
  min-width: 120px;
}

.clientes-table tbody td:last-child {
  text-align: center !important;
}
.erro-msg {
  color: #ff6a6a;
  font-size: 0.99rem;
  margin: 2px 0 8px 2px;
  font-weight: 500;
  letter-spacing: 0.01em;
  /* você pode ajustar mais coisas aqui! */
}


</style>
