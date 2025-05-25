const db = require("../models");
const Carrinho = db.Carrinho;
const ItemCarrinho = db.ItemCarrinho;
const Produto = db.Produto;

// Obter o carrinho do usuário logado
exports.getCarrinho = async (req, res) => {
  const usuarioId = req.user.id;

  try {
    let carrinho = await Carrinho.findOne({
      where: { UsuarioId: usuarioId },
      include: [
        {
          model: ItemCarrinho,
          as: "ItemCarrinhos", // Certifique-se que o alias está correto (definido na associação)
          include: [
            {
              model: Produto,
              attributes: ["id", "nome", "preco", "imagemUrl"], // Incluir detalhes do produto
            },
          ],
        },
      ],
    });

    // Se o usuário não tiver carrinho, criar um
    if (!carrinho) {
      carrinho = await Carrinho.create({ UsuarioId: usuarioId });
      // Recarregar com includes após criar
      carrinho = await Carrinho.findOne({
          where: { id: carrinho.id },
          include: [
            {
              model: ItemCarrinho,
              as: "ItemCarrinhos",
              include: [{ model: Produto, attributes: ["id", "nome", "preco", "imagemUrl"] }],
            },
          ],
      });
    }

    res.status(200).json(carrinho);
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Adicionar item ao carrinho
exports.addItemCarrinho = async (req, res) => {
  const usuarioId = req.user.id;
  const { produtoId, quantidade } = req.body;

  if (!produtoId || !quantidade || quantidade <= 0) {
    return res.status(400).json({ message: "ID do produto e quantidade válida são obrigatórios." });
  }

  try {
    // Encontrar ou criar o carrinho do usuário
    let [carrinho] = await Carrinho.findOrCreate({
      where: { UsuarioId: usuarioId },
      defaults: { UsuarioId: usuarioId },
    });

    // Verificar se o produto existe
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    // Verificar se o item já existe no carrinho
    let itemCarrinho = await ItemCarrinho.findOne({
      where: { CarrinhoId: carrinho.id, ProdutoId: produtoId },
    });

    if (itemCarrinho) {
      // Se existe, atualizar a quantidade
      itemCarrinho.quantidade += parseInt(quantidade, 10);
      await itemCarrinho.save();
    } else {
      // Se não existe, criar novo item
      itemCarrinho = await ItemCarrinho.create({
        CarrinhoId: carrinho.id,
        ProdutoId: produtoId,
        quantidade: parseInt(quantidade, 10),
        // precoUnitario: produto.preco // Opcional: armazenar preço no momento da adição
      });
    }

    // Recarregar o item com detalhes do produto para retornar
    const itemAtualizado = await ItemCarrinho.findByPk(itemCarrinho.id, {
        include: [{ model: Produto, attributes: ["id", "nome", "preco", "imagemUrl"] }]
    });

    res.status(201).json(itemAtualizado);
  } catch (error) {
    console.error("Erro ao adicionar item ao carrinho:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Atualizar quantidade de um item no carrinho
exports.updateItemCarrinho = async (req, res) => {
  const usuarioId = req.user.id;
  const itemId = parseInt(req.params.itemId, 10);
  const { quantidade } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ message: "Quantidade válida é obrigatória." });
  }

  try {
    const carrinho = await Carrinho.findOne({ where: { UsuarioId: usuarioId } });
    if (!carrinho) {
      return res.status(404).json({ message: "Carrinho não encontrado." });
    }

    const itemCarrinho = await ItemCarrinho.findOne({
      where: { id: itemId, CarrinhoId: carrinho.id },
    });

    if (!itemCarrinho) {
      return res.status(404).json({ message: "Item não encontrado no carrinho." });
    }

    itemCarrinho.quantidade = parseInt(quantidade, 10);
    await itemCarrinho.save();

    // Recarregar o item com detalhes do produto para retornar
    const itemAtualizado = await ItemCarrinho.findByPk(itemCarrinho.id, {
        include: [{ model: Produto, attributes: ["id", "nome", "preco", "imagemUrl"] }]
    });

    res.status(200).json(itemAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar item do carrinho:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Remover item do carrinho
exports.removeItemCarrinho = async (req, res) => {
  const usuarioId = req.user.id;
  const itemId = parseInt(req.params.itemId, 10);

  try {
    const carrinho = await Carrinho.findOne({ where: { UsuarioId: usuarioId } });
    if (!carrinho) {
      return res.status(404).json({ message: "Carrinho não encontrado." });
    }

    const itemCarrinho = await ItemCarrinho.findOne({
      where: { id: itemId, CarrinhoId: carrinho.id },
    });

    if (!itemCarrinho) {
      return res.status(404).json({ message: "Item não encontrado no carrinho." });
    }

    await itemCarrinho.destroy();
    res.status(204).send(); // Sem conteúdo

  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Limpar carrinho (remover todos os itens)
exports.clearCarrinho = async (req, res) => {
    const usuarioId = req.user.id;

    try {
        const carrinho = await Carrinho.findOne({ where: { UsuarioId: usuarioId } });
        if (!carrinho) {
            return res.status(404).json({ message: "Carrinho não encontrado." });
        }

        await ItemCarrinho.destroy({ where: { CarrinhoId: carrinho.id } });

        res.status(204).send(); // Sem conteúdo

    } catch (error) {
        console.error("Erro ao limpar carrinho:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

