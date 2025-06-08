const db = require("../models");
const Pedido = db.Pedido;
const ItemPedido = db.ItemPedido;
const Produto = db.Produto;
const Usuario = db.Usuario;
const sequelize = db.sequelize;

// Criar pedido diretamente (admin/operador)
const createPedidoAdmin = async (req, res) => {
  const { usuarioId, enderecoEntrega, itens, observacoes } = req.body;
  const userRole = req.user.role;

  // Verificar permissões
  if (userRole !== "admin" && userRole !== "operador") {
    return res.status(403).json({ 
      message: "Acesso negado. Apenas administradores e operadores podem criar pedidos diretamente." 
    });
  }

  // Validações básicas
  if (!usuarioId || !Number.isInteger(usuarioId)) {
    return res.status(400).json({ message: "ID do usuário é obrigatório e deve ser um número inteiro." });
  }

  if (!enderecoEntrega || typeof enderecoEntrega !== 'object' || Object.keys(enderecoEntrega).length === 0) {
    return res.status(400).json({ message: "Endereço de entrega é obrigatório e deve ser um objeto válido." });
  }

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ message: "Lista de itens é obrigatória e deve conter pelo menos um item." });
  }

  // Validar estrutura dos itens
  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];
    if (!item.produtoId || !Number.isInteger(item.produtoId)) {
      return res.status(400).json({ 
        message: `Item ${i + 1}: ID do produto é obrigatório e deve ser um número inteiro.` 
      });
    }
    if (!item.quantidade || !Number.isInteger(item.quantidade) || item.quantidade <= 0) {
      return res.status(400).json({ 
        message: `Item ${i + 1}: Quantidade deve ser um número inteiro maior que zero.` 
      });
    }
  }

  const t = await sequelize.transaction();

  try {
    // Verificar se o usuário existe
    const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Verificar se todos os produtos existem e calcular valor total
    let valorTotal = 0;
    const itensValidados = [];

    for (const item of itens) {
      const produto = await Produto.findByPk(item.produtoId, { transaction: t });
      if (!produto) {
        if (!t.finished) await t.rollback();
        return res.status(404).json({ message: `Produto com ID ${item.produtoId} não encontrado.` });
      }

      if (produto.preco == null) {
        if (!t.finished) await t.rollback();
        return res.status(400).json({ message: `Produto ${produto.nome} não possui preço definido.` });
      }

      // Verificar estoque se necessário
      if (produto.estoque != null && produto.estoque < item.quantidade) {
        if (!t.finished) await t.rollback();
        return res.status(400).json({ 
          message: `Estoque insuficiente para o produto ${produto.nome}. Estoque disponível: ${produto.estoque}` 
        });
      }

      const subtotal = item.quantidade * produto.preco;
      valorTotal += subtotal;

      itensValidados.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: produto.preco,
        produto: produto
      });
    }

    // Criar o pedido
    const novoPedido = await Pedido.create({
      UsuarioId: usuarioId,
      valorTotal: valorTotal,
      status: "pendente",
      enderecoEntrega: enderecoEntrega,
      dataPedido: new Date(),
      observacoes: observacoes || null
    }, { transaction: t });

    // Criar os itens do pedido
    const itensPedidoParaCriar = itensValidados.map(item => ({
      PedidoId: novoPedido.id,
      ProdutoId: item.produtoId,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
    }));

    await ItemPedido.bulkCreate(itensPedidoParaCriar, { transaction: t });

    // Atualizar estoque se necessário
    for (const item of itensValidados) {
      if (item.produto.estoque != null) {
        await Produto.update(
          { estoque: item.produto.estoque - item.quantidade },
          { where: { id: item.produtoId }, transaction: t }
        );
      }
    }

    await t.commit();

    // Buscar o pedido criado com todas as relações (fora da transação)
    const pedidoCriado = await Pedido.findByPk(novoPedido.id, {
      include: [
        { 
          model: Usuario, 
          attributes: ['id', 'nome', 'email', 'telefone'] 
        },
        { 
          model: ItemPedido, 
          include: [{ 
            model: Produto,
            attributes: ['id', 'nome', 'preco', 'descricao']
          }] 
        }
      ],
    });

    // Notificar o usuário via socket se disponível
    if (req.io) {
      req.io.to(`user_${usuarioId}`).emit('novo_pedido_criado', {
        pedidoId: pedidoCriado.id,
        valorTotal: pedidoCriado.valorTotal,
        status: pedidoCriado.status,
        criadoPorAdmin: true
      });
    }

    res.status(201).json({
      message: "Pedido criado com sucesso",
      pedido: pedidoCriado
    });

  } catch (error) {
    // Verificar se a transação ainda está ativa antes de fazer rollback
    if (!t.finished) {
      await t.rollback();
    }
    console.error("Erro ao criar pedido (admin):", error);
    res.status(500).json({ message: "Erro interno do servidor ao criar pedido." });
  }
};

// Criar pedido rápido com produtos pré-definidos (admin/operador)
const createPedidoRapido = async (req, res) => {
  const { usuarioId, enderecoEntrega, templateId } = req.body;
  const userRole = req.user.role;

  if (userRole !== "admin" && userRole !== "operador") {
    return res.status(403).json({ 
      message: "Acesso negado. Apenas administradores e operadores podem criar pedidos rápidos." 
    });
  }

  // Templates pré-definidos (pode ser movido para o banco de dados futuramente)
  const templates = {
    1: { // Template básico
      nome: "Pedido Básico",
      itens: [
        { produtoId: 1, quantidade: 1 },
        { produtoId: 2, quantidade: 2 }
      ]
    },
    2: { // Template família
      nome: "Pedido Família",
      itens: [
        { produtoId: 1, quantidade: 2 },
        { produtoId: 3, quantidade: 1 },
        { produtoId: 4, quantidade: 3 }
      ]
    }
  };

  if (!templateId || !templates[templateId]) {
    return res.status(400).json({ 
      message: "Template inválido. Templates disponíveis: " + Object.keys(templates).join(", ")
    });
  }

  const template = templates[templateId];

  // Reutilizar a lógica do createPedidoAdmin
  const pedidoData = {
    usuarioId,
    enderecoEntrega,
    itens: template.itens,
    observacoes: `Pedido criado usando template: ${template.nome}`
  };

  // Simular req.body com os dados do template
  req.body = pedidoData;
  
  return createPedidoAdmin(req, res);
};

// Duplicar um pedido existente (admin/operador)
const duplicarPedido = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const { usuarioId, enderecoEntrega } = req.body;
  const userRole = req.user.role;

  if (userRole !== "admin" && userRole !== "operador") {
    return res.status(403).json({ 
      message: "Acesso negado. Apenas administradores e operadores podem duplicar pedidos." 
    });
  }

  try {
    // Buscar o pedido original
    const pedidoOriginal = await Pedido.findByPk(pedidoId, {
      include: [{ model: ItemPedido, include: [Produto] }]
    });

    if (!pedidoOriginal) {
      return res.status(404).json({ message: "Pedido original não encontrado." });
    }

    // Preparar itens do pedido original
    const itens = pedidoOriginal.ItemPedidos.map(item => ({
      produtoId: item.ProdutoId,
      quantidade: item.quantidade
    }));

    // Usar endereço fornecido ou do pedido original
    const enderecoFinal = enderecoEntrega || pedidoOriginal.enderecoEntrega;
    const usuarioFinal = usuarioId || pedidoOriginal.UsuarioId;

    // Simular req.body com os dados duplicados
    req.body = {
      usuarioId: usuarioFinal,
      enderecoEntrega: enderecoFinal,
      itens: itens,
      observacoes: `Pedido duplicado do pedido #${pedidoOriginal.id}`
    };

    return createPedidoAdmin(req, res);

  } catch (error) {
    console.error("Erro ao duplicar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor ao duplicar pedido." });
  }
};

// Listar templates disponíveis
const getTemplates = async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== "admin" && userRole !== "operador") {
    return res.status(403).json({ 
      message: "Acesso negado." 
    });
  }

  const templates = {
    1: { nome: "Pedido Básico", descricao: "Template com produtos básicos" },
    2: { nome: "Pedido Família", descricao: "Template para pedidos familiares" }
  };

  res.status(200).json(templates);
};

module.exports = {
  createPedidoAdmin,
  createPedidoRapido,
  duplicarPedido,
  getTemplates
};