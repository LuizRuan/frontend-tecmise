<!--
  AmpliarFotoModal.vue

  Modal reutilizável para exibição de foto ampliada de estudante.
  Muito útil para UX: permite visualizar com mais detalhes o avatar/foto ao clicar na tabela.
  Recomendado para qualquer sistema que trabalhe com fotos de perfil em lista.

  -----
  RESPONSABILIDADES:
    - Exibir foto ampliada de um estudante, junto ao nome e (opcionalmente) o ano/turma.
    - Permitir fechar o modal ao clicar fora do card central ou no botão "Fechar".
    - Garantir foco visual (overlay escurecido, centralização, destaque para a imagem).

  -----
  PROPS:
    - show (Boolean)       : Controla a visibilidade do modal.
    - foto (String)        : URL ou base64 da imagem (exibida em destaque).
    - nome (String)        : Nome do estudante.
    - ano (String, opcional): Nome do ano/turma, exibido abaixo do nome.

  -----
  EVENTS:
    - fechar               : Emitido ao clicar no overlay (fora do card) ou no botão "Fechar".

  -----
  BOAS PRÁTICAS:
    - O modal é acessível: tem foco visual, fecha ao clicar no fundo e é centralizado.
    - CSS é scoped para evitar vazamentos.
    - Fácil extensão: pode adicionar campos ou ações extras se necessário.

  -----
  DICAS DE USO/EXTENSÃO:
    - Adicione descrição, matrícula, ou outros detalhes do estudante na área "info-ampliada" se quiser mostrar mais dados.
    - Para acessibilidade total, adicione `role="dialog"` e `aria-modal="true"` ao `.modal-bg`, e um foco automático no botão ao abrir.
    - Se quiser permitir fechar via tecla ESC, adicione um listener de keydown no mounted/unmounted.
-->

<template>
  <transition name="modal">
    <!-- Overlay de fundo escurecido; fecha ao clicar fora do card -->
    <div
      v-if="show"
      class="modal-bg"
      @click.self="fechar"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-label="Foto ampliada do estudante"
    >
      <div class="modal-ampliada-card" @click.stop>
        <!-- Foto principal -->
        <img :src="foto" class="foto-ampliada" :alt="`Foto ampliada de ${nome}`" />
        <!-- Informações (nome e ano/turma, se houver) -->
        <div class="info-ampliada">
          <strong>{{ nome }}</strong>
          <span v-if="ano" class="ano-texto">{{ ano }}</span>
        </div>
        <button class="fechar-btn" @click="fechar">Fechar</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
/**
 * Props esperadas pelo componente:
 * - show: Boolean     // visibilidade do modal
 * - foto: String      // url/base64 da imagem a ser exibida
 * - nome: String      // nome do estudante
 * - ano: String       // ano/turma (opcional)
 */
const props = defineProps({
  show: Boolean,
  foto: String,
  nome: String,
  ano: String
})

/**
 * Evento 'fechar'
 * Disparado ao clicar no fundo escuro ou no botão "Fechar"
 */
const emit = defineEmits(['fechar'])

/**
 * Função para fechar o modal, emitindo o evento apropriado.
 */
function fechar() {
  emit('fechar')
}
</script>

<style scoped>
/* Overlay escurecido, centralizando o card na tela */
.modal-bg {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(12,22,36,0.79);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}

/* Card central com padding, sombra e arredondamento */
.modal-ampliada-card {
  background: #183765;
  border-radius: 18px;
  padding: 30px 30px 25px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 280px;
  min-height: 240px;
  box-shadow: 0 15px 60px #16213a60;
  position: relative;
  animation: modal-pop 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Imagem em destaque */
.foto-ampliada {
  width: 180px;
  height: 180px;
  border-radius: 16px;
  object-fit: cover;
  background: #254277;
  margin-bottom: 19px;
  box-shadow: 0 7px 24px #10345848;
}

/* Nome do estudante e (opcional) ano/turma */
.info-ampliada {
  text-align: center;
  color: #fff;
  margin-bottom: 14px;
}
.info-ampliada strong {
  display: block;
  font-size: 1.22rem;
  font-weight: bold;
  margin-bottom: 2px;
  color: #3bc7ff;
}
.ano-texto {
  color: #39f4b6;
  font-size: 1.05rem;
  margin-top: 3px;
  display: block;
}

/* Botão para fechar o modal */
.fechar-btn {
  margin-top: 7px;
  padding: 8px 30px;
  border-radius: 8px;
  border: none;
  background: #245ca8;
  color: #fff;
  font-weight: 600;
  font-size: 1.07rem;
  cursor: pointer;
  transition: background .15s;
  box-shadow: 0 3px 15px #15213c40;
}
.fechar-btn:hover {
  background: #36c9ff;
  color: #153258;
}

/* Animação de entrada */
@keyframes modal-pop {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
