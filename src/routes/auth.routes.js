const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

// Rate limit específico para auth — 10 tentativas por 15 min por IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitização básica
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"`;\\]/g, '').trim().slice(0, 500);
}

// Validar CPF
function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(nums[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(nums[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(nums[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(nums[10]);
}

// ── CADASTRO ──────────────────────────────────────────────────
router.post('/register', authLimiter, [
  body('nomeCompleto').trim().isLength({ min: 3, max: 100 }).withMessage('Nome inválido'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido'),
  body('senha')
    .isLength({ min: 8 })
    .matches(/[A-Z]/).withMessage('Senha fraca')
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/),
  body('telefone').matches(/^\(\d{2}\) \d{4,5}-\d{4}$/).withMessage('Telefone inválido'),
  body('cpf').custom(v => {
    if (!validarCPF(v)) throw new Error('CPF inválido');
    return true;
  }),
  body('nascimento').isDate().withMessage('Data inválida'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { nomeCompleto, email, senha, telefone, cpf, nascimento, tipo } = req.body;

    // Bloquear criação de admin pelo formulário público
    if (tipo === 'admin') {
      return res.status(403).json({ error: 'Tipo de conta inválido.' });
    }

    // Verificar idade mínima (18 anos)
    const hoje = new Date();
    const nasc = new Date(nascimento);
    const idade = hoje.getFullYear() - nasc.getFullYear();
    if (idade < 18) {
      return res.status(400).json({ error: 'Você deve ter pelo menos 18 anos.' });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');

    // Verificar duplicatas
    const [emailExiste, cpfExiste] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findFirst({ where: { cpf: cpfLimpo } }),
    ]);

    if (emailExiste) return res.status(400).json({ error: 'E-mail já cadastrado.' });
    if (cpfExiste) return res.status(400).json({ error: 'CPF já cadastrado.' });

    const senhaHash = await bcrypt.hash(senha, 12);

    const user = await prisma.user.create({
      data: {
        nomeCompleto: sanitize(nomeCompleto),
        email,
        senhaHash,
        telefone: sanitize(telefone),
        cpf: cpfLimpo,
        tipoUsuario: ['cidadao', 'protetor', 'veterinario', 'empresa'].includes(tipo) ? tipo : 'cidadao',
      },
    });

    const token = jwt.sign(
      { id: user.id, tipo: user.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: user.id, nome: user.nomeCompleto, email: user.email, tipo: user.tipoUsuario },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('senha').isLength({ min: 1 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    const { email, senha } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Sempre comparar hash mesmo se usuário não existe (evita timing attack)
    const senhaFake = '$2a$12$fakehashfakehashfakehashfakehashfakehashfakehash';
    const senhaValida = user
      ? await bcrypt.compare(senha, user.senhaHash || senhaFake)
      : await bcrypt.compare(senha, senhaFake);

    if (!user || !senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    if (user.status !== 'ativo') {
      return res.status(403).json({ error: 'Conta inativa ou bloqueada.' });
    }

    const token = jwt.sign(
      { id: user.id, tipo: user.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, nome: user.nomeCompleto, email: user.email, tipo: user.tipoUsuario },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ── ME ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, nomeCompleto: true, email: true, telefone: true, tipoUsuario: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
