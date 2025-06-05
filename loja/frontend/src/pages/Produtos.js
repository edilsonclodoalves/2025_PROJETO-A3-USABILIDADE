import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import ProductItem from '../components/ProductItem';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const collapseNavbarRef = useRef(null);

  // Initialize navbar collapse
  useEffect(() => {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse) {
      collapseNavbarRef.current = new bootstrap.Collapse(navbarCollapse, { toggle: false });
    }
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (priceFilter.min) params.minPrice = priceFilter.min;
        if (priceFilter.max) params.maxPrice = priceFilter.max;

        const response = await api.get('/produtos', { params });
        let filteredProducts = response.data;
        // Client-side price filtering as fallback
        if (priceFilter.min || priceFilter.max) {
          filteredProducts = filteredProducts.filter(p => 
            (!priceFilter.min || p.preco >= parseFloat(priceFilter.min)) &&
            (!priceFilter.max || p.preco <= parseFloat(priceFilter.max))
          );
        }
        setProdutos(filteredProducts);
        if (filteredProducts.length === 0 && (searchTerm || priceFilter.min || priceFilter.max)) {
          toast.warn('Nenhum produto corresponde aos filtros selecionados.', { autoClose: 3000 });
        }
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError('Não foi possível carregar os produtos. Por favor, tente novamente.');
        toast.error('Erro ao carregar os produtos. Tente novamente.', { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [searchTerm, priceFilter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    if (collapseNavbarRef.current) {
      collapseNavbarRef.current.hide();
    }
  };

  const handlePriceFilterChange = (event, type) => {
    setPriceFilter(prev => ({
      ...prev,
      [type]: event.target.value
    }));
    if (collapseNavbarRef.current) {
      collapseNavbarRef.current.hide();
    }
  };

  return (
    <div className="container my-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick />
      <h2 className="display-4 fw-bold text-center mb-5 text-primary">Explore Nossos Produtos</h2>

      {/* Search and Filters */}
      <div className="card shadow-lg mb-5 rounded-3 border-0">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6">
              <label htmlFor="searchInput" className="form-label fw-semibold">Pesquisar</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-primary"></i>
                </span>
                <input
                  id="searchInput"
                  type="text"
                  className="form-control border-start-0 rounded-end"
                  placeholder="Nome ou descrição do produto..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row g-2">
                <div className="col">
                  <label htmlFor="minPrice" className="form-label fw-semibold">Preço Mínimo (R$)</label>
                  <input
                    id="minPrice"
                    type="number"
                    className="form-control"
                    placeholder="Ex: 50"
                    value={priceFilter.min}
                    onChange={(e) => handlePriceFilterChange(e, 'min')}
                    min="0"
                  />
                </div>
                <div className="col">
                  <label htmlFor="maxPrice" className="form-label fw-semibold">Preço Máximo (R$)</label>
                  <input
                    id="maxPrice"
                    type="number"
                    className="form-control"
                    placeholder="Ex: 500"
                    value={priceFilter.max}
                    onChange={(e) => handlePriceFilterChange(e, 'max')}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Carregando produtos...</span>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {produtos.length > 0 ? (
            produtos.map(produto => (
              <div className="col" key={produto.id}>
                <ProductItem produto={produto} />
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-muted py-5">
              <i className="bi bi-box-seam display-1 text-secondary opacity-50"></i>
              <p className="lead mt-3">Nenhum produto corresponde aos filtros selecionados.</p>
              <button className="btn btn-link" onClick={() => { setSearchTerm(''); setPriceFilter({ min: '', max: '' }); }}>
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Produtos;