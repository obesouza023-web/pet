const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, checkRole } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { especie, sexo, porte, castrado, page = 1, limit = 20 } = req.query;
    
    const where = { status: 'disponivel' };
    if (especie) where.especie = especie;
    if (sexo) where.sexo = sexo;
    if (porte) where.porte = porte;
    if (castrado !== undefined) where.castrado = castrado === 'true';

    const skip = (page - 1) * limit;
    
    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.animal.count({ where })
    ]);

    res.json({
      data: animals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const animal = await prisma.animal.findUnique({
      where: { id: req.params.id },
      include: {
        responsavel: {
          select: { nomeCompleto: true, telefone: true }
        }
      }
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }

    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, checkRole('protetor', 'empresa', 'admin'), async (req, res) => {
  try {
    const animal = await prisma.animal.create({
      data: {
        ...req.body,
        responsavelId: req.userId
      }
    });

    res.status(201).json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, checkRole('protetor', 'empresa', 'admin'), async (req, res) => {
  try {
    const animal = await prisma.animal.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(animal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
