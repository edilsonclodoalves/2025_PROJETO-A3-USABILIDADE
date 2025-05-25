import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redireciona para login após logout
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Sorveteria Delícia</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/produtos">Produtos</Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/carrinho">Carrinho</Link>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/pedidos">Meus Pedidos</Link>
              </li>
            )}
            {/* Links de Admin */} 
            {isAuthenticated && user?.role === 'admin' && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#!" id="navbarDropdownAdmin" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Admin
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdownAdmin">
                  <li><Link className="dropdown-item" to="/dashboard">Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/relatorios">Relatórios</Link></li>
                  <li><Link className="dropdown-item" to="/usuarios">Gerenciar Usuários</Link></li>
                  {/* Adicionar link para gerenciar produtos */} 
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to="/admin/produtos">Gerenciar Produtos</Link></li> 
                </ul>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#!" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Olá, {user?.nome || 'Usuário'}!
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownUser">
                  <li><Link className="dropdown-item" to="/perfil">Meu Perfil</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Sair</button></li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

