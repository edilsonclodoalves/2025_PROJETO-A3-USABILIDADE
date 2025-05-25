const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Produto = sequelize.define("Produto", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    // Campo para estoque (se aplicável, ou gerenciado por insumos)
    // estoque: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   defaultValue: 0,
    //   validate: {
    //     isInt: true,
    //     min: 0,
    //   },
    // },
    imagemUrl: { // URL da imagem do produto
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    // Categoria, tipo, etc., podem ser adicionados aqui
    // categoria: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
  }, {
    timestamps: true, // Adiciona createdAt e updatedAt
  });

  // Associações (definidas em models/index.js)
  // Produto.hasMany(models.ItemCarrinho);
  // Produto.hasMany(models.Avaliacao);

  return Produto;
};

