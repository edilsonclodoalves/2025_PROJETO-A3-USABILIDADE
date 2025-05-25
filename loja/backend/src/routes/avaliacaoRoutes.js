const express = require("express");
const router = express.Router();
const avaliacaoController = require("../controllers/avaliacaoController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Obter todas as avaliações de um produto específico (Público)
router.get("/produto/:produtoId", avaliacaoController.getAvaliacoesByProduto);

// --- Rotas Protegidas ---
router.use(authenticate);

// Criar uma nova avaliação para um produto
router.post("/", avaliacaoController.createAvaliacao);

// Obter todas as avaliações feitas por um usuário específico (próprio usuário ou admin)
router.get("/usuario/:usuarioId", avaliacaoController.getAvaliacoesByUsuario);

// Atualizar uma avaliação (apenas o próprio usuário)
router.put("/:id", avaliacaoController.updateAvaliacao);

// Deletar uma avaliação (próprio usuário ou admin)
router.delete("/:id", avaliacaoController.deleteAvaliacao);

module.exports = router;

