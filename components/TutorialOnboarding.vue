<!-- components/TutorialOnboarding.vue -->
<template>
  <transition name="fade">
    <div v-if="show" class="tut-overlay" @click.stop>
      <!-- Bolha com transição direcional -->
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
          <button class="tut-skip" type="button" @click="finalizar(true)" aria-label="Pular tutorial">
            Pular
          </button>

          <h3 class="tut-title">{{ passoAtual.title }}</h3>
          <p class="tut-text">{{ passoAtual.text }}</p>

          <div class="dots">
            <span v-for="(s,i) in steps" :key="s.key" :class="['dot',{active:i===step}]"/>
          </div>

          <div class="tut-actions">
            <button class="btn ghost" type="button" :disabled="step===0" v-show="step>0" @click="voltar">
              Voltar
            </button>
            <button class="btn primary" type="button" @click="avancar">
              {{ step === steps.length - 1 ? 'Concluir' : 'Próximo' }}
            </button>
          </div>
        </div>
      </transition>

      <!-- Anel de destaque -->
      <div
        v-if="passoAtual.mode==='target' && targetRect"
        class="tut-ring"
        :style="focusStyle"
        aria-hidden="true"
      />
    </div>
  </transition>
</template>

<script setup>
/**
 * TutorialOnboarding (posicionamento inteligente)
 * - “Anos e Turmas”, “Buscar Estudante”, “Novo Estudante”, “Perfil”
 * - Sem atraso no highlight
 * - A bolha tenta ficar: à direita do alvo → à esquerda → abaixo → acima
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  userId: { type: Number, default: 0 },
  apiBase: { type: String, default: 'http://localhost:8080' },
  seletorAnoTurmaBtn: { type: String, default: '[data-tutorial="btn-ano"]' },
  seletorBuscarBtn:    { type: String, default: '[data-tutorial="btn-busca"]' },
  seletorNovoAlunoBtn: { type: String, default: '[data-tutorial="btn-aluno"]' },
  seletorPerfilBtn:    { type: String, default: '[data-tutorial="btn-perfil"]' }
})

const emit = defineEmits([
  'close',
  'demo-lock',
  'abrir-modal-ano','fechar-modal-ano',
  'abrir-modal-estudante','fechar-modal-estudante',
  'abrir-modal-perfil','fechar-modal-perfil'
])

function qs(sel){ if(!import.meta.client) return null; try{ return document.querySelector(sel) } catch { return null } }
function clamp(v,min,max){ return Math.min(max, Math.max(min,v)) }

const steps = reactive([
  { key:'home',   title:'Bem-vinda(o) ao TecMise', text:'Aqui você gerencia estudantes, anos e turmas, e seu perfil.', mode:'center' },
  { key:'ano',    title:'Anos e Turmas',           text:'Use este botão para criar um novo ano e turma.',             mode:'target', selector:()=>qs(props.seletorAnoTurmaBtn) },
  { key:'buscar', title:'Buscar Estudante',        text:'Aqui você pode pesquisar o nome ou email de qualquer estudante.',     mode:'target', selector:()=>qs(props.seletorBuscarBtn) },
  { key:'aluno',  title:'Novo Estudante',          text:'Cadastre novos estudantes (é necessário ter um Ano e Turma).', mode:'target', selector:()=>qs(props.seletorNovoAlunoBtn) },
  { key:'perfil', title:'Perfil',                  text:'Atualize seu nome e foto neste botão.',                      mode:'target', selector:()=>qs(props.seletorPerfilBtn) }
])

const step = ref(0)
const passoAtual = computed(()=>steps[step.value])
const targetRect = ref(null)
const direction = ref('forward')
const bubbleRef = ref(null)

function atualizarPosicao(){
  if(!import.meta.client) return

  // remove halo anterior (sem transição – imediato)
  document.querySelectorAll('.tut-halo').forEach(el=>{
    el.classList.remove('tut-halo')
    el.style.transition = 'none'
  })

  if(passoAtual.value.mode==='center'){
    targetRect.value = null
    return
  }
  const el = passoAtual.value.selector?.()
  if(!el){
    targetRect.value = null
    return
  }
  // garante visibilidade sem “delay” perceptível
  el.scrollIntoView({ behavior:'instant', block:'center', inline:'center' })
  // aplica halo agora
  el.classList.add('tut-halo')
  targetRect.value = el.getBoundingClientRect()
}

const bubbleStyle = computed(()=>{
  // central
  if(!import.meta.client || passoAtual.value.mode==='center' || !targetRect.value){
    return { left:'50%', top:'50%', transform:'translate(-50%, -50%)' }
  }

  const r = targetRect.value
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = 16
  const gap = 12

  // medidas da bolha (se ainda não renderizou, usa estimativa)
  const bw = bubbleRef.value?.offsetWidth ?? 520
  const bh = bubbleRef.value?.offsetHeight ?? 180

  // preferências: right → left → bottom → top
  // RIGHT
  if (vw - r.right - margin >= bw) {
    const top = clamp(r.top + r.height/2 - bh/2, margin, vh - bh - margin)
    const left = r.right + gap
    return { top: `${top}px`, left: `${left}px` }
  }
  // LEFT
  if (r.left - margin >= bw) {
    const top = clamp(r.top + r.height/2 - bh/2, margin, vh - bh - margin)
    const left = r.left - bw - gap
    return { top: `${top}px`, left: `${left}px` }
  }
  // BOTTOM
  if (vh - r.bottom - margin >= bh) {
    const top = r.bottom + gap
    const left = clamp(r.left + r.width/2 - bw/2, margin, vw - bw - margin)
    return { top: `${top}px`, left: `${left}px` }
  }
  // TOP (fallback)
  const top = r.top - bh - gap
  const left = clamp(r.left + r.width/2 - bw/2, margin, vw - bw - margin)
  return { top: `${Math.max(margin, top)}px`, left: `${left}px` }
})

const focusStyle = computed(()=>{
  if(!import.meta.client || !targetRect.value) return {}
  const pad = 6
  return {
    top:`${targetRect.value.top - pad}px`,
    left:`${targetRect.value.left - pad}px`,
    width:`${targetRect.value.width + pad*2}px`,
    height:`${targetRect.value.height + pad*2}px`
  }
})

async function aplicarEfeitosDoPasso(){
  emit('fechar-modal-ano')
  emit('fechar-modal-estudante')
  emit('fechar-modal-perfil')
  emit('demo-lock', true)
  await nextTick()
  atualizarPosicao()
  await nextTick() // mede bolha já renderizada
}

function onResizeOrScroll(){ atualizarPosicao() }

watch(()=>props.show, async (v)=>{
  if(!import.meta.client) return
  if(v){
    step.value = 0
    await nextTick()
    aplicarEfeitosDoPasso()
    window.addEventListener('resize', onResizeOrScroll, { passive:true })
    window.addEventListener('scroll', onResizeOrScroll, { passive:true })
  }else{
    window.removeEventListener('resize', onResizeOrScroll)
    window.removeEventListener('scroll', onResizeOrScroll)
    document.querySelectorAll('.tut-halo').forEach(el=>el.classList.remove('tut-halo'))
  }
})

watch(step, async (nv, ov)=>{
  direction.value = nv > ov ? 'forward' : 'backward'
  await nextTick()
  aplicarEfeitosDoPasso()
})

onMounted(()=>{ if(props.show) aplicarEfeitosDoPasso() })
onBeforeUnmount(()=>{ emit('demo-lock', false) })

function voltar(){ if(step.value>0) step.value-- }
async function avancar(){
  if(step.value < steps.length - 1){ step.value++; return }
  await finalizar(false)
}

async function finalizar(/* pulado */){
  try{
    if (props.userId) {
      await fetch(`${props.apiBase}/api/usuario/${props.userId}/tutorial`,{
        method:'PUT',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ tutorial_visto:true })
      })
    }
  }catch(e){
    console.warn('Falha ao marcar tutorial_visto:', e)
  }finally{
    emit('fechar-modal-ano')
    emit('fechar-modal-estudante')
    emit('fechar-modal-perfil')
    emit('demo-lock', false)
    document.querySelectorAll('.tut-halo').forEach(el=>el.classList.remove('tut-halo'))
    emit('close')
  }
}

</script>

<style scoped>
/* Overlay */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.tut-overlay{ position: fixed; inset:0; background: rgba(10,18,34,.72); z-index: 9999 }

/* Bolha */
.tut-bubble{
  position: fixed;
  width: 520px; max-width: calc(100vw - 40px);
  padding: 22px 22px 18px;
  background: linear-gradient(180deg,#193a6e 0%, #162f59 100%);
  border: 1px solid #2ca8ff55;
  border-radius: 16px;
  box-shadow: 0 30px 120px #0a2c7040, inset 0 0 0 1px #1c4c8a80;
  color: #e8f6ff;
}
.tut-skip{ position:absolute; top:10px; right:12px; background:transparent; border:0; color:#7ed3ff; font-weight:700; cursor:pointer }
.tut-skip:hover{ color:#baf0ff }
.tut-title{ color:#43c9ff; font-weight:700; font-size:1.18rem; margin:6px 0 8px }
.tut-text{  color:#e8f6ff; line-height:1.35rem; margin-bottom:12px }

/* Dots */
.dots{ display:flex; gap:8px; margin:4px 0 14px }
.dot{ width:8px; height:8px; border-radius:50%; background:#2f6fa6; opacity:.7 }
.dot.active{ background:#35c0ff; opacity:1; box-shadow:0 0 0 3px #35c0ff22 }

/* Actions */
.tut-actions{ display:flex; justify-content:flex-end; gap:10px }
.btn{ padding:10px 18px; border-radius:10px; border:0; font-weight:700; cursor:pointer; font-size:.98rem }
.btn.primary{ background: linear-gradient(90deg,#33aaff 20%,#256cbb 100%); color:#fff; box-shadow:0 6px 20px #0a355f60 }
.btn.primary:hover{ filter:brightness(1.08) }
.btn.ghost{ background:#1a3157; color:#9ddfff }
.btn.ghost:disabled{ opacity:.35; cursor:not-allowed }

/* Anel do alvo (sem delay) */
.tut-ring{
  position:fixed; pointer-events:none; border:3px solid #7fd8ff;
  box-shadow:0 0 0 3px rgba(127,216,255,.25) inset, 0 0 0 8px rgba(127,216,255,.18), 0 12px 40px rgba(20,120,200,.35);
  animation: ringPulse 1.6s ease-in-out infinite; border-radius:14px; z-index:3
}
@keyframes ringPulse{
  0%{   box-shadow:0 0 0 3px rgba(127,216,255,.25) inset, 0 0 0 8px rgba(127,216,255,.18), 0 12px 40px rgba(20,120,200,.35) }
  50%{  box-shadow:0 0 0 3px rgba(127,216,255,.35) inset, 0 0 0 12px rgba(127,216,255,.26), 0 18px 58px rgba(20,120,200,.45) }
  100%{ box-shadow:0 0 0 3px rgba(127,216,255,.25) inset, 0 0 0 8px rgba(127,216,255,.18), 0 12px 40px rgba(20,120,200,.35) }
}

/* Halo direto no elemento alvo (sem transição) */
:deep(.tut-halo){
  position: relative; z-index: 2;
  outline: 3px solid rgba(127,216,255,.95);
  border-radius: 12px !important;
  box-shadow:0 0 0 3px rgba(127,216,255,.25) inset, 0 0 0 8px rgba(127,216,255,.18), 0 12px 40px rgba(20,120,200,.35);
  animation: haloPulse 1.6s ease-in-out infinite;
}
@keyframes haloPulse{
  0%{   box-shadow:0 0 0 3px rgba(127,216,255,.25) inset, 0 0 0 8px rgba(127,216,255,.18), 0 12px 40px rgba(20,120,200,.35) }
  50%{  box-shadow:0 0 0 3px rgba(127,216,255,.35) inset, 0 0 0 12px rgba(127,216,255,.26), 0 18px 58px rgba(20,120,200,.45) }
  100%{ box-shadow:0 0 0 3px rgba(127,216,255,.25) inset, 0 0 0 8px rgba(127,216,255,.18), 0 12px 40px rgba(20,120,200,.35) }
}

/* Transições entre passos */
.step-next-enter-from   { opacity:0; transform: translateY(8px) scale(.98) }
.step-next-enter-active { transition: all .20s ease }
.step-next-leave-to     { opacity:0; transform: translateX(-10px) scale(.98) }
.step-next-leave-active { transition: all .16s ease }

.step-prev-enter-from   { opacity:0; transform: translateY(8px) scale(.98) }
.step-prev-enter-active { transition: all .20s ease }
.step-prev-leave-to     { opacity:0; transform: translateX(10px) scale(.98) }
.step-prev-leave-active { transition: all .16s ease }
</style>
