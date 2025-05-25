// Middleware para verificar permissões de papel (role)
exports.authorize = (roles = []) => {
  // roles pode ser uma string única (ex: 'admin') ou um array (ex: ['admin', 'operador'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // req.user deve ter sido populado pelo middleware authenticate
    if (!req.user) {
      return res.status(401).json({ message: "Não autorizado." });
    }

    // Verificar se o papel do usuário está na lista de papéis permitidos
    if (roles.length && !roles.includes(req.user.role)) {
      // Usuário não tem o papel necessário
      return res.status(403).json({ message: "Acesso proibido. Permissão insuficiente." });
    }

    // Autenticação e autorização bem-sucedidas
    next();
  };
};

