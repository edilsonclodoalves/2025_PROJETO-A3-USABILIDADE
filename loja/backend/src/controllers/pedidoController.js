const db = require("../models");
const Pedido = db.Pedido;
const ItemPedido = db.ItemPedido;
const Carrinho = db.Carrinho;
const ItemCarrinho = db.ItemCarrinho;
const Produto = db.Produto;
const sequelize = db.sequelize;
const { Op } = require("sequelize");

// Criar um novo pedido a partir do carrinho do usuário
const createPedido = async (req, res) => {
  const usuarioId = req.user.id;
  const { enderecoEntrega } = req.body;

  if (!enderecoEntrega || typeof enderecoEntrega !== 'object' || Object.keys(enderecoEntrega).length === 0) {
    return res.status(400).json({ message: "Erro: Endereço de entrega é obrigatório e deve ser um objeto válido." });
  }

  const t = await sequelize.transaction();

  try {
    const carrinho = await Carrinho.findOne({
      where: { UsuarioId: usuarioId },
      include: [
        {
          model: ItemCarrinho,
          as: "ItemCarrinhos",
          required: true,
          include: [{ model: Produto }],
        },
      ],
      transaction: t,
    });

    if (!carrinho || !carrinho.ItemCarrinhos || carrinho.ItemCarrinhos.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Carrinho vazio ou não encontrado." });
    }

    let valorTotal = 0;
    for (const item of carrinho.ItemCarrinhos) {
      if (!item.Produto || item.Produto.preco == null) {
        await t.rollback();
        console.error(`Produto inválido ou sem preço no item do carrinho: ${item.id}`);
        return res.status(500).json({ message: `Erro ao processar item ${item.id}: Produto inválido ou sem preço.` });
      }
      valorTotal += item.quantidade * item.Produto.preco;
    }

    const novoPedido = await Pedido.create({
      UsuarioId: usuarioId,
      valorTotal: valorTotal,
      status: "pendente",
      enderecoEntrega: enderecoEntrega,
      dataPedido: new Date(),
    }, { transaction: t });

    const itensPedidoParaCriar = carrinho.ItemCarrinhos.map(item => ({
      PedidoId: novoPedido.id,
      ProdutoId: item.ProdutoId,
      quantidade: item.quantidade,
      precoUnitario: item.Produto.preco,
    }));
    await ItemPedido.bulkCreate(itensPedidoParaCriar, { transaction: t });

    await ItemCarrinho.destroy({ where: { CarrinhoId: carrinho.id }, transaction: t });

    await t.commit();

    const pedidoCriado = await Pedido.findByPk(novoPedido.id, {
      include: [{ model: ItemPedido, include: [Produto] }],
    });

    res.status(201).json(pedidoCriado);
  } catch (error) {
    await t.rollback();
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor ao criar pedido." });
  }
};

// Obter todos os pedidos do usuário logado
const getPedidosUsuario = async (req, res) => {
  const usuarioId = req.user.id;

  try {
    const pedidos = await Pedido.findAll({
      where: { UsuarioId: usuarioId },
      order: [["createdAt", "DESC"]],
      include: [{ model: ItemPedido, include: [Produto] }],
    });
    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter um pedido específico pelo ID (usuário logado, admin ou operador)
const getPedidoById = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const usuarioId = req.user.id;
  const userRole = req.user.role;

  try {
    const pedido = await Pedido.findByPk(pedidoId, {
      include: [{ model: ItemPedido, include: [Produto] }],
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    if (pedido.UsuarioId !== usuarioId && userRole !== "admin" && userRole !== "operador") {
      return res.status(403).json({ message: "Acesso negado." });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido por ID:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Cancelar um pedido (apenas usuário dono do pedido)
const cancelPedido = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const usuarioId = req.user.id;

  const t = await sequelize.transaction();

  try {
    const pedido = await Pedido.findByPk(pedidoId, { transaction: t });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    if (pedido.UsuarioId !== usuarioId) {
      await t.rollback();
      return res.status(403).json({ message: "Acesso negado. Apenas o dono do pedido pode cancelá-lo." });
    }

    if (pedido.status !== "pendente") {
      await t.rollback();
      return res.status(400).json({ message: "Apenas pedidos pendentes podem ser cancelados." });
    }

    pedido.status = "cancelado";
    await pedido.save({ transaction: t });

    if (req.io) {
      req.io.to(`user_${pedido.UsuarioId}`).emit('status_pedido_atualizado', {
        pedidoId: pedido.id,
        status: pedido.status,
      });
    }

    await t.commit();
    res.status(200).json(pedido);
  } catch (error) {
    await t.rollback();
    console.error("Erro ao cancelar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Editar um pedido (apenas admin)
const editPedido = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const userRole = req.user.role;
  const { enderecoEntrega, status } = req.body;

  const allowedStatus = ["pendente", "processando", "enviado", "entregue", "cancelado"];
  if (status && !allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Status inválido." });
  }
  if (enderecoEntrega && (typeof enderecoEntrega !== 'object' || Object.keys(enderecoEntrega).length === 0)) {
    return res.status(400).json({ message: "Endereço de entrega deve ser um objeto válido." });
  }

  if (userRole !== "admin") {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem editar pedidos." });
  }

  const t = await sequelize.transaction();

  try {
    const pedido = await Pedido.findByPk(pedidoId, {
      include: [{ model: ItemPedido, include: [Produto] }],
      transaction: t,
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    if (enderecoEntrega) {
      pedido.enderecoEntrega = enderecoEntrega;
    }
    if (status) {
      pedido.status = status;
    }

    await pedido.save({ transaction: t });

    if (status && req.io) {
      req.io.to(`user_${pedido.UsuarioId}`).emit('status_pedido_atualizado', {
        pedidoId: pedido.id,
        status: pedido.status,
      });
    }

    await t.commit();
    res.status(200).json(pedido);
  } catch (error) {
    await t.rollback();
    console.error("Erro ao editar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Deletar um pedido (apenas admin)
const deletePedido = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const userRole = req.user.role;

  if (userRole !== "admin") {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem excluir pedidos." });
  }

  const t = await sequelize.transaction();

  try {
    const pedido = await Pedido.findByPk(pedidoId, { transaction: t });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    await ItemPedido.destroy({ where: { PedidoId: pedidoId }, transaction: t });
    await pedido.destroy({ transaction: t });

    if (req.io) {
      req.io.to(`user_${pedido.UsuarioId}`).emit('pedido_deletado', { pedidoId: pedido.id });
    }

    await t.commit();
    res.status(204).send();
  } catch (error) {
    await t.rollback();
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Atualizar status do pedido (admin ou operador)
const updatePedidoStatus = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const { status } = req.body;

  const allowedStatus = ["pendente", "processando", "enviado", "entregue", "cancelado"];
  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Status inválido." });
  }

  try {
    const pedido = await Pedido.findByPk(pedidoId);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    pedido.status = status;
    await pedido.save();

    if (req.io) {
      req.io.to(`user_${pedido.UsuarioId}`).emit('status_pedido_atualizado', { pedidoId: pedido.id, status: pedido.status });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter todos os pedidos (admin ou operador)
const getAllPedidosAdmin = async (req, res) => {
  const { status, userId, startDate, endDate, sortBy = 'createdAt', order = 'DESC' } = req.query;
  const whereClause = {};

  if (status) whereClause.status = status;
  if (userId) whereClause.UsuarioId = parseInt(userId, 10);
  if (startDate) whereClause.createdAt = { ...whereClause.createdAt, [Op.gte]: new Date(startDate) };
  if (endDate) whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: new Date(endDate) };

  const allowedSortBy = ['valorTotal', 'status', 'createdAt', 'updatedAt'];
  const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
  const validOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  try {
    const pedidos = await Pedido.findAll({
      where: whereClause,
      include: [
        { model: db.Usuario, attributes: ['id', 'nome', 'email', 'telefone'] },
        { model: ItemPedido, include: [Produto] }
      ],
      order: [[validSortBy, validOrder]],
    });
    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos (admin):", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

module.exports = {
  createPedido,
  getPedidosUsuario,
  getPedidoById,
  cancelPedido,
  editPedido,
  deletePedido,
  updatePedidoStatus,
  getAllPedidosAdmin,
};