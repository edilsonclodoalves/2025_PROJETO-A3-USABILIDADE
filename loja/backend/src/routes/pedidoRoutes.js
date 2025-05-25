const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Todas as rotas abaixo exigem autenticação
router.use(authenticate);

// Criar um novo pedido a partir do carrinho
router.post("/", pedidoController.createPedido);

// Obter todos os pedidos do usuário logado
router.get("/me", pedidoController.getPedidosUsuario);

// Obter um pedido específico pelo ID (usuário logado ou admin)
router.get("/:id", pedidoController.getPedidoById);

// --- Rotas de Admin/Operador ---

// Obter todos os pedidos (para gerenciamento)
router.get("/admin/all", authorize(["admin", "operador"]), pedidoController.getAllPedidosAdmin);

// Atualizar status de um pedido
router.patch("/:id/status", authorize(["admin", "operador"]), pedidoController.updatePedidoStatus);

module.exports = router;

