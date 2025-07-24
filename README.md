# TecMise — Sistema Completo de Gestão Escolar

Bem-vindo ao **TecMise**, um sistema de cadastro e gerenciamento de estudantes, anos, turmas e perfis de usuário.  
O projeto utiliza **Go** no backend, **PostgreSQL** para banco de dados e **Vue 3/Nuxt** no frontend.  
Pensado para produtividade, segurança e experiência do usuário.

---

## Índice

- [Visão Geral do Projeto](#visão-geral-do-projeto)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Arquitetura Geral](#arquitetura-geral)
- [1. Banco de Dados (PostgreSQL)](#1-banco-de-dados-postgresql)
    - [Scripts e Estrutura](#scripts-e-estrutura)
    - [Relacionamentos e Integridade](#relacionamentos-e-integridade)
- [2. Backend (Go)](#2-backend-go)
    - [Endpoints e Lógica de Negócio](#endpoints-e-lógica-de-negócio)
    - [Fluxo de Autenticação](#fluxo-de-autenticação)
    - [Boas Práticas de Segurança](#boas-práticas-de-segurança)
    - [Logs e Debug](#logs-e-debug)
- [3. Frontend (Vue 3/Nuxt)](#3-frontend-vue-3nuxt)
    - [Fluxo do Usuário na Prática](#fluxo-do-usuário-na-prática)
    - [Persistência Local e Experiência](#persistência-local-e-experiência)
    - [Detalhes de UX/UI](#detalhes-de-uxui)
- [Setup Completo](#setup-completo)
- [Dúvidas Frequentes](#dúvidas-frequentes)
- [Possíveis Melhorias Futuras](#possíveis-melhorias-futuras)
- [Contato e Suporte](#contato-e-suporte)

---

## Visão Geral do Projeto

O **TecMise** resolve um problema real de gestão de informações em ambientes escolares, conectando as partes pedagógica, tecnológica e de gestão em uma plataforma acessível e moderna.

- **Totalmente integrado:** Usuário cadastra e gerencia seus estudantes, turmas e anos, com segurança.
- **Multiusuário:** Cada usuário só vê e altera seus próprios dados.
- **Experiência fluida:** Tudo pensado para ser fácil de usar e personalizar.

---

## Principais Funcionalidades

- Cadastro e login de usuários, com nome completo, e-mail único e senha forte.
- Recuperação de dados do usuário na autenticação (nome e e-mail vão do banco direto para o frontend).
- Painel administrativo (dashboard) moderno e responsivo.
- Cadastro, edição, exclusão e listagem de estudantes vinculados ao usuário logado.
- Cadastro de fotos para perfil do usuário e do estudante.
- Cadastro de turmas e anos escolares, com filtros inteligentes.
- Validação avançada de dados no frontend e backend.
- Hash seguro de senhas com bcrypt.
- Integração total entre backend Go e frontend Vue/Nuxt.

---

## Arquitetura Geral

+-------------------+ HTTP REST API +--------------------+
| Frontend | <-----------------------> | Backend (Go) |
| Vue 3 + Nuxt | | REST + SQL/PG |
+-------------------+ SQL Queries +--------------------+
| Banco de Dados |
| PostgreSQL |
+---------------------------+

pgsql
Copiar
Editar

---

## 1. Banco de Dados (PostgreSQL)

### Scripts e Estrutura

Você encontra o script completo em `schema.sql`.  
**Principais tabelas:**

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha_hash VARCHAR(300) NOT NULL
);

CREATE TABLE IF NOT EXISTS estudantes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(200) NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(32),
    foto_url TEXT,
    ano_id INTEGER NOT NULL,
    turma_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS turmas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(10) NOT NULL,
    ano_id INTEGER NOT NULL REFERENCES anos(id) ON DELETE CASCADE
);

-- Popula anos e turmas de exemplo
INSERT INTO anos (nome) VALUES ('6º ano'), ('7º ano') ON CONFLICT DO NOTHING;
INSERT INTO turmas (nome, ano_id) VALUES ('A', 1), ('B', 1), ('A', 2) ON CONFLICT DO NOTHING;
Relacionamentos e Integridade
usuarios: guarda todos os usuários do sistema (cada um com e-mail único e nome obrigatório).

estudantes: cada registro tem um usuário associado (usuario_id), mantendo isolamento dos dados.

anos e turmas: pré-cadastrados para facilitar filtros e organização.

Integridade:

Se um usuário for deletado, todos os seus estudantes são excluídos automaticamente (ON DELETE CASCADE).

2. Backend (Go)
O backend é responsável por toda a lógica de negócio, autenticação, comunicação com o banco e exposição dos endpoints HTTP.

Endpoints e Lógica de Negócio
Principais rotas implementadas:

POST /register
Recebe { nome, email, senha }, valida, faz hash da senha, salva no banco.

POST /login
Recebe { email, senha }, valida, verifica hash, retorna dados do usuário (id, nome, email).

POST /estudantes
Recebe dados de estudante + usuário, salva estudante vinculado ao usuário logado.

Outros endpoints podem ser facilmente adicionados para listar, editar ou deletar estudantes.

Exemplo de Handler de Cadastro
go
Copiar
Editar
func registerHandler(w http.ResponseWriter, r *http.Request) {
    // ... leitura do JSON
    // ... validação
    _, err = db.Exec("INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)", req.Nome, req.Email, string(hashed))
    // ... resposta de sucesso/erro
}
Exemplo de Handler de Login
go
Copiar
Editar
func loginHandler(w http.ResponseWriter, r *http.Request) {
    var id int
    var nome, senhaHash string
    err = db.QueryRow("SELECT id, nome, senha_hash FROM usuarios WHERE email=$1", req.Email).Scan(&id, &nome, &senhaHash)
    // ... compara hash, retorna { id, email, nome }
}
Fluxo de Autenticação
Cadastro: e-mail único, senha forte, nome obrigatório.

Login: busca usuário pelo e-mail, compara hash da senha, retorna nome e id.

Persistência: dados básicos do usuário ficam no localStorage do navegador.

Boas Práticas de Segurança
Senhas nunca ficam salvas em texto puro (sempre hash).

E-mails e nomes são validados no backend e frontend.

Requisições entre frontend e backend liberadas por CORS (mas podem ser restritas no futuro).

SQL Injection protegido com queries parametrizadas.

Logs e Debug
Todos os erros relevantes são logados no terminal para fácil rastreamento.

Requisições sensíveis são logadas com detalhes em modo desenvolvimento.

3. Frontend (Vue 3/Nuxt)
Totalmente moderno e responsivo, pensado para performance e experiência do usuário.

Fluxo do Usuário na Prática
Register.vue: usuário preenche nome, e-mail, senha, faz requisição para /register.

Login.vue: autenticação, armazena nome, id e e-mail localmente, redireciona para dashboard.

Dashboard.vue: busca, exibe e gerencia estudantes vinculados ao usuário logado. Filtros por ano e turma, modais para edição e cadastro, exibição do nome do usuário logado e foto.

Exemplo de Uso de LocalStorage
js
Copiar
Editar
// Após login bem sucedido
localStorage.setItem('usuario', JSON.stringify({
  id: data.id,
  email: data.email,
  nome: data.nome
}))
Persistência Local e Experiência
O nome do usuário sempre aparece no topo da dashboard, lido do banco no login.

Alterações no perfil são salvas no banco e atualizadas localmente.

Ao cadastrar um estudante, sempre é enviado o usuario_id correto.

Detalhes de UX/UI
Interface inspirada em aplicações de alto padrão, com cores, animações e responsividade.

Feedback visual para erros, carregamento, ações bem sucedidas.

Upload de foto com preview imediato.

Tabela dinâmica de estudantes com filtros por ano e turma.

Setup Completo
1. Banco de Dados
Crie o banco no PostgreSQL (ex: clientes_db).

Execute o script schema.sql para criar e popular tabelas.

2. Backend
Edite sua string de conexão em db.go conforme seu ambiente.

Rode:

bash
Copiar
Editar
go mod tidy
go run main.go db.go
O backend vai rodar em http://localhost:8080.

3. Frontend
Instale as dependências:

bash
Copiar
Editar
npm install
Rode o servidor de desenvolvimento:

bash
Copiar
Editar
npm run dev
Frontend em http://localhost:3000.

Dúvidas Frequentes
O nome não aparece no dashboard?
Confirme que o campo nome está sendo enviado no cadastro e recebido na resposta do login.
Confira também se o banco está populado corretamente (coluna nome não null).

Cadastro de estudante não fica salvo?
Verifique se está sendo enviado o usuario_id ao backend e se não há erros de requisição no console.

Senhas não funcionam?
Confirme se o hash está sendo salvo e validado corretamente (campo senha_hash).

Fotos não aparecem?
As fotos são salvas como URL/Base64 no frontend (padrão para uso local). Para produção, sugere-se salvar arquivos em storage externo.

Possíveis Melhorias Futuras
Sistema de permissões por perfil (admin, professor, aluno).

Edição avançada de perfil do usuário (troca de senha, foto persistente, etc).

Autenticação JWT para APIs seguras e escaláveis.

Recuperação de senha por e-mail.

Dashboard para administradores (gestão geral).

Exportação/importação de dados.

Deploy na nuvem com Docker e CI/CD.

Testes automatizados e documentação das APIs via Swagger.

Contato e Suporte
Para dúvidas, sugestões ou bugs, entre em contato pela equipe TecMise.
Projeto desenvolvido para aprendizado, produtividade e qualidade!