const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "sorveteria_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "secret",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false, // Desativar logs SQL no console
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.Usuario = require("./Usuario")(sequelize, Sequelize);
db.Produto = require("./Produto")(sequelize, Sequelize);
db.Pedido = require("./Pedido")(sequelize, Sequelize);
db.Carrinho = require("./Carrinho")(sequelize, Sequelize);
db.ItemCarrinho = require("./ItemCarrinho")(sequelize, Sequelize);
db.Avaliacao = require("./Avaliacao")(sequelize, Sequelize);

// Definir associações
// Usuário
db.Usuario.hasOne(db.Carrinho, { foreignKey: "UsuarioId", onDelete: "CASCADE" });
db.Usuario.hasMany(db.Pedido, { foreignKey: "UsuarioId" });
db.Usuario.hasMany(db.Avaliacao, { foreignKey: "UsuarioId" });

// Carrinho
db.Carrinho.belongsTo(db.Usuario, { foreignKey: "UsuarioId" });
db.Carrinho.hasMany(db.ItemCarrinho, { foreignKey: "CarrinhoId", onDelete: "CASCADE" });

// ItemCarrinho
db.ItemCarrinho.belongsTo(db.Carrinho, { foreignKey: "CarrinhoId" });
db.ItemCarrinho.belongsTo(db.Produto, { foreignKey: "ProdutoId" });

// Produto
db.Produto.hasMany(db.ItemCarrinho, { foreignKey: "ProdutoId" });
db.Produto.hasMany(db.Avaliacao, { foreignKey: "ProdutoId" });
// Adicionar associação com Receita/Insumo se necessário

// Pedido
db.Pedido.belongsTo(db.Usuario, { foreignKey: "UsuarioId" });
// Se usar ItemPedido:
// db.Pedido.hasMany(db.ItemPedido, { foreignKey: 'PedidoId', onDelete: 'CASCADE' });

// Avaliação
db.Avaliacao.belongsTo(db.Usuario, { foreignKey: "UsuarioId" });
db.Avaliacao.belongsTo(db.Produto, { foreignKey: "ProdutoId" });

// Sincronizar modelos (opcional, usar migrations é melhor prática)
// sequelize.sync({ force: false })
//   .then(() => console.log("Banco de dados sincronizado"))
//   .catch((err) => console.error("Erro ao sincronizar banco de dados:", err));

module.exports = db;

