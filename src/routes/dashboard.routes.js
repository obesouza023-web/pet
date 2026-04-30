const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');

router.get('/stats', authMiddleware, checkRole('empresa', 'admin'), (req, res) => {
  res.json({ message: 'Estatísticas do dashboard' });
});

module.exports = router;
