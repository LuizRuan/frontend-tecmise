  <!--
    PerfilModal.vue

    🎯 **Responsabilidade**:
      - Modal para edição do perfil do usuário logado.
      - Permite alterar nome e foto do usuário. O e-mail é exibido mas é apenas leitura (readonly).
      - Permite logout do sistema.

    📦 **Como funciona**:
      - Controlado pelo pai via prop `show`.
      - Recebe e manipula um objeto `form` (nome, email, fotoUrl).
      - Apresenta mensagens de erro por prop (erro/erros).
      - Upload de foto manipulado internamente (converte para base64 para preview imediato).
      - Emite eventos para salvar, fechar, logout e update de campos.

    📥 **Props**:
      - show: Boolean        — controla exibição do modal.
      - form: Object         — modelo do formulário: { nome, email, fotoUrl }.
      - erros: Object        — mapa de erros para os campos (ex: { nome: "Obrigatório" }).
      - erro: String         — erro geral (ex: do backend).
      - defaultAvatar: String — url do avatar padrão.

    📤 **Emits**:
      - salvar           — usuário clicou "Salvar" (quem persiste é o pai).
      - fechar           — usuário clicou "Cancelar" ou fora do modal.
      - logout           — usuário clicou em "Sair da conta".
      - update:form      — não utilizado diretamente aqui, mas disponível para reatividade controlada.
      - update:erros     — idem acima.

    💡 **Princípios e boas práticas**:
      - **Stateless**: Não guarda estado relevante, apenas manipula/reflete dados do pai.
      - **UX**: Fecha ao clicar fora, visual limpo, campo readonly para email (evita erros de edição).
      - **Acessibilidade**: role/aria-label, fácil navegação por tab.
      - **Preview Instantâneo**: upload de imagem mostra preview imediato via base64.
      - **Extensível**: fácil adicionar campos, senhas, etc.

    🚩 **Atenção**:
      - O avatar é convertido para base64 apenas para exibir, o pai decide se salva em base64, faz upload, etc.
      - Validação e persistência dos dados ficam a cargo do pai.

    📋 **Projeto: TecMise - Gestão Escolar**
  -->

  <template>
    <!-- Modal de edição de perfil do usuário -->
    <transition name="modal">
      <div
        v-if="show"
        class="modal-bg"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        aria-label="Modal de edição de perfil"
        @click.self="onFechar"
      >
        <div class="modal-card" @click.stop>
          <h3 class="modal-title">Editar Perfil</h3>
          <!-- Mensagem de erro, se houver -->
          <p v-if="erro" class="erro-msg">{{ erro }}</p>

          <form @submit.prevent="onSalvar">
            <!-- Upload/avatar -->
            <div class="avatar-edit">
              <label for="foto-perfil">
                <img :src="form.fotoUrl || defaultAvatar" class="avatar-img" alt="Foto de perfil" />
                <input id="foto-perfil" type="file" accept="image/*" @change="onFotoPerfilChange" style="display:none" />
              </label>
              <span class="avatar-upload-text" @click="dispararInputPerfil()">Alterar foto</span>
            </div>

            <!-- Nome do usuário -->
            <input
              v-model="form.nome"
              type="text"
              placeholder="Nome de usuário"
              required
              autocomplete="off"
              :class="{ erroInput: !!erros.nome }"
              @input="erros.nome = ''"
            />
            <p v-if="erros.nome" class="erro-msg">{{ erros.nome }}</p>

            <!-- E-mail do usuário (readonly) -->
            <input
              v-model="form.email"
              type="email"
              placeholder="Seu e-mail"
              readonly
              tabindex="-1"
              style="background: #1b335a; color: #91cfff; opacity:0.95; cursor: not-allowed;"
            />

            <p v-if="erros.email" class="erro-msg">{{ erros.email }}</p>

            <div class="modal-btns">
              <button type="submit">Salvar</button>
              <button type="button" @click="onFechar">Cancelar</button>
            </div>
            <button class="logout-btn" type="button" @click="onLogout">Sair da conta</button>
          </form>
        </div>
      </div>
    </transition>
  </template>

  <script setup>
  /**
   * PerfilModal.vue
   *
   * Modal controlado por props, apenas emite eventos para o pai manipular lógica.
   * Props:
   *  - show: Boolean (visibilidade)
   *  - form: Object (modelo de dados)
   *  - erros: Object (mapa de erros por campo)
   *  - erro: String (erro geral)
   *  - defaultAvatar: String (url do avatar padrão)
   * Emits:
   *  - salvar
   *  - fechar
   *  - logout
   *  - update:form
   *  - update:erros
   */

  const props = defineProps({
    show: Boolean,
    form: Object,
    erros: Object,
    erro: String,
    defaultAvatar: {
      type: String,
      default: "https://ui-avatars.com/api/?background=2db6ff&color=fff&name=U"
    }
  })

  const emit = defineEmits(['salvar', 'fechar', 'logout', 'update:form', 'update:erros'])

  /**
   * Atualiza avatar ao selecionar arquivo
   * Mostra preview instantâneo (base64)
   */
  function onFotoPerfilChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert("A imagem deve ter até 5MB!"); return }
    const reader = new FileReader()
    reader.onload = (evt) => { props.form.fotoUrl = evt.target.result }
    reader.readAsDataURL(file)
  }

  /** Dispara clique no input escondido de avatar */
  function dispararInputPerfil() {
    document.getElementById('foto-perfil')?.click()
  }

  /** Emite evento para salvar alterações */
  function onSalvar() {
    emit('salvar')
  }
  /** Emite evento para fechar/cancelar */
  function onFechar() {
    emit('fechar')
  }
  /** Emite evento de logout (sair da conta) */
  function onLogout() {
    emit('logout')
  }
  </script>
  <style scoped>
  /* Overlay do modal, cobre tela toda */
  .modal-bg {
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(23,40,64,0.74);
    display: flex; align-items: center; justify-content: center;
    z-index: 99;
  }
  /* Card centralizado, fundo, sombra, padding */
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
  .modal-card form {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .modal-card input, .modal-card select {
    width: 100%; box-sizing: border-box;
    padding: 0.57rem 1rem;
    margin-bottom: 14px;
    border-radius: 8px;
    border: 1.2px solid #3b5998;
    background: #25447b;
    color: #fff;
    font-size: 0.97rem;
    outline: none;
    transition: border .19s, background .19s;
  }
  .modal-card input::placeholder { color: #a2cfff; }
  .modal-card input:focus, .modal-card select:focus { border-color: #3bc7ff; }
  .erroInput { border-color: #ff5b5b !important; }
  .erro-msg { color: #ff5b5b; font-size: 0.91rem; margin: -8px 0 10px 0; text-align: left; }
  .avatar-edit {
    display: flex; flex-direction: column;
    align-items: center; margin-bottom: 18px;
  }
  .avatar-img {
    width: 70px; height: 70px; border-radius: 50%;
    object-fit: cover; margin-bottom: 5px;
    border: 3px solid #36c5ff44;
    background: #193255; cursor: pointer;
  }
  .avatar-upload-text {
    color: #3bc7ff; font-size: 0.96rem;
    cursor: pointer; transition: color .16s;
  }
  .avatar-upload-text:hover { color: #fff; }
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
  .modal-btns button[type="button"] { background: #223a5c; color: #d3f5ff;}
  .modal-btns button[type="button"]:hover { background: #335e97; color: #fff; }
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
    transition: background .17s, color .16s;
  }
  .logout-btn:hover {
    background: #ff5b5b;
    color: #fff;
  }
  </style>