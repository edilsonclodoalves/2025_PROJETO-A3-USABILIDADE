const db = require("../models");
const { Sequelize } = db;
const Avaliacao = db.Avaliacao;
const Produto = db.Produto;
const Usuario = db.Usuario;

// ✅ Criar uma nova avaliação
exports.createAvaliacao = async (req, res) => {
  const usuarioId = req.user.id;
  const { produtoId, nota, comentario } = req.body;

  if (!produtoId || nota === undefined || nota < 1 || nota > 5) {
    return res.status(400).json({ message: "ID do produto e nota válida (1-5) são obrigatórios." });
  }

  try {
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const novaAvaliacao = await Avaliacao.create({
      UsuarioId: usuarioId,
      ProdutoId: produtoId,
      nota: parseInt(nota, 10),
      comentario: comentario,
    });

    const avaliacaoCriada = await Avaliacao.findByPk(novaAvaliacao.id, {
      include: [
        { model: Usuario, attributes: ["id", "nome"] },
        { model: Produto, attributes: ["id", "nome"] }
      ]
    });

    res.status(201).json(avaliacaoCriada);

  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: "Erro de validação", errors: messages });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter todas as avaliações de um produto específico
exports.getAvaliacoesByProduto = async (req, res) => {
  const produtoId = parseInt(req.params.produtoId, 10);

  try {
    const avaliacoes = await Avaliacao.findAll({
      where: { ProdutoId: produtoId },
      include: [
        { model: Usuario, attributes: ["id", "nome"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao buscar avaliações do produto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Obter todas as avaliações feitas por um usuário
exports.getAvaliacoesByUsuario = async (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId, 10);
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;

  if (loggedInUserRole !== 'admin' && loggedInUserId !== usuarioId) {
    return res.status(403).json({ message: "Acesso negado." });
  }

  try {
    const avaliacoes = await Avaliacao.findAll({
      where: { UsuarioId: usuarioId },
      include: [
        { model: Produto, attributes: ["id", "nome", "imagemUrl"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao buscar avaliações do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Atualizar uma avaliação (somente o próprio usuário)
exports.updateAvaliacao = async (req, res) => {
  const avaliacaoId = parseInt(req.params.id, 10);
  const usuarioId = req.user.id;
  const { nota, comentario } = req.body;

  if (nota === undefined || nota < 1 || nota > 5) {
    return res.status(400).json({ message: "Nota válida (1-5) é obrigatória." });
  }

  try {
    const avaliacao = await Avaliacao.findByPk(avaliacaoId);

    if (!avaliacao) {
      return res.status(404).json({ message: "Avaliação não encontrada." });
    }

    if (avaliacao.UsuarioId !== usuarioId) {
      return res.status(403).json({ message: "Acesso negado. Você só pode editar suas próprias avaliações." });
    }

    avaliacao.nota = parseInt(nota, 10);
    avaliacao.comentario = comentario ?? avaliacao.comentario;
    await avaliacao.save();

    const avaliacaoAtualizada = await Avaliacao.findByPk(avaliacao.id, {
      include: [
        { model: Usuario, attributes: ["id", "nome"] },
        { model: Produto, attributes: ["id", "nome"] }
      ]
    });

    res.status(200).json(avaliacaoAtualizada);

  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: "Erro de validação", errors: messages });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// ✅ Deletar uma avaliação (próprio usuário ou admin)
exports.deleteAvaliacao = async (req, res) => {
  const avaliacaoId = parseInt(req.params.id, 10);
  const usuarioId = req.user.id;
  const userRole = req.user.role;

  try {
    const avaliacao = await Avaliacao.findByPk(avaliacaoId);

    if (!avaliacao) {
      return res.status(404).json({ message: "Avaliação não encontrada." });
    }

    if (avaliacao.UsuarioId !== usuarioId && userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado." });
    }

    await avaliacao.destroy();
    res.status(204).send();

  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
<<<<<<< HEAD
};

// ✅ Obter todas as avaliações
exports.getAllAvaliacoes = async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.findAll({
      include: [
        { model: Usuario, attributes: ['id', 'nome'] },
        { model: Produto, attributes: ['id', 'nome'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar todas as avaliações:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// ✅ Distribuição de notas
exports.getDistribuicaoNotas = async (req, res) => {
  try {
    const notas = await Avaliacao.findAll({
      attributes: [
        'nota',
        [Sequelize.fn('COUNT', Sequelize.col('nota')), 'quantidade']
      ],
      group: ['nota'],
      order: [['nota', 'DESC']]
    });

    res.status(200).json(notas);
  } catch (error) {
    console.error("Erro ao buscar distribuição de notas:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
=======
};
>>>>>>> 82fd50fef8870610f5f94e030c8bb03477e79246
