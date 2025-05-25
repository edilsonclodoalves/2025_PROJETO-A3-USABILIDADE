import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// roles: Array opcional de papéis permitidos para acessar a rota
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Mostrar um loader enquanto verifica a autenticação
    return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando...</span></div></div>;
  }

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login
    // Passa a localização atual para que possa retornar após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota exige papéis específicos e o usuário não tem o papel necessário
  if (roles && roles.length > 0 && (!user || !roles.includes(user.role))) {
    // Redireciona para uma página não autorizada ou para a home
    // Poderia ser uma página específica de "Acesso Negado"
    console.warn(`Acesso negado para ${user?.email} à rota ${location.pathname}. Papel necessário: ${roles.join(', ')}, Papel do usuário: ${user?.role}`);
    return <Navigate to="/" state={{ error: "Acesso não autorizado" }} replace />;
    // Ou: return <div>Acesso Não Autorizado</div>;
  }

  // Se autenticado e (não há restrição de papel OU o usuário tem o papel permitido)
  return children;
};

export default ProtectedRoute;

