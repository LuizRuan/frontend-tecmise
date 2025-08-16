<!--
  =====================================================================
  📘 TutorialOnboarding.vue — Documentação do Componente
  =====================================================================
  🎯 Propósito
    Guia interativo/onboarding que destaca áreas chave da interface por
    meio de uma bolha explicativa (“tut-bubble”) e um anel de foco sobre
    o elemento alvo (“tut-ring”). Navegação por passos com Próximo/Voltar
    e opção de “Pular”.

  🧩 Padrão de Uso (Alto Nível)
    <TutorialOnboarding
      :show="mostrarTutorial"
      :user-id="usuario.id"
      api-base="/minha-api"
      seletor-ano-turma-btn='[data-tutorial="btn-ano"]'
      seletor-buscar-btn='[data-tutorial="btn-busca"]'
      seletor-novo-aluno-btn='[data-tutorial="btn-aluno"]'
      seletor-perfil-btn='[data-tutorial="btn-perfil"]'
      @close="mostrarTutorial=false"
      @demo-lock="bloquearInteracao = $event"
      @abrir-modal-ano="abrirModalAno()"
      @abrir-modal-estudante="abrirModalEstudante()"
      @abrir-modal-perfil="abrirModalPerfil()"
      @fechar-modal-ano="fecharModalAno()"
      @fechar-modal-estudante="fecharModalEstudante()"
      @fechar-modal-perfil="fecharModalPerfil()"
    />

  🔌 Props
    - show: Boolean
        Controla a visibilidade do overlay/tutorial.
    - userId: Number
        ID do usuário para persistir que o tutorial foi visto.
    - apiBase: String
        Base da API. Usada no PUT /api/usuario/:id/tutorial para marcar “visto”.
    - seletorAnoTurmaBtn, seletorBuscarBtn, seletorNovoAlunoBtn, seletorPerfilBtn: String
        Selectors CSS dos elementos que serão destacados em cada passo “target”.
        Devem existir no DOM quando o passo estiver ativo.

  📤 Emits
    - close
        Disparado ao finalizar/fechar o tutorial (inclusive “Pular”).
    - demo-lock(Boolean)
        true → bloquear interações de fundo durante o tutorial;
        false → liberar ao finalizar/fechar.
    - abrir-modal-ano / fechar-modal-ano
    - abrir-modal-estudante / fechar-modal-estudante
    - abrir-modal-perfil / fechar-modal-perfil
        Ganchos para abrir/fechar modais do app conforme o passo.
        (Neste arquivo, o tutorial chama apenas os eventos *de fechar*
         para garantir que não haja sobreposição; abrir pode ser feito
         pelo pai quando conveniente.)

  🧠 Estado & Reatividade (interno)
    - steps: Array
        Definição dos passos (key, title, text, mode, selector?).
        mode: 'center' → bolha central (sem foco alvo);
              'target' → bolha ao lado do elemento alvo + anel de foco.
    - step: Number
        Índice do passo atual.
    - passoAtual: Computed
        Objeto do passo atual.
    - targetRect: Ref<DOMRect|null>
        Bounding box do elemento alvo atual (se houver).
    - direction: Ref<'forward'|'backward'>
        Direção da navegação (para transições animadas).
    - bubbleRef: Ref<HTMLElement|null>
        Ref para medir o tamanho da bolha e posicioná-la corretamente.

  📍 Posicionamento
    - atualizarPosicao()
        Resolve o alvo (querySelector via seletor do passo), dá scroll
        para centralizá-lo e calcula `getBoundingClientRect()` para
        posicionar a bolha (`bubbleStyle`) ao lado. Aplica/remover
        classe `tut-halo` no elemento alvo para evidência visual.
    - bubbleStyle: Computed
        Lógica de posicionamento que tenta:
          1) à direita do alvo, se couber,
          2) à esquerda,
          3) abaixo,
          4) senão, acima, com clamps em viewport.
        Fallback para centralizar quando não há targetRect.
    - focusStyle: Computed
        Estilo do anel de foco (tut-ring) com pequeno padding ao redor.

  🧭 Navegação / Fluxo
    - voltar() / avancar()
        Alteram `step` respeitando limites. No último passo,
        `avancar()` chama `finalizar()`.
    - aplicarEfeitosDoPasso()
        Fecha modais concorrentes (emit “fechar-*”), emite “demo-lock”
        para bloquear a UI, e atualiza o posicionamento após render.
    - finalizar()
        Marca tutorial como visto (PUT) se houver `userId`. Limpa halos,
        desbloqueia a UI, e emite `close`.

  ♿ Acessibilidade
    - Overlay com `role="dialog"` e `aria-modal="true"`.
    - Transições com foco visual no alvo (`tut-halo`) e anel (`tut-ring`).
    - Botões com rótulos claros e estados desabilitados adequados.

  🛡️ Considerações de Robustez
    - Se o seletor de um passo não encontrar elemento, o passo cai em modo “center”.
    - Escuta e remove listeners de `resize` e `scroll` ao abrir/fechar.
    - Evita exception com `querySelector` usando try/catch em `qs()`.

  🧪 Testes sugeridos
    - Renderizar com e sem targets presentes.
    - Navegação completa (próximo/voltar) + finalizar e pular.
    - Responsividade: largura estreita/alta, elementos perto das bordas.
    - Verificar se `demo-lock(false)` sempre dispara ao encerrar.

  🔧 Extensões
    - Adicionar novos passos no array `steps`.
    - Incluir “auto-abrir” modais específicos ao entrar em passo
      (emit 'abrir-modal-*' do pai) se desejado.
    - Persistir o índice do passo atual para retomar depois.

  =====================================================================
-->

<template>
  <!-- Overlay principal -->
  <transition name="fade">
    <div v-if="show" class="tut-overlay" @click.stop>

      <!-- Bolha de instrução -->
      <transition :name="direction === 'forward' ? 'step-next' : 'step-prev'" mode="out-in">
        <div
          :key="passoAtual.key"
          class="tut-bubble"
          :style="bubbleStyle"
          role="dialog"
          aria-modal="true"
          ref="bubbleRef"
          @click.stop
        >
          <!-- Botão de pular tutorial -->
          <button
            class="tut-skip"
            type="button"
            @click="finalizar(true)"
            aria-label="Pular tutorial"
          >
            Pular
          </button>

          <!-- Conteúdo do passo -->
          <h3 class="tut-title">{{ passoAtual.title }}</h3>
          <p class="tut-text">{{ passoAtual.text }}</p>

          <!-- Indicadores de progresso -->
          <div class="dots">
            <span
              v-for="(s,i) in steps"
              :key="s.key"
              :class="['dot',{ active: i === step }]"
            />
          </div>

          <!-- Botões de navegação -->
          <div class="tut-actions">
            <button
              class="btn ghost"
              type="button"
              :disabled="step === 0"
              v-show="step > 0"
              @click="voltar"
            >
              Voltar
            </button>
            <button
              class="btn primary"
              type="button"
              @click="avancar"
            >
              {{ step === steps.length - 1 ? 'Concluir' : 'Próximo' }}
            </button>
          </div>
        </div>
      </transition>

      <!-- Anel de destaque no alvo -->
      <div
        v-if="passoAtual.mode === 'target' && targetRect"
        class="tut-ring"
        :style="focusStyle"
        aria-hidden="true"
      />
    </div>
  </transition>
</template>

<script setup>
/* ========================
   IMPORTS & DEFINIÇÕES
======================== */
import {
  computed, nextTick, onBeforeUnmount,
  onMounted, reactive, ref, watch
} from 'vue'

/* Props */
const props = defineProps({
  show: { type: Boolean, default: false },
  userId: { type: Number, default: 0 },
  apiBase: { type: String, default: 'http://localhost:8080' },
  seletorAnoTurmaBtn: { type: String, default: '[data-tutorial="btn-ano"]' },
  seletorBuscarBtn: { type: String, default: '[data-tutorial="btn-busca"]' },
  seletorNovoAlunoBtn: { type: String, default: '[data-tutorial="btn-aluno"]' },
  seletorPerfilBtn: { type: String, default: '[data-tutorial="btn-perfil"]' }
})

/* Emits */
const emit = defineEmits([
  'close', 'demo-lock',
  'abrir-modal-ano', 'fechar-modal-ano',
  'abrir-modal-estudante', 'fechar-modal-estudante',
  'abrir-modal-perfil', 'fechar-modal-perfil'
])

/* ========================
   ESTADO REATIVO
======================== */
function qs(sel) { try { return document.querySelector(sel) } catch { return null } }
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }

const steps = reactive([
  { key:'home',   title:'Bem-vinda(o) à plataforma Tecmise.', text:'Feita para administrar dados de seus estudantes.', mode:'center' },
  { key:'ano',    title:'Ano e Turma.', text:'Neste campo você poderá criar um novo ano e turma.', mode:'target', selector:()=>qs(props.seletorAnoTurmaBtn) },
  { key:'buscar', title:'Buscar Estudante.', text:'Para pesquisar o estudante é preciso do nome ou e-mail.', mode:'target', selector:()=>qs(props.seletorBuscarBtn) },
  { key:'aluno',  title:'Novo Estudante.', text:'Antes de cadastrar um novo estudante, crie um ano e turma.', mode:'target', selector:()=>qs(props.seletorNovoAlunoBtn) },
  { key:'perfil', title:'Perfil.', text:'Gerencie seu perfil.', mode:'target', selector:()=>qs(props.seletorPerfilBtn) }
])

const step = ref(0)
const passoAtual = computed(() => steps[step.value])
const targetRect = ref(null)
const direction = ref('forward')
const bubbleRef = ref(null)

/* ========================
   FUNÇÕES DE POSICIONAMENTO
======================== */
function atualizarPosicao() {
  // remove halos anteriores
  document.querySelectorAll('.tut-halo').forEach(el => {
    el.classList.remove('tut-halo')
    el.style.transition = 'none'
  })

  // passo central sem alvo
  if (passoAtual.value.mode === 'center') {
    targetRect.value = null
    return
  }

  // resolve alvo
  const el = passoAtual.value.selector?.()
  if (!el) { targetRect.value = null; return }

  // garante visibilidade
  el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' })
  // halo no alvo
  el.classList.add('tut-halo')
  // bounding rect para posicionar bolha e anel
  targetRect.value = el.getBoundingClientRect()
}

const bubbleStyle = computed(() => {
  // sem alvo → centralizar
  if (!targetRect.value) {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  }

  // posicionamento inteligente ao redor do alvo
  const r = targetRect.value, vw = innerWidth, vh = innerHeight, m = 16, gap = 12
  const bw = bubbleRef.value?.offsetWidth ?? 520
  const bh = bubbleRef.value?.offsetHeight ?? 180

  // direita
  if (vw - r.right - m >= bw) {
    return { top: `${clamp(r.top + r.height/2 - bh/2, m, vh-bh-m)}px`, left: `${r.right + gap}px` }
  }
  // esquerda
  if (r.left - m >= bw) {
    return { top: `${clamp(r.top + r.height/2 - bh/2, m, vh-bh-m)}px`, left: `${r.left - bw - gap}px` }
  }
  // abaixo
  if (vh - r.bottom - m >= bh) {
    return { top: `${r.bottom + gap}px`, left: `${clamp(r.left + r.width/2 - bw/2, m, vw-bw-m)}px` }
  }
  // acima (fallback)
  return { top: `${Math.max(m, r.top - bh - gap)}px`, left: `${clamp(r.left + r.width/2 - bw/2, m, vw-bw-m)}px` }
})

const focusStyle = computed(() => {
  if (!targetRect.value) return {}
  const pad = 6, r = targetRect.value
  return { top: `${r.top-pad}px`, left: `${r.left-pad}px`, width: `${r.width+pad*2}px`, height: `${r.height+pad*2}px` }
})

/* ========================
   NAVEGAÇÃO DO TUTORIAL
======================== */
async function aplicarEfeitosDoPasso() {
  // Fecha modais que possam conflitar com a bolha/anel
  emit('fechar-modal-ano'); emit('fechar-modal-estudante'); emit('fechar-modal-perfil')
  // Bloqueia UI do app enquanto tutorial estiver ativo
  emit('demo-lock', true)
  await nextTick()
  atualizarPosicao()
}

function voltar() {
  if (step.value > 0) step.value--
}

async function avancar() {
  if (step.value < steps.length - 1) { step.value++; return }
  await finalizar(false)
}

async function finalizar() {
  try {
    if (props.userId) {
      await fetch(`${props.apiBase}/api/usuario/${props.userId}/tutorial`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorial_visto: true })
      })
    }
  } catch {}
  emit('fechar-modal-ano'); emit('fechar-modal-estudante'); emit('fechar-modal-perfil')
  emit('demo-lock', false)
  document.querySelectorAll('.tut-halo').forEach(el => el.classList.remove('tut-halo'))
  emit('close')
}

/* ========================
   CICLO DE VIDA & WATCHERS
======================== */
function onResizeOrScroll() { atualizarPosicao() }

watch(() => props.show, async v => {
  if (v) {
    step.value = 0
    await nextTick()
    aplicarEfeitosDoPasso()
    addEventListener('resize', onResizeOrScroll, { passive: true })
    addEventListener('scroll', onResizeOrScroll, { passive: true })
  } else {
    removeEventListener('resize', onResizeOrScroll)
    removeEventListener('scroll', onResizeOrScroll)
    document.querySelectorAll('.tut-halo').forEach(el => el.classList.remove('tut-halo'))
  }
})

watch(step, async (nv, ov) => {
  direction.value = nv > ov ? 'forward' : 'backward'
  await nextTick()
  aplicarEfeitosDoPasso()
})

onMounted(() => { if (props.show) aplicarEfeitosDoPasso() })
onBeforeUnmount(() => { emit('demo-lock', false) })
</script>

<style scoped>
/* =========================================================
   Overlay e transições gerais
   ========================================================= */
.fade-enter-active,.fade-leave-active { transition: opacity .18s ease }
.fade-enter-from,.fade-leave-to { opacity: 0 }
.tut-overlay { position: fixed; inset: 0; background: rgba(10,18,34,.72); z-index: 9999 }

/* =========================================================
   Bolha de instrução
   ========================================================= */
.tut-bubble {
  position: fixed;
  width: 520px; max-width: calc(100vw - 40px);
  padding: 22px 22px 18px;
  background: linear-gradient(180deg,#193a6e 0%, #162f59 100%);
  border: 1px solid #2ca8ff55; border-radius: 16px;
  box-shadow: 0 30px 120px #0a2c7040, inset 0 0 0 1px #1c4c8a80;
  color: #e8f6ff;
}
.tut-skip { position: absolute; top: 10px; right: 12px; background: transparent; border: 0; color: #7ed3ff; font-weight: 700; cursor: pointer }
.tut-title { color: #43c9ff; font-weight: 700; font-size: 1.18rem; margin: 6px 0 8px }
.tut-text { color: #e8f6ff; line-height: 1.35rem; margin-bottom: 12px }

/* =========================================================
   Indicadores de progresso
   ========================================================= */
.dots { display: flex; gap: 8px; margin: 4px 0 14px }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #2f6fa6; opacity: .7 }
.dot.active { background: #35c0ff; opacity: 1; box-shadow: 0 0 0 3px #35c0ff22 }

/* =========================================================
   Ações
   ========================================================= */
.tut-actions { display: flex; justify-content: flex-end; gap: 10px }
.btn { padding: 10px 18px; border-radius: 10px; border: 0; font-weight: 700; cursor: pointer; font-size: .98rem }
.btn.primary { background: linear-gradient(90deg,#33aaff 20%,#256cbb 100%); color: #fff; box-shadow: 0 6px 20px #0a355f60 }
.btn.ghost { background: #1a3157; color: #9ddfff }

/* =========================================================
   Anel de destaque do alvo
   ========================================================= */
.tut-ring {
  position: fixed; pointer-events: none;
  border: 3px solid #7fd8ff; border-radius: 14px;
  animation: ringPulse 1.6s ease-in-out infinite; z-index: 3
}

/* =========================================================
   Halo no elemento alvo (ajusta estilo do host)
   ========================================================= */
:deep(.tut-halo) {
  position: relative; z-index: 2;
  outline: 3px solid rgba(127,216,255,.95);
  border-radius: 12px !important;
  animation: haloPulse 1.6s ease-in-out infinite;
}

/* =========================================================
   Transições de passos
   ========================================================= */
.step-next-enter-from { opacity: 0; transform: translateY(8px) scale(.98) }
.step-next-leave-to { opacity: 0; transform: translateX(-10px) scale(.98) }
.step-prev-enter-from { opacity: 0; transform: translateY(8px) scale(.98) }
.step-prev-leave-to { opacity: 0; transform: translateX(10px) scale(.98) }

/* (opcional) keyframes para ring/halo se quiser animar melhor
@keyframes ringPulse { 0%,100%{ box-shadow:0 0 0 0 rgba(127,216,255,.45)} 50%{ box-shadow:0 0 0 6px rgba(127,216,255,.12)} }
@keyframes haloPulse { 0%,100%{ outline-color: rgba(127,216,255,.95)} 50%{ outline-color: rgba(127,216,255,.55)} }
*/
</style>
