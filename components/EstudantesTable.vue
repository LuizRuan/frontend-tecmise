<!--
  =====================================================================
  📄 EstudantesTable.vue — Tabela de alunos (somente documentação)
  =====================================================================
  🎯 Responsabilidade
    - Renderiza uma tabela responsiva de estudantes.
    - Permite **ordenação acessível** por *Nome* e *Email* (click/teclado).
    - Mostra avatar (com clique para ampliar via evento).
    - Expõe botões de **Editar** e **Excluir** (o pai trata a ação).

  🧩 Principais entradas (props)
    - clientes:Array
        Lista de objetos do estudante. Suporta chaves em *snake_case* e *camelCase*
        para compatibilidade com backend: ex.: `data_nascimento` ou `dataNascimento`,
        `foto_url` ou `fotoUrl`, `ano_id` ou `anoTurmaId`.
    - anosTurmas:Array
        Lista de opções { id:number, nome:string } para resolver o nome do ano/turma.
    - defaultAvatar:String
        URL da imagem padrão (fallback de avatar).

  🔄 Eventos emitidos
    - "ampliar-foto": ao clicar no avatar do estudante. Payload: { foto, nome, ano }.
    - "editar": ao clicar no botão “Editar”. Payload: objeto completo do estudante.
    - "excluir": ao clicar no botão “Excluir”. Payload: objeto completo do estudante.

  🧠 Como funciona a ordenação
    - `ordenacao` (reactive): { campo:'nome'|'email', crescente:boolean }.
    - `ordenarPor(campo)`: alterna a coluna e o sentido (asc/desc).
    - `clientesOrdenados` (computed): copia `clientes` e ordena com `localeCompare`
      (pt-BR, case-insensitive). Por padrão, ordena por **nome ascendente**.

  ♿ Acessibilidade
    - Cabeçalhos ordenáveis têm `role="button"`, `tabindex="0"` e `aria-sort`.
    - Interação por teclado: **Enter**/**Espaço** chama `ordenarPor`.
    - Imagens com `alt` descritivo e título.

  🛠️ Utilidades internas
    - `formatarCpf`: exibe CPF como `999.999.999-99`.
    - `formatarDataBrasileira`: aceita ISO ou BR e exibe dd/mm/aaaa.
    - `getFoto`: resolve `fotoUrl` | `foto_url` | `defaultAvatar`.
    - `getAnoTurmaNome`: resolve o nome a partir de `ano_id` | `anoTurmaId`.

  📌 Observações
    - **Nenhuma lógica foi alterada** — apenas documentação e comentários.
    - Estilos mantidos; apenas comentados para clareza.

  =====================================================================
-->

<template>
  <div class="table-scroll expandido-tabela">
    <table class="clientes-table">
      <!-- =================== Cabeçalho =================== -->
      <thead>
        <tr>
          <!-- Nome (ordenável: clique/Enter/Espaço) -->
          <th
            scope="col"
            :class="['sortable', ordenacao.campo === 'nome' ? 'active' : '']"
            tabindex="0"
            role="button"
            aria-label="Ordenar por nome"
            :aria-sort="getAriaSort('nome')"
            @click="ordenarPor('nome')"
            @keydown.enter.prevent="ordenarPor('nome')"
            @keydown.space.prevent="ordenarPor('nome')"
          >
            Nome
            <!-- Ícone de direção (mostrado só quando a coluna está ativa) -->
            <OrdenacaoIcon v-if="ordenacao.campo === 'nome'" :crescente="ordenacao.crescente" />
          </th>

          <!-- Email (ordenável) -->
          <th
            scope="col"
            :class="['sortable', ordenacao.campo === 'email' ? 'active' : '']"
            tabindex="0"
            role="button"
            aria-label="Ordenar por e-mail"
            :aria-sort="getAriaSort('email')"
            @click="ordenarPor('email')"
            @keydown.enter.prevent="ordenarPor('email')"
            @keydown.space.prevent="ordenarPor('email')"
          >
            Email
            <OrdenacaoIcon v-if="ordenacao.campo === 'email'" :crescente="ordenacao.crescente" />
          </th>

          <!-- Demais colunas (não ordenáveis) -->
          <th scope="col">CPF</th>
          <th scope="col">Data Nasc.</th>
          <th scope="col">Telefone</th>
          <th scope="col">Ano e Turma</th>
          <th scope="col" class="acoes-th">Ações</th>
        </tr>
      </thead>

      <!-- ===================== Corpo ===================== -->
      <tbody>
        <tr v-for="c in clientesOrdenados" :key="c.id">
          <!-- Foto + Nome: avatar clicável emite 'ampliar-foto' -->
          <td class="col-nome">
            <div class="nome-flex">
              <img
                :src="getFoto(c)"
                class="estudante-foto-tabela"
                @click="emitirAmpliarFoto(c)"
                title="Clique para ampliar"
                :alt="`Foto de ${c.nome || 'Estudante'}`"
              />
              <span>{{ c.nome || '—' }}</span>
            </div>
          </td>

          <!-- Texto simples (com fallback '—') -->
          <td class="center">{{ c.email || '—' }}</td>
          <td class="center">{{ formatarCpf(c.cpf) || '—' }}</td>
          <td class="center">{{ formatarDataBrasileira(c.data_nascimento ?? c.dataNascimento) || '—' }}</td>
          <td class="center">{{ c.telefone || '—' }}</td>
          <td class="center">{{ getAnoTurmaNome(c.ano_id ?? c.anoTurmaId) || '—' }}</td>

          <!-- Ações: o pai decide o que fazer ao editar/excluir -->
          <td>
            <button
              class="edit-btn"
              type="button"
              @click="$emit('editar', c)"
              :aria-label="`Editar estudante ${c.nome || ''}`"
            >
              Editar
            </button>
            <button
              class="del-btn"
              type="button"
              @click="$emit('excluir', c)"
              :aria-label="`Excluir estudante ${c.nome || ''}`"
            >
              Excluir
            </button>
          </td>
        </tr>

        <!-- Linha de estado vazio -->
        <tr v-if="clientesOrdenados.length === 0">
          <td colspan="7" class="empty-row">
            Nenhum estudante cadastrado para este Ano/Turma.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/* ===========================================================
   Imports
=========================================================== */
import { computed, reactive } from 'vue'

/* ===========================================================
   Props (entradas do componente)
   - `clientes` e `anosTurmas` são obrigatórios
   - `defaultAvatar` tem fallback local
=========================================================== */
const props = defineProps({
  clientes: { type: Array, required: true },
  anosTurmas: { type: Array, required: true },
  defaultAvatar: {
    type: String,
    default: '/default-avatar.png'
  }
})

/* ===========================================================
   Emits (saídas/ações)
   - ampliar-foto: payload com { foto, nome, ano }
   - editar / excluir: payload = objeto do estudante
=========================================================== */
const emit = defineEmits(['ampliar-foto', 'editar', 'excluir'])

/* ===========================================================
   Ordenação: estado + helpers
=========================================================== */
const ordenacao = reactive({ campo: 'nome', crescente: true })

/** Alterna campo/direção de ordenação. */
function ordenarPor(campo) {
  if (ordenacao.campo === campo) {
    ordenacao.crescente = !ordenacao.crescente
  } else {
    ordenacao.campo = campo
    ordenacao.crescente = true
  }
}

/** Fornece valor adequado para aria-sort (acessibilidade). */
function getAriaSort(campo) {
  if (ordenacao.campo !== campo) return 'none'
  return ordenacao.crescente ? 'ascending' : 'descending'
}

/* ===========================================================
   Lista ordenada (computed)
   - Cópia defensiva (spread) para não mutar a prop
   - localeCompare com 'pt' e sensitivity:'base' para A/a
=========================================================== */
const clientesOrdenados = computed(() => {
  const lista = [...props.clientes]
  const dir = ordenacao.crescente ? 1 : -1

  lista.sort((a, b) => {
    const valA = String(a?.[ordenacao.campo] ?? '').toLowerCase()
    const valB = String(b?.[ordenacao.campo] ?? '').toLowerCase()
    return valA.localeCompare(valB, 'pt', { sensitivity: 'base' }) * dir
  })

  return lista
})

/* ===========================================================
   Formatações e resoluções
=========================================================== */
/** Exibe CPF como XXX.XXX.XXX-XX; retorna vazio/fallback se inválido. */
function formatarCpf(cpf) {
  if (!cpf) return ''
  const d = String(cpf).replace(/\D/g, '')
  if (d.length !== 11) return d
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/** Converte ISO (YYYY-MM-DD[THH]) para dd/mm/aaaa; aceita BR direto. */
function formatarDataBrasileira(data) {
  if (!data) return ''
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data
  try {
    const iso = String(data).split('T')[0]
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  } catch {
    return String(data)
  }
}

/** Resolve a URL da foto com fallback no defaultAvatar. */
function getFoto(estudante) {
  return estudante.fotoUrl || estudante.foto_url || props.defaultAvatar
}

/** Mapeia o ID do ano/turma para o nome. */
function getAnoTurmaNome(anoId) {
  return props.anosTurmas.find(at => at.id === Number(anoId))?.nome || ''
}

/* ===========================================================
   Eventos auxiliares
=========================================================== */
/** Emite payload completo para abrir o modal de foto ampliada. */
function emitirAmpliarFoto(c) {
  const dados = {
    foto: getFoto(c),
    nome: c.nome || 'Estudante',
    ano: getAnoTurmaNome(c.ano_id ?? c.anoTurmaId)
  }
  emit('ampliar-foto', dados)
}
</script>

<!-- =========================================================
     💅 Estilos (documentados)
     - Scroll container com scrollbar discreta
     - Cabeçalho sticky + destaque de coluna ativa
     - Hover de linha e microinterações nos botões
========================================================= -->
<style scoped>
/* ===== Scroll do container (tabela grande/longa) ===== */
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

/* ===== Tabela base ===== */
.clientes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.02rem;
}
.clientes-table th, .clientes-table td {
  padding: 12px;
  border-bottom: 1.5px solid #24548e;
  color: #fff;
}

/* Cabeçalho fixo (sticky) e destaque visual */
.clientes-table thead th {
  background: #274b7c;
  color: #caf3ff;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  user-select: none;
}
.sortable { cursor: pointer; }
.active { color: #42bfff; text-decoration: underline; }

/* Hover de linha para melhor leitura */
.clientes-table tbody tr:hover {
  background: rgba(80,180,255,0.10);
}

/* Estado vazio (mensagem centralizada) */
.empty-row {
  text-align: center;
  color: #fff;
  font-style: italic;
}

/* ===== Coluna nome: avatar + texto ===== */
.col-nome .nome-flex {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Avatar pequeno com interação */
.estudante-foto-tabela {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3bc7ff;
  background: #193255;
  cursor: pointer;
  transition: transform .13s;
}
.estudante-foto-tabela:hover { transform: scale(1.1); }

/* ===== Colunas & ações ===== */
.center { text-align: center; }
.acoes-th { text-align: center; min-width: 120px; }

.edit-btn, .del-btn {
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
  font-size: 1.01rem;
  padding: 2px 7px;
  background: none;
  transition: all .18s;
}
.edit-btn { color: #3bc7ff; }
.edit-btn:hover { color: #3bffc1; background: #12344a40; }
.del-btn { color: #ff6c75; }
.del-btn:hover { color: #ff3939; background: #43232823; }
</style>
