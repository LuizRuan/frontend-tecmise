<!--
  ConfirmarExclusaoModal.vue

  Modal de confirmação para remoção de estudante.
  Função crítica de UX para evitar exclusões acidentais em sistemas de gestão.

  ----------------------------------------
  RESPONSABILIDADES:
    - Solicitar confirmação do usuário antes de remover um estudante do sistema.
    - Exibir o nome do estudante alvo da exclusão (feedback visual claro).
    - Oferecer opção de cancelar a ação com segurança.

  ----------------------------------------
  PROPS:
    - show (Boolean): Visibilidade do modal.
    - estudante (Object): Dados do estudante a ser removido (precisa de .nome pelo menos).

  ----------------------------------------
  EVENTS:
    - confirmar: Emitido ao clicar em "Excluir". (o pai faz a remoção de verdade)
    - cancelar: Emitido ao clicar em "Cancelar" (ou fechar).

  ----------------------------------------
  BOAS PRÁTICAS:
    - Modal centralizado, overlay escurecido, foco na ação.
    - Usa transição animada para entrada/saída.
    - Botão de exclusão destacado em vermelho (visual padrão para ações destrutivas).
    - Estrutura facilmente extensível para outros tipos de confirmação no futuro.
    - CSS scoped, evitando conflitos globais.

  ----------------------------------------
  MANUTENÇÃO/FACILIDADE:
    - Nome do estudante aparece destacado para evitar dúvidas na exclusão.
    - Código pronto para receber mais detalhes do estudante, se necessário (ex: email, turma).
    - Pode ser reaproveitado para outros tipos de entidades apenas mudando a mensagem.

  Projeto: TecMise - Gestão Escolar
-->

<template>
  <transition name="modal">
    <!-- Overlay modal, bloqueia interação com fundo -->
    <div
      v-if="show"
      class="modal-bg"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Modal de confirmação de exclusão"
    >
      <div class="modal-card">
        <h3 class="modal-title">Confirmar Exclusão</h3>
        <p style="color:#fff; margin-bottom: 18px;">
          Tem certeza que deseja excluir <strong>{{ estudante?.nome }}</strong>?
        </p>
        <div class="modal-btns">
          <button @click="onConfirmar" style="background:#ff5b5b;">Excluir</button>
          <button type="button" @click="onCancelar">Cancelar</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
/**
 * PROPS
 * - show: Boolean (exibe ou não o modal)
 * - estudante: Object (alvo da exclusão)
 */
const props = defineProps({
  show: Boolean,
  estudante: Object
})

/**
 * EVENTS
 * - confirmar: Dispara confirmação da exclusão
 * - cancelar: Dispara cancelamento (fecha modal)
 */
const emit = defineEmits(['confirmar', 'cancelar'])

/**
 * Handler para confirmar exclusão (aciona lógica do pai).
 */
function onConfirmar() {
  emit('confirmar')
}

/**
 * Handler para cancelar/excluir (apenas fecha o modal).
 */
function onCancelar() {
  emit('cancelar')
}
</script>

<style scoped>
/* Overlay de fundo, escurecido e centralizado */
.modal-bg {
  position: fixed; top:0; left:0; width:100%; height:100%;
  background: rgba(23,40,64,0.74);
  display: flex; align-items: center; justify-content: center;
  z-index: 99;
}
/* Card centralizado, com padding e sombra */
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
/* Animação de entrada suave */
@keyframes modal-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
/* Título com destaque */
.modal-title {
  color: #3bc7ff;
  font-weight: 700;
  font-size: 1.16rem;
  margin-bottom: 17px;
}
/* Área de botões */
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
/* Botão cancelar com cor diferenciada */
.modal-btns button[type="button"] { background: #223a5c; color: #d3f5ff;}
.modal-btns button[type="button"]:hover { background: #335e97; color: #fff; }
</style>
