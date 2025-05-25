require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // Para Socket.IO
const { Server } = require("socket.io"); // Para Socket.IO
const db = require("./models");

// Importar Rotas
const usuarioRoutes = require("./routes/usuarioRoutes");
const produtoRoutes = require("./routes/produtoRoutes");
const carrinhoRoutes = require("./routes/carrinhoRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const relatorioRoutes = require("./routes/relatorioRoutes");

const app = express();
const server = http.createServer(app); // Criar servidor HTTP para o Socket.IO

// Configurar CORS
// TODO: Configurar origens permitidas de forma mais segura em produção
app.use(cors());

// Middlewares
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); // Para parsear form data

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // TODO: Restringir em produção (ex: http://localhost:3000)
    methods: ["GET", "POST"]
  }
});

// Middleware para injetar io no request (para uso nos controllers)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rotas da API
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/avaliacoes", avaliacaoRoutes);
app.use("/api/relatorios", relatorioRoutes);

// Rota de Teste
app.get("/", (req, res) => {
  res.send("API da Sorveteria Funcionando!");
});

// Lógica do Socket.IO
io.on("connection", (socket) => {
  console.log(`Usuário conectado com socket ID: ${socket.id}`);

  // Exemplo: Entrar em uma sala específica para o usuário (após autenticação)
  // socket.on("join_user_room", (userId) => {
  //   socket.join(`user_${userId}`);
  //   console.log(`Socket ${socket.id} entrou na sala user_${userId}`);
  // });

  // Exemplo: Ouvir evento para atualizar status do pedido (emitido pelo controller)
  // (A emissão real está comentada no pedidoController por enquanto)

  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});


// Sincronizar com Banco de Dados e Iniciar Servidor
const PORT = process.env.PORT || 3001;

db.sequelize.sync({ force: false }) // force: false para não recriar tabelas a cada inicialização
  .then(() => {
    console.log("Banco de dados sincronizado.");
    server.listen(PORT, () => {
      console.log(`Servidor backend rodando na porta ${PORT}`);
      console.log(`Socket.IO ouvindo na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao sincronizar com o banco de dados:", err);
  });

