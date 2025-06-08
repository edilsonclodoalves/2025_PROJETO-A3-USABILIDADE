const express = require("express");
const router = express.Router();
const pedidoAdminController = require("../controllers/pedidoAdminController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Todas as rotas exigem autenticação
router.use(authenticate);

// Todas as rotas são restritas para admin e operador
router.use(authorize(["admin", "operador"]));

// Criar pedido diretamente (admin/operador)
router.post("/", pedidoAdminController.createPedidoAdmin);

// Criar pedido usando template pré-definido (admin/operador)
router.post("/rapido", pedidoAdminController.createPedidoRapido);

// Duplicar um pedido existente (admin/operador)
router.post("/duplicar/:id", pedidoAdminController.duplicarPedido);

// Listar templates disponíveis para pedidos rápidos
router.get("/templates", pedidoAdminController.getTemplates);

module.exports = router;