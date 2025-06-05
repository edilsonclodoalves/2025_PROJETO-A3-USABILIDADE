const db = require("../models");
const { Sequelize } = db;
const ProdutoVendido = db.ProdutoVendido;
const Produto = db.Produto;

// ✅ Criar um produto vendido (registro de venda)
exports.create = async (req, res) => {
  const { produtoId, nomeProduto, quantidade, precoUnitario, dataVenda, vendaId } = req.body;

  if (!produtoId || !quantidade || !precoUnitario || !dataVenda || !vendaId) {
    return res.status(400).json({ message: "Campos obrigatórios estão faltando." });
  }

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const novoProdutoVendido = await ProdutoVendido.create({
      produtoId,
      nomeProduto: nomeProduto || produto.nome,
      quantidade,
      precoUnitario,
      dataVenda,
      vendaId,
      createdAt: new Date()
    });

    res.status(201).json(novoProdutoVendido);

  } catch (error) {
    console.error("Erro ao criar ProdutoVendido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter todos os produtos vendidos
exports.getAll = async (req, res) => {
  try {
    const vendidos = await ProdutoVendido.findAll({
      order: [["dataVenda", "DESC"]]
    });
    res.status(200).json(vendidos);
  } catch (error) {
    console.error("Erro ao buscar produtos vendidos:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter produtos vendidos por ID do produto
exports.getByProdutoId = async (req, res) => {
  const produtoId = parseInt(req.params.produtoId, 10);

  try {
    const vendidos = await ProdutoVendido.findAll({
      where: { produtoId },
      order: [["dataVenda", "DESC"]]
    });

    if (!vendidos.length) {
      return res.status(404).json({ message: "Nenhuma venda encontrada para este produto." });
    }

    res.status(200).json(vendidos);
  } catch (error) {
    console.error("Erro ao buscar vendas por produto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter produtos vendidos por ID do pedido/venda
exports.getByPedidoId = async (req, res) => {
  const vendaId = parseInt(req.params.pedidoId, 10);

  try {
    const vendidos = await ProdutoVendido.findAll({
      where: { vendaId },
      order: [["dataVenda", "DESC"]]
    });

    if (!vendidos.length) {
      return res.status(404).json({ message: "Nenhuma venda encontrada para este pedido." });
    }

    res.status(200).json(vendidos);
  } catch (error) {
    console.error("Erro ao buscar vendas por pedido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter estatísticas gerais de vendas
exports.getEstatisticas = async (req, res) => {
  try {
    const totalVendas = await ProdutoVendido.count();
    const totalItensVendidos = await ProdutoVendido.sum("quantidade");
    const faturamentoTotal = await ProdutoVendido.sum(
      Sequelize.literal("quantidade * precoUnitario")
    );

    const maisVendidos = await ProdutoVendido.findAll({
      attributes: [
        "produtoId",
        "nomeProduto",
        [Sequelize.fn("SUM", Sequelize.col("quantidade")), "totalVendido"]
      ],
      group: ["produtoId", "nomeProduto"],
      order: [[Sequelize.literal("totalVendido"), "DESC"]],
      limit: 5
    });

    res.status(200).json({
      totalVendas,
      totalItensVendidos,
      faturamentoTotal,
      produtosMaisVendidos: maisVendidos
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Atualizar registro de produto vendido
exports.update = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { quantidade, precoUnitario, dataVenda, nomeProduto } = req.body;

  try {
    const venda = await ProdutoVendido.findByPk(id);

    if (!venda) {
      return res.status(404).json({ message: "Produto vendido não encontrado." });
    }

    venda.quantidade = quantidade ?? venda.quantidade;
    venda.precoUnitario = precoUnitario ?? venda.precoUnitario;
    venda.dataVenda = dataVenda ?? venda.dataVenda;
    venda.nomeProduto = nomeProduto ?? venda.nomeProduto;

    await venda.save();

    res.status(200).json(venda);
  } catch (error) {
    console.error("Erro ao atualizar ProdutoVendido:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
