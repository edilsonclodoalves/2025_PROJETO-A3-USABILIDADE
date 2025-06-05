const express = require("express");
const router = express.Router();
const produtoEmEstoqueController = require("../controllers/produtoEmEstoque.controller");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Rotas públicas
router.get("/", produtoEmEstoqueController.getAllProdutosEmEstoque);
router.get("/produto/:produtoId", produtoEmEstoqueController.getEstoqueByProduto);

// Rotas protegidas (Admin)
router.post("/", authenticate, authorize(["admin"]), produtoEmEstoqueController.createProdutoEmEstoque);
router.put("/:id", authenticate, authorize(["admin"]), produtoEmEstoqueController.updateProdutoEmEstoque);
router.delete("/:id", authenticate, authorize(["admin"]), produtoEmEstoqueController.deleteProdutoEmEstoque);

module.exports = router;
