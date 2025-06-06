import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Importar Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Produtos from './pages/Produtos';
import Carrinho from './pages/Carrinho';
import Pedidos from './pages/Pedidos';
import Perfil from './pages/Perfil';
import Dashboard from './pages/Dashboard';
// import Relatorios from './pages/Relatorios';
import Usuarios from './pages/Usuarios';
import AdminProdutos from './pages/AdminProdutos';

// Importar Componentes
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Navbar />
            <div className="container mt-4">
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/produtos" element={<Produtos />} />

                {/* Rotas Protegidas (Usuário Logado) */}
                <Route path="/carrinho" element={<ProtectedRoute><Carrinho /></ProtectedRoute>} />
                <Route path="/pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

                {/* Rotas Protegidas (Admin/Operador) */}
                <Route 
                  path="/admin/pedidos" 
                  element={<ProtectedRoute roles={['admin', 'operador']}><Pedidos /></ProtectedRoute>} 
                />
                <Route 
                  path="/dashboard" 
                  element={<ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>} 
                />
                {/* <Route 
                  path="/relatorios" 
                  element={<ProtectedRoute roles={['admin', 'operador']}><Relatorios /></ProtectedRoute>} 
                /> */}
                <Route 
                  path="/usuarios" 
                  element={<ProtectedRoute roles={['admin']}><Usuarios /></ProtectedRoute>} 
                />
                <Route 
                  path="/admin/produtos" 
                  element={<ProtectedRoute roles={['admin', 'operador']}><AdminProdutos /></ProtectedRoute>} 
                />
                {/* Rota de Fallback para Páginas Não Encontradas */}
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