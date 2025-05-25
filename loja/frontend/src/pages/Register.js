import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (senha !== confirmSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await register(nome, email, senha);
      navigate('/'); // Redireciona para Home após registro bem-sucedido
    } catch (err) {
      setError(err.response?.data?.message || 'Falha no registro. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Registrar Nova Conta</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="nome" className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className="form-control"
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="senha" className="form-label">Senha</label>
                <input
                  type="password"
                  className="form-control"
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength="6" // Exemplo de validação
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmSenha" className="form-label">Confirmar Senha</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmSenha"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
            <div className="text-center">
              <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;