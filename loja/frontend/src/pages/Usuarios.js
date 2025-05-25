import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Placeholder para a página de Gerenciamento de Usuários
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      setError('');
      try {
        // Apenas admins podem acessar esta rota no backend
        const response = await api.get('/usuarios'); 
        setUsuarios(response.data);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        setError('Falha ao carregar usuários. Você tem permissão para acessar esta página?');
      }
      setLoading(false);
    };

    fetchUsuarios();
  }, []);

  // Funções para editar/excluir usuários podem ser adicionadas aqui

  if (loading) return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando Usuários...</span></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;


  return (
    <div className="container mt-4">
      <h2>Gerenciar Usuários</h2>
      <p>Esta área é restrita a administradores.</p>
      
      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td><span className={`badge bg-${usuario.role === 'admin' ? 'danger' : 'secondary'}`}>{usuario.role}</span></td>
                <td>
                  {/* Adicionar botões de editar/excluir */}
                  <button className="btn btn-sm btn-warning me-2" disabled>Editar</button>
                  <button className="btn btn-sm btn-danger" disabled>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Usuarios;

