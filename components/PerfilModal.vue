<!--
  ======================================================================
  📄 PerfilModal.vue
  ======================================================================
  🎯 Responsabilidade
    - Modal para edição do perfil do usuário logado.
    - Permite trocar foto (com preview), editar o nome e visualizar o e-mail (somente leitura).
    - Oferece ação de logout.

  📦 Funcionamento
    - Exibição controlada por `props.show`.
    - Dados vindos do pai via `props.form` (ex.: { nome, email, fotoUrl }).
    - Edição inline do nome (botão lápis ↔ check) com autosave ao confirmar/blur.
    - Upload de imagem < 5MB; arquivo lido em base64 para preview imediato.
    - Fecha ao clicar no overlay.

  🔌 Props
    - show: Boolean                → controla exibição do modal.
    - form: Object                 → estado do perfil (mutável pelo pai).
    - erros: Object                → erros por campo (opcional).
    - erro: String                 → erro geral (opcional).
    - defaultAvatar: String        → URL do avatar padrão.

  📤 Emits
    - salvar       → usuário confirmou alterações (ou autosave do nome).
    - fechar       → fechar modal sem salvar.
    - logout       → aciona fluxo de sair da conta.
    - update:form  → disponível para sincronizações finas (não usado aqui).
    - update:erros → disponível para propagar erros (não usado aqui).

  ♿ Acessibilidade
    - role="dialog", aria-modal="true".
    - aria-labelledby aponta para o título.
    - Ícone do botão de nome tem `aria-label` alternando “Editar nome”/“Concluir edição”.

  🧪 Validações
    - Nome: mínimo de 2 caracteres (mensagem “Informe seu nome completo.”).
    - Imagem: tamanho máximo 5MB (alerta).

  🧭 Interações
    - Clique em “Alterar foto” abre o seletor de arquivo.
    - Enter/blur no campo do nome dispara `autoSalvarNome()` se válido.
    - “Salvar” envia `emit('salvar')` com nome atual.
    - “Cancelar” envia `emit('fechar')`.
    - “Sair da conta” envia `emit('logout')`.

  🎨 Estilos
    - Modal centralizado, com overlay semitransparente.
    - Avatar com borda e texto de upload em destaque.
    - Campo de nome com botão inline (lápis/check).
    - Botões com feedback visual (hover/transform).

  🔧 Manutenção
    - Código segmentado por seções com comentários (props/emits/estado/métodos).
    - Sem dependências externas; apenas APIs do navegador (FileReader) e Vue.

  ======================================================================
-->

<template>
  <transition name="modal">
    <div
      v-if="show"
      class="modal-bg"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="tituloId"
      @click.self="onFechar"
    >
      <div class="modal-card" @click.stop>
        <!-- Título -->
        <h3 :id="tituloId" class="modal-title">Editar Perfil</h3>

        <!-- Erro geral -->
        <p v-if="erro" class="erro-msg">{{ erro }}</p>

        <form @submit.prevent="onSalvar">
          <!-- Avatar -->
          <div class="avatar-edit">
            <label for="foto-perfil">
              <img :src="form.fotoUrl || defaultAvatar" class="avatar-img" alt="Foto de perfil" />
              <input
                id="foto-perfil"
                type="file"
                accept="image/*"
                @change="onFotoPerfilChange"
                hidden
              />
            </label>
            <span class="avatar-upload-text" @click="dispararInputPerfil()">Alterar foto</span>
          </div>

          <!-- Nome com edição inline -->
          <div class="input-wrap">
            <input
              ref="nomeInput"
              v-model="localNome"
              :readonly="!editandoNome"
              type="text"
              placeholder="Nome de usuário"
              autocomplete="off"
              :class="{ erroInput: !!errosLocal.nome }"
              @focus="touched.nome = true"
              @input="touched.nome && validarNome()"
              @keydown.enter.prevent="autoSalvarNome()"
              @blur="autoSalvarNome()"
            />
            <button
              type="button"
              class="icon-btn"
              :aria-label="editandoNome ? 'Concluir edição do nome' : 'Editar nome'"
              @click="toggleEditarNome"
            >
              <svg v-if="!editandoNome" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                <path d="M20.71 7.04a1 1 0 0 0 0-1.42L18.37 3.29a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
              </svg>
            </button>
          </div>
          <p v-if="errosLocal.nome" class="erro-msg">{{ errosLocal.nome }}</p>

          <!-- E-mail somente leitura -->
          <input
            v-model="form.email"
            type="email"
            placeholder="Seu e-mail"
            readonly
            tabindex="-1"
            style="background:#1b335a; color:#91cfff; opacity:.95; cursor:not-allowed;"
          />
          <p v-if="erros.email" class="erro-msg">{{ erros.email }}</p>

          <!-- Botões principais -->
          <div class="modal-btns">
            <button type="submit" class="btn-salvar">Salvar</button>
            <button type="button" class="btn-cancelar" @click="onFechar">Cancelar</button>
          </div>

          <!-- Logout -->
          <button class="logout-btn" type="button" @click="onLogout">Sair da conta</button>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'

/** ID único do título para acessibilidade */
const tituloId = 'perfil-modal-title'

/* Props e Emits */
const props = defineProps({
  show: Boolean,
  form: Object,
  erros: Object,
  erro: String,
  defaultAvatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=2db6ff&color=fff&name=U'
  }
})
const emit = defineEmits(['salvar', 'fechar', 'logout', 'update:form', 'update:erros'])

/* Estado local para edição inline do nome */
const nomeInput = ref(null)
const localNome = ref(props.form?.nome || '')
const editandoNome = ref(false)
const touched = reactive({ nome: false })
const errosLocal = reactive({ nome: '' })

/* Sincroniza nome quando a prop muda e não está editando */
watch(() => props.form?.nome, v => {
  if (!editandoNome.value) localNome.value = v || ''
})

/* Validação simples do nome */
function validarNome() {
  const v = (localNome.value || '').trim()
  errosLocal.nome = !v ? '' : (v.length < 2 ? 'Informe seu nome completo.' : '')
}

/* Alterna modo de edição do nome */
function toggleEditarNome() {
  editandoNome.value = !editandoNome.value
  if (editandoNome.value) {
    nextTick(() => nomeInput.value?.focus())
  } else {
    autoSalvarNome()
  }
}

/* Salva automaticamente o nome se for válido */
function autoSalvarNome() {
  validarNome()
  if (errosLocal.nome) return
  const novo = (localNome.value || '').trim()
  const atual = (props.form?.nome || '').trim()
  if (novo && novo !== atual) {
    props.form.nome = novo
    emit('salvar')
  }
  editandoNome.value = false
}

/* Manipulação de avatar */
function onFotoPerfilChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('A imagem deve ter até 5MB!')
    return
  }
  const reader = new FileReader()
  reader.onload = evt => {
    props.form.fotoUrl = evt.target.result
  }
  reader.readAsDataURL(file)
}
function dispararInputPerfil() {
  document.getElementById('foto-perfil')?.click()
}

/* Ações do modal */
function onSalvar() {
  validarNome()
  if (errosLocal.nome) return
  props.form.nome = (localNome.value || '').trim()
  emit('salvar')
}
function onFechar() {
  emit('fechar')
}
function onLogout() {
  emit('logout')
}
</script>

<style scoped>
/* Mantém fonte padrão do app */
.modal-card, .modal-card * {
  font-family: var(--app-font, 'Montserrat'), Arial, sans-serif;
}

/* Overlay */
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(23, 40, 64, 0.74);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

/* Card */
.modal-card {
  background: #183765;
  border-radius: 15px;
  width: 90%;
  max-width: 430px;
  box-shadow: 0 12px 50px #16213a42;
  text-align: center;
  padding: 2.1rem 1.5rem 1.7rem;
  animation: modal-pop 0.3s cubic-bezier(.25, .46, .45, .94);
}
@keyframes modal-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-title {
  color: #3bc7ff;
  font-weight: 700;
  font-size: 1.16rem;
  margin-bottom: 17px;
}

/* Avatar */
.avatar-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}
.avatar-img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 5px;
  border: 3px solid #36c5ff44;
  background: #193255;
  cursor: pointer;
}
.avatar-upload-text {
  color: #3bc7ff;
  font-size: 0.96rem;
  cursor: pointer;
  transition: color 0.16s;
}
.avatar-upload-text:hover {
  color: #fff;
}

/* Campo com lápis/check */
.input-wrap {
  position: relative;
  display: block;
  height: 46px;
  margin-bottom: 10px;
}
.input-wrap input {
  width: 100%;
  height: 100%;
  padding: 0 44px 0 14px;
  border-radius: 8px;
  border: 1.2px solid #3b5998;
  background: #25447b;
  color: #fff;
  font-size: 0.97rem;
  outline: none;
  transition: border 0.18s, background 0.18s, box-shadow 0.18s;
}
.input-wrap input::placeholder {
  color: #a2cfff;
}
.input-wrap input:focus {
  border-color: #3bc7ff;
  background: #295291;
  box-shadow: 0 0 0 3px rgba(60, 193, 255, 0.18);
}
.input-wrap input[readonly] {
  opacity: 0.95;
  cursor: default;
}
.icon-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.15s;
}
.icon-btn:hover {
  background: rgba(60, 193, 255, 0.15);
}
.icon-btn svg {
  width: 20px;
  height: 20px;
  fill: #36c0ff;
}

/* Inputs padrão */
.modal-card input:not(.input-wrap input) {
  width: 100%;
  padding: 0.57rem 1rem;
  margin-bottom: 14px;
  border-radius: 8px;
  border: 1.2px solid #3b5998;
  background: #25447b;
  color: #fff;
  font-size: 0.97rem;
  outline: none;
}
.modal-card input:not(.input-wrap input)::placeholder {
  color: #a2cfff;
}
.modal-card input:not(.input-wrap input):focus {
  border-color: #3bc7ff;
}

/* Mensagens de erro */
.erroInput {
  border-color: #ff5b5b !important;
  background: #331c1c !important;
}
.erro-msg {
  color: #ff5b5b;
  font-size: 0.91rem;
  margin: -6px 0 10px;
  text-align: left;
}

/* Botões principais */
.modal-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 6px;
}
.btn-salvar {
  padding: 0.62rem 1.09rem;
  border-radius: 7px;
  border: none;
  font-size: 1.01rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(90deg, #32e0ff 30%, #2956a6 100%);
  color: #fff;
  transition: transform 0.17s, filter 0.17s;
}
.btn-salvar:hover {
  transform: scale(1.03);
  filter: brightness(1.1);
}
.btn-cancelar {
  padding: 0.62rem 1.09rem;
  border-radius: 7px;
  border: none;
  font-size: 1.01rem;
  font-weight: 600;
  cursor: pointer;
  background: #2b334b;
  color: #f64f61;
  transition: background 0.17s, color 0.16s, transform 0.17s;
}
.btn-cancelar:hover {
  background: #ff5b5b;
  color: #fff;
  transform: scale(1.02);
}

/* Logout */
.logout-btn {
  margin-top: 22px;
  background: #2b334b;
  color: #f64f61;
  border: none;
  border-radius: 7px;
  padding: 0.62rem 1.09rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background 0.17s, color 0.16s;
}
.logout-btn:hover {
  background: #ff5b5b;
  color: #fff;
}
</style>
