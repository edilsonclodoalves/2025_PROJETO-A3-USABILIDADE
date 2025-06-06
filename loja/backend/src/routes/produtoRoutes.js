const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Rotas Públicas
router.get("/", produtoController.getAllProdutos); // Listar todos os produtos (com filtros)
router.get("/busca", authenticate, authorize(["admin", "operador"]), produtoController.searchProdutos); // Buscar produtos
router.get("/:id", produtoController.getProdutoById); // Obter detalhes de um produto

// Rotas Protegidas (Admin/Operador)
router.post("/", authenticate, authorize(["admin", "operador"]), produtoController.createProduto);
router.post("/bulk", authenticate, authorize(["admin", "operador"]), produtoController.createProdutosBulk);
router.put("/:id", authenticate, authorize(["admin", "operador"]), produtoController.updateProduto);
router.delete("/:id", authenticate, authorize(["admin", "operador"]), produtoController.deleteProduto);

module.exports = router;