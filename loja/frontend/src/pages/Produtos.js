import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductItem from '../components/ProductItem'; // Será criado depois

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Adicionar estados para filtros (preço, etc.) se necessário

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      setError('');
      try {
        // Adicionar parâmetros de filtro à requisição se necessário
        const params = {};
        if (searchTerm) {
          params.search = searchTerm;
        }
        // Ex: params.minPrice = minPriceFilter;
        // Ex: params.maxPrice = maxPriceFilter;

        const response = await api.get('/produtos', { params });
        setProdutos(response.data);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError('Falha ao carregar produtos. Tente novamente mais tarde.');
      }
      setLoading(false);
    };

    fetchProdutos();
  }, [searchTerm]); // Adicionar outras dependências de filtro aqui

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Função para lidar com a submissão da busca (se usar botão)
  // const handleSearchSubmit = (event) => {
  //   event.preventDefault();
  //   // A busca já é acionada pelo useEffect ao mudar searchTerm
  // };

  return (
    <div className="container mt-4">
      <h2>Nossos Produtos</h2>

      {/* Barra de Busca e Filtros */} 
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {/* Adicionar outros filtros aqui (dropdowns, sliders de preço, etc.) */}
      </div>

      {loading && <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando...</span></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row">
          {produtos.length > 0 ? (
            produtos.map(produto => (
              <div className="col-md-4 mb-4" key={produto.id}>
                {/* Passar dados do produto para o componente ProductItem */}
                <ProductItem produto={produto} />
              </div>
            ))
          ) : (
            <div className="col-12">
              <p>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Produtos;

