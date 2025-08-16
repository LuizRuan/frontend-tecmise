<!-- components/BuscarEstudante.vue -->
<template>
  <!--
    =====================================================================
    🔎 BuscarEstudante.vue — Modal de busca rápida
    =====================================================================
    🎯 Objetivo
      - Permitir buscar estudantes por nome ou e-mail.
      - Mostrar resultados em tempo real com um debounce leve.
      - Exibir Ano/Turma associado quando disponível.

    🧭 Estrutura
      - <transition name="modal">: transição de opacidade (entrada/saída).
      - .modal-bg: overlay escurecido que fecha ao clicar fora do card (@click.self).
      - .modal-card: conteúdo do modal (título, input, lista, botão fechar).

    ♿ Acessibilidade (A11Y)
      - Lista semântica (<ul>/<li>) para resultados.
      - Alto contraste no input e textos.
      - Fechamento seguro: clique fora do card ou botão "Fechar".
  -->
  <!-- Modal -->
  <transition name="modal">
    <!-- Overlay (fecha ao clicar fora do card) -->
    <div v-if="show" class="modal-bg" @click.self="close">
      <!-- Card do modal (impede propagação para não fechar) -->
      <div class="modal-card" @click.stop>
        <h3 class="modal-title">Buscar Estudante</h3>

        <!--
          Campo de busca
          - v-model="term": estado controlado.
          - @input="onType": aplica debounce de ~140ms para UX mais suave.
        -->
        <input
          v-model="term"
          type="text"
          class="input-busca"
          placeholder="Digite nome ou email do estudante"
          @input="onType"
        />

        <!-- Resultados (aparecem apenas se houver termo não-vazio) -->
        <div v-if="term.trim().length > 0" class="result-wrap">
          <template v-if="results.length">
            <!-- 🔽 aplica rolagem apenas quando houver mais de 4 itens -->
            <ul class="result-list" :class="{ scroll: results.length > 4 }">
              <li v-for="aluno in results" :key="aluno.id" class="item-busca">
                <strong>{{ aluno.nome }}</strong>
                <span class="email">{{ aluno.email }}</span>
                <span class="ano">(Ano e Turma: {{ anoTurmaNome(aluno.ano_id ?? aluno.anoTurmaId) }})</span>
              </li>
            </ul>
          </template>

          <!-- Estado vazio (nenhum match) -->
          <p v-else class="empty">Nenhum estudante encontrado.</p>
        </div>

        <!-- Botão Fechar (mantém o visual do seu Perfil/Cancelar) -->
        <div class="modal-btns">
          <button type="button" class="btn-fechar" @click="close">Fechar</button>
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
  - Componente controlado externamente: pai chama open()/close() via ref.
  - Debounce leve na digitação para evitar recomputes a cada tecla.
  - Filtro local (em memória) por nome OU e-mail, case-insensitive.
*/
import { ref, computed, defineExpose } from 'vue'

/*
  📥 Props
  - alunos: Array de estudantes; cada item deve conter ao menos { id, nome, email }.
            Pode trazer o vínculo como ano_id ou anoTurmaId.
  - anosTurmas: Array com { id, nome } para resolver o nome do Ano/Turma.
*/
const props = defineProps({
  alunos: { type: Array, default: () => [] },
  anosTurmas: { type: Array, default: () => [] },
})

/* 🎛️ Estado interno */
const show = ref(false)  // controla visibilidade do modal
const term = ref('')     // termo digitado no input

/*
  🌐 API pública do componente
  - open(): exibe o modal
  - close(): esconde o modal e limpa o termo de busca
  - defineExpose: permite que o componente pai (via ref) chame open/close
*/
function open () { show.value = true }
function close () { show.value = false; term.value = '' }
defineExpose({ open, close })

/*
  ⏳ Debounce simples
  - Armazena o último valor digitado e atualiza term após 140ms.
  - Evita cálculos a cada keypress, melhorando a responsividade.
*/
let t = null
function onType () {
  clearTimeout(t)
  const v = term.value
  t = setTimeout(() => { term.value = v }, 140)
}

/*
  🔎 results (computed)
  - Normaliza o termo (trim + lowercase) e filtra alunos por nome OU e-mail.
  - Se o termo estiver vazio, retorna lista vazia para não exibir nada.
*/
const results = computed(() => {
  const q = term.value.trim().toLowerCase()
  if (!q) return []
  return (props.alunos || []).filter(a =>
    (a.nome && a.nome.toLowerCase().includes(q)) ||
    (a.email && a.email.toLowerCase().includes(q))
  )
})

/*
  🏷️ anoTurmaNome(id)
  - Busca em props.anosTurmas o objeto cujo id bate com o informado.
  - Retorna o nome ou string vazia se não encontrar.
*/
function anoTurmaNome (id) {
  return props.anosTurmas?.find(a => a.id === id)?.nome || ''
}
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilos (mantidos exatamente como os originais)
   ========================================================================== */

/* -------- Modal -------- */
.modal-bg{
  position:fixed; inset:0; background:rgba(23,40,64,.78);
  display:flex; align-items:center; justify-content:center; z-index:9999;
}
.modal-card{
  background:#183765; border-radius:18px;
  width:min(560px,92vw);
  padding:28px; text-align:center;
  box-shadow:0 18px 60px #0c193a66; animation:pop .28s ease;
  max-height: 86vh; /* garante que o conteúdo nunca ultrapasse a viewport */
}
@keyframes pop{ from{ transform:scale(.95); opacity:0 } to{ transform:scale(1); opacity:1 } }

.modal-title{
  color:#32e0ff; font-size:1.5rem; font-weight:800; margin-bottom:18px;
}

/* 🔤 Campo de busca */
.input-busca{
  width:100%; height:52px; border-radius:12px; border:1.7px solid #2b66a8;
  background:#224477; color:#e6f7ff; font-size:1.06rem;
  padding:0 16px; outline:none; transition:border .15s, background .15s;
}
.input-busca::placeholder{ color:#ffffff; opacity:1; }
.input-busca:focus{ border-color:#35afff; background:#1d335c; }

/* 📋 Resultados */
.result-wrap{ margin-top:18px; }
.result-list{
  list-style:none; padding:0; margin:0;
  display:flex; flex-direction:column; gap:10px; align-items:center;
}
/* 🔽 quando houver mais de 4 itens, ativa rolagem vertical */
.result-list.scroll{
  max-height: 360px;       /* ~4 cartões + espaçamentos */
  overflow-y: auto;
  padding-right: 6px;      /* espaço pro scroll */
}

/* (opcional) scrollbar discreto */
.result-list.scroll::-webkit-scrollbar{ width: 8px; }
.result-list.scroll::-webkit-scrollbar-track{ background:#112542; border-radius:8px; }
.result-list.scroll::-webkit-scrollbar-thumb{ background:#2f5fa1; border-radius:8px; }
.result-list.scroll::-webkit-scrollbar-thumb:hover{ background:#3a74c6; }

.item-busca{
  width:100%; max-width:420px; background:#162a4a; border-radius:12px;
  padding:14px 16px; color:#fff; box-shadow:0 1px 8px #0c1d3b33;
  display:flex; flex-direction:column; gap:4px; align-items:center; text-align:center;
}
.item-busca strong{ color:#6fe2ff; font-size:1.08rem; }
.item-busca .email{ color:#96e9ff; }
.item-busca .ano{ color:#ffffff; font-size:.85rem; }
.empty{ color:#de5656; margin-top:8px; }

/* Botão Fechar — mesmo estilo do Cancelar no Perfil */
.modal-btns{ display:flex; justify-content:center; margin-top:22px; }
.btn-fechar{
  background:#2b334b; color:#f64f61; border:none; border-radius:12px;
  padding:12px 28px; font-weight:800; font-size:1.02rem; cursor:pointer;
  box-shadow:0 3px 14px #0b2b5a55; transition:background .16s, color .16s, transform .12s, filter .16s;
}
.btn-fechar:hover{ background:#ff5b5b; color:#fff; transform:translateY(-1px); }

/* transição */
.modal-enter-active,.modal-leave-active{ transition:opacity .18s ease; }
.modal-enter-from,.modal-leave-to{ opacity:0; }
</style>
