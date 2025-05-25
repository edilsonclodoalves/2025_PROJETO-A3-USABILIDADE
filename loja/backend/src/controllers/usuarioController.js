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
    // Verificar se o usuário logado é admin ou está tentando acessar seu próprio perfil
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
  const { nome, email, role } = req.body; // Senha não deve ser atualizada aqui diretamente

  try {
    // Verificar permissão
    if (loggedInUserRole !== "admin" && loggedInUserId !== userId) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    // Apenas admin pode mudar o 'role'
    if (loggedInUserRole !== "admin" && role && role !== req.user.role) {
        return res.status(403).json({ message: "Você não tem permissão para alterar o papel do usuário." });
    }

    const user = await Usuario.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Atualizar campos permitidos
    user.nome = nome || user.nome;
    user.email = email || user.email;
    if (loggedInUserRole === "admin") {
        user.role = role || user.role;
    }

    await user.save();

    // Retornar usuário atualizado sem a senha
    const { senha, ...userWithoutPassword } = user.get({ plain: true });
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    // Tratar erro de email duplicado, se houver
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Email já está em uso.' });
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
    res.status(204).send(); // Sem conteúdo

  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter informações do usuário logado (/me)
exports.getMe = async (req, res) => {
  try {
    // req.user é populado pelo middleware de autenticação
    const user = await Usuario.findByPk(req.user.id, {
      attributes: { exclude: ["senha"] },
    });

    if (!user) {
      // Isso não deveria acontecer se o token for válido, mas é bom verificar
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar informações do usuário logado:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

