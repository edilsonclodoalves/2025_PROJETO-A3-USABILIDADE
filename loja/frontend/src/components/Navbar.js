import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4" collapseOnSelect>
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-ice-cream me-2"></i>Sorveteria Delícia
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={isActive('/')}>
              <i className="bi bi-house-door me-1"></i>Home
            </Nav.Link>
            <Nav.Link as={Link} to="/produtos" className={isActive('/produtos')}>
              <i className="bi bi-shop me-1"></i>Produtos
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/carrinho" className={isActive('/carrinho')}>
                <i className="bi bi-cart me-1"></i>Carrinho
              </Nav.Link>
            )}
            {isAuthenticated && user?.role !== 'admin' && user?.role !== 'operador' && (
              <Nav.Link as={Link} to="/pedidos" className={isActive('/pedidos')}>
                <i className="bi bi-list-check me-1"></i>Meus Pedidos
              </Nav.Link>
            )}
            {isAuthenticated && (user?.role === 'admin' || user?.role === 'operador') && (
              <Nav.Link as={Link} to="/admin/pedidos" className={isActive('/admin/pedidos')}>
                <i className="bi bi-list-ul me-1"></i>Pedidos
              </Nav.Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <NavDropdown
                title={
                  <>
                    <i className="bi bi-gear me-1"></i>Administração
                  </>
                }
                id="navbarDropdownAdmin"
              >
                <NavDropdown.Item as={Link} to="/dashboard" className={isActive('/dashboard')}>
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </NavDropdown.Item>
                {/* <NavDropdown.Item as={Link} to="/relatorios" className={isActive('/relatorios')}>
                  <i className="bi bi-bar-chart me-2"></i>Relatórios
                </NavDropdown.Item> */}
                <NavDropdown.Item as={Link} to="/usuarios" className={isActive('/usuarios')}>
                  <i className="bi bi-people me-2"></i>Gerenciar Usuários
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/produtos" className={isActive('/admin/produtos')}>
                  <i className="bi bi-box-seam me-2"></i>Gerenciar Produtos
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <>
                    <i className="bi bi-person-circle me-1"></i>Olá, {user?.nome || 'Usuário'}!
                  </>
                }
                id="navbarDropdownUser"
              >
                <NavDropdown.Item as={Link} to="/perfil" className={isActive('/perfil')}>
                  <i className="bi bi-person me-2"></i>Meu Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>Sair
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className={isActive('/login')}>
                  <i className="bi bi-box-arrow-in-right me-1"></i>Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className={isActive('/register')}>
                  <i className="bi bi-person-plus me-1"></i>Cadastrar
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;