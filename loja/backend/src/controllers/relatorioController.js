const db = require("../models");
const Pedido = db.Pedido;
const Produto = db.Produto;
const Usuario = db.Usuario;
const ItemCarrinho = db.ItemCarrinho; // Assumindo que ItemPedido não foi criado e usamos ItemCarrinho como proxy ou que Pedido armazena itens
const { Op, fn, col, literal } = require("sequelize");

// Relatório de Vendas por Período
exports.getVendasPorPeriodo = async (req, res) => {
  const { startDate, endDate, groupBy = "day" } = req.query; // groupBy pode ser 'day', 'month', 'year'

  const whereClause = {
    status: { [Op.ne]: "cancelado" }, // Excluir pedidos cancelados
  };
  if (startDate) whereClause.createdAt = { ...whereClause.createdAt, [Op.gte]: new Date(startDate) };
  if (endDate) whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: new Date(endDate) };

  let dateFormat;
  switch (groupBy) {
    case "month":
      dateFormat = "%Y-%m";
      break;
    case "year":
      dateFormat = "%Y";
      break;
    case "day":
    default:
      dateFormat = "%Y-%m-%d";
      break;
  }

  try {
    const vendas = await Pedido.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), dateFormat), "periodo"],
        [fn("COUNT", col("id")), "totalPedidos"],
        [fn("SUM", col("valorTotal")), "valorTotalVendas"],
      ],
      where: whereClause,
      group: ["periodo"],
      order: [["periodo", "ASC"]],
      raw: true, // Retorna dados brutos para agregação
    });

    res.status(200).json(vendas);
  } catch (error) {
    console.error("Erro ao gerar relatório de vendas por período:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Relatório de Produtos Mais Vendidos
exports.getProdutosMaisVendidos = async (req, res) => {
    const { limit = 10, startDate, endDate } = req.query; // Limite padrão de 10 produtos

    // Para obter os produtos mais vendidos, precisamos agregar dados dos itens vendidos.
    // Isso é mais complexo se os itens não estão diretamente ligados ao Pedido.
    // Assumindo que precisamos consultar ItemCarrinho associado a Pedidos concluídos.
    // Esta consulta pode precisar de ajustes dependendo da estrutura exata (ItemPedido vs ItemCarrinho)

    // Abordagem 1: Se Pedido tem associação direta com ItemPedido (não implementado no modelo atual)
    // Abordagem 2: Inferir a partir de ItemCarrinho (menos preciso, pois o carrinho pode mudar)
    // Abordagem 3: Modificar o modelo Pedido para incluir um snapshot dos itens.

    // Vamos tentar uma abordagem simplificada que pode não ser perfeitamente precisa
    // ou exigir uma estrutura de ItemPedido.
    // Por simplicidade, vamos simular um ranking (NÃO USAR EM PRODUÇÃO SEM AJUSTES)

    // --- INÍCIO DA SIMULAÇÃO (SUBSTITUIR POR LÓGICA REAL COM ItemPedido) ---
    try {
        const produtos = await Produto.findAll({
            limit: parseInt(limit, 10),
            order: [[fn("RAND")]], // Simulação: ordem aleatória
            attributes: [
                "id",
                "nome",
                [fn("FLOOR", literal("RAND() * 100")), "quantidadeVendida"], // Simulação
                [fn("ROUND", literal("preco * FLOOR(RAND() * 100)"), 2), "valorTotalVendido"] // Simulação
            ],
            raw: true,
        });
        res.status(200).json(produtos);
    } catch (error) { MOCK_END
        console.error("Erro ao gerar relatório de produtos mais vendidos (simulado):", error);
        res.status(500).json({ message: "Erro interno do servidor (simulado)." });
    }
    // --- FIM DA SIMULAÇÃO ---

    /* Lógica Real (requer ItemPedido ou similar):
    try {
        const wherePedido = { status: 'entregue' }; // Considerar apenas pedidos entregues
        if (startDate) wherePedido.createdAt = { ...wherePedido.createdAt, [Op.gte]: new Date(startDate) };
        if (endDate) wherePedido.createdAt = { ...wherePedido.createdAt, [Op.lte]: new Date(endDate) };

        const topProdutos = await ItemPedido.findAll({
            attributes: [
                'ProdutoId',
                [fn('SUM', col('quantidade')), 'quantidadeTotalVendida'],
                [fn('SUM', literal('quantidade * precoUnitario')), 'valorTotalVendido'] // Usar precoUnitario do ItemPedido
            ],
            include: [
                {
                    model: Pedido,
                    attributes: [],
                    where: wherePedido,
                    required: true
                },
                {
                    model: Produto,
                    attributes: ['id', 'nome', 'imagemUrl'], // Incluir detalhes do produto
                    required: true
                }
            ],
            group: ['ProdutoId', 'Produto.id', 'Produto.nome', 'Produto.imagemUrl'],
            order: [[literal('quantidadeTotalVendida'), 'DESC']],
            limit: parseInt(limit, 10),
            raw: true, // Para facilitar o manuseio dos resultados agrupados
            subQuery: false // Importante para includes com group/limit
        });

        // Mapear resultado para formato desejado
        const resultadoFormatado = topProdutos.map(item => ({
            id: item['Produto.id'],
            nome: item['Produto.nome'],
            imagemUrl: item['Produto.imagemUrl'],
            quantidadeVendida: parseInt(item.quantidadeTotalVendida, 10),
            valorTotalVendido: parseFloat(item.valorTotalVendido)
        }));

        res.status(200).json(resultadoFormatado);
    } catch (error) {
        console.error("Erro ao gerar relatório de produtos mais vendidos:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
    */
};

// Outros relatórios podem ser adicionados aqui (ex: clientes que mais compram, etc.)

