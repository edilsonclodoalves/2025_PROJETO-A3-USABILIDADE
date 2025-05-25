import React from 'react';
import { useAuth } from '../context/AuthContext'; // Para verificar se usuário está logado
// import { useCart } from '../context/CartContext'; // Se tiver um contexto de carrinho
import api from '../services/api'; // Para adicionar ao carrinho

const ProductItem = ({ produto }) => {
  const { isAuthenticated } = useAuth();
  // const { addItem } = useCart(); // Exemplo se usar contexto de carrinho

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para adicionar itens ao carrinho.');
      // Redirecionar para login? navigate('/login');
      return;
    }
    try {
      // Chamar API para adicionar ao carrinho (quantidade 1 por padrão)
      await api.post('/carrinho/items', { produtoId: produto.id, quantidade: 1 });
      alert(`${produto.nome} adicionado ao carrinho!`);
      // Atualizar estado do carrinho (se não usar contexto que atualiza automaticamente)
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert('Falha ao adicionar item ao carrinho.');
    }
  };

  return (
    <div className="card h-100">
      {produto.imagemUrl && (
        <img src={produto.imagemUrl} className="card-img-top" alt={produto.nome} style={{ height: '200px', objectFit: 'cover' }} />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{produto.nome}</h5>
        <p className="card-text flex-grow-1">{produto.descricao || 'Sem descrição disponível.'}</p>
        <p className="card-text fw-bold">R$ {parseFloat(produto.preco).toFixed(2)}</p>
        {/* Botão de adicionar ao carrinho */} 
        <button onClick={handleAddToCart} className="btn btn-primary mt-auto" disabled={!isAuthenticated}>
          Adicionar ao Carrinho
        </button>
        {/* Adicionar link para detalhes do produto se necessário */}
        {/* <Link to={`/produtos/${produto.id}`} className="btn btn-secondary mt-2">Ver Detalhes</Link> */}
      </div>
    </div>
  );
};

export default ProductItem;

