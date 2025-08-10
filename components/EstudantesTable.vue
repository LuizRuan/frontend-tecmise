<!--
  EstudantesTable.vue (rev Lume)
  ------------------------------------------------------------
  - Tabela responsiva de estudantes, com ordenação por Nome/E-mail.
  - Acessível: headers ordenáveis via teclado (Enter/Espaço).
  - Ações: editar, excluir, ampliar foto (emite para o pai).
-->

<template>
  <div class="table-scroll expandido-tabela">
    <table class="clientes-table">
      <thead>
        <tr>
          <!-- Nome (ordenável) -->
          <th
            :class="['sortable', ordenacao.campo === 'nome' ? 'active' : '']"
            tabindex="0"
            role="button"
            aria-label="Ordenar por nome"
            :aria-pressed="ordenacao.campo === 'nome'"
            @click="ordenarPor('nome')"
            @keydown.enter.prevent="ordenarPor('nome')"
            @keydown.space.prevent="ordenarPor('nome')"
          >
            Nome
            <span v-if="ordenacao.campo === 'nome'">
              <span v-if="ordenacao.crescente">▲</span>
              <span v-else>▼</span>
            </span>
          </th>

          <!-- Email (ordenável) -->
          <th
            :class="['sortable', ordenacao.campo === 'email' ? 'active' : '']"
            tabindex="0"
            role="button"
            aria-label="Ordenar por e-mail"
            :aria-pressed="ordenacao.campo === 'email'"
            @click="ordenarPor('email')"
            @keydown.enter.prevent="ordenarPor('email')"
            @keydown.space.prevent="ordenarPor('email')"
          >
            Email
            <span v-if="ordenacao.campo === 'email'">
              <span v-if="ordenacao.crescente">▲</span>
              <span v-else>▼</span>
            </span>
          </th>

          <th>CPF</th>
          <th>Data Nasc.</th>
          <th>Telefone</th>
          <th>Ano/Turma</th>
          <th class="acoes-th">Ações</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="c in clientesOrdenados" :key="c.id">
          <!-- Avatar + Nome -->
          <td class="col-nome">
            <div class="nome-flex">
              <img
                :src="c.fotoUrl || c.foto_url || defaultAvatar"
                class="estudante-foto-tabela"
                @click="$emit('ampliar-foto', {
                  foto: c.fotoUrl || c.foto_url || defaultAvatar,
                  nome: c.nome || 'Estudante',
                  ano: getAnoTurmaNome(c.ano_id ?? c.anoTurmaId)
                })"
                title="Clique para ampliar"
                alt="Foto do estudante"
                style="cursor: pointer;"
              />
              <span>{{ c.nome || '—' }}</span>
            </div>
          </td>

          <td class="center">{{ c.email || '—' }}</td>
          <td class="center">{{ formatarCpf(c.cpf) || '—' }}</td>
          <td class="center">{{ formatarDataBrasileira(c.data_nascimento ?? c.dataNascimento) || '—' }}</td>
          <td class="center">{{ c.telefone || '—' }}</td>
          <td class="center">{{ getAnoTurmaNome(c.ano_id ?? c.anoTurmaId) || '—' }}</td>

          <td style="text-align:right;">
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
const { $api } = useNuxtApp()

import { computed, reactive } from 'vue'

const props = defineProps({
  clientes: { type: Array, required: true },
  anosTurmas: { type: Array, required: true },
  defaultAvatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=2db6ff&color=fff&name=U'
  }
})

// estado local de ordenação
const ordenacao = reactive({ campo: 'nome', crescente: true })

function ordenarPor(campo) {
  if (ordenacao.campo === campo) {
    ordenacao.crescente = !ordenacao.crescente
  } else {
    ordenacao.campo = campo
    ordenacao.crescente = true
  }
}

// sort seguro (lida com null/undefined e normaliza)
function safeStr(v) {
  return (v ?? '').toString().trim().toLowerCase()
}

const clientesOrdenados = computed(() => {
  const lista = [...props.clientes]
  const dir = ordenacao.crescente ? 1 : -1

  if (ordenacao.campo === 'nome') {
    lista.sort((a, b) => (safeStr(a.nome) > safeStr(b.nome) ? 1 : safeStr(a.nome) < safeStr(b.nome) ? -1 : 0) * dir)
  } else if (ordenacao.campo === 'email') {
    lista.sort((a, b) => (safeStr(a.email) > safeStr(b.email) ? 1 : safeStr(a.email) < safeStr(b.email) ? -1 : 0) * dir)
  }
  return lista
})

function formatarCpf(cpf) {
  if (!cpf) return ''
  const d = String(cpf).replace(/\D/g, '')
  if (d.length !== 11) return d
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatarDataBrasileira(data) {
  if (!data) return ''
  // já BR?
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data
  try {
    const iso = String(data).split('T')[0]
    const [y, m, d] = iso.split('-')
    if (y && m && d) return `${d}/${m}/${y}`
    return data
  } catch { return String(data) }
}

function getAnoTurmaNome(anoId) {
  if (!anoId) return ''
  return props.anosTurmas.find(at => at.id === Number(anoId))?.nome || ''
}
</script>

<style scoped>
/* Scroll e responsividade */
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

/* Tabela */
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
  position: sticky; top: 0; z-index: 10;
  user-select: none;
}
.clientes-table th.sortable { cursor: pointer; }
.clientes-table th.active { color: #42bfff; text-decoration: underline; }

.clientes-table tbody tr { transition: background 0.18s; }
.clientes-table tbody tr:hover { background: rgba(80,180,255,0.10); }

.empty-row { text-align: center !important; color: #fff; font-style: italic; }

/* Coluna nome */
.col-nome .nome-flex { display: flex; align-items: center; gap: 10px; }
.col-nome .nome-flex span { color: #fff !important; font-size: 0.98rem !important; font-weight: 500 !important; }

/* Avatar */
.estudante-foto-tabela {
  width: 34px; height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3bc7ff;
  transition: transform .13s;
  background: #193255;
}
.estudante-foto-tabela:hover { transform: scale(1.10); }

/* Ações */
.center { text-align: center; }
.acoes-th { text-align: center !important; min-width: 120px; }
.clientes-table tbody td:last-child { text-align: center !important; }
.edit-btn, .del-btn {
  background: none; border: none; border-radius: 6px;
  color: #3bc7ff; font-weight: 600; cursor: pointer;
  margin-right: 8px; font-size: 1.01rem; transition: all .18s;
  padding: 2px 7px;
}
.edit-btn:hover { color: #3bffc1; background: #12344a40; }
.del-btn { color: #ff6c75; }
.del-btn:hover { color: #ff3939; background: #43232823; }
</style>
