<!--
  ===========================================================
  CustomSelect.vue
  ===========================================================
  🎯 Responsabilidade
    - Select personalizado para substituir o <select> nativo.
    - Controlado externamente via v-model (prop `modelValue`).
    - Exibe dropdown com lista rolável e estilos customizados.

  📦 Como funciona
    - Props:
        • modelValue: id do item selecionado.
        • options: lista de objetos { id, nome } a exibir.
        • placeholder: label quando nada está selecionado.
        • maxVisible: quantos itens visíveis antes de aparecer a rolagem.
    - Estados:
        • open: controla abrir/fechar do dropdown.
        • selectedLabel (computed): resolve o nome do item selecionado.
    - Interações:
        • Clique no “fake input” alterna (toggle) o dropdown.
        • Clique num item emite `update:modelValue` + `change` e fecha.
        • Fecha ao clicar fora (captura global) ou pressionar ESC.
    - A11Y:
        • Usa roles ARIA (listbox/option) e aria-selected nos itens.
-->

<template>
  <div class="cs-wrap" ref="wrap">
    <!--
      🧾 Campo "fake input"
      - Visual de input, mas é um <button> para acessibilidade de clique/teclado.
      - aria-haspopup="listbox" indica que abre uma lista.
      - :aria-expanded reflete o estado do dropdown.
    -->
    <button
      type="button"
      class="cs-input"
      :class="{ open }"
      @click="toggle"
      aria-haspopup="listbox"
      :aria-expanded="open.toString()"
    >
      <span>{{ selectedLabel || placeholder }}</span>
    </button>

    <!--
      ⬇️ Dropdown
      - Montado/desmontado com v-if (só existe quando open = true).
      - role="listbox" para leitores de tela.
      - O cabeçalho reflete o placeholder.
    -->
    <transition name="cs-pop">
      <div
        v-if="open"
        class="cs-dropdown"
        role="listbox"
      >
        <!-- Cabeçalho do dropdown (contexto do seletor) -->
        <div class="cs-header">{{ placeholder }}</div>

        <!--
          Lista com rolagem
          - maxHeight calculado a partir de `maxVisible` (aprox. 42px por item).
          - Cada li é uma "option" com aria-selected coerente ao valor atual.
        -->
        <ul
          class="cs-list"
          ref="listEl"
          :style="{ maxHeight: `calc(${props.maxVisible} * 42px)` }"
        >
          <li
            v-for="opt in options"
            :key="opt.id"
            class="cs-item"
            :class="{ active: opt.id === modelValue }"
            role="option"
            :aria-selected="(opt.id === modelValue).toString()"
            @click="pick(opt)"
          >
            {{ opt.nome }}
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
/* ===========================================================
   Imports
   =========================================================== */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/* ===========================================================
   Props recebidas do pai
   - `options` valida que todos os itens possuem { id, nome }
   =========================================================== */
const props = defineProps({
  modelValue: [String, Number],
  options: {
    type: Array,
    default: () => [],
    validator: (arr) => arr.every(o => 'id' in o && 'nome' in o) // garante { id, nome }
  },
  placeholder: { type: String, default: 'Selecione Ano e Turma' },
  maxVisible: { type: Number, default: 3 } // itens visíveis antes do scroll
})

/* ===========================================================
   Eventos emitidos para o pai
   - update:modelValue: sincroniza o v-model
   - change: notifica mudança de valor
   - close: notifica fechamento do dropdown
   =========================================================== */
const emit = defineEmits(['update:modelValue', 'change', 'close'])

/* ===========================================================
   Estados reativos
   =========================================================== */
const open = ref(false)   // dropdown aberto/fechado
const wrap = ref(null)    // referência do wrapper para click-outside
const listEl = ref(null)  // referência da lista (se precisar evoluir foco/teclas)

/* ===========================================================
   Computed: texto do item selecionado
   - Busca em options o item cujo id === modelValue
   =========================================================== */
const selectedLabel = computed(() => {
  const found = props.options.find(o => o.id === props.modelValue)
  return found?.nome || ''
})

/* ===========================================================
   Métodos
   =========================================================== */
/** Alterna o dropdown (abre/fecha) */
function toggle () {
  open.value ? close() : open.value = true
}

/** Fecha o dropdown e emite evento `close` */
function close () {
  if (!open.value) return
  open.value = false
  emit('close')
}

/** Seleciona um item e emite os devidos eventos */
function pick (opt) {
  emit('update:modelValue', opt.id)
  emit('change', opt.id)
  close()
}

/* ===========================================================
   Fechar ao clicar fora (captura true para priorizar antes de outros handlers)
   =========================================================== */
function onClickOutside(e) {
  if (!wrap.value) return
  if (!wrap.value.contains(e.target)) close()
}

/* ===========================================================
   Fechar ao pressionar ESC
   =========================================================== */
function onEsc(e) {
  if (e.key === 'Escape') close()
}

/* ===========================================================
   Ciclo de vida: registra e remove listeners globais
   =========================================================== */
onMounted(() => {
  document.addEventListener('click', onClickOutside, true)
  document.addEventListener('keydown', onEsc)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside, true)
  document.removeEventListener('keydown', onEsc)
})
</script>

<style scoped>
/* ===========================================================
   WRAPPER
   =========================================================== */
.cs-wrap {
  position: relative;
  width: 100%;
}

/* ===========================================================
   INPUT FAKE (botão principal)
   =========================================================== */
.cs-input {
  width: 100%;
  padding: .66rem .95rem;
  border-radius: 8px;
  border: 1.2px solid #3b5998;
  background: #25447b;
  color: #fff;
  font-size: .97rem;
  text-align: left;
  outline: none;
  transition: border .19s, background .19s, box-shadow .18s;
}
.cs-input:hover,
.cs-input.open {
  border-color: #3bc7ff;
  background: #295291;
  box-shadow: 0 0 0 3px rgba(60,193,255,.18);
}

/* ===========================================================
   DROPDOWN
   =========================================================== */
.cs-dropdown {
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  width: 100%;
  z-index: 1000;
  background: #213f70;
  border: 1px solid #385a93;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0,0,0,.28);
  overflow: hidden;
}

/* Cabeçalho */
.cs-header {
  padding: .55rem .9rem;
  font-weight: 700;
  color: #ffffff;
  background: #233e6b;
}

/* ===========================================================
   LISTA COM ROLAGEM
   =========================================================== */
.cs-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Barra de rolagem customizada */
.cs-list::-webkit-scrollbar { width: 8px; }
.cs-list::-webkit-scrollbar-thumb {
  background: #3b5ea1;
  border-radius: 8px;
}
.cs-list::-webkit-scrollbar-track { background: transparent; }

/* ===========================================================
   ITENS
   =========================================================== */
.cs-item {
  padding: .7rem .9rem;
  color: #e8f1ff;
  cursor: pointer;
  user-select: none;
}
.cs-item:hover { background: #2a55a0; }
.cs-item.active { background: #2a4f8e; }

/* ===========================================================
   ANIMAÇÃO ABRIR/FECHAR
   =========================================================== */
.cs-pop-enter-from,
.cs-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(.98);
}
.cs-pop-enter-active,
.cs-pop-leave-active {
  transition: all .14s ease-out;
}
</style>
