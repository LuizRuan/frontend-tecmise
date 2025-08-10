<template>
  <div class="home-container">
    <div class="card">
      <img src="/logo.png" alt="Tecmise" class="logo" />
      <h1 class="title">Bem-vindo</h1>
      <p class="subtitle">
        O sistema completo para gerenciamento escolar com praticidade e eficiência.
      </p>
      <NuxtLink to="/login" class="btn">
        🚀 Entrar no Sistema
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #0d47a1, #1976d2);
}

.card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 450px;
  width: 100%;
}

.logo {
  width: 150px; /* aumentei o tamanho */
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2.2rem;
  color: white;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #e3f2fd;
  margin-bottom: 2rem;
}

.btn {
  background: #1976d2; /* azul no lugar do amarelo */
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  text-decoration: none;
  transition: background 0.3s;
}

.btn:hover {
  background: #1565c0;
}
</style>
