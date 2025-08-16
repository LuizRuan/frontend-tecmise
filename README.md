TecMise — Sistema de Gestão Escolar (Frontend)

Bem-vindo ao TecMise, uma aplicação web moderna para gestão escolar com foco em cadastro, listagem, edição e gerenciamento de estudantes, anos/turmas e perfis de usuário.

🚀 Tecnologias Utilizadas

Frontend: Vue 3 + Nuxt.js

Backend: Go (API RESTful)

Banco: PostgreSQL

ORM: sqlc (no backend)

Comunicação: JSON via API REST

📌 Visão Geral

O TecMise foi desenvolvido para entregar experiência simples e eficiente tanto para escolas quanto para usuários finais.

O Dashboard é o coração do sistema, permitindo:

Listar estudantes com filtros e buscas rápidas

Criar, editar e excluir registros via modais amigáveis

Organizar estudantes por Ano/Turma

Editar perfil do usuário (nome, foto, logout seguro)

Interface responsiva e intuitiva para desktop e mobile

⚡ Funcionalidades

✅ CRUD de Estudantes (nome, e-mail, CPF, telefone, foto, turma/ano)

✅ Filtros por Ano/Turma (dropdown customizado)

✅ Busca em tempo real por nome ou e-mail

✅ Upload de Fotos (usuário e estudante)

✅ Perfil do Usuário com edição de dados

✅ Logout com confirmação

✅ Modais reutilizáveis para todas as ações

✅ Validações front + back (CPF, e-mail, campos obrigatórios)

✅ Responsividade total (desktop, tablet e mobile)

🏗️ Arquitetura do Frontend

O projeto segue componentização máxima com Vue 3 + Nuxt:

Dashboard.vue → Tela principal, gerencia estado global e orquestra modais

EstudantesTable.vue → Listagem e ações sobre estudantes

FiltrosEstudante.vue → Dropdown e filtros de turma/ano

EstudanteModal.vue → CRUD de estudante com upload de foto

ModalAdicionarAno.vue → Criação de novos anos/turmas

PerfilModal.vue → Edição de perfil do usuário

ConfirmarExclusaoModal.vue → Exclusão segura

ConfirmarLogoutModal.vue → Logout seguro

AmpliarFotoModal.vue → Visualização de fotos ampliadas

Todos os componentes possuem documentação em comentários, com props, emits e regras de uso bem descritas.

⚙️ Instalação e Execução
🔑 Pré-requisitos

Node.js: v22.17.1 ou superior

npm (ou yarn)

Go: v1.20+ (para rodar o backend)

PostgreSQL: 12+

Passo a passo
1. Baixe o projeto
[git clone https://github.com/seu-usuario/tecmise.git](https://github.com/LuizRuan/frontend-tecmise)
cd tecmise

2. Instale as dependências do frontend
cd frontend
npm install

3. Rode o frontend em modo desenvolvimento
npm run dev


👉 Acesse em: http://localhost:3000

4. Configure e rode o backend
cd ../backend
go run .


👉 Backend disponível em: http://localhost:8080

5. Configure o banco

Crie um banco PostgreSQL

Ajuste as credenciais no arquivo .env

Rode as migrations fornecidas em /db/migrations

📝 Padrões e Boas Práticas

🔹 Componentização: tudo isolado em Vue Components

🔹 CSS Scoped: cada componente com estilo encapsulado

🔹 Documentação clara: comentários em PT-BR nos arquivos

🔹 Acessibilidade: foco visual, botões grandes, ARIA tags

🔹 Validação dupla: frontend e backend validam dados críticos

🤝 Contribuição

Contribuições são bem-vindas!

Abra uma issue para sugestões ou bugs

Envie um pull request com melhorias

📄 Licença

Projeto licenciado sob a MIT License — veja o arquivo LICENSE.

👤 Autor

Desenvolvido por Luiz Ruan
 | 🌐 [LinkedIn](https://www.linkedin.com/in/ruan-andrade-a16083346/)

✨ TecMise — Gestão escolar mais conectada, moderna e eficiente.
