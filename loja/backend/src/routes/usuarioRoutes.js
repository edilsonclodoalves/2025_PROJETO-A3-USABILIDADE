const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const usuarioController = require("../controllers/usuarioController"); // Será criado depois
const { authenticate } = require("../middlewares/auth"); // Será criado depois
const { authorize } = require("../middlewares/authorize"); // Será criado depois

// Rotas de Autenticação (usando authController)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);

// Rotas de Gerenciamento de Usuários (usando usuarioController)
// Exemplo: Obter todos os usuários (protegido, apenas admin)
router.get("/", authenticate, authorize(["admin"]), usuarioController.getAllUsers);

// Exemplo: Obter usuário por ID (protegido, admin ou próprio usuário)
router.get("/:id", authenticate, usuarioController.getUserById); // A lógica de permissão estará no controller

// Exemplo: Atualizar usuário (protegido, admin ou próprio usuário)
router.put("/:id", authenticate, usuarioController.updateUser);

// Exemplo: Deletar usuário (protegido, apenas admin)
router.delete("/:id", authenticate, authorize(["admin"]), usuarioController.deleteUser);

// Rota para obter informações do usuário logado (ex: /me)
router.get("/me", authenticate, usuarioController.getMe);

module.exports = router;

