<!-- ConfirmarLogoutModal.vue -->
<template>
  <!--
    =====================================================================
    🔒 ConfirmarLogoutModal — Confirmação de saída (logout do sistema)
    =====================================================================
    🎯 Objetivo
      - Exibir um diálogo modal para confirmar se o usuário realmente deseja sair.
      - Fornece duas ações: "Sair" (confirma logout) e "Cancelar" (fecha sem sair).
      - Totalmente controlado pelo pai (prop `show` + eventos `confirmar` / `cancelar`).

    🧭 Estrutura
      - <transition name="modal">: animação de entrada/saída (definida globalmente).
      - .modal-bg (overlay): fecha no ESC, mas ignora clique dentro do card.
      - .modal-card: título, mensagem e botões de ação.

    ♿ Acessibilidade
      - role="dialog" + aria-modal="true"
      - aria-labelledby e aria-describedby (IDs estáticos).
      - Foco inicial no botão "Sair" ao abrir (watch + nextTick).
      - Fecha com tecla ESC (listener no @keydown.esc).
  -->
  <transition name="modal">
    <div
      v-if="show"
      class="modal-bg"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
      tabindex="-1"
      @keydown.esc.stop.prevent="onCancelar"
    >
      <div class="modal-card" @click.stop>
        <!-- 🏷️ Título -->
        <h3 :id="titleId" class="modal-title">Sair da Conta</h3>

        <!-- 💬 Texto explicativo -->
        <p :id="descId" class="modal-text">
          Tem certeza que deseja sair da conta?
        </p>

        <!-- 🔘 Botões -->
        <div class="modal-btns">
          <button
            ref="btnSair"
            type="button"
            class="sair-btn"
            @click="onConfirmar"
          >
            Sair
          </button>
          <button
            type="button"
            class="cancelar-btn"
            @click="onCancelar"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
/*
  ============================================================================
  🧠 Lógica do ConfirmarLogoutModal
  ============================================================================
  - show: controla visibilidade.
  - Eventos:
      • confirmar -> usuário confirma logout (pai executa lógica real).
      • cancelar   -> fecha o modal sem sair.
  - Foco inicial: botão "Sair" recebe foco automático ao abrir.
*/
import { ref, watch, nextTick } from 'vue'

/* --------------------------------------------------------------------------
   📥 Props
-------------------------------------------------------------------------- */
const props = defineProps({
  show: { type: Boolean, default: false }
})

/* --------------------------------------------------------------------------
   📤 Eventos emitidos
-------------------------------------------------------------------------- */
const emit = defineEmits(['confirmar', 'cancelar'])

/* --------------------------------------------------------------------------
   🔎 Refs e IDs
-------------------------------------------------------------------------- */
const btnSair = ref(null)
const titleId = 'confirmar-logout-title'
const descId  = 'confirmar-logout-desc'

/* --------------------------------------------------------------------------
   👀 Watchers
   - Foca no botão "Sair" quando o modal abre.
-------------------------------------------------------------------------- */
watch(() => props.show, async (isVisible) => {
  if (isVisible) {
    await nextTick()
    btnSair.value?.focus()
  }
})

/* --------------------------------------------------------------------------
   🔘 Métodos
-------------------------------------------------------------------------- */
function onConfirmar(){ emit('confirmar') }
function onCancelar(){ emit('cancelar') }
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilos
   ========================================================================== */

/* Fundo escurecido */
.modal-bg{
  position: fixed; inset: 0;
  background: rgba(23, 40, 64, 0.74);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}

/* Card principal */
.modal-card{
  background: #183765;
  border-radius: 15px;
  width: min(430px, 90%);
  padding: 2.1rem 1.5rem 1.7rem;
  box-shadow: 0 12px 50px #16213a42;
  text-align: center;
  animation: modal-pop .3s cubic-bezier(.25,.46,.45,.94);
}
@keyframes modal-pop {
  from { transform: scale(.9); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

/* Texto */
.modal-title{
  color:#3bc7ff; font-weight:700; font-size:1.16rem;
  margin-bottom: 17px;
}
.modal-text{
  color:#fff; font-size:1.05rem;
  margin-bottom:18px;
}

/* Botões */
.modal-btns{
  display:flex; gap:12px; justify-content:center;
  margin-top:6px;
}
.sair-btn, .cancelar-btn{
  padding:.62rem 1.09rem; border-radius:7px; border:none;
  font-size:1.01rem; font-weight:600; cursor:pointer;
  transition: background .17s, color .17s;
}

/* Botão Sair */
.sair-btn{
  background:#ff5b5b; color:#fff;
}
.sair-btn:hover{ background:#e04a4a; }

/* Botão Cancelar */
.cancelar-btn{
  background:#223a5c; color:#d3f5ff;
}
.cancelar-btn:hover{
  background:#335e97; color:#fff;
}
</style>
