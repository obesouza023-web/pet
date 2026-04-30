const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userTipo = decoded.tipo;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.userTipo !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
}

function checkRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userTipo)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }
    next();
  };
}

module.exports = { authMiddleware, adminMiddleware, checkRole };
