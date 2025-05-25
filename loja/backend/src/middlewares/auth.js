const jwt = require("jsonwebtoken");
const db = require("../models");
const Usuario = db.Usuario;

// Middleware para verificar o token JWT
exports.authenticate = async (req, res, next) => {
  let token;

  // Verificar se o token está no header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Se não houver token
  if (!token) {
    return res.status(401).json({ message: "Não autorizado, token não encontrado." });
  }

  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Encontrar o usuário pelo ID do token e anexar ao request
    // Excluir a senha do objeto do usuário anexado
    req.user = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ["senha"] },
    });

    if (!req.user) {
        // Caso o usuário associado ao token não exista mais
        return res.status(401).json({ message: "Não autorizado, usuário não encontrado." });
    }

    next(); // Passar para o próximo middleware ou rota
  } catch (error) {
    console.error("Erro na autenticação:", error);
    // Tratar erros específicos do JWT (expirado, inválido)
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Não autorizado, token expirado." });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Não autorizado, token inválido." });
    }
    res.status(401).json({ message: "Não autorizado, falha na verificação do token." });
  }
};

