<!--
  =====================================================================
  📄 ModalAdicionarAno.vue
  =====================================================================
  🎯 Responsabilidade:
    - Exibir um modal para adicionar um novo "Ano e Turma".
    - Possibilitar que o usuário insira o nome do ano/turma.
    - Emitir eventos de salvar ou cancelar para o componente pai.

  📦 Como funciona:
    - O modal é exibido quando a prop `show` é verdadeira.
    - O campo de input é controlado reativamente por `inputNome`.
    - Ao salvar, emite o valor digitado para o pai (`salvar`).
    - Ao cancelar, reseta o campo e emite evento `cancelar`.
    - Fecha automaticamente ao clicar fora ou pressionar "Cancelar".

  🔄 Eventos emitidos:
    - salvar (String)   → retorna o valor digitado.
    - cancelar          → notifica o fechamento sem salvar.

  ♿ Acessibilidade:
    - Usa `role="dialog"` e `aria-modal="true"`.
    - O título do modal é referenciado por `aria-labelledby`.

  🛡️ Estados importantes:
    - show (prop Boolean) → controla visibilidade do modal.
    - nome (prop String)  → valor inicial do input (opcional).
    - inputNome (ref)     → estado interno do campo de texto.

  🛠️ Melhorias:
    - Reset automático do campo ao abrir ou fechar.
    - Fechamento seguro com clique fora.
    - Uso de watch para manter compatibilidade com a prop `nome`.
-->

<template>
  <transition name="modal">
    <!-- Overlay do modal -->
    <div
      v-if="show"
      class="modal-bg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-adicionar-ano-title"
      @click.self="onClose"
    >
      <!-- Conteúdo principal -->
      <div class="modal-card" @click.stop>
        <!-- Título acessível -->
        <h3 id="modal-adicionar-ano-title" class="modal-title">
          Adicionar Novo Ano e Turma
        </h3>

        <!-- Campo de entrada -->
        <input
          v-model="inputNome"
          type="text"
          class="input-ano"
          placeholder="Ex: 8º A"
          @keyup.enter="emitSalvar"
        />

        <!-- Área de botões -->
        <div class="modal-btns">
          <button class="btn-salvar" type="button" @click="emitSalvar">
            Salvar
          </button>
          <button class="btn-cancelar" type="button" @click="emitCancelar">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
/**
 * ===========================================================
 *  Imports e Definições
 * ===========================================================
 */
import { ref, watch } from 'vue'

/* Props do componente pai */
const props = defineProps({
  show: Boolean,  // controla exibição
  nome: String    // valor inicial (opcional)
})

/* Eventos que o modal emite */
const emit = defineEmits(['salvar', 'cancelar'])

/* Estado interno do input */
const inputNome = ref(props.nome || '')

/**
 * ===========================================================
 *  Reatividade
 * ===========================================================
 */

/* Atualiza valor do input se `nome` mudar no pai */
watch(() => props.nome, v => {
  inputNome.value = v || ''
})

/* Sempre que abrir o modal, limpa o campo */
watch(() => props.show, v => {
  if (v) inputNome.value = ''
})

/**
 * ===========================================================
 *  Métodos
 * ===========================================================
 */

/** Salva valor digitado e emite para o pai */
function emitSalvar() {
  const val = (inputNome.value || '').trim()
  if (!val) return
  emit('salvar', val)
  inputNome.value = '' // limpa após salvar
}

/** Cancela, limpa o campo e notifica o pai */
function emitCancelar() {
  inputNome.value = ''
  emit('cancelar')
}

/** Fecha modal ao clicar fora */
function onClose() {
  emitCancelar()
}
</script>

<style scoped>
/* Overlay do modal */
.modal-bg {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(23, 40, 64, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Card principal */
.modal-card {
  background: #183765;
  border-radius: 15px;
  width: min(92vw, 480px);
  box-shadow: 0 12px 50px #16213a42;
  text-align: center;
  padding: 2.1rem 2rem 1.6rem;
  animation: pop 0.28s cubic-bezier(0.24, 0.7, 0.41, 0.99);
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}

/* Título */
.modal-title {
  color: #3bc7ff;
  font-weight: 700;
  font-size: 1.16rem;
  margin-bottom: 17px;
}

/* Campo de entrada */
.input-ano {
  width: 100%;
  box-sizing: border-box;
  padding: 0.57rem 1rem;
  margin-bottom: 14px;
  border-radius: 8px;
  border: 1.2px solid #3b5998;
  background: #25447b;
  color: #fff;
  font-size: 0.97rem;
  outline: none;
  transition: border 0.19s, background 0.19s, box-shadow 0.18s;
}
.input-ano::placeholder {
  color: #ffffff;
}
.input-ano:focus {
  border-color: #3bc7ff;
  background: #295291;
  box-shadow: 0 0 0 3px rgba(60, 193, 255, 0.18);
}

/* Botões */
.modal-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 6px;
}
.btn-salvar {
  padding: 0.62rem 1.09rem;
  border-radius: 7px;
  border: none;
  font-size: 1.01rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(90deg, #32e0ff 30%, #2956a6 100%);
  color: #fff;
  transition: transform 0.17s, filter 0.17s;
}
.btn-salvar:hover {
  transform: scale(1.03);
  filter: brightness(1.1);
}

.btn-cancelar {
  padding: 0.62rem 1.09rem;
  border-radius: 7px;
  border: none;
  font-size: 1.01rem;
  font-weight: 600;
  cursor: pointer;
  background: #2b334b;
  color: #f64f61;
  transition: background 0.17s, color 0.16s, transform 0.17s;
}
.btn-cancelar:hover {
  background: #ff5b5b;
  color: #fff;
  transform: scale(1.02);
}
</style>
