const db = require("../models");
const Produto = db.Produto;
const { Op } = require("sequelize"); // Para filtros

// Criar novo produto (Admin/Operador)
exports.createProduto = async (req, res) => {
  const { nome, descricao, preco, imagemUrl } = req.body;

  try {
    const newProduto = await Produto.create({ nome, descricao, preco, imagemUrl });
    res.status(201).json(newProduto);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    // Tratar erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message);
        return res.status(400).json({ message: "Erro de validação", errors: messages });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter todos os produtos (Público, com filtros opcionais)
exports.getAllProdutos = async (req, res) => {
  const { search, minPrice, maxPrice, sortBy = 'createdAt', order = 'DESC' } = req.query;
  const whereClause = {};

  if (search) {
    whereClause[Op.or] = [
      { nome: { [Op.like]: `%${search}%` } },
      { descricao: { [Op.like]: `%${search}%` } },
    ];
  }
  if (minPrice) {
    whereClause.preco = { ...whereClause.preco, [Op.gte]: parseFloat(minPrice) };
  }
  if (maxPrice) {
    whereClause.preco = { ...whereClause.preco, [Op.lte]: parseFloat(maxPrice) };
  }

  // Validar sortBy para evitar injeção
  const allowedSortBy = ['nome', 'preco', 'createdAt', 'updatedAt'];
  const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
  const validOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  try {
    const produtos = await Produto.findAll({
      where: whereClause,
      order: [[validSortBy, validOrder]],
      // Adicionar paginação se necessário
      // limit: parseInt(req.query.limit) || 10,
      // offset: parseInt(req.query.offset) || 0,
    });
    res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter produto por ID (Público)
exports.getProdutoById = async (req, res) => {
  const produtoId = parseInt(req.params.id, 10);

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }
    res.status(200).json(produto);
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Atualizar produto (Admin/Operador)
exports.updateProduto = async (req, res) => {
  const produtoId = parseInt(req.params.id, 10);
  const { nome, descricao, preco, imagemUrl } = req.body;

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    // Atualizar campos
    produto.nome = nome || produto.nome;
    produto.descricao = descricao || produto.descricao;
    produto.preco = preco || produto.preco;
    produto.imagemUrl = imagemUrl || produto.imagemUrl;

    await produto.save();
    res.status(200).json(produto);

  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message);
        return res.status(400).json({ message: "Erro de validação", errors: messages });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Deletar produto (Admin/Operador)
exports.deleteProduto = async (req, res) => {
  const produtoId = parseInt(req.params.id, 10);

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    await produto.destroy();
    res.status(204).send(); // Sem conteúdo

  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

