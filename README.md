# TecMise — Sistema Completo de Gestão Escolar

Bem-vindo ao **TecMise**, uma solução moderna de cadastro e gestão escolar desenvolvida em **Go**, **PostgreSQL** e **Vue 3/Nuxt**.

---

## ✨ O que é o TecMise?

- Plataforma web para cadastro, edição, exclusão e consulta de estudantes, anos, turmas e perfis de usuário.
- Cada usuário só vê e gerencia seus próprios dados.
- Design responsivo, seguro e fácil de usar.
- Stack 100% open source.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** Vue 3 + Nuxt
- **Backend:** Go (Golang)
- **Banco de Dados:** PostgreSQL
- **Gerenciamento:** pgAdmin (sugestão)
- **Estilo:** TailwindCSS

---

## 📦 Organização do Projeto

```text
/
├── backend/         # Código do backend Go (API, lógica, integração com Postgres)
├── frontend/        # Frontend Vue/Nuxt (dashboard, login, UX/UI)
├── schema.sql       # Script completo para criação das tabelas
├── README.md        # Este arquivo
⚡ Setup Rápido
Clone o repositório:

bash
Copiar
Editar
git clone https://github.com/seuusuario/tecmise.git
cd tecmise
Configure o banco de dados (PostgreSQL):

Instale o PostgreSQL e crie o banco clientes_db.

Execute o script schema.sql no pgAdmin ou psql.

Configure o backend (Go):

Acesse a pasta /backend

Ajuste a string de conexão conforme seu ambiente.

Instale as dependências:

bash
Copiar
Editar
go mod tidy
Inicie o backend:

bash
Copiar
Editar
go run .
O backend roda em http://localhost:8080

Configure o frontend (Vue/Nuxt):

Acesse a pasta /frontend

Instale as dependências:

bash
Copiar
Editar
npm install
Rode o frontend:

bash
Copiar
Editar
npm run dev
O frontend roda em http://localhost:3000

🔗 Documentação Detalhada
Setup e comandos Backend Go

Setup e comandos Frontend Nuxt

Estrutura do Banco de Dados (schema.sql)

👨‍💻 Contato e Suporte
Para dúvidas, sugestões ou bugs, contate a equipe TecMise.
Este projeto é open-source e pode ser adaptado para novas necessidades!