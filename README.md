# Nuxt Minimal Starter + Go Backend

See the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## ⚠️ Atenção

> **Este frontend depende do backend em Go rodando em http://localhost:8080**  
> Certifique-se de rodar o backend ANTES de iniciar o frontend.

## Backend — Como rodar

1. Instale o Go e o PostgreSQL, configure conforme seu ambiente.
2. No terminal, entre na pasta do backend e execute:

```bash
cd backend
go run .
O backend ficará disponível em http://localhost:8080.

Frontend — Setup
Make sure to install dependencies:

bash
Copiar
Editar
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
Development Server
Start the development server on http://localhost:3000:

bash
Copiar
Editar
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
Production
Build the application for production:

bash
Copiar
Editar
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
Locally preview production build:

bash
Copiar
Editar
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
Check out the deployment documentation for more information.

markdown
Copiar
Editar

**Resumindo:**  
- Siga o mesmo modelo clean  
- Destaque logo no começo sobre rodar o backend  
- Inclua o passo do Go  
- Resto igual ao template Nuxt.
