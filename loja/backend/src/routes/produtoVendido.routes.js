const express = require("express");
const router = express.Router();
const produtoVendidoController = require("../controllers/produtoVendido.controllers");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Rotas públicas
router.get("/", produtoVendidoController.getAll);
router.get("/produto/:produtoId", produtoVendidoController.getByProdutoId);
router.get("/pedido/:pedidoId", produtoVendidoController.getByPedidoId);
router.get("/estatisticas", produtoVendidoController.getEstatisticas);

// Rotas protegidas (Admin/Operador)
router.post("/", authenticate, authorize(["admin", "operador"]), produtoVendidoController.create);
router.put("/:id", authenticate, authorize(["admin", "operador"]), produtoVendidoController.update);

module.exports = router;
