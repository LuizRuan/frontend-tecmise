<!--
  =====================================================================
  📄 FiltrosEstudante.vue
  =====================================================================
  🎯 Responsabilidade:
    - Exibir e gerenciar um seletor (dropdown) de "Ano/Turma".
    - Permitir selecionar "Todos", escolher um item ou criar um novo.
    - Emitir eventos para o pai reagir às ações.
    - Fechar automaticamente ao clicar fora ou pressionar ESC.

  📦 Como funciona:
    - Estado `aberto` controla a visibilidade do dropdown.
    - Recebe lista de opções (`anoTurmaList`) e um item selecionado (`selecionado`).
    - Botões internos chamam funções que disparam eventos para o pai.
    - Fecha quando há clique fora ou ESC.

  🔄 Eventos emitidos:
    - selecionar (obj) — usuário escolheu um item ou "Todos".
    - abrir-modal-ano-turma — usuário quer criar novo Ano/Turma.
    - remover-ano-turma (obj) — usuário quer excluir um item.

  ♿ Acessibilidade:
    - Usa `aria-expanded` e `role="listbox"`.
    - Fechamento com tecla ESC.
    - Itens indicam seleção com `aria-selected`.

  🛠️ Melhoria nesta versão:
    - Código mais comentado.
    - Estrutura semântica e acessível.
    - Fechamento seguro ao clicar fora.
    - Evita repetição de código.
-->

<template>
  <!-- Wrapper principal do filtro -->
  <div class="filtro-wrap" ref="root" :aria-expanded="aberto">
    <!-- Botão principal que mostra o item selecionado ou "Todos" -->
    <button
      class="filtro-btn"
      type="button"
      data-tutorial="btn-ano"
      @click.stop="toggle"
    >
      {{ selecionado?.nome || 'Todos' }}
    </button>

    <!-- Dropdown com as opções -->
    <div
      v-if="aberto"
      class="dropdown"
      role="listbox"
      tabindex="-1"
      @keydown.esc.stop.prevent="fechar"
    >
      <!-- Opção para criar novo Ano/Turma -->
      <button
        class="item novo"
        type="button"
        @click="onNovo"
      >
        + Novo Ano e Turma
      </button>

      <!-- Opção para selecionar "Todos" -->
      <button
        class="item todos"
        type="button"
        :aria-selected="!selecionado || selecionado.id === null"
        @click="onSelecionar({ id: null, nome: 'Todos' })"
      >
        Todos
      </button>

      <!-- Lista de opções de anos/turmas -->
      <div class="lista">
        <div
          v-for="at in anoTurmaList"
          :key="at.id"
          class="linha"
          :class="{ ativo: selecionado?.id === at.id }"
        >
          <!-- Nome do item -->
          <button
            class="nome"
            type="button"
            @click="onSelecionar(at)"
          >
            {{ at.nome }}
          </button>
          <!-- Botão de remover item -->
          <button
            class="remover"
            type="button"
            title="Remover"
            @click.stop="emit('remover-ano-turma', at)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ===========================================================
 *  Imports e Props
 * ===========================================================
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Props recebidas do componente pai
 * - anoTurmaList → lista de opções disponíveis
 * - selecionado → objeto que representa o item atual
 */
const props = defineProps({
  anoTurmaList: { type: Array, default: () => [] },
  selecionado: { type: Object, default: () => ({ id: null, nome: 'Todos' }) }
})

/**
 * Eventos emitidos para o pai reagir
 */
const emit = defineEmits([
  'selecionar',
  'abrir-modal-ano-turma',
  'remover-ano-turma'
])

/**
 * ===========================================================
 *  Estado reativo
 * ===========================================================
 */
const aberto = ref(false) // controla abertura/fechamento do dropdown
const root = ref(null)    // referência ao wrapper principal

/**
 * ===========================================================
 *  Métodos
 * ===========================================================
 */

/** Alterna visibilidade do dropdown */
function toggle() {
  aberto.value = !aberto.value
}

/** Fecha o dropdown */
function fechar() {
  aberto.value = false
}

/** Seleciona um item e emite para o pai */
function onSelecionar(item) {
  emit('selecionar', item)
  fechar()
}

/** Ação para criar novo Ano/Turma */
function onNovo() {
  emit('abrir-modal-ano-turma')
  fechar()
}

/** Fecha ao clicar fora do componente */
function onDocClick(e) {
  if (!root.value) return
  if (!root.value.contains(e.target)) fechar()
}

/**
 * ===========================================================
 *  Ciclo de vida
 * ===========================================================
 */
onMounted(() => {
  // Escuta cliques no documento para fechar ao clicar fora
  document.addEventListener('click', onDocClick, true)
})
onBeforeUnmount(() => {
  // Remove o listener ao desmontar
  document.removeEventListener('click', onDocClick, true)
})
</script>

<style scoped>
/* ===========================================================
   Container e botão principal
   =========================================================== */
.filtro-wrap {
  position: relative;
}

.filtro-btn {
  background: linear-gradient(90deg, #33aaff 40%, #256cbb 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-weight: 800;
  font-size: 1.02rem;
  cursor: pointer;
  box-shadow: 0 1px 8px #22437740;
  transition: filter 0.16s, transform 0.12s;
}
.filtro-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* ===========================================================
   Dropdown
   =========================================================== */
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  min-width: 260px;
  max-width: 320px;
  background: #183765;
  border: 1px solid #2ca8ff55;
  border-radius: 14px;
  box-shadow: 0 18px 80px #0a2c7040, inset 0 0 0 1px #1c4c8a60;
  padding: 10px;
  z-index: 50;
}

/* ===========================================================
   Itens do dropdown
   =========================================================== */
.item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: #fff;
  font-weight: 800;
  padding: 10px 12px;
  border-radius: 10px;
}
.item:hover {
  background: #274c89;
}
.item.novo {
  color: #79e6ff;
  border-bottom: 1px solid #264b88;
  margin-bottom: 6px;
}
.item.todos {
  color: #2fff94;
}

/* ===========================================================
   Lista de opções
   =========================================================== */
.lista {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.linha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border-radius: 10px;
  padding: 6px 6px 6px 8px;
}
.linha:hover {
  background: #244879;
}
.linha.ativo {
  background: #25447b;
}

/* Botão nome (item da lista) */
.nome {
  flex: 1;
  text-align: left;
  background: transparent;
  border: 0;
  color: #fff;
  font-weight: 700;
  padding: 7px 8px;
  cursor: pointer;
}

/* Botão remover */
.remover {
  background: transparent;
  border: 0;
  color: #ff7c98;
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1;
  padding: 0 8px;
  cursor: pointer;
}
.remover:hover {
  color: #ff2b5b;
}
</style>
