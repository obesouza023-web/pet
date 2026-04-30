const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

const gerarProtocolo = () => {
  return `CH${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, descricao, localizacao, urgencia, fotos, anonimo } = req.body;

    const chamado = await prisma.call.create({
      data: {
        protocolo: gerarProtocolo(),
        tipo,
        descricao,
        localizacao,
        urgencia,
        fotos: fotos || [],
        anonimo,
        denuncianteId: anonimo ? null : req.userId,
        historico: [{
          data: new Date(),
          status: 'recebido',
          observacao: 'Chamado recebido'
        }]
      }
    });

    res.status(201).json(chamado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const chamados = await prisma.call.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(chamados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
