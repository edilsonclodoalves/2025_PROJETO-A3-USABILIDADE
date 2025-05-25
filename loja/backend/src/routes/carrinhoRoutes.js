const express = require("express");
const router = express.Router();
const carrinhoController = require("../controllers/carrinhoController");
const { authenticate } = require("../middlewares/auth");

// Todas as rotas do carrinho são protegidas, exigem autenticação
router.use(authenticate);

// Obter o carrinho do usuário logado
router.get("/", carrinhoController.getCarrinho);

// Adicionar item ao carrinho
router.post("/items", carrinhoController.addItemCarrinho);

// Atualizar quantidade de um item no carrinho
router.put("/items/:itemId", carrinhoController.updateItemCarrinho);

// Remover item do carrinho
router.delete("/items/:itemId", carrinhoController.removeItemCarrinho);

// Limpar o carrinho (remover todos os itens)
router.delete("/", carrinhoController.clearCarrinho);

module.exports = router;

