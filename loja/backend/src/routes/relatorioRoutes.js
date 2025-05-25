const express = require("express");
const router = express.Router();
const relatorioController = require("../controllers/relatorioController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

// Todas as rotas de relatório são protegidas (Admin/Operador)
router.use(authenticate);
router.use(authorize(["admin", "operador"]));

// Relatório de Vendas por Período
router.get("/vendas-periodo", relatorioController.getVendasPorPeriodo);

// Relatório de Produtos Mais Vendidos
router.get("/produtos-mais-vendidos", relatorioController.getProdutosMaisVendidos);

// Adicionar outras rotas de relatório aqui, se necessário

module.exports = router;

