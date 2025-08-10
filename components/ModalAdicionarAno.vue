<!--
  ModalAdicionarAno.vue

  🎯 **Responsabilidade**:
    - Modal dedicado para adicionar um novo "Ano" escolar.
    - Interface simples para entrada do nome do ano e confirmação/cancelamento.

  📦 **Como funciona**:
    - Modal controlado por prop `show` (aberto/fechado) — controlado pelo componente pai.
    - Campo controlado via ref reativo, sempre sincronizado com a prop `nome`.
    - Não faz nenhuma lógica de persistência, apenas emite eventos.

  📥 **Props**:
    - show: Boolean — exibe/esconde o modal.
    - nome: String  — valor inicial do input, útil para reset ou para edição futura.

  📤 **Emits**:
    - salvar(nome: String)   — usuário clicou "Salvar" e envia o nome digitado.
    - cancelar               — usuário clicou "Cancelar" ou fechou o modal.

  💡 **Princípios Sólidos**:
    - **Stateless:** Não guarda estado relevante, todo controle fica no pai.
    - **UX:** Modal fecha ao clicar fora da área central (via @click.self).
    - **Extensível:** Se quiser transformar em modal de edição de ano/turma, basta adaptar prop e label.
    - **Acessibilidade:** Layout centralizado, botão destacado, foco visual claro.

  🚩 **Atenção**:
    - Campo input sincronizado manualmente via `watch` para garantir que seja resetado sempre que reabrir.
    - Validação (ex: obrigatoriedade, formato) é responsabilidade do pai — aqui só captura e retorna valor.

  📋 **Projeto: TecMise - Gestão Escolar**
-->

<template>
  <transition name="modal">
    <div v-if="show" class="modal-bg" @click.self="onClose">
      <div class="modal-card" @click.stop>
        <h3 class="modal-title">Adicionar Novo Ano</h3>
        <input v-model="inputNome" type="text" class="input-ano" placeholder="Nome do ano (Ex: 8º ano)" @keyup.enter="emitSalvar"
/>
        <div class="modal-btns">
          <button @click="emitSalvar">Salvar</button>
          <button @click="emitCancelar" type="button">Cancelar</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
/**
 * ModalAdicionarAno.vue
 *
 * Modal controlado por props, apenas emite eventos para o pai manipular lógica.
 * Props:
 *  - show: Boolean (visibilidade)
 *  - nome: String (valor inicial do campo)
 * Emits:
 *  - salvar (String)
 *  - cancelar
 */
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  nome: String
})
const emit = defineEmits(['salvar', 'cancelar'])

const inputNome = ref(props.nome || '')

// Sincroniza campo toda vez que prop nome muda (ao reabrir/resetar)
watch(() => props.nome, (val) => {
  inputNome.value = val || ''
})

/** Emite evento salvar, enviando o valor digitado */
function emitSalvar() {
  emit('salvar', inputNome.value)
}
/** Emite evento cancelar */
function emitCancelar() {
  emit('cancelar')
}
/** Alias para fechar modal pelo fundo */
function onClose() {
  emitCancelar()
}
</script>

<style scoped>
.modal-bg {
  position: fixed; top:0; left:0; width:100vw; height:100vh;
  background: rgba(23,40,64,0.78);
  display: flex; align-items: center; justify-content: center;
  z-index: 99;
}
.modal-card {
  background: #183765;
  border-radius: 15px;
  max-width: 480px;
  min-width: 390px;
  min-height: 220px;
  box-shadow: 0 12px 50px #16213a42;
  text-align: center;
  padding: 2.2rem 2.2rem 1.6rem 2.2rem;
  animation: modal-pop 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
@keyframes modal-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.modal-title {
  color: #32e0ff;
  font-size: 1.38rem;
  font-weight: bold;
  margin-bottom: 22px;
  margin-top: 4px;
}
.input-ano {
  width: 100%;
  max-width: 300px;
  padding: 13px 16px;
  border-radius: 10px;
  border: none;
  background: #223f6c;
  color: #c6f3ff;
  font-size: 1.09rem;
  font-family: inherit;
  transition: background .15s, color .15s;
  margin-bottom: 0;
  margin-top: 0;
}
.input-ano::placeholder {
  color: #7cd6fc;
  opacity: 0.9;
}
.input-ano:focus {
  background: #3282b8;
  outline: none;
  color: #fff;
}
.modal-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 38px;
}
.modal-btns button {
  min-width: 110px;
  padding: 11px 0;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.07rem;
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
</style>
