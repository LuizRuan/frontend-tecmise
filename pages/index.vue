<template>
  <div class="center">
    <div class="card">
      <img src="/ICON.png" alt="Logo Tecmise" class="logo-img" />
      <h2 class="title">Bem-vindo</h2>
      <p class="subtitle">
        O sistema completo para gerenciamento escolar com praticidade e eficiência.
      </p>
      <NuxtLink to="/login" class="btn-primary">
        Entrar no Sistema
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// Nenhuma lógica extra necessária
</script>

<style scoped>
.center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #233e6b 70%, #2479cc 100%);
  font-family: 'Montserrat', Arial, sans-serif;
}

.card {
  background: rgba(35, 55, 110, 0.97);
  border-radius: 22px;
  padding: 2.6rem 2.6rem 2.2rem 2.6rem;
  box-shadow: 0 8px 36px #17366a34;
  text-align: center;
  max-width: 440px;
  width: 100%;
  animation: fadein 0.7s;
}

.logo-img {
  width: 290px;
  height: auto;
  margin-bottom: 10px;
}

.title {
  color: #2196f3;
  font-size: 2.4rem;
  margin-bottom: 14px;
}

.subtitle {
  font-size: 1.1rem;
  color: #e0eaf5;
  margin-bottom: 28px;
  opacity: 0.9;
}

.btn-primary {
  display: inline-block;
  padding: 0.9rem 2rem;
  background: linear-gradient(90deg, #33aaff 30%, #256cbb 100%);
  color: #fff;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.19s, transform 0.19s, box-shadow 0.19s;
  box-shadow: 0 2px 18px #19345a44;
}

.btn-primary:hover {
  background: linear-gradient(90deg, #43c8ff 30%, #4185e6 100%);
  transform: scale(1.04);
  box-shadow: 0 8px 28px #0a355f60;
}

@keyframes fadein {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
