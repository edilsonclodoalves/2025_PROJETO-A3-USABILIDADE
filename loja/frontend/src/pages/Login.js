import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/'); // Redireciona para Home após login
    } catch (err) {
      setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // A lógica de chamada ao backend está no AuthContext
    // O hook useGoogleLogin é chamado diretamente
    // Precisamos garantir que o fluxo de idToken esteja correto
    try {
        loginWithGoogle();
        // O redirecionamento ou atualização de estado ocorrerá no AuthContext após sucesso
    } catch (err) {
        setError('Falha no login com Google.');
        console.error("Google login trigger error:", err);
    }

  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
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
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <button onClick={handleGoogleLogin} className="btn btn-danger w-100 mb-3" disabled={loading}>
              <i className="bi bi-google me-2"></i> Entrar com Google
            </button>
            <div className="text-center">
              <p>Não tem uma conta? <Link to="/register">Registre-se</Link></p>
              {/* Adicionar link para "Esqueci minha senha" se necessário */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

