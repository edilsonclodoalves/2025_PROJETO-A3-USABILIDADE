const db = require("../models");
const Pedido = db.Pedido;
const Carrinho = db.Carrinho;
const ItemCarrinho = db.ItemCarrinho;
const Produto = db.Produto;
const sequelize = db.sequelize; // Para transações

// Criar um novo pedido a partir do carrinho do usuário
exports.createPedido = async (req, res) => {
  const usuarioId = req.user.id;
  const { enderecoEntrega } = req.body; // Obter endereço do corpo da requisição

  // Iniciar uma transação
  const t = await sequelize.transaction();

  try {
    // 1. Buscar o carrinho do usuário com seus itens e produtos
    const carrinho = await Carrinho.findOne({
      where: { UsuarioId: usuarioId },
      include: [
        {
          model: ItemCarrinho,
          as: "ItemCarrinhos",
          required: true, // Garantir que o carrinho tenha itens
          include: [{ model: Produto }],
        },
      ],
      transaction: t,
    });

    // Verificar se o carrinho existe e tem itens
    if (!carrinho || !carrinho.ItemCarrinhos || carrinho.ItemCarrinhos.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "Carrinho vazio ou não encontrado." });
    }

    // 2. Calcular o valor total do pedido
    let valorTotal = 0;
    for (const item of carrinho.ItemCarrinhos) {
        if (!item.Produto || item.Produto.preco == null) {
            await t.rollback();
            console.error(`Produto inválido ou sem preço no item do carrinho: ${item.id}`);
            return res.status(500).json({ message: `Erro ao processar item ${item.id}: Produto inválido ou sem preço.` });
        }
        valorTotal += item.quantidade * item.Produto.preco;
    }

    // 3. Criar o registro do pedido
    const novoPedido = await Pedido.create({
      UsuarioId: usuarioId,
      valorTotal: valorTotal,
      status: "pendente", // Status inicial
      enderecoEntrega: enderecoEntrega, // Salvar endereço
      // Adicionar detalhes dos itens se o modelo Pedido os armazenar diretamente
      // ou criar registros na tabela ItemPedido (abordagem recomendada)
    }, { transaction: t });

    // 4. (Opcional, mas recomendado) Criar registros em ItemPedido se essa tabela existir
    // Exemplo:
    // const itensPedidoParaCriar = carrinho.ItemCarrinhos.map(item => ({
    //   PedidoId: novoPedido.id,
    //   ProdutoId: item.ProdutoId,
    //   quantidade: item.quantidade,
    //   precoUnitario: item.Produto.preco, // Preço no momento da compra
    // }));
    // await ItemPedido.bulkCreate(itensPedidoParaCriar, { transaction: t });

    // 5. Limpar o carrinho do usuário (remover itens)
    await ItemCarrinho.destroy({ where: { CarrinhoId: carrinho.id }, transaction: t });

    // 6. Commit da transação
    await t.commit();

    // 7. Retornar o pedido criado (pode incluir itens se necessário)
    // Recarregar o pedido para incluir associações, se necessário
    const pedidoCriado = await Pedido.findByPk(novoPedido.id, {
        // include: [{ model: ItemPedido, include: [Produto] }] // Se usar ItemPedido
    });

    res.status(201).json(pedidoCriado);

  } catch (error) {
    // Rollback em caso de erro
    await t.rollback();
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor ao criar pedido." });
  }
};

// Obter todos os pedidos do usuário logado
exports.getPedidosUsuario = async (req, res) => {
  const usuarioId = req.user.id;

  try {
    const pedidos = await Pedido.findAll({
      where: { UsuarioId: usuarioId },
      order: [["createdAt", "DESC"]],
      // Incluir itens do pedido se necessário
      // include: [{ model: ItemPedido, include: [Produto] }]
    });
    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Erro ao buscar pedidos do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter um pedido específico pelo ID (usuário logado ou admin)
exports.getPedidoById = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const usuarioId = req.user.id;
  const userRole = req.user.role;

  try {
    const pedido = await Pedido.findByPk(pedidoId, {
      // Incluir itens do pedido se necessário
      // include: [{ model: ItemPedido, include: [Produto] }]
    });

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    // Verificar permissão: usuário dono do pedido ou admin
    if (pedido.UsuarioId !== usuarioId && userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado." });
    }

    res.status(200).json(pedido);
  } catch (error) {
    console.error("Erro ao buscar pedido por ID:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Atualizar status do pedido (Admin/Operador)
exports.updatePedidoStatus = async (req, res) => {
  const pedidoId = parseInt(req.params.id, 10);
  const { status } = req.body;

  // Validar o status recebido
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

    // TODO: Emitir evento via WebSocket para notificar o cliente sobre a atualização do status
    // req.io.to(`user_${pedido.UsuarioId}`).emit('status_pedido_atualizado', { pedidoId: pedido.id, status: pedido.status });

    res.status(200).json(pedido);
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter todos os pedidos (Admin/Operador - para gerenciamento)
exports.getAllPedidosAdmin = async (req, res) => {
    // Adicionar filtros por status, data, usuário, etc., se necessário
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
            include: [{ model: db.Usuario, attributes: ['id', 'nome', 'email'] }], // Incluir dados do usuário
            order: [[validSortBy, validOrder]],
            // Adicionar paginação
        });
        res.status(200).json(pedidos);
    } catch (error) {
        console.error("Erro ao buscar todos os pedidos (admin):", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

