const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProdutoVendido = sequelize.define("ProdutoVendido", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeProduto: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    precoUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dataVenda: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
  });

  // Associações serão feitas no index.js
  // ProdutoVendido.belongsTo(models.Produto);
  // ProdutoVendido.belongsTo(models.Pedido);

  return ProdutoVendido;
};