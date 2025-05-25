import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Perfil = () => {
  const { user, token } = useAuth(); // Assumindo que useAuth retorna o token também
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Atualiza o estado local se o usuário do contexto mudar
  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // A API espera o ID do usuário na URL para atualização
      await api.put(`/usuarios/${user.id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}` // Garante que o token está no header
        }
      });
      setSuccess('Perfil atualizado com sucesso!');
      // Opcional: Atualizar o usuário no AuthContext se a API retornar o usuário atualizado
      // login(token, response.data); // Reutilizar login para atualizar contexto?
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    }
    setLoading(false);
  };

  if (!userData) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Meu Perfil</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nome" className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            id="nome"
            name="nome"
            value={userData.nome || ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={userData.email || ''}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        {/* Adicionar campo para senha atual e nova senha se permitir alteração */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
};

export default Perfil;

