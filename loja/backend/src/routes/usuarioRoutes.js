const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const usuarioController = require("../controllers/usuarioController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Rotas de Autenticação
router.post("/register", authController.register); // Cadastro de usuário padrão
router.post("/login", authController.login); // Login de usuário
router.post("/google-login", authController.googleLogin); // Login com Google

// Rota para cadastrar usuário pelo painel admin
router.post("/admin/create", authenticate, authorize(["admin"]), authController.register); // Cadastro admin

// Rota para obter informações do usuário logado (/usuarios/me)
router.get("/me", authenticate, usuarioController.getMe);

// Rotas de Gerenciamento de Usuários
router.get("/", authenticate, authorize(["admin"]), usuarioController.getAllUsers); // Listar todos os usuários
router.get("/busca", authenticate, authorize(["admin", "operador"]), usuarioController.searchUsers); // Buscar usuários
router.get("/:id", authenticate, usuarioController.getUserById); // Obter usuário por ID
router.put("/:id", authenticate, usuarioController.updateUser); // Atualizar usuário
router.delete("/:id", authenticate, authorize(["admin"]), usuarioController.deleteUser); // Deletar usuário

// Reset de senha (protegido, admin ou próprio usuário)
router.put("/:id/reset-password", authenticate, usuarioController.resetPassword);

module.exports = router;
