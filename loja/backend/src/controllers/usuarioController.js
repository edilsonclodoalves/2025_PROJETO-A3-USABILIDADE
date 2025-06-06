const db = require("../models");
const Usuario = db.Usuario;

// Obter todos os usuários (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Usuario.findAll({
      attributes: { exclude: ["senha"] }, // Não retornar a senha
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter usuário por ID (Admin ou próprio usuário)
exports.getUserById = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;

  try {
    if (loggedInUserRole !== "admin" && loggedInUserId !== userId) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    const user = await Usuario.findByPk(userId, {
      attributes: { exclude: ["senha"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Atualizar usuário (Admin ou próprio usuário)
exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;
  const { nome, email, telefone, senha, role } = req.body;

  try {
    if (loggedInUserRole !== "admin" && loggedInUserId !== userId) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    if (loggedInUserRole !== "admin" && role && role !== req.user.role) {
      return res.status(403).json({ message: "Você não tem permissão para alterar o papel do usuário." });
    }

    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    if (telefone && !/^\d{11}$/.test(telefone)) {
      return res.status(400).json({ message: "Telefone deve conter exatamente 11 dígitos." });
    }

    user.nome = nome || user.nome;
    user.email = email || user.email;
    user.telefone = telefone !== undefined ? telefone : user.telefone;
    if (loggedInUserRole === "admin") {
      user.role = role || user.role;
    }

    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
      }
      // Deixar o hook beforeUpdate fazer o hash automaticamente
      user.senha = senha;
    }

    await user.save();

    const { senha: _, ...userWithoutPassword } = user.get({ plain: true });
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Email já está em uso." });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Deletar usuário (Admin)
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter informações do usuário logado (/me)
exports.getMe = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.id, {
      attributes: { exclude: ["senha"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar informações do usuário logado:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Reset de senha (Admin ou próprio usuário)
exports.resetPassword = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;
  const { novaSenha } = req.body;

  try {
    if (!novaSenha || novaSenha.trim() === "") {
      return res.status(400).json({ message: "Nova senha é obrigatória." });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    if (loggedInUserRole !== "admin" && loggedInUserId !== userId) {
      return res.status(403).json({ message: "Acesso negado. Você só pode alterar sua própria senha." });
    }

    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Atualizar a senha (o hook beforeUpdate irá fazer o hash automaticamente)
    user.senha = novaSenha;
    await user.save();

    res.status(200).json({
      message: "Senha alterada com sucesso.",
      userId: user.id
    });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Buscar usuários por termo (para autocomplete)
exports.searchUsers = async (req, res) => {
  const { termo } = req.query;

  try {
    if (!termo || termo.trim().length < 3) {
      return res.status(400).json({ message: "Termo de busca deve ter pelo menos 3 caracteres." });
    }

    const users = await Usuario.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { nome: { [db.Sequelize.Op.like]: `%${termo}%` } },
          { email: { [db.Sequelize.Op.like]: `%${termo}%` } }
        ]
      },
      attributes: ['id', 'nome', 'email', 'telefone'],
      limit: 10
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

