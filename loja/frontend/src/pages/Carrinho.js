import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for ViaCEP
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Carrinho = () => {
  const [carrinho, setCarrinho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    localidade: '', // Cidade
    uf: ''
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch cart items
  useEffect(() => {
    const fetchCarrinho = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/carrinho/');
        setCarrinho(response.data);
      } catch (err) {
        console.error("Erro ao buscar carrinho:", err);
        setError('Falha ao carregar o carrinho. Tente novamente.');
      }
      setLoading(false);
    };

    if (user) {
      fetchCarrinho();
    }
  }, [user]);

  // Handle CEP input blur to fetch address
  const handleCepBlur = async (event) => {
    const cepValue = event.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setEndereco(prev => ({ ...prev, cep: cepValue })); // Update CEP state immediately

    if (cepValue.length === 8) {
      setCepLoading(true);
      setCepError('');
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepValue}/json/`);
        if (response.data.erro) {
          setCepError('CEP não encontrado.');
          setEndereco(prev => ({ ...prev, logradouro: '', bairro: '', localidade: '', uf: '' }));
        } else {
          setEndereco(prev => ({
            ...prev,
            logradouro: response.data.logradouro || '',
            bairro: response.data.bairro || '',
            localidade: response.data.localidade || '',
            uf: response.data.uf || ''
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        setCepError('Erro ao buscar CEP. Verifique sua conexão.');
        setEndereco(prev => ({ ...prev, logradouro: '', bairro: '', localidade: '', uf: '' }));
      }
      setCepLoading(false);
    }
  };

  // Handle address form input changes
  const handleEnderecoChange = (event) => {
    const { name, value } = event.target;
    setEndereco(prev => ({ ...prev, [name]: value }));
  };

  // Handle quantity update
  const handleUpdateQuantidade = async (itemId, novaQuantidade) => {
    if (novaQuantidade < 1) return; // Minimum quantity is 1
    try {
      await api.put(`/carrinho/items/${itemId}`, { quantidade: novaQuantidade });
      // Refetch cart to update UI
      const response = await api.get('/carrinho/');
      setCarrinho(response.data);
    } catch (err) {
      console.error("Erro ao atualizar quantidade:", err);
      setError('Falha ao atualizar quantidade do item.');
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    try {
      await api.delete(`/carrinho/items/${itemId}`);
      // Refetch cart
      const response = await api.get('/carrinho/');
      setCarrinho(response.data);
    } catch (err) {
      console.error("Erro ao remover item:", err);
      setError('Falha ao remover item do carrinho.');
    }
  };

  // Calculate total price
  const calcularTotal = () => {
    if (!carrinho || !carrinho.ItemCarrinhos) return 0;
    return carrinho.ItemCarrinhos.reduce((total, item) => {
      const preco = item.Produto?.preco || 0;
      return total + item.quantidade * preco;
    }, 0);
  };

  // Handle order submission
  const handleFinalizarPedido = async (event) => {
    event.preventDefault();
    setOrderLoading(true);
    setError('');

    // Basic validation
    if (!endereco.cep || !endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.localidade || !endereco.uf) {
        setError('Por favor, preencha todos os campos obrigatórios do endereço.');
        setOrderLoading(false);
        return;
    }

    try {
      await api.post("/pedidos/", {       enderecoEntrega: endereco // Send the full address object
      });
      alert('Pedido realizado com sucesso!');
      setCarrinho(null); // Clear cart visually (backend already cleared it)
      navigate('/pedidos'); // Redirect to orders page
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err);
      setError(err.response?.data?.message || 'Falha ao finalizar o pedido. Tente novamente.');
    }
    setOrderLoading(false);
  };

  if (loading) return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando Carrinho...</span></div></div>;
  if (error && !carrinho) return <div className="alert alert-danger">{error}</div>; // Show error only if cart failed to load initially

  return (
    <div className="container mt-4">
      <h2>Meu Carrinho</h2>
      {error && <div className="alert alert-danger">{error}</div>} 

      {!carrinho || !carrinho.ItemCarrinhos || carrinho.ItemCarrinhos.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço Unit.</th>
                <th>Quantidade</th>
                <th>Subtotal</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carrinho.ItemCarrinhos.map(item => (
                <tr key={item.id}>
                  <td>{item.Produto?.nome || 'Produto não encontrado'}</td>
                  <td>R$ {parseFloat(item.Produto?.preco || 0).toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => handleUpdateQuantidade(item.id, parseInt(e.target.value, 10))}
                      className="form-control form-control-sm" style={{ width: '70px' }}
                    />
                  </td>
                  <td>R$ {(item.quantidade * (item.Produto?.preco || 0)).toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleRemoveItem(item.id)} className="btn btn-danger btn-sm">Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end fw-bold">Total:</td>
                <td className="fw-bold">R$ {calcularTotal().toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <hr />

          <h3>Endereço de Entrega</h3>
          <form onSubmit={handleFinalizarPedido}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="cep" className="form-label">CEP</label>
                <input
                  type="text"
                  className={`form-control ${cepError ? 'is-invalid' : ''}`}
                  id="cep"
                  name="cep"
                  value={endereco.cep}
                  onChange={handleEnderecoChange} // Update state on change
                  onBlur={handleCepBlur} // Fetch address on blur
                  maxLength="9" // 00000-000
                  placeholder="00000-000"
                  required
                  disabled={cepLoading || orderLoading}
                />
                {cepLoading && <div className="form-text">Buscando CEP...</div>}
                {cepError && <div className="invalid-feedback">{cepError}</div>}
              </div>

              <div className="col-md-8">
                <label htmlFor="logradouro" className="form-label">Endereço (Rua, Av.)</label>
                <input
                  type="text"
                  className="form-control"
                  id="logradouro"
                  name="logradouro"
                  value={endereco.logradouro}
                  onChange={handleEnderecoChange}
                  required
                  disabled={cepLoading || orderLoading}
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="numero" className="form-label">Número</label>
                <input
                  type="text"
                  className="form-control"
                  id="numero"
                  name="numero"
                  value={endereco.numero}
                  onChange={handleEnderecoChange}
                  required
                  disabled={orderLoading}
                />
              </div>

              <div className="col-md-8">
                <label htmlFor="complemento" className="form-label">Complemento (Opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  id="complemento"
                  name="complemento"
                  value={endereco.complemento}
                  onChange={handleEnderecoChange}
                  disabled={orderLoading}
                />
              </div>

              <div className="col-md-5">
                <label htmlFor="bairro" className="form-label">Bairro</label>
                <input
                  type="text"
                  className="form-control"
                  id="bairro"
                  name="bairro"
                  value={endereco.bairro}
                  onChange={handleEnderecoChange}
                  required
                  disabled={cepLoading || orderLoading}
                />
              </div>

              <div className="col-md-5">
                <label htmlFor="localidade" className="form-label">Cidade</label>
                <input
                  type="text"
                  className="form-control"
                  id="localidade"
                  name="localidade"
                  value={endereco.localidade}
                  onChange={handleEnderecoChange}
                  required
                  disabled={cepLoading || orderLoading}
                />
              </div>

              <div className="col-md-2">
                <label htmlFor="uf" className="form-label">UF</label>
                <input
                  type="text"
                  className="form-control"
                  id="uf"
                  name="uf"
                  value={endereco.uf}
                  onChange={handleEnderecoChange}
                  maxLength="2"
                  required
                  disabled={cepLoading || orderLoading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success mt-4" disabled={orderLoading || cepLoading || !carrinho || carrinho.ItemCarrinhos.length === 0}>
              {orderLoading ? 'Finalizando...' : 'Finalizar Pedido'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Carrinho;