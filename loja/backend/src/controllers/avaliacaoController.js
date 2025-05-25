const db = require("../models");
const Avaliacao = db.Avaliacao;
const Produto = db.Produto;
const Usuario = db.Usuario;

// Criar uma nova avaliação para um produto
exports.createAvaliacao = async (req, res) => {
  const usuarioId = req.user.id;
  const { produtoId, nota, comentario } = req.body;

  if (!produtoId || nota === undefined || nota < 1 || nota > 5) {
    return res.status(400).json({ message: "ID do produto e nota válida (1-5) são obrigatórios." });
  }

  try {
    // Verificar se o produto existe
    const produto = await Produto.findByPk(produtoId);
    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    // Verificar se o usuário já avaliou este produto (opcional, depende da regra)
    // const existingAvaliacao = await Avaliacao.findOne({ where: { UsuarioId: usuarioId, ProdutoId: produtoId } });
    // if (existingAvaliacao) {
    //   return res.status(400).json({ message: "Você já avaliou este produto." });
    // }

    // Criar a avaliação
    const novaAvaliacao = await Avaliacao.create({
      UsuarioId: usuarioId,
      ProdutoId: produtoId,
      nota: parseInt(nota, 10),
      comentario: comentario,
    });

    // Recarregar para incluir associações (opcional)
    const avaliacaoCriada = await Avaliacao.findByPk(novaAvaliacao.id, {
        include: [
            { model: Usuario, attributes: ["id", "nome"] },
            // { model: Produto, attributes: ["id", "nome"] } // Já temos o produtoId
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

// Obter todas as avaliações de um produto específico
exports.getAvaliacoesByProduto = async (req, res) => {
  const produtoId = parseInt(req.params.produtoId, 10);

  try {
    const avaliacoes = await Avaliacao.findAll({
      where: { ProdutoId: produtoId },
      include: [
        { model: Usuario, attributes: ["id", "nome"] }, // Incluir nome do usuário
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error("Erro ao buscar avaliações do produto:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter todas as avaliações feitas por um usuário específico
exports.getAvaliacoesByUsuario = async (req, res) => {
    const usuarioId = parseInt(req.params.usuarioId, 10);
    const loggedInUserId = req.user.id;
    const loggedInUserRole = req.user.role;

    // Permitir acesso apenas para o próprio usuário ou admin
    if (loggedInUserRole !== 'admin' && loggedInUserId !== usuarioId) {
        return res.status(403).json({ message: "Acesso negado." });
    }

    try {
        const avaliacoes = await Avaliacao.findAll({
            where: { UsuarioId: usuarioId },
            include: [
                { model: Produto, attributes: ["id", "nome", "imagemUrl"] }, // Incluir detalhes do produto avaliado
            ],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json(avaliacoes);
    } catch (error) {
        console.error("Erro ao buscar avaliações do usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

// Atualizar uma avaliação (apenas o próprio usuário)
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

    // Verificar se o usuário logado é o dono da avaliação
    if (avaliacao.UsuarioId !== usuarioId) {
      return res.status(403).json({ message: "Acesso negado. Você só pode editar suas próprias avaliações." });
    }

    avaliacao.nota = parseInt(nota, 10);
    avaliacao.comentario = comentario || avaliacao.comentario; // Permite remover comentário passando null ou ""
    await avaliacao.save();

    // Recarregar para incluir associações (opcional)
    const avaliacaoAtualizada = await Avaliacao.findByPk(avaliacao.id, {
        include: [{ model: Usuario, attributes: ["id", "nome"] }]
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

// Deletar uma avaliação (próprio usuário ou admin)
exports.deleteAvaliacao = async (req, res) => {
  const avaliacaoId = parseInt(req.params.id, 10);
  const usuarioId = req.user.id;
  const userRole = req.user.role;

  try {
    const avaliacao = await Avaliacao.findByPk(avaliacaoId);

    if (!avaliacao) {
      return res.status(404).json({ message: "Avaliação não encontrada." });
    }

    // Verificar permissão: dono da avaliação ou admin
    if (avaliacao.UsuarioId !== usuarioId && userRole !== "admin") {
      return res.status(403).json({ message: "Acesso negado." });
    }

    await avaliacao.destroy();
    res.status(204).send(); // Sem conteúdo

  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

