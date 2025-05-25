const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const Usuario = sequelize.define("Usuario", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("cliente", "operador", "admin"),
      defaultValue: "cliente",
      allowNull: false,
    },
    googleId: { // Para login social com Google
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    // Outros campos como telefone, endereço podem ser adicionados aqui
  }, {
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.senha) {
          const salt = await bcrypt.genSalt(10);
          usuario.senha = await bcrypt.hash(usuario.senha, salt);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed("senha") && usuario.senha) {
          const salt = await bcrypt.genSalt(10);
          usuario.senha = await bcrypt.hash(usuario.senha, salt);
        }
      },
    },
    timestamps: true, // Adiciona createdAt e updatedAt
  });

  // Método para comparar senhas
  Usuario.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.senha);
  };

  // Associações (definidas em models/index.js)
  // Usuario.hasMany(models.Pedido);
  // Usuario.hasOne(models.Carrinho);

  return Usuario;
};

