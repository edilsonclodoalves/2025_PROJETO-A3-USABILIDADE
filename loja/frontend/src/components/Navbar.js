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

  // Configuration for role-based navigation
  const roleConfig = {
    admin: {
      links: [
        { path: '/', label: 'Home', icon: 'bi-house-door' },
        { path: '/produtos', label: 'Produtos', icon: 'bi-shop' },
      ],
      dropdown: {
        title: (
          <>
            <i className="bi bi-gear me-1"></i>Administração
          </>
        ),
        id: 'navbarDropdownAdmin',
        items: [
          { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
          { path: '/admin/pedidos', label: 'Gerenciar Pedidos', icon: 'bi-list-ul' },
          { path: '/usuarios', label: 'Gerenciar Usuários', icon: 'bi-people' },
          { path: '/admin/produtos', label: 'Gerenciar Produtos', icon: 'bi-box-seam' },
        ],
      },
    },
    operador: {
      links: [
        { path: '/', label: 'Home', icon: 'bi-house-door' },
        { path: '/produtos', label: 'Produtos', icon: 'bi-shop' },
      ],
      dropdown: {
        title: (
          <>
            <i className="bi bi-gear me-1"></i>Administração
          </>
        ),
        id: 'navbarDropdownAdmin',
        items: [
          { path: '/admin/pedidos', label: 'Gerenciar Pedidos', icon: 'bi-list-ul' },
          { path: '/admin/produtos', label: 'Gerenciar Produtos', icon: 'bi-box-seam' },
        ],
      },
    },
    cliente: {
      links: [
        { path: '/', label: 'Home', icon: 'bi-house-door' },
        { path: '/produtos', label: 'Produtos', icon: 'bi-shop' },
        { path: '/carrinho', label: 'Carrinho', icon: 'bi-cart' },
        { path: '/pedidos', label: 'Meus Pedidos', icon: 'bi-list-ul' },
      ],
      dropdown: null,
    },
    default: {
      links: [
        { path: '/', label: 'Home', icon: 'bi-house-door' },
        { path: '/produtos', label: 'Produtos', icon: 'bi-shop' },
      ],
      dropdown: null,
    },
  };

  // Determine the config based on authentication and role
  const config = isAuthenticated && user?.role
    ? roleConfig[user.role] || roleConfig.default
    : roleConfig.default;

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4" collapseOnSelect>
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-ice-cream me-2"></i>Sorveteria Delícia
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            {config.links.map((link) => (
              <Nav.Link
                key={link.path}
                as={Link}
                to={link.path}
                className={isActive(link.path)}
              >
                <i className={`bi ${link.icon} me-1`}></i>{link.label}
              </Nav.Link>
            ))}
            {isAuthenticated && config.dropdown && (
              <NavDropdown title={config.dropdown.title} id={config.dropdown.id}>
                {config.dropdown.items.map((item) => (
                  <NavDropdown.Item
                    key={item.path}
                    as={Link}
                    to={item.path}
                    className={isActive(item.path)}
                  >
                    <i className={`bi ${item.icon} me-2`}></i>{item.label}
                  </NavDropdown.Item>
                ))}
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