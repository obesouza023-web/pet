require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Segurança ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS — libera o frontend
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting global — 100 req/15min por IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limitar tamanho do body (anti DDoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logs apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Remover header que expõe tecnologia
app.disable('x-powered-by');

// ── Rotas ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/animals', require('./routes/animals.routes'));
app.use('/api/adoptions', require('./routes/adoptions.routes'));
app.use('/api/calls', require('./routes/calls.routes'));
app.use('/api/castrations', require('./routes/castrations.routes'));
app.use('/api/veterinarians', require('./routes/veterinarians.routes'));
app.use('/api/donations', require('./routes/donations.routes'));
app.use('/api/campaigns', require('./routes/campaigns.routes'));
app.use('/api/temporary-homes', require('./routes/temporaryHomes.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// Erro global — nunca expõe stack em produção
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erro interno.' : err.message,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} [${process.env.NODE_ENV}]`);
});
