const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'loja',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'mysql@2025',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.Usuario = require('./Usuario')(sequelize, Sequelize);
db.Produto = require('./Produto')(sequelize, Sequelize);
db.Pedido = require('./Pedido')(sequelize, Sequelize);
db.Carrinho = require('./Carrinho')(sequelize, Sequelize);
db.ItemCarrinho = require('./ItemCarrinho')(sequelize, Sequelize);
db.Avaliacao = require('./Avaliacao')(sequelize, Sequelize);
db.ItemPedido = require('./ItemPedido')(sequelize, Sequelize);

// Definir associações
// Usuário
db.Usuario.hasOne(db.Carrinho, { foreignKey: 'UsuarioId', onDelete: 'CASCADE' });
db.Usuario.hasMany(db.Pedido, { foreignKey: 'UsuarioId' });
db.Usuario.hasMany(db.Avaliacao, { foreignKey: 'UsuarioId' });

// Carrinho
db.Carrinho.belongsTo(db.Usuario, { foreignKey: 'UsuarioId',  onDelete: 'CASCADE'});
db.Carrinho.belongsToMany(db.Produto, { through: db.ItemCarrinho, foreignKey: 'CarrinhoId'});
db.Carrinho.hasMany(db.ItemCarrinho, { foreignKey: 'CarrinhoId', onDelete: 'CASCADE' });

// ItemCarrinho
db.ItemCarrinho.belongsTo(db.Carrinho, { foreignKey: 'CarrinhoId' });
db.ItemCarrinho.belongsTo(db.Produto, { foreignKey: 'ProdutoId' });


// Produto
db.Produto.hasMany(db.ItemCarrinho, { foreignKey: 'ProdutoId' });
db.Produto.hasMany(db.Avaliacao, { foreignKey: 'ProdutoId' });
db.Produto.hasMany(db.ItemPedido, { foreignKey: 'ProdutoId' });

// Pedido
db.Pedido.belongsTo(db.Usuario, { foreignKey: 'UsuarioId' });
db.Pedido.hasMany(db.ItemPedido, { foreignKey: 'PedidoId', onDelete: 'CASCADE' });

// ItemPedido
db.ItemPedido.belongsTo(db.Pedido, { foreignKey: 'PedidoId',  onDelete: 'CASCADE' });
db.ItemPedido.belongsTo(db.Produto, { foreignKey: 'ProdutoId', onDelete: 'CASCADE' });

// Avaliação
db.Avaliacao.belongsTo(db.Usuario, { foreignKey: 'UsuarioId' });
db.Avaliacao.belongsTo(db.Produto, { foreignKey: 'ProdutoId' });

module.exports = db;