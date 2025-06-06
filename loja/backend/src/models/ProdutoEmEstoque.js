const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProdutoEmEstoque = sequelize.define("ProdutoEmEstoque", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    localizacao: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dataReposicao: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
  });

  // Associações serão feitas no index.js
  // ProdutoEmEstoque.belongsTo(models.Produto);

  return ProdutoEmEstoque;
};