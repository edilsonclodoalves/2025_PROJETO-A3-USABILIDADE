import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [editingPedido, setEditingPedido] = useState(null);
  const [editForm, setEditForm] = useState({ enderecoEntrega: {}, status: '' });

  // Buscar pedidos
  useEffect(() => {
    const fetchPedidos = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = user.role === 'admin' || user.role === 'operador'
          ? '/pedidos/admin/all'
          : '/pedidos/me';
        const response = await api.get(endpoint);
        setPedidos(response.data);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        setError('Falha ao carregar os pedidos. Tente novamente.');
        toast.error('Falha ao carregar os pedidos.');
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
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const handleCancelPedido = async (pedidoId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;

    try {
      await api.patch(`/pedidos/${pedidoId}/cancel`);
      setPedidos(prev =>
        prev.map(pedido =>
          pedido.id === pedidoId ? { ...pedido, status: 'cancelado' } : pedido
        )
      );
      toast.success('Pedido cancelado com sucesso!');
    } catch (err) {
      console.error('Erro ao cancelar pedido:', err);
      toast.error('Falha ao cancelar o pedido. Tente novamente.');
    }
  };

  const handleDeletePedido = async (pedidoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      await api.delete(`/pedidos/${pedidoId}`);
      setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));
      toast.success('Pedido excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      toast.error('Falha ao excluir o pedido. Tente novamente.');
    }
  };

  const handleEditPedido = (pedido) => {
    setEditingPedido(pedido.id);
    setEditForm({
      enderecoEntrega: pedido.enderecoEntrega || {},
      status: pedido.status,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pedidos/${editingPedido}`, editForm);
      setPedidos(prev =>
        prev.map(pedido =>
          pedido.id === editingPedido ? { ...pedido, ...editForm } : pedido
        )
      );
      setEditingPedido(null);
      toast.success('Pedido atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao editar pedido:', err);
      toast.error('Falha ao atualizar o pedido. Tente novamente.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('enderecoEntrega.')) {
      const field = name.split('.')[1];
      setEditForm({
        ...editForm,
        enderecoEntrega: { ...editForm.enderecoEntrega, [field]: value },
      });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando Pedidos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        {error}
        <button className="btn btn-link" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>{user.role === 'admin' || user.role === 'operador' ? 'Gerenciar Pedidos' : 'Meus Pedidos'}</h2>
      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#ID</th>
                {user.role === 'admin' || user.role === 'operador' ? <th>Usuário</th> : null}
                <th>Data</th>
                <th>Itens</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  {user.role === 'admin' || user.role === 'operador' ? (
                    <td>{pedido.Usuario?.nome || 'N/A'} ({pedido.Usuario?.email || 'N/A'})</td>
                  ) : null}
                  <td>{formatarData(pedido.createdAt)}</td>
                  <td>
                    {pedido.ItemPedidos && pedido.ItemPedidos.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {pedido.ItemPedidos.map(item => (
                          <li key={item.id}>
                            {item.Produto?.nome || 'Produto não encontrado'} - Quantidade: {item.quantidade} - R$ {parseFloat(item.precoUnitario).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'Nenhum item'
                    )}
                  </td>
                  <td>R$ {parseFloat(pedido.valorTotal).toFixed(2)}</td>
                  <td>{formatarStatus(pedido.status)}</td>
                  <td>
                    {pedido.enderecoEntrega ? (
                      `${pedido.enderecoEntrega.logradouro || ''}, ${pedido.enderecoEntrega.numero || ''} - ${pedido.enderecoEntrega.bairro || ''}, ${pedido.enderecoEntrega.localidade || ''}/${pedido.enderecoEntrega.uf || ''}`
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {user.role === 'admin' && (
                      <>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEditPedido(pedido)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeletePedido(pedido.id)}
                        >
                          Excluir
                        </button>
                      </>
                    )}
                    {user.role !== 'admin' && user.role !== 'operador' && pedido.status === 'pendente' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancelPedido(pedido.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edição */}
      {editingPedido && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Pedido #{editingPedido}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingPedido(null)}
                ></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Logradouro</label>
                    <input
                      type="text"
                      className="form-control"
                      name="enderecoEntrega.logradouro"
                      value={editForm.enderecoEntrega.logradouro || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Número</label>
                    <input
                      type="text"
                      className="form-control"
                      name="enderecoEntrega.numero"
                      value={editForm.enderecoEntrega.numero || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bairro</label>
                    <input
                      type="text"
                      className="form-control"
                      name="enderecoEntrega.bairro"
                      value={editForm.enderecoEntrega.bairro || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cidade</label>
                    <input
                      type="text"
                      className="form-control"
                      name="enderecoEntrega.localidade"
                      value={editForm.enderecoEntrega.localidade || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">UF</label>
                    <input
                      type="text"
                      className="form-control"
                      name="enderecoEntrega.uf"
                      value={editForm.enderecoEntrega.uf || ''}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="processando">Processando</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingPedido(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;