const db = require("../models");
const { Sequelize } = db;
const ProdutoEmEstoque = db.ProdutoEmEstoque;
const Produto = db.Produto;

// ✅ Criar novo registro de estoque
exports.createProdutoEmEstoque = async (req, res) => {
  const { produtoId, quantidade, localizacao, dataReposicao } = req.body;

  if (!produtoId || quantidade === undefined) {
    return res.status(400).json({ message: "ID do produto e quantidade são obrigatórios." });
  }

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const novoEstoque = await ProdutoEmEstoque.create({
      ProdutoId: produtoId,
      quantidade: parseInt(quantidade, 10),
      localizacao: localizacao || null,
      dataReposicao: dataReposicao || null
    });

    const estoqueCriado = await ProdutoEmEstoque.findByPk(novoEstoque.id, {
      include: [
        { model: Produto, attributes: ["id", "nome", "preco", "imagemUrl"] }
      ]
    });

    res.status(201).json(estoqueCriado);

  } catch (error) {
    console.error("Erro ao criar registro de estoque:", error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: "Erro de validação", errors: messages });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter todos os registros de estoque
exports.getAllProdutosEmEstoque = async (req, res) => {
  try {
    const estoque = await ProdutoEmEstoque.findAll({
      include: [
        { model: Produto, attributes: ["id", "nome", "preco", "imagemUrl", "descricao"] }
      ],
      order: [["ProdutoId", "ASC"]]
    });
    res.status(200).json(estoque);
  } catch (error) {
    console.error("Erro ao buscar registros de estoque:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter estoque de um produto específico
exports.getEstoqueByProduto = async (req, res) => {
  const produtoId = parseInt(req.params.produtoId, 10);

  try {
    const estoque = await ProdutoEmEstoque.findOne({
      where: { ProdutoId: produtoId },
      include: [
        { model: Produto, attributes: ["id", "nome", "preco", "imagemUrl", "descricao"] }
      ]
    });

    if (!estoque) {
      return res.status(404).json({ message: "Estoque não encontrado para este produto." });
    }

    res.status(200).json(estoque);
  } catch (error) {
    console.error("Erro ao buscar estoque do produto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Atualizar registro de estoque
exports.updateProdutoEmEstoque = async (req, res) => {
  const estoqueId = parseInt(req.params.id, 10);
  const { quantidade, localizacao, dataReposicao } = req.body;

  if (quantidade === undefined) {
    return res.status(400).json({ message: "Quantidade é obrigatória." });
  }

  try {
    const estoque = await ProdutoEmEstoque.findByPk(estoqueId, {
      include: [
        { model: Produto, attributes: ["id", "nome"] }
      ]
    });

    if (!estoque) {
      return res.status(404).json({ message: "Registro de estoque não encontrado." });
    }

    estoque.quantidade = parseInt(quantidade, 10);
    estoque.localizacao = localizacao ?? estoque.localizacao;
    estoque.dataReposicao = dataReposicao ?? estoque.dataReposicao;
    await estoque.save();

    res.status(200).json(estoque);

  } catch (error) {
    console.error("Erro ao atualizar registro de estoque:", error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: "Erro de validação", errors: messages });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Deletar registro de estoque
exports.deleteProdutoEmEstoque = async (req, res) => {
  const estoqueId = parseInt(req.params.id, 10);

  try {
    const estoque = await ProdutoEmEstoque.findByPk(estoqueId);

    if (!estoque) {
      return res.status(404).json({ message: "Registro de estoque não encontrado." });
    }

    await estoque.destroy();
    res.status(204).send();

  } catch (error) {
    console.error("Erro ao deletar registro de estoque:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};