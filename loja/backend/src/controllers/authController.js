const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const db = require("../models");
const Usuario = db.Usuario;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Função para gerar token JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// Registrar novo usuário
exports.register = async (req, res) => {
  const { nome, email, senha, role } = req.body;

  try {
    // Verificar se o email já existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    // Criar novo usuário (a senha será hasheada pelo hook do model)
    const newUser = await Usuario.create({ nome, email, senha, role });

    // Gerar token
    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({ token, user: { id: newUser.id, nome: newUser.nome, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ message: "Erro interno do servidor ao registrar usuário." });
  }
};

// Login com email e senha
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Encontrar usuário pelo email
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(senha);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    // Gerar token
    const token = generateToken(user.id, user.role);

    res.status(200).json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor ao fazer login." });
  }
};

// Login/Registro com Google
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body; // Token recebido do frontend

  try {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const googleId = payload["sub"];
    const email = payload["email"];
    const nome = payload["name"];
    // const picture = payload["picture"]; // Se quiser salvar a foto

    let user = await Usuario.findOne({ where: { googleId } });

    if (!user) {
      // Se não existe, verificar se já existe pelo email
      user = await Usuario.findOne({ where: { email } });

      if (user) {
        // Se existe pelo email, atualizar com googleId
        user.googleId = googleId;
        // Poderia atualizar o nome ou foto aqui se desejado
        await user.save();
      } else {
        // Se não existe nem por googleId nem por email, criar novo usuário
        // Gerar uma senha aleatória segura ou pedir para definir depois?
        // Por simplicidade, vamos gerar uma senha padrão (NÃO RECOMENDADO PARA PRODUÇÃO)
        const randomPassword = Math.random().toString(36).slice(-8);
        user = await Usuario.create({
          googleId,
          email,
          nome,
          senha: randomPassword, // Senha precisa ser definida, mesmo que não usada para login social
          role: "cliente", // Papel padrão para novos usuários via Google
        });
      }
    }

    // Gerar token JWT para o usuário encontrado ou criado
    const token = generateToken(user.id, user.role);

    res.status(200).json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });

  } catch (error) {
    console.error("Erro no login com Google:", error);
    res.status(500).json({ message: "Erro ao autenticar com Google." });
  }
};

