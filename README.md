# 💸 Organizador Financeiro

Um site de **organização financeira** para ajudar o usuário a controlar entradas, saídas e visualizar seu saldo de forma simples e intuitiva.

---

## 🚀 Tecnologias utilizadas

- **Front-end:** React  
- **Back-end:** Node.js + Express  
- **Banco de Dados:** PostgreSQL (com Prisma ou Sequelize)  
- **Autenticação:** JWT (JSON Web Token)  
- **Gráficos:** Recharts ou Chart.js  

---

## ⚙️ Funcionalidades principais

- Cadastro e login de usuários  
- Adição de receitas e despesas  
- Categorias personalizáveis  
- Dashboard com resumo financeiro  
- Filtros por mês e categoria  
- Exportação de dados  

---

## 🧩 Estrutura do Projeto

```
Organizador-financeiro/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Lógica das rotas
│   │   ├── routes/             # Definição de rotas da API
│   │   ├── models/             # Modelos do banco de dados
│   │   ├── middlewares/        # Autenticação, erros, etc.
│   │   ├── config/             # Configurações (DB, JWT)
│   │   └── server.js           # Ponto de entrada do servidor
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/              # Páginas principais
│   │   ├── services/           # Comunicação com a API
│   │   ├── styles/             # Estilos globais
│   │   └── App.jsx             # Ponto de entrada do React
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
# Organizador Financeiro — instruções rápidas

Este repositório contém a API (Node + Express) do Organizador Financeiro. O projeto usa Prisma como ORM e o cliente Prisma está centralizado em `src/lib/prisma.js`.

Resumo rápido:

- Servidor: `src/app.js` (Express)
- Cliente Prisma central: `src/lib/prisma.js`
- Rotas: `src/routes/` (users, categories, transactions)
- Modelos: `src/models/` (usando Prisma)
- Scripts úteis: `scripts/` (migrações, seeds, checagens)

## Requisitos
- Node.js (v16+; recomendado v18+)
- PostgreSQL

## Variáveis de ambiente
Crie um arquivo `.env` na raiz com pelo menos:

```
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=senha
PGDATABASE=meu_banco
PGPORT=5432
DATABASE_URL="postgresql://postgres:senha@localhost:5432/meu_banco?schema=public"
JWT_SECRET=uma_chave_secreta
PORT=3000
```

OBS: `DATABASE_URL` é usada pelo Prisma; os `PG*` são uma conveniência histórica, mas apenas `DATABASE_URL` é estritamente necessária para Prisma.

## Como rodar (PowerShell)

```powershell
npm install
npm run dev
```

API estará em `http://localhost:3000` por padrão.

## Scripts (exemplos)

- Inserir categorias de exemplo (confirmação requerida):
	node scripts/seed_categories.js --yes
- Criar tabelas via SQL (executa SQL bruto via Prisma):
	node scripts/create_categories.js
	node scripts/create_transactions.js
- Checar tabelas/contagens:
	node scripts/check_categories.js
	node scripts/check_transactions.js
- Atribuir seeds ao usuário de teste:
	node scripts/assign_seeds_to_test_user.js
- Limpar usuários (perigoso):
	node scripts/clear_users.js --yes

## Observações
- Todos os scripts e o runtime usam o cliente Prisma central (`src/lib/prisma.js`).
- Migrations SQL em `scripts/*.sql` são executadas com `prisma.$executeRawUnsafe` / `$queryRawUnsafe` — adequado para scripts controlados, não para entrada do usuário.
- `src/app.js` possui hooks de shutdown que chamam `prisma.$disconnect()`.

Se quiser, eu posso:
- apagar `pg` do `package-lock.json` (executando `npm install` para regenerar),
- adicionar um pequeno README mais extenso ou instruções Docker,
- ou adicionar testes de integração (jest + supertest).

---
Peça qualquer ajuste e eu aplico.

## Docker / Compose
Há um `docker-compose.yml` na raiz que já fornece um serviço PostgreSQL configurado para desenvolvimento:

```yaml
services:
	db:
		image: postgres:16
		environment:
			POSTGRES_USER: postgres
			POSTGRES_PASSWORD: 123456
			POSTGRES_DB: meu_banco
		ports:
			- "5432:5432"
		volumes:
			- ./data:/var/lib/postgresql/data
```

Para subir apenas o Postgres (no PowerShell):

```powershell
docker compose up -d
```

Depois de o DB estar pronto, rode as migrations/seeds descritas nesta README.

## Exemplos rápidos (curl)
Login (gera token JWT):

```bash
curl -X POST http://localhost:3000/users/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"seed.user+test@local","password":"Test@1234"}'
```

Criar transação (substitua <TOKEN> pelo token retornado no login):

```bash
curl -X POST http://localhost:3000/transactions \
	-H 'Content-Type: application/json' \
	-H "Authorization: Bearer <TOKEN>" \
	-d '{"descricao":"Teste curl","valor":"10.5","tipo":"despesa"}'
```

Listar transações:

```bash
curl -X GET http://localhost:3000/transactions \
	-H "Authorization: Bearer <TOKEN>"
```

## Testando com Insomnia / Postman
- Você pode importar `insomnia/organizador_insomnia_export.json` (arquivo já presente no repositório) para rodar as requisições de exemplo.
- Ajuste a variável de ambiente de host/baseUrl para `http://localhost:3000` e adicione o token nas requisições que precisam de autenticação.

## Seeds e ordem sugerida
1. Suba o Postgres (docker compose up -d) ou garanta que o DB esteja acessível.
2. Rode as migrations (os scripts que executam os SQLs):
	 - `node scripts/create_categories.js`
	 - `node scripts/create_transactions.js`
3. Rode o seed de categorias (confirme com `--yes`):
	 - `node scripts/seed_categories.js --yes`
4. Crie/atribua o usuário de teste e associe categorias:
	 - `node scripts/assign_seeds_to_test_user.js`

Isso garante que as tabelas existam antes de inserir seeds.
