import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      setError('');
      try {
        // A rota /pedidos/me busca os pedidos do usuário logado
        const response = await api.get('/pedidos/me');
        setPedidos(response.data);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        setError('Falha ao carregar seus pedidos. Tente novamente.');
      }
      setLoading(false);
    };

    if (user) {
      fetchPedidos();
    }
  }, [user]);

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatarStatus = (status) => {
    switch (status) {
      case 'pendente': return <span className="badge bg-warning text-dark">Pendente</span>;
      case 'processando': return <span className="badge bg-info text-dark">Processando</span>;
      case 'enviado': return <span className="badge bg-primary">Enviado</span>;
      case 'entregue': return <span className="badge bg-success">Entregue</span>;
      case 'cancelado': return <span className="badge bg-danger">Cancelado</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Carregando Pedidos...</span></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Meus Pedidos</h2>
      {pedidos.length === 0 ? (
        <p>Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Data</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th>Endereço</th>
                {/* Adicionar coluna para detalhes se necessário */}
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{formatarData(pedido.createdAt)}</td>
                  <td>R$ {parseFloat(pedido.valorTotal).toFixed(2)}</td>
                  <td>{formatarStatus(pedido.status)}</td>
                  <td>
                    {pedido.enderecoEntrega ? (
                      `${pedido.enderecoEntrega.logradouro || ''}, ${pedido.enderecoEntrega.numero || ''} - ${pedido.enderecoEntrega.bairro || ''}, ${pedido.enderecoEntrega.localidade || ''}/${pedido.enderecoEntrega.uf || ''}`
                    ) : (
                      'N/A'
                    )}
                  </td>
                  {/* Adicionar botão/link para ver detalhes do pedido */}
                  {/* <td><button className="btn btn-sm btn-info">Detalhes</button></td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Pedidos;

