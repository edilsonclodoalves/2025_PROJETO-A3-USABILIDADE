const db = require("../models");
const Usuario = db.Usuario;
const bcrypt = require("bcryptjs");

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
  const { nome, email, telefone, senha, role } = req.body;

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

    // Validar telefone, se fornecido
    if (telefone && !/^\d{11}$/.test(telefone)) {
      return res.status(400).json({ message: "Telefone deve conter exatamente 11 dígitos." });
    }

    // Atualizar campos permitidos
    user.nome = nome || user.nome;
    user.email = email || user.email;
    user.telefone = telefone !== undefined ? telefone : user.telefone; // Atualizar telefone
    if (loggedInUserRole === "admin") {
      user.role = role || user.role;
    }

    // Atualizar senha se fornecida
    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
      }
      const salt = await bcrypt.genSalt(10);
      user.senha = await bcrypt.hash(senha, salt);
    }

    await user.save();

    // Retornar usuário atualizado sem a senha
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
    res.status(204).send(); // Sem conteúdo
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