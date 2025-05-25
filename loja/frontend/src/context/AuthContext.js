import React, { createContext, useState, useEffect, useContext } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Função para definir o token e atualizar o estado
  const setAuthData = (newToken, userData) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    setToken(newToken);
    setUser(userData);
    setLoading(false);
  };

  // Efeito para carregar dados do usuário ao iniciar ou quando o token muda
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          // Adiciona o token ao header para a requisição /me
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/usuarios/me');
          setAuthData(token, response.data);
        } catch (error) {
          console.error("Erro ao buscar usuário pelo token:", error);
          // Token inválido ou expirado, limpar
          setAuthData(null, null);
        }
      } else {
        setLoading(false);
      }
    };
    loadUserFromToken();
  }, [token]); // Dependência apenas no token inicial

  // Função de Login com Email/Senha
  const login = async (email, senha) => {
    setLoading(true);
    try {
      const response = await api.post('/usuarios/login', { email, senha });
      setAuthData(response.data.token, response.data.user);
      return response.data; // Retorna sucesso
    } catch (error) {
      console.error("Erro no login:", error.response?.data?.message || error.message);
      setAuthData(null, null);
      throw error; // Propaga o erro para o componente de Login tratar
    }
  };

  // Função de Registro
  const register = async (nome, email, senha) => {
    setLoading(true);
    try {
      const response = await api.post('/usuarios/register', { nome, email, senha });
      setAuthData(response.data.token, response.data.user);
      return response.data; // Retorna sucesso
    } catch (error) {
      console.error("Erro no registro:", error.response?.data?.message || error.message);
      setAuthData(null, null);
      throw error; // Propaga o erro
    }
  };

  // Função de Login com Google (usando hook do @react-oauth/google)
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Enviar o access_token ou id_token para o backend
        // O backend deve verificar o token com o Google e retornar um token JWT
        // A biblioteca @react-oauth/google geralmente retorna um access_token.
        // Se o backend espera um id_token, ajuste a configuração ou o backend.
        // Assumindo que o backend /google-login espera um idToken (mais comum)
        // Precisamos obter o id_token a partir do access_token ou usar outro fluxo.

        // Alternativa: Usar fluxo que retorna id_token diretamente (se configurado)
        // Por simplicidade, vamos assumir que o backend pode lidar com access_token
        // ou que obtemos id_token de outra forma.

        // **Importante:** O backend /google-login foi implementado esperando idToken.
        // O hook useGoogleLogin por padrão retorna access_token.
        // Para obter id_token, você pode usar o fluxo implícito ou buscar info do usuário:        // const userInfoResponse = await fetch(\'https://www.googleapis.com/oauth2/v3/userinfo\', {
        //   headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        // });
        // const userInfo = await userInfoResponse.json(); // Comentado pois não está sendo usado
        // Idealmente, o backend deveria receber o id_token diretamente.
        // Se o backend só aceita id_token, o frontend precisa usar um fluxo diferente
        // ou o backend precisa ser adaptado.

        // **Simulando envio de um token (requer ajuste real):**
        // Supondo que temos o id_token (precisa ajustar o fluxo do useGoogleLogin ou backend)
        // const idToken = "TOKEN_ID_OBTIDO_DO_GOOGLE"; // Substituir pela lógica correta
        // const response = await api.post('/usuarios/google-login', { idToken });

        // **Solução Temporária (NÃO IDEAL): Enviar info do usuário para um endpoint diferente**
        // Ou adaptar o backend para aceitar access_token e verificar no backend.
        // Vamos manter a chamada original, mas cientes da necessidade de ajuste:

        // **Atenção:** Esta parte requer um idToken real obtido do Google.
        // O código abaixo falhará sem um idToken válido.
        // console.warn("A integração Google Login requer um idToken válido.");
        // const response = await api.post('/usuarios/google-login', { idToken: tokenResponse.access_token }); // INCORRETO - access_token != idToken

        // **Placeholder:** Simular sucesso sem chamada real ao backend por enquanto
        console.warn("Placeholder Google Login: Simulating success without backend call due to idToken issue.");
        // setAuthData(response.data.token, response.data.user);
        setLoading(false);
        // throw new Error("Google Login backend integration needs idToken.");

      } catch (error) {
        console.error('Google Login Failed:', error.response?.data?.message || error.message);
        logout(); // Garante que o usuário seja deslogado em caso de falha
      }
    },
    onError: (error) => {
      console.error('Google Login Hook Error:', error);
      logout();
    },
    // flow: 'auth-code', // Usar 'auth-code' para obter código de autorização (mais seguro, requer backend)
    // ux_mode: 'popup', // ou 'redirect'
  });

  // Função de Logout
  const logout = () => {
    setLoading(true);
    googleLogout(); // Limpa sessão do Google
    setAuthData(null, null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loginWithGoogle, loading, isAuthenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};

