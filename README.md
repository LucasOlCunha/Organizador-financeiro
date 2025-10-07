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
```

---

## 🧑‍💻 Como rodar o projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/LucasOlCunha/Organizador-financeiro.git
cd Organizador-financeiro
```

### 2. Instalar dependências
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` dentro da pasta **backend**:
```
DATABASE_URL=postgres://usuario:senha@localhost:5432/organizador
JWT_SECRET=sua_chave_secreta
PORT=5000
```

E outro dentro da pasta **frontend**:
```
VITE_API_URL=http://localhost:5000
```

### 4. Executar o projeto
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

---

## 👨‍💻 Autor

**Lucas Cunha**  
📞 WhatsApp: (35) 99721-9444  
💬 Projeto pessoal de aprendizado e prática de desenvolvimento fullstack.
