const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Carrinho = sequelize.define("Carrinho", { //Será criada Carrinhos o sequelize pluraliza automaticamente o nome do modelo e o utiliza como nome da tabela;
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // UsuarioId será adicionado automaticamente pela associação
    // UsuarioId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   unique: true, // Geralmente um usuário tem apenas um carrinho ativo
    //   references: {
    //     model: 'Usuarios',
    //     key: 'id'
    //   }
    // },
    // Pode adicionar campos como 'ultimaAtualizacao' se necessário
  }, {
    timestamps: true, // Adiciona createdAt e updatedAt
  });

  // Associações (definidas em models/index.js)
  // Carrinho.belongsTo(models.Usuario);
  // Carrinho.hasMany(models.ItemCarrinho);

  return Carrinho;
};

