<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="show"
        class="modal-bg"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        aria-label="Modal de cadastro/edição de estudante"
        @click.self="onFechar"
      >
        <div class="modal-card" @click.stop>
          <h3 class="modal-title">{{ editando ? 'Editar estudante' : 'Novo estudante' }}</h3>

          <form @submit.prevent="onSalvar">
            <!-- Foto do estudante -->
            <div class="avatar-edit">
              <label for="foto-estudante">
                <img :src="form.fotoUrl || defaultAvatar" class="avatar-img" alt="Foto do estudante" />
                <input
                  id="foto-estudante"
                  type="file"
                  accept="image/*"
                  @change="onFotoEstudanteChange"
                  style="display:none"
                />
              </label>
              <span class="avatar-upload-text" @click="dispararInputEstudante">
                Adicionar / Alterar foto
              </span>
            </div>

            <!-- Nome -->
            <input
              v-model="form.nome"
              type="text"
              placeholder="Nome"
              required
              autocomplete="off"
              :class="{ erroInput: erros.nome }"
              @input="erros.nome = ''"
              @keyup.enter="onSalvar"
            />
            <p v-if="erros.nome" class="erro-msg">{{ erros.nome }}</p>

            <!-- CPF -->
            <input
              v-model="form.cpf"
              type="text"
              maxlength="11"
              placeholder="CPF (apenas números)"
              required
              autocomplete="off"
              :class="{ erroInput: erros.cpf }"
              @input="onCpfInput"
              @blur="onCpfBlur"
            />
            <p v-if="erros.cpf" class="erro-msg">{{ erros.cpf }}</p>

            <!-- Email -->
            <input
              v-model="form.email"
              type="text"
              placeholder="E-mail"
              required
              autocomplete="off"
              :class="{ erroInput: erros.email }"
              @input="onEmailTyping"
              @blur="onEmailBlur"
            />
            <p v-if="erros.email" class="erro-msg">{{ erros.email }}</p>

            <!-- Data de Nascimento -->
            <input
              v-model="form.dataNascimento"
              type="date"
              required
              :class="{ erroInput: erros.dataNascimento }"
              @input="erros.dataNascimento = ''"
            />
            <p v-if="erros.dataNascimento" class="erro-msg">{{ erros.dataNascimento }}</p>

            <!-- Telefone -->
            <input
              v-model="form.telefone"
              type="text"
              placeholder="Telefone (opcional)"
              autocomplete="off"
              :class="{ erroInput: erros.telefone }"
              @input="erros.telefone = ''"
            />
            <p v-if="erros.telefone" class="erro-msg">{{ erros.telefone }}</p>

            <!-- Ano/Turma -->
            <select
              v-model="form.anoTurmaId"
              required
              :class="{ erroInput: erros.anoTurmaId }"
              @change="erros.anoTurmaId = ''"
            >
              <option disabled value="">Selecione o Ano/Turma</option>
              <option
                v-for="anoTurma in anosTurmas"
                :key="anoTurma.id"
                :value="anoTurma.id"
              >
                {{ anoTurma.nome }}
              </option>
            </select>
            <p v-if="erros.anoTurmaId" class="erro-msg">{{ erros.anoTurmaId }}</p>

            <!-- Mensagem geral de erro -->
            <p v-if="erros.geral" class="erro-msg" style="text-align:center; font-weight:500;">
              {{ erros.geral }}
            </p>

            <!-- Botões -->
            <div class="modal-btns">
              <button type="submit">{{ editando ? 'Salvar' : 'Cadastrar' }}</button>
              <button type="button" @click="onFechar">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
const { $api } = useNuxtApp()

import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  show: Boolean,
  editando: Boolean,
  form: Object,
  erros: Object,
  anosTurmas: Array,
  defaultAvatar: String,
  apiBase: { type: String, default: 'http://localhost:8080' },
  userEmail: { type: String, default: '' }
})

const emit = defineEmits(['salvar', 'fechar', 'update:form', 'update:erros'])

/* =========================
   Guarda o CPF original ao abrir
========================= */
const cpfInicial = ref('')

watch(() => props.show, (abriu) => {
  if (!abriu) return
  cpfInicial.value = String(props.form.cpf || '')
  emit('update:erros', {
    ...props.erros,
    nome: '', cpf: '', email: '', dataNascimento: '',
    telefone: '', anoTurmaId: '', geral: ''
  })
})

/* =========================
   Validações Helpers
========================= */
function validarEmail(email) {
  if (!email || email.trim() === "") return "E-mail é obrigatório"
  if (email.includes(" ")) return "Não use espaços no e-mail"
  if (email.startsWith("@")) return "E-mail não pode começar com @"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Digite um e-mail válido"
  return ""
}
function validarCPF(cpf) {
  cpf = String(cpf || "").replace(/\D/g, "").trim()
  if (!cpf) return "CPF é obrigatório"
  if (cpf.length !== 11) return "CPF deve ter 11 dígitos"
  if (/^(\d)\1+$/.test(cpf)) return "CPF inválido"
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(cpf[9])) return "CPF inválido"
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(cpf[10])) return "CPF inválido"
  return ""
}

/* =========================
   CPF: debounce + checagem duplicidade
========================= */
let cpfTimer = null
async function checarCpfDuplicado() {
  // se está editando e o CPF não mudou, não acusa duplicado
  if (props.editando && props.form.id && String(props.form.cpf || '') === cpfInicial.value) {
    if (props.erros.cpf === 'CPF já cadastrado para este usuário.') {
      props.erros.cpf = ''
      emit('update:erros', { ...props.erros })
    }
    return
  }

  try {
    const cpf = String(props.form.cpf || '')
    if (validarCPF(cpf)) return

    const url = new URL(`${props.apiBase}/api/estudantes/check-cpf`)
    url.searchParams.set('cpf', cpf)
    if (props.editando && props.form.id) url.searchParams.set('excludeId', String(props.form.id))

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-User-Email': props.userEmail }
    })
    if (!res.ok) return
    const data = await res.json()

    if (data?.exists) {
      props.erros.cpf = 'CPF já cadastrado para este usuário.'
    } else if (props.erros.cpf === 'CPF já cadastrado para este usuário.') {
      props.erros.cpf = ''
    }
    emit('update:erros', { ...props.erros })
  } catch {}
}

/* === DIGITAÇÃO ===
   - normaliza p/ 11 dígitos
   - não mostra erro < 11
   - ao chegar em 11: valida; se OK, checa duplicidade (debounce)
*/
function onCpfInput() {
  props.form.cpf = String(props.form.cpf || '').replace(/\D/g, '').slice(0, 11)

  // < 11: não exibe erro
  if (props.form.cpf.length < 11) {
    if (props.erros.cpf) {
      props.erros.cpf = ''
      emit('update:erros', { ...props.erros })
    }
    clearTimeout(cpfTimer)
    return
  }

  // == 11: valida; se válido, checa duplicidade
  const err = validarCPF(props.form.cpf)
  if (err) {
    if (props.erros.cpf !== err) {
      props.erros.cpf = err
      emit('update:erros', { ...props.erros })
    }
    clearTimeout(cpfTimer)
    return
  }

  // válido -> dispara checagem com debounce
  if (props.erros.cpf) {
    props.erros.cpf = ''
    emit('update:erros', { ...props.erros })
  }
  clearTimeout(cpfTimer)
  cpfTimer = setTimeout(checarCpfDuplicado, 220)
}

/* === BLUR ===
   - <11 -> "11 dígitos"
   - 11 inválido -> "CPF inválido"
   - 11 válido -> checa duplicidade sem debounce
*/
function onCpfBlur() {
  const cpf = String(props.form.cpf || '')
  if (cpf.length < 11) {
    props.erros.cpf = 'CPF deve ter 11 dígitos'
    emit('update:erros', { ...props.erros })
    return
  }
  const err = validarCPF(cpf)
  if (err) {
    props.erros.cpf = err
    emit('update:erros', { ...props.erros })
    return
  }
  clearTimeout(cpfTimer)
  checarCpfDuplicado()
}

/* =========================
   Email: UX — digita limpa, blur valida
========================= */
function onEmailTyping() {
  if (props.erros.email) {
    props.erros.email = ''
    emit('update:erros', { ...props.erros })
  }
}
function onEmailBlur() {
  props.erros.email = validarEmail(props.form.email)
  emit('update:erros', { ...props.erros })
}

/* =========================
   Foto
========================= */
function onFotoEstudanteChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    props.erros.geral = "A imagem deve ter até 5MB!"
    emit('update:erros', { ...props.erros })
    return
  }
  const reader = new FileReader()
  reader.onload = evt => { props.form.fotoUrl = evt.target.result }
  reader.readAsDataURL(file)
}
function dispararInputEstudante() {
  document.getElementById('foto-estudante')?.click()
}

/* =========================
   Submit / Fechar
========================= */
function onSalvar() {
  const emailErro = validarEmail(props.form.email)
  const cpfErro = validarCPF(props.form.cpf)
  props.erros.email = emailErro
  props.erros.cpf = cpfErro
  props.erros.geral = ""
  if (emailErro || cpfErro) {
    emit('update:erros', { ...props.erros })
    return
  }
  emit('salvar')
}

function onFechar() {
  clearTimeout(cpfTimer)
  emit('fechar')
}

onBeforeUnmount(() => clearTimeout(cpfTimer))
</script>

<style scoped>
.modal-bg {
  position: fixed;
  top:0; left:0; width:100%; height:100%;
  background: rgba(23,40,64,0.74);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.modal-card {
  background: #183765;
  border-radius: 15px;
  width: 90%;
  max-width: 430px;
  box-shadow: 0 12px 50px #16213a42;
  text-align: center;
  padding: 2.1rem 1.5rem 1.7rem 1.5rem;
}
.modal-title {
  color: #3bc7ff;
  font-weight: 700;
  font-size: 1.16rem;
  margin-bottom: 17px;
}
.modal-card form {
  display: flex;
  flex-direction: column;
}
.modal-card input, .modal-card select {
  padding: 0.57rem 1rem;
  margin-bottom: 14px;
  border-radius: 8px;
  border: 1.2px solid #3b5998;
  background: #25447b;
  color: #fff;
}
.erroInput { border-color: #ff5b5b !important; }
.erro-msg { color: #ff5b5b; font-size: 0.91rem; margin: -8px 0 10px 0; text-align: left; }
.avatar-edit {
  display: flex; flex-direction: column;
  align-items: center; margin-bottom: 18px;
}
.avatar-img {
  width: 70px; height: 70px; border-radius: 50%;
  object-fit: cover; margin-bottom: 5px;
  cursor: pointer;
}
.avatar-upload-text {
  color: #3bc7ff; cursor: pointer;
}
.modal-btns {
  display: flex; gap: 12px; justify-content: center; margin-top: 6px;
}
.modal-btns button {
  padding: 0.62rem 1.09rem; border-radius: 7px; border: none;
  background: linear-gradient(90deg, #32e0ff 30%, #2956a6 100%);
  color: #fff; font-weight: 600; cursor: pointer;
}
.modal-btns button[type="button"] {
  background: #223a5c; color: #d3f5ff;
}
</style>
