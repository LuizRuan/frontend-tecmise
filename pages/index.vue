<template>
  <div class="home-container">
    <div class="content-box">
      <img src="/ICON.png" alt="Logo TecMise" class="logo" />
      <h1>Bem-vindo ao <span>TecMise</span></h1>
      <p class="subtitle">
        O sistema completo para gerenciamento escolar com praticidade e eficiência.
      </p>
      <NuxtLink to="/login" class="btn-login">
        🚀 Entrar no Sistema
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// Nenhuma lógica extra necessária por enquanto
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #0d47a1, #1976d2);
  color: white;
  font-family: Arial, sans-serif;
}

.content-box {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.logo {
  width: 100px;
  margin-bottom: 20px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

h1 span {
  color: #ffca28;
}

.subtitle {
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.btn-login {
  display: inline-block;
  padding: 12px 25px;
  background: #ffca28;
  color: #0d47a1;
  font-weight: bold;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background: #ffc107;
  transform: scale(1.05);
}
</style>
