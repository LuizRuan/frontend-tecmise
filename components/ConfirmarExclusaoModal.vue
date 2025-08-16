<!-- ConfirmarExclusaoModal.vue -->
<template>
  <!--
    =====================================================================
    🗑️ ConfirmarExclusaoModal — Confirmação de remoção (Aluno ou Ano/Turma)
    =====================================================================
    🎯 Objetivo
      - Exibir um diálogo modal de confirmação antes de executar ações destrutivas.
      - Suporta dois contextos:
          • tipo === 'aluno'      -> Mensagem específica para aluno.
          • qualquer outro valor  -> Uso genérico (ex.: Ano/Turma).
      - Compatível com API antiga via prop `estudante` ({ nome }).

    🧭 Estrutura
      - <transition name="modal">: animação (entrada/saída controlada globalmente).
      - .modal-bg (overlay): fecha no clique fora do card (@click.self="onCancelar").
      - .modal-card: título, mensagem(s), e botões de ação (Excluir / Cancelar).

    ♿ Acessibilidade (A11Y)
      - role="dialog" + aria-modal="true"
      - :aria-labelledby + :aria-describedby: rótulos e descrição do conteúdo.
      - Foco inicial no botão "Excluir" ao abrir (watchEffect + nextTick).
      - Fecha com tecla ESC (event listener no document).
  -->
  <transition name="modal">
    <div
      v-if="show"
      class="modal-bg"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
      @click.self="onCancelar"
    >
      <div class="modal-card" @click.stop>
        <!-- 🏷️ Título do modal (customizável via prop `titulo`) -->
        <h3 :id="titleId" class="modal-title">{{ titulo || 'Confirmar exclusão' }}</h3>

        <!-- 💬 Mensagem principal (varia conforme `tipoFinal`) -->
        <p class="msg">
          <template v-if="tipoFinal === 'aluno'">
            Tem certeza que deseja remover o aluno
            <strong v-if="nomeFinal" class="alvo">“{{ nomeFinal }}”</strong>?
          </template>
          <template v-else>
            Tem certeza de que deseja remover
            <strong v-if="nomeFinal" class="alvo">“{{ nomeFinal }}”</strong>?
          </template>
        </p>

        <!-- ℹ️ Linha 2 (apenas quando NÃO for aluno) -->
        <p v-if="mostrarLinha2" :id="descId" class="sub">
          {{ linha2Text }}
        </p>

        <!-- 🔘 Ações -->
        <div class="modal-btns">
          <!-- Foco inicial aqui ao abrir -->
          <button ref="btnExcluir" type="button" class="btn btn-danger-like-cancel" @click="onConfirmar">
            Excluir
          </button>
          <button type="button" class="btn btn-primary-like-save" @click="onCancelar">
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
  🧠 Lógica do componente (Vue 3 + <script setup>)
  ============================================================================
  - Compatível com a API antiga (prop `estudante`) e nova (`nomeAlvo`, `tipo`).
  - Foco gerenciado para acessibilidade (botão Excluir recebe foco ao abrir).
  - Fecha no ESC (listener global adicionado/removido no mount/unmount).
*/
import { ref, onMounted, onBeforeUnmount, nextTick, watchEffect, computed } from 'vue'

/* --------------------------------------------------------------------------
   📥 Props (novas + compat)
   - show: controla visibilidade.
   - nomeAlvo: nome textual do alvo da exclusão (nova API).
   - tipo: 'aluno' | (qualquer outro) -> muda a mensagem principal e a linha 2.
   - titulo: título do modal (opcional).
   - descricao: texto para a segunda linha (opcional; só aparece se tipo !== 'aluno').

   ✅ Compat com API antiga:
   - estudante: objeto com ao menos { nome }, usado como fallback.
-------------------------------------------------------------------------- */
const props = defineProps({
  show: { type: Boolean, default: false },
  nomeAlvo: { type: String, default: '' },    // nova API
  tipo: { type: String, default: '' },        // 'aluno' | genérico (ex.: 'ano')
  titulo: { type: String, default: '' },
  descricao: { type: String, default: '' },   // sobrescreve a linha 2 quando presente

  // ✅ compat com versão anterior
  estudante: { type: Object, default: null }  // { nome, ... }
})

/* 📤 Eventos emitidos para o pai */
const emit = defineEmits(['confirmar', 'cancelar'])

/* 🔖 IDs estáticos para A11Y (rótulo e descrição do diálogo) */
const titleId = 'confirmar-exclusao-title'
const descId  = 'confirmar-exclusao-desc'

/* 🔎 Refs locais */
const btnExcluir = ref(null)

/* --------------------------------------------------------------------------
   🧩 Derivações (computed)
   - nomeFinal: decide o nome a mostrar (prioriza `nomeAlvo`, cai para `estudante.nome`).
   - tipoFinal: decide o tipo (prioriza `tipo`, cai para 'aluno' se vier `estudante`).
   - mostrarLinha2: só exibe linha 2 se não for caso de 'aluno'.
   - linha2Text: conteúdo da linha 2 (prop `descricao` ou padrão).
-------------------------------------------------------------------------- */
const nomeFinal = computed(() =>
  props.nomeAlvo || props.estudante?.nome || ''
)
const tipoFinal = computed(() =>
  props.tipo || (props.estudante ? 'aluno' : '')
)
const mostrarLinha2 = computed(() => tipoFinal.value !== 'aluno')
const linha2Text = computed(() => props.descricao || 'Todos os alunos serão apagados automaticamente.')

/* --------------------------------------------------------------------------
   🎯 Foco inicial: quando `show` vira true, dá foco no botão "Excluir"
-------------------------------------------------------------------------- */
watchEffect(async () => {
  if (props.show) {
    await nextTick()
    btnExcluir.value?.focus()
  }
})

/* --------------------------------------------------------------------------
   🔘 Handlers
   - onConfirmar: emite 'confirmar'
   - onCancelar: emite 'cancelar'
   - onEsc: fecha no pressionar da tecla Escape quando o modal está aberto
-------------------------------------------------------------------------- */
function onConfirmar(){ emit('confirmar') }
function onCancelar(){ emit('cancelar') }
function onEsc(e){ if (e.key === 'Escape' && props.show) onCancelar() }

/* --------------------------------------------------------------------------
   🔗 Ciclo de vida: adiciona/remove listener para ESC
-------------------------------------------------------------------------- */
onMounted(() => document.addEventListener('keydown', onEsc))
onBeforeUnmount(() => document.removeEventListener('keydown', onEsc))
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilos (mantidos exatamente como no original)
   ========================================================================== */
.modal-bg{
  position: fixed; inset: 0;
  background: rgba(23, 40, 64, 0.74);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.modal-card, .modal-card * { font-family: var(--app-font, 'Montserrat'), Arial, sans-serif; }
.modal-card{
  background: #183765;
  border-radius: 15px;
  width: 90%; max-width: 540px;
  box-shadow: 0 12px 50px #16213a42;
  text-align: center;
  padding: 2rem 1.6rem 1.4rem;
  animation: modal-pop .28s cubic-bezier(.25,.46,.45,.94);
}
@keyframes modal-pop { from { transform: scale(.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-title{ color:#3bc7ff; font-weight:700; font-size:1.18rem; margin-bottom:.7rem; }
.msg{ color:#fff; font-weight:700; font-size:1.02rem; margin:.2rem 0 .2rem; }
.alvo{ color:#fff; font-weight:900; }
.sub{ color:#e6f2ff; opacity:.95; font-weight:600; font-size:.98rem; margin:0 0 1.1rem; }

.modal-btns{ display:flex; gap:12px; justify-content:center; }
.btn{
  padding:.62rem 1.09rem; border-radius:7px; border:none;
  font-size:1.01rem; font-weight:600; cursor:pointer; color:#fff;
  transition: transform .17s, filter .17s, background .17s, color .17s;
}

/* Excluir = mesmo visual do “cancelar” escuro/vermelho */
.btn-danger-like-cancel{ background:#2b334b; color:#f64f61; }
.btn-danger-like-cancel:hover{ background:#ff5b5b; color:#fff; transform:scale(1.02); }

/* Cancelar = azul gradiente (salvar) */
.btn-primary-like-save{
  background: linear-gradient(90deg, #32e0ff 30%, #2956a6 100%);
  box-shadow: 0 1px 8px #22437740;
}
.btn-primary-like-save:hover{ transform:scale(1.03); filter:brightness(1.08); }
</style>
