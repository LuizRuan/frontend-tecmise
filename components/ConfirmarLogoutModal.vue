<!--
  ConfirmarLogoutModal.vue

  Modal de confirmação para logout do usuário.
  Evita saídas acidentais e reforça a segurança da experiência do usuário.

  ----------------------------------------
  RESPONSABILIDADES:
    - Exibir um modal de confirmação antes de realizar logout.
    - Bloquear interação com o fundo (overlay escurecido).
    - Destacar o botão "Sair" (ação crítica/destrutiva).
    - Botão de "Cancelar" para fechar o modal sem sair.

  ----------------------------------------
  PROPS:
    - show (Boolean): controla exibição do modal.

  ----------------------------------------
  EVENTS:
    - confirmar: emitido ao confirmar o logout (componente pai faz o logout).
    - cancelar: emitido ao cancelar/fechar o modal.

  ----------------------------------------
  ACESSIBILIDADE/UX:
    - role="dialog", aria-modal, aria-label, tabindex: melhora navegação de leitores de tela.
    - Botões bem identificados.
    - Animação de transição visual, modal centralizado.

  ----------------------------------------
  MANUTENÇÃO/EXPANSÃO:
    - CSS scoped e padronizado.
    - Estrutura simples, fácil de expandir (ex: inserir mensagem customizável).
    - Pronto para reutilização em outros contextos de confirmação/desconexão.

  Projeto: TecMise - Gestão Escolar
-->

<template>
  <transition name="modal">
    <!-- Overlay escurecido, modal centralizado -->
    <div
      v-if="show"
      class="modal-bg"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Modal de confirmação de logout"
    >
      <div class="modal-card">
        <h3 class="modal-title">Sair da Conta</h3>
        <p class="modal-text">
          Tem certeza que deseja sair da conta?
        </p>
        <div class="modal-btns">
          <button @click="onConfirmar" class="sair-btn">Sair</button>
          <button type="button" @click="onCancelar" class="cancelar-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const { $api } = useNuxtApp()

// --- Props ---
// - show: controla exibição do modal de logout
const props = defineProps({
  show: Boolean
})

// --- Events ---
// - confirmar: dispara ação de logout
// - cancelar: fecha/cancela o modal
const emit = defineEmits(['confirmar', 'cancelar'])

/**
 * Dispara evento para o pai confirmar logout.
 * O componente pai deve executar a ação de logout.
 */
function onConfirmar() {
  emit('confirmar')
}

/**
 * Dispara evento para o pai cancelar (fecha o modal).
 */
function onCancelar() {
  emit('cancelar')
}
</script>

<style scoped>
/* Overlay escurecido centralizado */
.modal-bg {
  position: fixed; top:0; left:0; width:100vw; height:100vh;
  background: rgba(23,40,64,0.74);
  display: flex; align-items: center; justify-content: center;
  z-index: 99;
}
/* Card centralizado */
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
/* Animação suave de entrada */
@keyframes modal-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
/* Título do modal */
.modal-title {
  color: #3bc7ff;
  font-weight: 700;
  font-size: 1.16rem;
  margin-bottom: 17px;
}
/* Texto explicativo */
.modal-text {
  color: #fff;
  margin-bottom: 18px;
  font-size: 1.05rem;
}
/* Área dos botões */
.modal-btns {
  display: flex; gap: 12px;
  justify-content: center; margin-top: 6px;
}
/* Botão "Sair" em vermelho */
.sair-btn {
  padding: 0.62rem 1.09rem; border-radius: 7px; border: none;
  font-size: 1.01rem; font-weight: 600; cursor: pointer;
  background: #ff5b5b;
  color: #fff; transition: background .17s;
}
.sair-btn:hover { background: #e04a4a; }
/* Botão "Cancelar" com cor diferenciada */
.cancelar-btn {
  padding: 0.62rem 1.09rem; border-radius: 7px; border: none;
  background: #223a5c; color: #d3f5ff; font-size: 1.01rem; font-weight: 600;
  cursor: pointer; transition: background .17s;
}
.cancelar-btn:hover { background: #335e97; color: #fff; }
</style>
