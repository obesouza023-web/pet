# Backend - Sistema Causa Animal

API REST para o sistema de causa animal.

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Configure as variáveis de ambiente
3. Configure o PostgreSQL

## Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migration
npx prisma migrate dev --name init

# Abrir Prisma Studio
npx prisma studio
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Estrutura

```
src/
├── config/          # Configurações
├── controllers/     # Controladores
├── middleware/      # Middlewares
├── models/          # Modelos (Prisma)
├── routes/          # Rotas
├── utils/           # Utilitários
└── server.js        # Servidor principal
```

## Endpoints Principais

- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/animals` - Listar animais
- `POST /api/calls` - Criar chamado
- `GET /api/dashboard/stats` - Estatísticas

Ver documentação completa em `/docs/API.md`
