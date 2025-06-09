import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Modal } from 'bootstrap';
import debounce from 'lodash/debounce';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const location = useLocation();
  const isAdminView = location.pathname === '/admin/pedidos';
  const [editingPedido, setEditingPedido] = useState(null);
  const [editForm, setEditForm] = useState({
    enderecoEntrega: {},
    status: '',
    telefone: '',
  });
  const [createForm, setCreateForm] = useState({
    usuarioId: '',
    nome: '',
    telefone: '',
    enderecoEntrega: { cep: '', logradouro: '', numero: '', bairro: '', localidade: '', uf: '' },
    itens: [{ produtoId: '', nomeProduto: '', quantidade: 1 }],
  });
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState([]);
  const [viewingContato, setViewingContato] = useState(null);
  const [usuariosBusca, setUsuariosBusca] = useState([]);
  const [produtosBusca, setProdutosBusca] = useState([]);
  const [buscaUsuarioTermo, setBuscaUsuarioTermo] = useState('');
  const [buscaProdutoTermo, setBuscaProdutoTermo] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const editModalRef = useRef(null);
  const createModalRef = useRef(null);
  const contatoModalRef = useRef(null);

  const collapseNavbar = useCallback(() => {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) {
        toggler.click();
        console.log('Navbar colapsável fechado');
      }
    }
  }, []);

  useEffect(() => {
    const initializeModals = () => {
      try {
        const editModalElement = document.getElementById('editModal');
        const createModalElement = document.getElementById('createModal');
        const contatoModalElement = document.getElementById('contatoModal');

        if (editModalElement && !editModalRef.current) {
          editModalRef.current = new Modal(editModalElement, { keyboard: false });
          editModalElement.addEventListener('hidden.bs.modal', () => {
            const navbarToggler = document.querySelector('.navbar-toggler');
            if (navbarToggler) navbarToggler.focus();
          });
        }
        if (createModalElement && !createModalRef.current) {
          createModalRef.current = new Modal(createModalElement, { keyboard: false });
          createModalElement.addEventListener('hidden.bs.modal', () => {
            const navbarToggler = document.querySelector('.navbar-toggler');
            if (navbarToggler) navbarToggler.focus();
          });
        }
        if (contatoModalElement && !contatoModalRef.current) {
          contatoModalRef.current = new Modal(contatoModalElement, { keyboard: false });
          contatoModalElement.addEventListener('hidden.bs.modal', () => {
            const navbarToggler = document.querySelector('.navbar-toggler');
            if (navbarToggler) navbarToggler.focus();
          });
        }
      } catch (err) {
        console.error('Erro ao inicializar modais:', err);
        toast.error('Erro ao inicializar os modais. Tente recarregar a página.');
      }
    };

    initializeModals();
    const timeoutId = setTimeout(initializeModals, 100);

    const observer = new MutationObserver(() => {
      initializeModals();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      const modals = ['editModal', 'createModal', 'contatoModal'];
      modals.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          element.removeEventListener('hidden.bs.modal', () => {});
        }
      });
      if (editModalRef.current) editModalRef.current.dispose();
      if (createModalRef.current) createModalRef.current.dispose();
      if (contatoModalRef.current) contatoModalRef.current.dispose();
      editModalRef.current = null;
      createModalRef.current = null;
      contatoModalRef.current = null;
    };
  }, []);

  const fetchPedidos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = isAdminView ? '/pedidos/admin/all' : '/pedidos/me';
      const params = isAdminView ? { status: filterStatus, search: searchTerm } : {};
      const response = await api.get(endpoint, { params });
      setPedidos(response.data);
      console.log('Pedidos retornados:', response.data);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Falha ao carregar os pedidos. Tente novamente.');
      toast.error('Falha ao carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  }, [user, isAdminView, filterStatus, searchTerm]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const buscarUsuarios = useCallback(debounce(async (termo) => {
    if (termo.length < 3) {
      setUsuariosBusca([]);
      return;
    }
    try {
      const response = await api.get('/usuarios/busca', { params: { termo } });
      setUsuariosBusca(response.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      toast.error('Falha ao buscar usuários.');
    }
  }, 500), []);

  useEffect(() => {
    buscarUsuarios(buscaUsuarioTermo);
    return () => buscarUsuarios.cancel();
  }, [buscaUsuarioTermo, buscarUsuarios]);

  const buscarProdutos = useCallback(debounce(async (termo) => {
    if (termo.length < 3) {
      setProdutosBusca([]);
      return;
    }
    try {
      const response = await api.get('/produtos/busca', { params: { termo } });
      setProdutosBusca(response.data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      toast.error('Falha ao buscar produtos.');
    }
  }, 500), []);

  useEffect(() => {
    buscarProdutos(buscaProdutoTermo);
    return () => buscarProdutos.cancel();
  }, [buscaProdutoTermo, buscarProdutos]);

  const buscarCEP = async (cep) => {
    if (!cep || cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setCreateForm(prev => ({
          ...prev,
          enderecoEntrega: {
            ...prev.enderecoEntrega,
            cep: cep,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            localidade: data.localidade || '',
            uf: data.uf || ''
          }
        }));
        toast.success('CEP encontrado!');
      } else {
        toast.error('CEP não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP.');
    }
  };

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
    if (!status || typeof status !== 'string') {
      return <span className="badge bg-secondary">Desconhecido</span>;
    }

    const statusStyles = {
      pendente: 'badge bg-warning text-dark',
      processando: 'badge bg-info text-dark',
      enviado: 'badge bg-primary',
      entregue: 'badge bg-success',
      cancelado: 'badge bg-danger',
    };

    return (
      <span className={statusStyles[status] || 'badge bg-secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    const numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length === 11) {
      return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`;
    } else if (numeroLimpo.length === 10) {
      return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 6)}-${numeroLimpo.slice(6)}`;
    }
    return telefone;
  };

  const handleCancelPedido = async (pedidoId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;
    try {
      await api.patch(`/pedidos/${pedidoId}/cancel`);
      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, status: 'cancelado' } : pedido
        )
      );
      toast.success('Pedido cancelado com sucesso!');
    } catch (err) {
      console.error('Erro ao cancelar pedido:', err);
      toast.error('Falha ao cancelar o pedido.');
    }
  };

  const handleDeletePedido = async (pedidoId) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      await api.delete(`/pedidos/${pedidoId}`);
      setPedidos((prev) => prev.filter((pedido) => pedido.id !== pedidoId));
      toast.success('Pedido excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      toast.error('Falha ao excluir o pedido.');
    }
  };

  const handleEditPedido = (pedido) => {
    collapseNavbar();
    setEditingPedido(pedido.id);
    setEditForm({
      enderecoEntrega: pedido.enderecoEntrega || {},
      status: pedido.status,
      telefone: pedido.Usuario?.telefone || '',
    });
    if (editModalRef.current) {
      editModalRef.current.show();
    } else {
      console.error('Modal de edição não inicializado');
      toast.error('Erro ao abrir modal de edição. Tente novamente.');
    }
  };

  const handleViewContato = (pedido) => {
    collapseNavbar();
    console.log('Dados do pedido em handleViewContato:', pedido);
    setViewingContato({
      id: pedido.id,
      nome: isAdminView ? (pedido.Usuario?.nome || 'N/A') : (user.nome || 'N/A'),
      email: isAdminView ? (pedido.Usuario?.email || 'N/A') : (user.email || 'N/A'),
      telefone: formatarTelefone(isAdminView ? (pedido.Usuario?.telefone || '') : (user.telefone || '')),
      endereco: pedido.enderecoEntrega
        ? `${pedido.enderecoEntrega.logradouro || ''}, ${pedido.enderecoEntrega.numero || ''} - ${pedido.enderecoEntrega.bairro || ''}, ${pedido.enderecoEntrega.localidade || ''}/${pedido.enderecoEntrega.uf || ''}`
        : 'Endereço não informado',
    });
    if (contatoModalRef.current) {
      contatoModalRef.current.show();
    } else {
      console.error('Modal de contato não inicializado');
      toast.error('Erro ao abrir modal de contato. Tente novamente.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/pedidos/${editingPedido}`, {
        enderecoEntrega: editForm.enderecoEntrega,
        status: editForm.status,
      });

      const pedido = pedidos.find((p) => p.id === editingPedido);
      if (pedido?.Usuario?.id) {
        const telefoneAtual = pedido.Usuario.telefone || '';
        if (editForm.telefone !== telefoneAtual) {
          console.log('Atualizando telefone do usuário:', {
            usuarioId: pedido.Usuario.id,
            telefone: editForm.telefone,
          });
          await api.put(`/usuarios/${pedido.Usuario.id}`, {
            telefone: editForm.telefone || null,
          });
        }
      } else {
        console.warn('Usuário não encontrado para o pedido:', editingPedido);
      }

      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === editingPedido
            ? {
                ...pedido,
                enderecoEntrega: editForm.enderecoEntrega,
                status: editForm.status,
                Usuario: {
                  ...pedido.Usuario,
                  telefone: editForm.telefone || null,
                },
              }
            : pedido
        )
      );

      toast.success('Pedido e informações do usuário atualizados com sucesso!');
      if (editModalRef.current) {
        editModalRef.current.hide();
      }
      setEditingPedido(null);
    } catch (err) {
      console.error('Erro ao editar pedido ou usuário:', err);
      toast.error(`Falha ao atualizar: ${err.response?.data?.message || 'Erro desconhecido'}`);
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

  const handleCreateChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('itens.')) {
      const field = name.split('.')[2];
      const newItens = [...createForm.itens];
      newItens[index] = { ...newItens[index], [field]: value };
      setCreateForm({ ...createForm, itens: newItens });
    } else if (name.startsWith('enderecoEntrega.')) {
      const field = name.split('.')[1];
      setCreateForm({
        ...createForm,
        enderecoEntrega: { ...createForm.enderecoEntrega, [field]: value },
      });
    } else {
      setCreateForm({ ...createForm, [name]: value });
    }
  };

  const handleSelectUsuario = (usuario) => {
    setCreateForm({
      ...createForm,
      usuarioId: usuario.id,
      nome: usuario.nome,
      telefone: usuario.telefone || '',
      enderecoEntrega: usuario.endereco
        ? {
            cep: usuario.endereco.cep || '',
            logradouro: usuario.endereco.logradouro || '',
            numero: usuario.endereco.numero || '',
            bairro: usuario.endereco.bairro || '',
            localidade: usuario.endereco.localidade || '',
            uf: usuario.endereco.uf || '',
          }
        : createForm.enderecoEntrega,
    });
    setBuscaUsuarioTermo('');
    setUsuariosBusca([]);
  };

  const handleSelectProduto = (produto, index) => {
    const newItens = [...createForm.itens];
    newItens[index] = {
      ...newItens[index],
      produtoId: produto.id,
      nomeProduto: produto.nome,
      preco: produto.preco,
    };
    setCreateForm({ ...createForm, itens: newItens });
    setBuscaProdutoTermo('');
    setProdutosBusca([]);
  };

  const handleAddItem = () => {
    setCreateForm({
      ...createForm,
      itens: [...createForm.itens, { produtoId: '', nomeProduto: '', quantidade: 1 }],
    });
  };

  const handleRemoveItem = (index) => {
    setCreateForm({
      ...createForm,
      itens: createForm.itens.filter((_, i) => i !== index),
    });
  };

const handleCreateSubmit = async (e) => {
  e.preventDefault();

  try {
    const formToSend = {
      ...createForm,
      itens: createForm.itens.map(item => ({
        ...item,
        produtoId: parseInt(item.produtoId, 10),
        quantidade: parseInt(item.quantidade, 10),
        preco: parseFloat(item.preco),
      })),
    };

    const response = await api.post('/pedidos/admin', formToSend);
    console.log('Resposta da API:', response.data);

    // Extrair o objeto 'pedido' da resposta
    let novoPedido = response.data.pedido || response.data;

    // Se os dados do usuário não estão completos, buscar do estado atual
    if (!novoPedido.Usuario && createForm.usuarioId) {
      // Encontrar o usuário nos dados de busca ou criar objeto básico
      const usuarioEncontrado = usuariosBusca.find(u => u.id === createForm.usuarioId);
      
      novoPedido = {
        ...novoPedido,
        Usuario: usuarioEncontrado || {
          id: createForm.usuarioId,
          nome: createForm.nome,
          email: 'N/A', // Você pode buscar isso se necessário
          telefone: createForm.telefone
        }
      };
    }

    // Garantir que os itens estão estruturados corretamente
    if (!novoPedido.ItemPedidos && createForm.itens) {
      novoPedido.ItemPedidos = createForm.itens.map((item, index) => ({
        id: `temp_${index}`, // ID temporário
        quantidade: item.quantidade,
        precoUnitario: item.preco,
        Produto: {
          nome: item.nomeProduto
        }
      }));
    }

    // Adicionar o novo pedido ao estado
    setPedidos((prev) => [novoPedido, ...prev]);

    // Resetar o formulário
    setCreateForm({
      usuarioId: '',
      nome: '',
      telefone: '',
      enderecoEntrega: { cep: '', logradouro: '', numero: '', bairro: '', localidade: '', uf: '' },
      itens: [{ produtoId: '', nomeProduto: '', quantidade: 1 }],
    });

    // Fechar o modal
    if (createModalRef.current) {
      createModalRef.current.hide();
    }

    toast.success('Pedido criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar pedido:', err);
    toast.error('Falha ao criar o pedido.');
  }
};


  const toggleRow = (pedidoId) => {
    setExpandedRows((prev) =>
      prev.includes(pedidoId)
        ? prev.filter((id) => id !== pedidoId)
        : [...prev, pedidoId]
    );
  };

  const handleStatusChange = useCallback(
    async (pedidoId, newStatus) => {
      setUpdatingStatus(pedidoId);
      try {
        const response = await api.patch(`/pedidos/${pedidoId}/status`, {
          status: newStatus,
        });
        setPedidos((prev) =>
          prev.map((pedido) =>
            pedido.id === pedidoId
              ? {
                  ...pedido,
                  status: response.data?.status || newStatus,
                  updatedAt: response.data?.updatedAt || new Date().toISOString(),
                }
              : pedido
          )
        );
        toast.success('Status atualizado com sucesso!');
      } catch (err) {
        console.error('Erro ao atualizar status:', err);
        toast.error('Erro ao atualizar status.');
        fetchPedidos();
      } finally {
        setUpdatingStatus(null);
      }
    },
    [fetchPedidos]
  );

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
      <h2>{isAdminView ? 'Gerenciar Pedidos' : 'Meus Pedidos'}</h2>

      {isAdminView && (user.role === 'admin' || user.role === 'operador') && (
        <>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Filtrar por Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="processando">Processando</option>
                <option value="enviado">Enviado</option>
                <option value="entregue">Entregue</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            {/* <div className="col-md-4">
              <label className="form-label">Buscar por ID ou Usuário</label>
              <input
                type="text"
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite ID ou e-mail"
              />
            </div> */}
            {isAdminView && (user.role === 'admin' || user.role === 'operador') && (
              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    collapseNavbar();
                    if (createModalRef.current) {
                      createModalRef.current.show();
                    } else {
                      toast.error('Erro ao abrir modal de criação. Tente novamente.');
                    }
                  }}
                >
                  Cadastrar Novo Pedido
                </button>
              </div>
            )}
          </div>

          <div
            className="modal fade"
            id="createModal"
            tabIndex="-1"
            aria-labelledby="createModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="createModalLabel">
                    Cadastrar Novo Pedido
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => createModalRef.current?.hide()}
                  ></button>
                </div>
                <form onSubmit={handleCreateSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Buscar Cliente</label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Digite nome ou email do cliente"
                          value={buscaUsuarioTermo}
                          onChange={(e) => setBuscaUsuarioTermo(e.target.value)}
                        />
                        {usuariosBusca.length > 0 && (
                          <div
                            className="position-absolute w-100 bg-white border rounded shadow-sm"
                            style={{ zIndex: 1000 }}
                          >
                            {usuariosBusca.map((usuario) => (
                              <div
                                key={usuario.id}
                                className="p-2 border-bottom cursor-pointer hover-bg-light"
                                onClick={() => handleSelectUsuario(usuario)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div>
                                  <strong>{usuario.nome}</strong>
                                </div>
                                <div className="small text-muted">{usuario.email}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {createForm.usuarioId && (
                      <div className="alert alert-info mb-3">
                        <h6>Cliente Selecionado</h6>
                        <p className="mb-1">
                          <strong>Nome:</strong> {createForm.nome}
                        </p>
                        <p className="mb-1">
                          <strong>ID:</strong> {createForm.usuarioId}
                        </p>
                        <p className="mb-0">
                          <strong>Telefone:</strong> {formatarTelefone(createForm.telefone)}
                        </p>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Telefone para Contato</label>
                      <input
                        type="text"
                        className="form-control"
                        name="telefone"
                        value={createForm.telefone}
                        onChange={(e) => handleCreateChange(e)}
                        trước
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    </div>

                    <h6>Endereço de Entrega</h6>
                    <div className="mb-3">
                      <label className="form-label">CEP</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          name="enderecoEntrega.cep"
                          value={createForm.enderecoEntrega.cep}
                          onChange={(e) => handleCreateChange(e)}
                          placeholder="Somente números"
                          maxLength="8"
                        />
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary"
                          onClick={() => buscarCEP(createForm.enderecoEntrega.cep)}
                        >
                          Buscar
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Logradouro</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enderecoEntrega.logradouro"
                        value={createForm.enderecoEntrega.logradouro}
                        onChange={(e) => handleCreateChange(e)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Número</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enderecoEntrega.numero"
                        value={createForm.enderecoEntrega.numero}
                        onChange={(e) => handleCreateChange(e)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Bairro</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enderecoEntrega.bairro"
                        value={createForm.enderecoEntrega.bairro}
                        onChange={(e) => handleCreateChange(e)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Cidade</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enderecoEntrega.localidade"
                        value={createForm.enderecoEntrega.localidade}
                        onChange={(e) => handleCreateChange(e)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">UF</label>
                      <input
                        type="text"
                        className="form-control"
                        name="enderecoEntrega.uf"
                        value={createForm.enderecoEntrega.uf}
                        onChange={(e) => handleCreateChange(e)}
                        required
                      />
                    </div>
                    <h6>Itens do Pedido</h6>
                    {createForm.itens.map((item, index) => (
                      <div key={index} className="row mb-2 border p-2 rounded">
                        <div className="col-md-12 mb-2">
                          <label className="form-label">Buscar Produto</label>
                          <div className="position-relative">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Digite nome ou código do produto"
                              value={index === createForm.itens.length - 1 ? buscaProdutoTermo : ''}
                              onChange={(e) => setBuscaProdutoTermo(e.target.value)}
                            />
                            {produtosBusca.length > 0 && index === createForm.itens.length - 1 && (
                              <div
                                className="position-absolute w-100 bg-white border rounded shadow-sm"
                                style={{ zIndex: 1000 }}
                              >
                                {produtosBusca.map((produto) => (
                                  <div
                                    key={produto.id}
                                    className="p-2 border-bottom cursor-pointer hover-bg-light"
                                    onClick={() => handleSelectProduto(produto, index)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div>
                                      <strong>{produto.nome}</strong>
                                    </div>
                                    <div className="small text-muted">
                                      R$ {parseFloat(produto.preco).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.nomeProduto && (
                          <div className="col-md-12 mb-2">
                            <div className="alert alert-info py-2 mb-2">
                              <strong>Produto:</strong> {item.nomeProduto} (ID: {item.produtoId})
                              {item.preco && (
                                <div>
                                  <strong>Preço:</strong> R$ {parseFloat(item.preco).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="col-md-8">
                          <label className="form-label">Quantidade</label>
                          <input
                            type="number"
                            className="form-control"
                            name={`itens.${index}.quantidade`}
                            value={item.quantidade}
                            onChange={(e) => handleCreateChange(e, index)}
                            min="1"
                            required
                          />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveItem(index)}
                            disabled={createForm.itens.length === 1}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary mb-3"
                      onClick={handleAddItem}
                    >
                      Adicionar Item
                    </button>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                      onClick={() => createModalRef.current?.hide()}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!createForm.usuarioId || createForm.itens.some((item) => !item.produtoId)}
                    >
                      Cadastrar Pedido
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th></th>
                <th>#ID</th>
                {isAdminView && <th>Usuário</th>}
                <th>Data</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th>Contato</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <React.Fragment key={pedido.id}>
                  <tr>
                    <td>
                      <button
                        className="btn btn-link p-0"
                        onClick={() => toggleRow(pedido.id)}
                      >
                        {expandedRows.includes(pedido.id) ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>{pedido.id}</td>
                    {isAdminView && (
                      <td>
                        {pedido.Usuario?.nome || 'N/A'} ({pedido.Usuario?.email || 'N/A'})
                      </td>
                    )}
                    <td>{formatarData(pedido.createdAt)}</td>
                    <td>R$ {parseFloat(pedido.valorTotal).toFixed(2)}</td>
                    <td>{formatarStatus(pedido.status)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => handleViewContato(pedido)}
                        title="Visualizar informações de contato"
                      >
                        <i className="bi bi-eye"></i> Ver Contato
                      </button>
                    </td>
                    <td>
                      {user.role === 'admin' && isAdminView && (
                        <>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEditPedido(pedido)}
                            title="Editar endereço e informações de contato"
                          >
                            <i className="bi bi-geo-alt"></i> Gerenciar Endereço
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeletePedido(pedido.id)}
                          >
                            Excluir
                          </button>
                        </>
                      )}
                      {(user.role === 'admin' || user.role === 'operador') && isAdminView && (
                        <select
                          className="form-select form-select-sm mt-2"
                          value={pedido.status}
                          onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                          disabled={updatingStatus === pedido.id}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="processando">Processando</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      )}
                      {!isAdminView && pedido.status === 'pendente' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelPedido(pedido.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRows.includes(pedido.id) && (
                    <tr>
                      <td colSpan={isAdminView ? 8 : 7}>
                        <div className="p-3 bg-light">
                          <h6>Itens do Pedido</h6>
                          {pedido.ItemPedidos && pedido.ItemPedidos.length > 0 ? (
                            <>
                              <ul className="list-unstyled mb-2">
                                {pedido.ItemPedidos.map((item) => (
                                  <li key={item.id}>
                                    {item.Produto?.nome || 'Produto não encontrado'} - Quantidade:{' '}
                                    {item.quantidade} - R$ {parseFloat(item.precoUnitario).toFixed(2)}
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-2 pt-2 border-top">
                                <strong>Valor Total: R$ {parseFloat(pedido.valorTotal).toFixed(2)}</strong>
                              </div>
                            </>
                          ) : (
                            'Nenhum item'
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        className="modal fade"
        id="contatoModal"
        tabIndex="-1"
        aria-labelledby="contatoModalLabel"
        aria-hidden="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="contatoModalLabel">
                Informações de Contato - Pedido #{viewingContato?.id}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => contatoModalRef.current?.hide()}
              ></button>
            </div>
            <div className="modal-body">
              {viewingContato && (
                <div>
                  <div className="mb-3">
                    <h6>Cliente</h6>
                    <p className="mb-0">{viewingContato.nome}</p>
                  </div>
                  <div className="mb-3">
                    <h6>Email</h6>
                    <p className="mb-0">{viewingContato.email}</p>
                  </div>
                  <div className="mb-3">
                    <h6>Telefone</h6>
                    <p className="mb-0">{viewingContato.telefone}</p>
                  </div>
                  <div className="mb-3">
                    <h6>Endereço de Entrega</h6>
                    <p className="mb-0">{viewingContato.endereco}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => contatoModalRef.current?.hide()}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">
                Gerenciar Endereço e Contato - Pedido #{editingPedido}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => editModalRef.current?.hide()}
              ></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Telefone para Contato</label>
                  <input
                    type="text"
                    className="form-control"
                    name="telefone"
                    value={editForm?.telefone || ''}
                    onChange={handleEditChange}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Logradouro</label>
                  <input
                    type="text"
                    className="form-control"
                    name="enderecoEntrega.logradouro"
                    value={editForm.enderecoEntrega?.logradouro || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Número</label>
                  <input
                    type="text"
                    className="form-control"
                    name="enderecoEntrega.numero"
                    value={editForm.enderecoEntrega?.numero || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Bairro</label>
                  <input
                    type="text"
                    className="form-control"
                    name="enderecoEntrega.bairro"
                    value={editForm.enderecoEntrega?.bairro || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Cidade</label>
                  <input
                    type="text"
                    className="form-control"
                    name="enderecoEntrega.localidade"
                    value={editForm.enderecoEntrega?.localidade || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">UF</label>
                  <input
                    type="text"
                    className="form-control"
                    name="enderecoEntrega.uf"
                    value={editForm.enderecoEntrega?.uf || ''}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={editForm.status || ''}
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
                  data-bs-dismiss="modal"
                  onClick={() => editModalRef.current?.hide()}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pedidos;