import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext'; // Importar SocketProvider

// Importar Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // Importar a página de Registro
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import Pedidos from './pages/Pedidos';
import Perfil from './pages/Perfil';
import Dashboard from './pages/Dashboard';
import Relatorios from './pages/Relatorios';
import Usuarios from './pages/Usuarios';

// Importar Componentes
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || ""; // Pegar do .env

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <SocketProvider> {/* Envolver com SocketProvider */}
          <Router>
            <Navbar />
            <div className="container mt-4"> {/* Adiciona um container para espaçamento */}
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> {/* Adicionar rota de Registro */}
                <Route path="/produtos" element={<Produtos />} />

                {/* Rotas Protegidas (Usuário Logado) */}
                <Route path="/carrinho" element={<ProtectedRoute><Carrinho /></ProtectedRoute>} />
                <Route path="/pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

                {/* Rotas Protegidas (Admin) */}
                <Route path="/dashboard" element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} />
                <Route path="/relatorios" element={<ProtectedRoute roles={['admin', 'operador']}><Relatorios /></ProtectedRoute>} /> {/* Permitir operador também? */}
                <Route path="/usuarios" element={<ProtectedRoute roles={['admin']}><Usuarios /></ProtectedRoute>} />
                {/* Adicionar rota para gerenciar produtos (admin/operador) */}
                {/* <Route path="/admin/produtos" element={<ProtectedRoute roles={['admin', 'operador']}><AdminProdutos /></ProtectedRoute>} /> */}

                {/* Rota para página não encontrada (opcional) */}
                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;