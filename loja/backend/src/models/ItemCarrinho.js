const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ItemCarrinho = sequelize.define("ItemCarrinho", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // CarrinhoId será adicionado automaticamente pela associação
    // CarrinhoId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Carrinhos',
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
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isInt: true,
        min: 1, // Quantidade mínima no carrinho
      },
    },
    // Preço unitário pode ser armazenado aqui para histórico, ou buscado do Produto
    // precoUnitario: {
    //   type: DataTypes.DECIMAL(10, 2),
    //   allowNull: false,
    // },
  }, {
    timestamps: true, // Adiciona createdAt e updatedAt
  });

  // Associações (definidas em models/index.js)
  // ItemCarrinho.belongsTo(models.Carrinho);
  // ItemCarrinho.belongsTo(models.Produto);

  return ItemCarrinho;
};

