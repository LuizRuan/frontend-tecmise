<template>
  <!--
    =====================================================================
    📄 index.vue — Landing / Página inicial
    =====================================================================
    🎯 Objetivo
      - Exibir um cartão centralizado com a identidade da Tecmise.
      - Apresentar título, subtítulo e um CTA ("Entrar") que leva ao /login.

    🧭 Estrutura do Template
      - <div.center>   -> Contêiner de tela inteira com o gradiente de fundo.
      - <div.card>     -> Cartão com logo, título, subtítulo e botão.
      - <NuxtLink ...> -> Link de roteamento do Nuxt para /login (SPA: sem reload).

    ♿ Acessibilidade (A11Y)
      - Imagem possui atributo alt descritivo: "Logo Tecmise".
      - Hierarquia de títulos simples (<h2>): suficiente para uma landing minimalista.
      - Contraste: textos claros sobre fundo escuro + CTA com alto contraste.

    🧩 Observações de Componente
      - Este arquivo é um Single File Component (SFC) do Vue 3.
      - O script usa <script setup>, mais enxuto e com tree-shaking automático.
      - A fonte é injetada dinamicamente no onMounted para manter compat com seu padrão atual.

    🧪 Como testar rapidamente
      1) Rode o projeto (ex.: npm run dev).
      2) Acesse http://localhost:3000/
      2) Clique em "Entrar": deve navegar para "/login" sem recarregar a página.

    🛠️ Nota para seniors
      - Carregamento da fonte via DOM API no onMounted evita mexer no nuxt.config.ts.
        Em produção, prefira <link rel="preconnect"> + inclusão estática no head
        para reduzir FOUT/FOIT e melhorar performance (ver comentários no <script>).
      - CSS com escopo (scoped) evita vazamento de estilos.
  -->
  <div class="center">
    <div class="card">
      <!-- 🖼️ Identidade visual: imagem do logotipo -->
      <img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />

      <!-- 🧷 Headline principal -->
      <h2 class="title">Bem-vindo</h2>

      <!-- 📝 Mensagem curta de valor/produto -->
      <p class="subtitle">
        O sistema completo para gerenciamento escolar com praticidade e eficiência.
      </p>

      <!--
        🚪 CTA (Call To Action)
        - Usa <NuxtLink> para navegação client-side (sem recarregar a página).
        - A classe .cta-btn replica a animação/estilo do login.vue.
      -->
      <NuxtLink to="/login" class="cta-btn">Entrar</NuxtLink>
    </div>
  </div>
</template>

<script setup>
/*
  ============================================================================
  🧠 <script setup>
  ============================================================================
  Por que usar?
    - Sintaxe concisa do Vue 3: reduz boilerplate.
    - Variáveis e imports são tratados como escopo do componente automaticamente.
    - Melhora tree-shaking e otimização.

  📚 Sobre a fonte:
    - Mantemos o comportamento existente: injetar a fonte "Poppins" em runtime.
    - Vantagem: não requer alterar nuxt.config.ts ou <head>.
    - Trade-off: pode ocorrer FOUT/FOIT (flash sem/ com fonte).
      👉 Para produção recomendável:
         - Incluir no head via nuxt.config.ts (css/head) ou app.html
         - Usar <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
         - Font-display: swap (já padrão no Google Fonts)
*/
import { onMounted } from 'vue'

onMounted(() => {
  // Cria dinamicamente a tag <link> para carregar a família "Poppins"
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'
  link.rel = 'stylesheet'

  // Anexa no <head>. Em SSR, executa somente no cliente (onMounted).
  document.head.appendChild(link)
})
</script>

<style scoped>
/* ==========================================================================
   🎨 Estilização com escopo (scoped)
   - Garante que as classes afetem apenas este componente.
   - Mantém seu design original: NÃO alteramos valores, apenas comentamos.
   ========================================================================== */

/* ===========================
   🧱 Layout base de fundo
   - Centraliza o cartão vertical e horizontalmente.
   - Aplica o gradiente de marca ao fundo da página.
   =========================== */
.center {
  min-height: 100vh;  /* ocupa 100% da altura da viewport */
  display: flex;       /* ativa flexbox para centralização */
  align-items: center; /* eixo vertical */
  justify-content: center; /* eixo horizontal */
  background: linear-gradient(135deg, #233e6b 70%, #2479cc 100%);
  /* Família primária + fallbacks seguros do sistema */
  font-family: "Poppins", system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Arial, sans-serif;
}

/* ===========================
   🗂️ Card/ Container do conteúdo
   - Fundo semitransparente, bordas arredondadas e sombra suave.
   - Largura máxima para boa legibilidade em telas grandes.
   - Animação de entrada sutil (fadein).
   =========================== */
.card {
  background: rgba(35, 55, 110, 0.97);
  border-radius: 22px;
  padding: 3rem 3rem 2.4rem;
  box-shadow: 0 8px 36px #17366a34;
  text-align: center;
  width: 100%;
  max-width: 560px;
  animation: fadein 0.7s;

  /* Layout interno em coluna para alinhar logo, títulos e CTA */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===========================
   🖼️ Logo
   - Mantém proporção e espaçamento inferior mínimo.
   =========================== */
.logo-img {
  width: 320px;  /* dimensionamento fixo adequado ao card */
  height: auto;  /* mantém proporção da imagem */
  display: block;
  margin-bottom: 8px;
}

/* ===========================
   🏷️ Título principal
   - Tipografia com impacto (peso 700).
   - Margens sutis para equilíbrio visual com a logo.
   =========================== */
.title {
  color: #ffffff;
  font-weight: 700;
  font-size: 2rem;
  margin: -2px 0 14px;
}

/* ===========================
   📝 Subtítulo/Descrição curta
   - Texto um pouco menor, com leve transparência para hierarquia visual.
   =========================== */
.subtitle {
  font-size: 1.02rem;
  color: #ffffff;
  opacity: 0.9;
  margin: -4px 0 22px;
}

/* ==========================================================================
   🔘 Botão "Entrar" — mesmo comportamento visual do login.vue
   - Gradiente horizontal + sombra.
   - Efeito "lift" (levanta no hover).
   - Brilho deslizante com pseudo-elemento ::after + @keyframes shine.
   - Largura 100% para ocupar o card com conforto em mobile.
   ========================================================================== */
.cta-btn{
  width: 100%;
  padding: .95rem 0;                 /* altura equivalente ao login.vue */
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.08rem;
  color: #fff;
  background: linear-gradient(90deg, #33aaff 30%, #256cbb 100%);
  box-shadow: 0 3px 14px rgba(13,51,94,.35);
  text-decoration: none;  /* garante estilo de botão, não de link */
  text-align: center;
  cursor: pointer;

  /* Necessários para o brilho "correr" dentro do botão */
  position: relative;
  overflow: hidden;

  /* Transições suaves para hover/foco */
  transition: transform .15s, box-shadow .15s;
}

/* ✨ Fita de brilho
   - Pseudo-elemento fora da tela que cruza o botão quando hover ativa a animação. */
.cta-btn::after{
  content:"";
  position:absolute;
  top:-120%;
  left:-30%;
  width:60%;
  height:300%;
  background:linear-gradient(
    115deg,
    rgba(255,255,255,0) 10%,
    rgba(255,255,255,.55) 45%,
    rgba(255,255,255,0) 70%
  );
  transform: rotate(25deg) translateX(-120%);
}

/* 🖱️ Interação no hover: leve "lift" + inicia o brilho */
.cta-btn:hover{
  transform: translateY(-1px);
  box-shadow: 0 8px 26px rgba(10,53,95,.45);
}
.cta-btn:hover::after{
  animation: shine .9s ease-out;
}

/* ▶️ Animação do brilho: move a faixa diagonalmente de esquerda p/ direita */
@keyframes shine{
  to { transform: rotate(25deg) translateX(240%); }
}

/* 🌫️ Animação de entrada do card: fade + deslocamento sutil para cima */
@keyframes fadein {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
