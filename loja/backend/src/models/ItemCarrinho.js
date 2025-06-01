const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ItemCarrinho = sequelize.define("ItemCarrinho", { //Será criada ItemCarrinhos o sequelize pluraliza automaticamente o nome do modelo e o utiliza como nome da tabela;
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // CarrinhoId será adicionado automaticamente pela associação
    CarrinhoId: {
       type: DataTypes.INTEGER,
       allowNull: false,
       references: {
         model: 'Carrinhos',
         key: 'id'
       }
     },
    // ProdutoId será adicionado automaticamente pela associação
     ProdutoId: {
       type: DataTypes.INTEGER,
       allowNull: false,
       references: {
         model: 'Produtos',
         key: 'id'
       }
     },
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
     precoUnitario: {
       type: DataTypes.DECIMAL(10, 2),
       allowNull: false,
     },
  }, {
    timestamps: true, // Adiciona createdAt e updatedAt
  });
  return ItemCarrinho;
};

