# TecMise — Sistema Completo de Gestão Escolar

Bem-vindo ao **TecMise**, uma aplicação web moderna para **gestão escolar** com foco em cadastro, listagem, edição e remoção de estudantes, anos/turmas e perfis de usuário.

Projeto construído utilizando:
- **Frontend:** Vue 3 com Nuxt.js
- **Backend:** Go (Golang, API RESTful)
- **Banco:** PostgreSQL
- **ORM:** sqlc (sugerido)
- **Comunicação:** JSON via API REST

---

## Índice

- [Visão Geral](#visão-geral)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Demonstração Visual](#demonstração-visual)
- [Instalação e Execução](#instalação-e-execução)
- [Padrões e Boas Práticas](#padrões-e-boas-práticas)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Visão Geral

O **TecMise** foi desenvolvido com foco em **experiência do usuário**, performance e código limpo/documentado. O painel principal (dashboard) permite ao usuário:
- Visualizar estudantes por Ano/Turma
- Filtrar, buscar e editar rapidamente informações
- Utilizar modais amigáveis para todas as ações (cadastro, edição, exclusão, visualização ampliada de fotos, logout e perfil)
- Interface responsiva, acessível e visualmente agradável

---

## Principais Funcionalidades

- **Listagem de Estudantes** com ordenação, busca e filtros dinâmicos
- **CRUD Completo** (criar, editar, remover estudantes)
- **Upload de Foto** (avatar para estudantes e usuário)
- **Filtros por Ano/Turma** (dropdown customizado e rápido)
- **Busca Instantânea** (nome/email, com resultados parciais)
- **Modais Padronizados** para todas as ações (altamente reutilizáveis)
- **Perfil de Usuário** com edição de nome e foto
- **Logout Seguro** (modal de confirmação)
- **Responsividade total** (experiência otimizada para desktop e mobile)
- **Validação de dados no frontend e backend** (ex: e-mail, CPF, campos obrigatórios)
- **Documentação extensiva** em todos os componentes Vue

---

## Arquitetura do Projeto

O frontend foi construído em **Vue 3 + Nuxt.js**, e o código é dividido em componentes desacoplados, cada um responsável por uma parte clara da interface:

- `Dashboard.vue` — Página principal, orquestra todos os componentes, mantém o estado global do dashboard.
- `EstudantesTable.vue` — Tabela de estudantes com ordenação e ações.
- `FiltrosEstudante.vue` — Filtro por Ano/Turma.
- `EstudanteModal.vue` — Modal para cadastro/edição de estudante (com upload de foto).
- `ModalAdicionarAno.vue` — Modal para adicionar novo Ano/Turma.
- `PerfilModal.vue` — Modal de edição do perfil do usuário.
- `ConfirmarExclusaoModal.vue` — Modal de confirmação para remover estudante.
- `ConfirmarLogoutModal.vue` — Modal de confirmação para logout.
- `AmpliarFotoModal.vue` — Modal para visualizar foto ampliada do estudante.

> Todos os componentes foram **altamente documentados** e seguem boas práticas de UX, acessibilidade, organização e CSS modularizado (scoped).

---

## Instalação e Execução

### Pré-requisitos

- **Node.js:** v22.17.1 ou superior  
- **npm:** (ou yarn, mas usei npm)
- **Go:** v1.20 ou superior (recomendado para rodar o backend)
- **PostgreSQL:** 12+  
- **sqlc:** para geração do código do ORM no backend

### Como rodar o projeto

#### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/tecmise.git
cd tecmise
````

#### 2. Instale as dependências do frontend

```bash
cd frontend
npm install
```

#### 3. Rode o frontend (modo dev)

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

#### 4. Configure o backend

* Configure variáveis de ambiente do banco (`.env`)
* Gere o código sqlc (ORM)
* Rode o servidor Go

```bash
cd ../backend
go run main.go
```

O backend sobe por padrão em: [http://localhost:8080](http://localhost:8080)

#### 5. Banco de dados

* Crie um banco PostgreSQL, configure os dados de acesso em `.env`
* Execute as migrations/tabelas necessárias (sql fornecido na pasta `/db/migrations` ou conforme modelo no projeto)

---

## Padrões e Boas Práticas

* **Componentização máxima:** cada modal, filtro e tabela é um Vue Component isolado
* **CSS scoped**: estilos 100% encapsulados
* **Documentação em todos os arquivos Vue** (comentários de props, emits, UX, manutenção)
* **UX/Acessibilidade:** modais centralizados, uso de ARIA, foco visual, botões grandes
* **Validação em camada dupla:** tanto frontend quanto backend validam campos críticos

---

## Como contribuir

Pull requests e sugestões são bem-vindos!
Se encontrar bugs, melhorias ou ideias, abra uma issue ou mande um PR.

---

## Licença

Este projeto está sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Sobre o autor

Desenvolvido por \[Luiz Ruan]
Contato: \[[Gmail](mailto:ruansiqueiraandrade@email.com)] | [LinkedIn](https://linkedin.com/in/LuizRuan)

---

> Projeto criado para avaliação técnica, **com foco em código limpo, usabilidade e documentação**.