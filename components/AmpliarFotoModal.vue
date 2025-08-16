<template>
  <!--
    =====================================================================
    📄 AmpliarFotoModal.vue — Modal simples para exibir a foto do estudante
    =====================================================================
    🎯 Objetivo
      - Exibir uma imagem em destaque (ampliada) no centro da tela.
      - Mostrar informações básicas: nome (obrigatório) e ano/turma (opcional).
      - Fechar ao clicar no fundo (overlay) ou no botão "Fechar".

    🧭 Estrutura
      - <transition name="modal">: animações globais de entrada/saída (definidas no app).
      - .modal-bg: overlay de fundo (escurecido), fecha com @click.self.
      - .modal-ampliada-card: card central com a foto e metadados (nome/ano).
      - Botão "Fechar": emite evento para o pai fechar o modal.

    ♿ Acessibilidade (A11Y)
      - role="dialog" + aria-modal="true": anuncia modal para leitores de tela.
      - aria-label: rótulo descritivo do conteúdo do diálogo.
      - tabindex="-1": permite focar o container do modal, se necessário.
      - alt dinâmico na imagem: “Foto ampliada de {{ nome }}”.
      - Observação: este componente **não captura tecla ESC** por design atual
        (mantemos o comportamento original). Se quiser, podemos adicionar depois.
  -->
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
        <!-- 🖼️ Foto principal -->
        <img :src="foto" class="foto-ampliada" :alt="`Foto ampliada de ${nome}`" />

        <!-- ℹ️ Informações (nome e ano/turma, se houver) -->
        <div class="info-ampliada">
          <strong>{{ nome }}</strong>
          <span v-if="ano" class="ano-texto">{{ ano }}</span>
        </div>

        <!-- 🔘 Ação: fechar -->
        <button class="fechar-btn" @click="fechar">Fechar</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
/*
  ============================================================================
  🧠 Lógica do componente (Vue 3 + <script setup>)
  ============================================================================
  Props e eventos mínimos para um modal de visualização.
  Mantemos o comportamento atual: fechar por clique no overlay ou no botão.
*/

import { useNuxtApp } from '#app' // Mantido para compat / futuros usos (como no original)
const { $api } = useNuxtApp()     // (não utilizado aqui, mas preservado)

/**
 * 📥 Props esperadas pelo componente:
 * - show: Boolean  -> controla a visibilidade do modal
 * - foto: String   -> URL/base64 da imagem a ser exibida
 * - nome: String   -> nome do estudante (usado no alt da imagem)
 * - ano:  String   -> ano/turma (opcional)
 */
const props = defineProps({
  show: Boolean,
  foto: String,
  nome: String,
  ano: String
})

/**
 * 📤 Eventos emitidos:
 * - 'fechar': disparado ao clicar no overlay (self) ou no botão "Fechar".
 */
const emit = defineEmits(['fechar'])

/**
 * 🔐 Encapsula a emissão do evento de fechamento.
 * - Mantemos separada para facilitar logs/instrumentação futura.
 */
function fechar() {
  emit('fechar')
}
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilos com escopo (scoped)
   - Mantêm o visual atual do modal.
   ========================================================================== */

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
