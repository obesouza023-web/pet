const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();

// Configuração do Multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/animais/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'animal-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas!'));
  }
});

// ── LISTAR ANIMAIS ────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { especie, status, sexo, porte, castrado, vacinado, bairro } = req.query;

    const where = {};
    if (especie) where.especie = especie.toLowerCase();
    if (status) where.status = status.toLowerCase().replace(/ /g, '_');
    if (sexo) where.sexo = sexo.toLowerCase();
    if (porte) where.porte = porte.toLowerCase();
    if (castrado !== undefined) where.castrado = castrado === 'true';
    if (bairro) where.localizacao = { path: ['bairro'], string_contains: bairro };

    const animais = await prisma.animal.findMany({
      where,
      include: {
        responsavel: {
          select: { id: true, nomeCompleto: true, telefone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(animais);
  } catch (error) {
    console.error('Erro ao listar animais:', error);
    res.status(500).json({ error: 'Erro ao listar animais' });
  }
});

// ── BUSCAR ANIMAL POR ID ──────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        responsavel: {
          select: { id: true, nomeCompleto: true, telefone: true, email: true }
        },
        adocoes: {
          include: {
            usuario: {
              select: { id: true, nomeCompleto: true, telefone: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }

    res.json(animal);
  } catch (error) {
    console.error('Erro ao buscar animal:', error);
    res.status(500).json({ error: 'Erro ao buscar animal' });
  }
});

// ── CADASTRAR ANIMAL ──────────────────────────────────────────
router.post('/', authMiddleware, upload.array('fotos', 10), async (req, res) => {
  try {
    const {
      nome, especie, raca, sexo, idadeAproximada, porte, peso, cor, pelagem,
      descricao, historia, temperamento, saude, castrado, vermifugado,
      compativelCriancas, compativelAnimais, status, localizacao
    } = req.body;

    // Validações
    if (!nome || !especie || !sexo || !idadeAproximada || !porte) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // Processar fotos
    const fotos = req.files ? req.files.map(f => `/uploads/animais/${f.filename}`) : [];

    const animal = await prisma.animal.create({
      data: {
        nome,
        especie: especie.toLowerCase(),
        raca,
        sexo: sexo.toLowerCase(),
        idadeAproximada,
        porte: porte.toLowerCase(),
        peso: peso ? parseFloat(peso) : null,
        cor,
        fotos: JSON.stringify(fotos),
        descricao,
        historia,
        temperamento: temperamento ? JSON.parse(temperamento) : null,
        saude: saude ? JSON.parse(saude) : null,
        castrado: castrado === 'true' || castrado === true,
        vermifugado: vermifugado === 'true' || vermifugado === true,
        compativelCriancas: compativelCriancas !== 'false',
        compativelAnimais: compativelAnimais !== 'false',
        status: status ? status.toLowerCase().replace(/ /g, '_') : 'disponivel',
        localizacao: localizacao ? JSON.parse(localizacao) : null,
        responsavelId: req.userId
      },
      include: {
        responsavel: {
          select: { id: true, nomeCompleto: true }
        }
      }
    });

    res.status(201).json(animal);
  } catch (error) {
    console.error('Erro ao cadastrar animal:', error);
    res.status(500).json({ error: 'Erro ao cadastrar animal', details: error.message });
  }
});

// ── ATUALIZAR ANIMAL ──────────────────────────────────────────
router.put('/:id', authMiddleware, upload.array('fotos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, especie, raca, sexo, idadeAproximada, porte, peso, cor,
      descricao, historia, temperamento, saude, castrado, vermifugado,
      compativelCriancas, compativelAnimais, status, localizacao
    } = req.body;

    // Verificar se animal existe
    const animalExiste = await prisma.animal.findUnique({ where: { id } });
    if (!animalExiste) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }

    // Processar novas fotos
    let fotos = JSON.parse(animalExiste.fotos || '[]');
    if (req.files && req.files.length > 0) {
      const novasFotos = req.files.map(f => `/uploads/animais/${f.filename}`);
      fotos = [...fotos, ...novasFotos];
    }

    const animal = await prisma.animal.update({
      where: { id },
      data: {
        nome,
        especie: especie ? especie.toLowerCase() : undefined,
        raca,
        sexo: sexo ? sexo.toLowerCase() : undefined,
        idadeAproximada,
        porte: porte ? porte.toLowerCase() : undefined,
        peso: peso ? parseFloat(peso) : undefined,
        cor,
        fotos: JSON.stringify(fotos),
        descricao,
        historia,
        temperamento: temperamento ? JSON.parse(temperamento) : undefined,
        saude: saude ? JSON.parse(saude) : undefined,
        castrado: castrado === 'true' || castrado === true,
        vermifugado: vermifugado === 'true' || vermifugado === true,
        compativelCriancas: compativelCriancas !== 'false',
        compativelAnimais: compativelAnimais !== 'false',
        status: status ? status.toLowerCase().replace(/ /g, '_') : undefined,
        localizacao: localizacao ? JSON.parse(localizacao) : undefined
      },
      include: {
        responsavel: {
          select: { id: true, nomeCompleto: true }
        }
      }
    });

    res.json(animal);
  } catch (error) {
    console.error('Erro ao atualizar animal:', error);
    res.status(500).json({ error: 'Erro ao atualizar animal', details: error.message });
  }
});

// ── DELETAR ANIMAL ────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se animal existe
    const animal = await prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      return res.status(404).json({ error: 'Animal não encontrado' });
    }

    // Verificar se tem adoções
    const adocoes = await prisma.adoption.count({ where: { animalId: id } });
    if (adocoes > 0) {
      return res.status(400).json({ error: 'Não é possível deletar animal com adoções registradas' });
    }

    await prisma.animal.delete({ where: { id } });

    res.json({ message: 'Animal deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar animal:', error);
    res.status(500).json({ error: 'Erro ao deletar animal' });
  }
});

// ── ESTATÍSTICAS ──────────────────────────────────────────────
router.get('/stats/resumo', authMiddleware, async (req, res) => {
  try {
    const [total, disponiveis, tratamento, adotados, larTemporario, perdidos] = await Promise.all([
      prisma.animal.count(),
      prisma.animal.count({ where: { status: 'disponivel' } }),
      prisma.animal.count({ where: { status: 'em_tratamento' } }),
      prisma.animal.count({ where: { status: 'adotado' } }),
      prisma.animal.count({ where: { status: 'lar_temporario' } }),
      prisma.animal.count({ where: { status: { in: ['perdido', 'encontrado'] } } })
    ]);

    res.json({
      total,
      disponiveis,
      tratamento,
      adotados,
      larTemporario,
      perdidos
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
