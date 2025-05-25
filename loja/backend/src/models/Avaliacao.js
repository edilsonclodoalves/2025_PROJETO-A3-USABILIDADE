const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Avaliacao = sequelize.define("Avaliacao", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // UsuarioId será adicionado automaticamente pela associação
    // UsuarioId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Usuarios',
    //     key: 'id'
    //   }
    // },
    // ProdutoId será adicionado automaticamente pela associação
    // ProdutoId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Produtos',
    //     key: 'id'
    //   }
    // },
    nota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1, // Nota mínima (ex: 1 estrela)
        max: 5, // Nota máxima (ex: 5 estrelas)
      },
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true, // Adiciona createdAt e updatedAt
  });

  // Associações (definidas em models/index.js)
  // Avaliacao.belongsTo(models.Usuario);
  // Avaliacao.belongsTo(models.Produto);

  return Avaliacao;
};

