const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Pedido = sequelize.define("Pedido", {
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
    //     model: 'Usuarios', // Nome da tabela de usuários
    //     key: 'id'
    //   }
    // },
    valorTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM("pendente", "processando", "enviado", "entregue", "cancelado"),
      defaultValue: "pendente",
      allowNull: false,
    },
    enderecoEntrega: { // Pode ser um JSON ou campos separados
      type: DataTypes.TEXT,
      allowNull: true, // Ou false, dependendo da regra de negócio
      get() {
        const rawValue = this.getDataValue('enderecoEntrega');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        this.setDataValue('enderecoEntrega', JSON.stringify(value));
      }
    },
    // Adicionar campos para itens do pedido (pode ser uma tabela separada ItemPedido)
    // ou um JSON com os detalhes dos itens, dependendo da complexidade.
    // Para melhor normalização, uma tabela ItemPedido é recomendada.

    // Campo para DANFE não fiscal (se necessário)
    // danfeUrl: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },

  }, {
    timestamps: true, // Adiciona createdAt e updatedAt
  });

  // Associações (definidas em models/index.js)
  // Pedido.belongsTo(models.Usuario);
  // Pedido.hasMany(models.ItemPedido); // Se usar tabela ItemPedido

  return Pedido;
};

