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

// Buscar produtos por termo (para autocomplete)
exports.searchProdutos = async (req, res) => {
  const { termo } = req.query;

  try {
    if (!termo || termo.trim().length < 3) {
      return res.status(400).json({ message: "Termo de busca deve ter pelo menos 3 caracteres." });
    }

    const produtos = await Produto.findAll({
      where: {
        [Op.or]: [
          { nome: { [Op.like]: `%${termo}%` } },
          { descricao: { [Op.like]: `%${termo}%` } }
        ]
      },
      attributes: ['id', 'nome', 'preco', 'imagemUrl'],
      limit: 10
    });

    res.status(200).json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};


// Cadastrar produtos em massa via CSV (Admin/Operador)
exports.createProdutosBulk = async (req, res) => {
  try {
    const { produtos } = req.body;

    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ 
        message: "Lista de produtos é obrigatória e deve conter pelo menos um produto." 
      });
    }

    const resultados = {
      sucessos: [],
      erros: [],
      total: produtos.length
    };

    // Processar cada produto individualmente
    for (let i = 0; i < produtos.length; i++) {
      const produto = produtos[i];
      const linha = i + 2; // +2 porque linha 1 é cabeçalho e array começa em 0

      try {
        // Validar campos obrigatórios
        if (!produto.nome || produto.nome.trim() === '') {
          throw new Error('Nome é obrigatório');
        }
        if (!produto.preco || isNaN(parseFloat(produto.preco))) {
          throw new Error('Preço deve ser um número válido');
        }

        // Criar produto
        const novoProduto = await Produto.create({
          nome: produto.nome.trim(),
          descricao: produto.descricao ? produto.descricao.trim() : '',
          preco: parseFloat(produto.preco),
          imagemUrl: produto.imagemUrl ? produto.imagemUrl.trim() : ''
        });

        resultados.sucessos.push({
          linha: linha,
          produto: novoProduto,
          nome: produto.nome
        });

      } catch (error) {
        console.error(`Erro ao criar produto linha ${linha}:`, error);
        
        let mensagemErro = error.message;
        if (error.name === 'SequelizeValidationError') {
          mensagemErro = error.errors.map(e => e.message).join(', ');
        } else if (error.name === 'SequelizeUniqueConstraintError') {
          mensagemErro = 'Produto com este nome já existe';
        }

        resultados.erros.push({
          linha: linha,
          nome: produto.nome || 'Nome não informado',
          erro: mensagemErro
        });
      }
    }

    // Retornar resultado do processamento
    const status = resultados.erros.length === 0 ? 201 : 207; // 207 = Multi-Status
    res.status(status).json({
      message: `Processamento concluído: ${resultados.sucessos.length} sucessos, ${resultados.erros.length} erros`,
      resultados: resultados
    });

  } catch (error) {
    console.error("Erro no processamento em massa:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

