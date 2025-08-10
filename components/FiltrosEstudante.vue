<!--
  FiltrosEstudante.vue (rev Lume)
  ------------------------------------------------------------
  - Mantém seu layout e comportamento.
  - Marca o alvo do tutorial no botão + Novo Ano/Turma (data-tutorial="btn-ano").
  - Acessibilidade: aria-* + fechamento por ESC no dropdown e no modal de confirmação.
  - Botões com type="button" para evitar submits acidentais.
-->

<template>
  <!-- Contêiner dos filtros (mantém seu layout original) -->
  <div class="filtros-flex">
    <!-- Título da seção -->
    <h2>Estudantes</h2>

    <!-- Linha com rótulo + seletor de Ano/Turma + botão de criar -->
    <div class="ano-turma-box">
      <span class="filtro-label">Ano/Turma:</span>

      <!-- Wrapper do dropdown (necessário pro posicionamento absoluto da lista) -->
      <div class="dropdown-wrap">
        <!-- Botão principal do dropdown -->
        <button
          class="ano-btn"
          type="button"
          @click.stop="emitToggleDropdown"
          :aria-expanded="props.dropdownAberto"
          aria-haspopup="listbox"
          :aria-controls="dropdownId"
        >
          {{ props.selecionado?.nome || 'Todos' }}
        </button>

        <!-- Lista (dropdown) com as opções -->
        <div
          v-if="props.dropdownAberto"
          class="dropdown-ano"
          @mousedown.stop
          :id="dropdownId"
          role="listbox"
          @keydown.esc.stop.prevent="emitToggleDropdown"
          tabindex="-1"
        >
          <!-- Opção "Todos" -->
          <div
            class="dropdown-item"
            @click="emitSelecionar({id: null, nome: 'Todos'})"
            :class="{'selected-todos': !props.selecionado || props.selecionado.id === null}"
            role="option"
            :aria-selected="!props.selecionado || props.selecionado.id === null"
          >
            Todos
          </div>

          <!-- Opções vindas de anoTurmaList -->
          <div
            v-for="at in props.anoTurmaList"
            :key="at.id"
            class="dropdown-item ano-item"
            :class="{ 'selected-todos': props.selecionado && props.selecionado.id === at.id }"
            role="option"
            :aria-selected="props.selecionado && props.selecionado.id === at.id"
          >
            <!-- Nome (clicável) da opção -->
            <span
              @click="emitSelecionar(at)"
              class="nome-ano-turma"
            >
              {{ at.nome }}
            </span>

            <!-- Botão para pedir confirmação de remoção -->
            <button
              class="btn-remove-ano"
              type="button"
              @click.stop="abrirModalRemover(at)"
              title="Remover Ano/Turma"
              tabindex="-1"
              aria-label="Remover este Ano/Turma"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Botão para abrir o modal de adicionar novo Ano/Turma -->
      <!-- IMPORTANTE PARA O TUTORIAL: data-tutorial="btn-ano" -->
      <button
        id="btnNovoAno"
        data-tutorial="btn-ano"
        class="mini-btn"
        type="button"
        @click.stop="emitAbrirModalAnoTurma"
        aria-label="Adicionar novo Ano/Turma"
      >
        + Novo Ano/Turma
      </button>
    </div>
  </div>

  <!-- ================== MODAL DE CONFIRMAÇÃO ================== -->
  <transition name="modal">
    <div
      v-if="showConfirmModal"
      class="modal-bg"
      @click.self="fecharModalConfirmacao"
      @keydown.esc.stop.prevent="fecharModalConfirmacao"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-remover-ano-turma"
    >
      <div class="modal-card modal-card-confirm">
        <h3 class="modal-title" id="titulo-remover-ano-turma">Remover Ano/Turma?</h3>

        <div class="modal-msg">
          Tem certeza que deseja remover<br>
          <span class="ano-nome-modal">"{{ anoTurmaParaRemover?.nome }}"</span>?
        </div>

        <div class="alerta-exclusao">
          Todos os estudantes desse ano/turma também serão excluídos!
        </div>

        <div class="modal-btns">
          <button class="btn-excluir" type="button" @click="confirmarRemocaoAnoTurma">Excluir</button>
          <button class="btn-cancelar" type="button" @click="fecharModalConfirmacao">Cancelar</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const { $api } = useNuxtApp()

import { ref } from 'vue'

/* -------------------- PROPS -------------------- */
const props = defineProps({
  anoTurmaList: Array,   // lista para popular o dropdown
  selecionado: Object,   // { id, nome } ou null => "Todos"
  dropdownAberto: Boolean, // visibilidade do dropdown (estado é do pai)
})

/* -------------------- EMITS -------------------- */
const emit = defineEmits([
  'toggle-dropdown',       // abre/fecha dropdown
  'selecionar',            // seleciona um Ano/Turma
  'abrir-modal-ano-turma', // abre modal para criar novo Ano/Turma
  'remover-ano-turma',     // confirma remoção (pai executa)
])

/* ----------------- HANDLERS/HELPERS ----------------- */
function emitToggleDropdown() { emit('toggle-dropdown') }
function emitSelecionar(at)   { emit('selecionar', at) }
function emitAbrirModalAnoTurma() { emit('abrir-modal-ano-turma') }

/* -------------- ESTADO: MODAL DE REMOÇÃO -------------- */
const showConfirmModal = ref(false)
const anoTurmaParaRemover = ref(null)

function abrirModalRemover(ano) {
  anoTurmaParaRemover.value = ano
  showConfirmModal.value = true
}
function fecharModalConfirmacao() {
  showConfirmModal.value = false
  anoTurmaParaRemover.value = null
}
function confirmarRemocaoAnoTurma() {
  emit('remover-ano-turma', anoTurmaParaRemover.value)
  showConfirmModal.value = false
  anoTurmaParaRemover.value = null
}

/* ----------------- ACESSIBILIDADE EXTRA ----------------- */
const dropdownId = `dropdown-ano-turma` // usado em aria-controls
</script>

<style scoped>
/* Mantivemos **todo** o seu CSS, apenas com comentários e sem alterar estilos */

.filtros-flex h2 { color: #fff !important; }

/* Layout geral dos filtros */
.filtros-flex { display: flex; align-items: center; gap: 27px; flex-wrap: wrap; }
.ano-turma-box { display: flex; align-items: center; gap: 14px; }

/* Rótulo do seletor */
.filtro-label { color: #fff; font-weight: 600; font-size: 1.01rem; margin-right: 5px; }

/* Botão principal do dropdown (mostra seleção atual) */
.ano-btn {
  background: #25447b; color: #caf3ff;
  border-radius: 7px; border: 1.2px solid #3bc7ff;
  padding: 7px 19px; cursor: pointer; font-weight: 600;
}
.ano-btn:hover { background: #3bc7ff; color: #183765; }

/* Wrapper do dropdown para posicionamento */
.dropdown-wrap { position: relative; }

/* Lista de opções (dropdown) */
.dropdown-ano {
  position: absolute; top: 41px; left: 0;
  background: #183765; border-radius: 10px;
  box-shadow: 0 2px 16px #0005; min-width: 180px;
  z-index: 40; padding: 4px 0;
}

/* Item do dropdown */
.dropdown-item {
  width: 100%; box-sizing: border-box;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px; color: #caf3ff; cursor: pointer;
  border: none; background: transparent;
  transition: background .14s, color .14s; gap: 10px;
}

/* Estados/efeitos no item */
.ano-item:hover, .dropdown-item.selected-todos { background: #25447b; }

/* Texto do nome (clicável) */
.nome-ano-turma { flex: 1; text-align: left; font-size: 1rem; cursor: pointer; }

/* Botão "X" de remover (ao lado do nome) */
.btn-remove-ano {
  background: transparent; border: none; color: #ff7c98;
  font-size: 1.7rem; font-weight: bold; cursor: pointer;
  transition: color 0.14s; margin-left: 26px; margin-right: -2px;
  line-height: 1; padding: 0 3px; outline: none;
  display: flex; align-items: center; justify-content: center;
}
.btn-remove-ano:hover { color: #ff2b5b; background: transparent; }

/* Destaque do item selecionado/"Todos" */
.selected-todos { background: #25447b; color: #4dffa8 !important; font-weight: bold; }

/* Botão pequeno "+ Novo Ano/Turma" (com data-tutorial) */
.mini-btn {
  background: #243e69; color: #2db6ff;
  border-radius: 7px; border: none; padding: 6px 14px;
  font-size: 0.97rem; margin-left: 10px; font-weight: 500;
  cursor: pointer; transition: background .16s;
}
.mini-btn:hover { background: #2db6ff; color: #fff; }

/* ==================== MODAL DE CONFIRMAÇÃO ==================== */
.modal-bg {
  position: fixed; top: 0; left: 0; right:0; bottom:0;
  width: 100vw; height: 100vh; background: rgba(23,40,64,0.74);
  display: flex; align-items: center; justify-content: center; z-index: 2222;
}
.modal-card-confirm {
  margin: 0 auto; background: #24366b; border-radius: 18px;
  min-width: 330px; max-width: 97vw;
  box-shadow: 0 12px 50px #18244a68; text-align: center;
  padding: 2.3rem 2.2rem 2.0rem 2.2rem;
  animation: modal-pop .26s cubic-bezier(.24,.7,.41,.99);
}
.modal-title {
  color: #ff4f7d; font-size: 1.38rem; font-weight: 800;
  margin-bottom: 13px; letter-spacing: 0.5px;
}
.modal-msg { color: #e1f0ff; font-size: 1.09rem; font-weight: 500; margin-bottom: 0.18em; }
.ano-nome-modal { color: #38b5ff; font-weight: bold; font-size: 1.13rem; }
.alerta-exclusao { color: #fff3f6; font-size: 1.05rem; margin: 13px 0 17px 0; font-weight: 600; }
.modal-btns { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
.btn-excluir {
  background: #f55b68; color: #fff; border: none; border-radius: 8px;
  padding: 12px 28px; font-weight: bold; font-size: 1.09rem;
  box-shadow: 0 2px 8px #9e206040; cursor: pointer; transition: background .13s, box-shadow .15s, transform .13s;
}
.btn-excluir:hover { background: #ff7b93; box-shadow: 0 5px 20px #ff3e6c31; transform: scale(1.04); }
.btn-cancelar {
  background: #223e5a; color: #b8e4ff; border: none; border-radius: 8px;
  padding: 12px 28px; font-size: 1.09rem; font-weight: 600; cursor: pointer; transition: background .15s, color .14s;
  box-shadow: 0 1px 8px #223a4b27;
}
.btn-cancelar:hover { background: #2b4579; color: #fff; }

@keyframes modal-pop {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
