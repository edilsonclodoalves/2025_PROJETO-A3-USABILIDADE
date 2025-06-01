const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Todas as rotas exigem autenticação
router.use(authenticate);

// Criar um novo pedido
router.post("/", pedidoController.createPedido);

// Obter todos os pedidos do usuário logado
router.get("/me", pedidoController.getPedidosUsuario);

// Obter um pedido específico pelo ID (usuário logado, admin ou operador)
router.get("/:id", pedidoController.getPedidoById);

// Cancelar um pedido (usuário dono do pedido)
router.patch("/:id/cancel", pedidoController.cancelPedido);

// Editar um pedido (apenas admin)
router.put("/:id", authorize(["admin"]), pedidoController.editPedido);

// Deletar um pedido (apenas admin)
router.delete("/:id", authorize(["admin"]), pedidoController.deletePedido);

// Rotas de Admin/Operador
router.get("/admin/all", authorize(["admin", "operador"]), pedidoController.getAllPedidosAdmin);
router.patch("/:id/status", authorize(["admin", "operador"]), pedidoController.updatePedidoStatus);

module.exports = router;