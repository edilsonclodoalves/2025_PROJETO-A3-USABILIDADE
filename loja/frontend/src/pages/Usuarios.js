import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Modal, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o Modal de Edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ nome: '', email: '', role: '', senha: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Estado para confirmação de exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Estados para o modal de criação
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ nome: '', email: '', role: 'cliente', senha: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Função para buscar usuários
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError('Falha ao carregar usuários. Você tem permissão para acessar esta página?');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Funções para o Modal de Edição
  const handleShowEditModal = (usuario) => {
    setEditingUser(usuario);
    setEditFormData({ nome: usuario.nome, email: usuario.email, role: usuario.role, senha: '' });
    setEditError('');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditError('');
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!editingUser) return;
    setEditLoading(true);
    setEditError('');
    try {
      // Validação do formulário
      if (!editFormData.nome.trim() || !editFormData.email.trim() || !editFormData.role) {
        throw new Error('Nome, email e papel são obrigatórios.');
      }
      if (editFormData.senha && editFormData.senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
        throw new Error('Email inválido.');
      }

      // Preparar dados para enviar
      const dataToSend = {
        nome: editFormData.nome.trim(),
        email: editFormData.email.trim(),
        role: editFormData.role,
      };
      // Incluir senha apenas se preenchida
      if (editFormData.senha) {
        dataToSend.senha = editFormData.senha;
      }

      await api.put(`/usuarios/${editingUser.id}`, dataToSend);
      handleCloseEditModal();
      fetchUsuarios();
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setEditError(err.response?.data?.message || err.message || 'Falha ao salvar alterações.');
    }
    setEditLoading(false);
  };

  // Funções para Exclusão
  const handleShowDeleteConfirm = (usuario) => {
    setDeletingUser(usuario);
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingUser(null);
    setDeleteError('');
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/usuarios/${deletingUser.id}`);
      handleCloseDeleteConfirm();
      fetchUsuarios();
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setDeleteError(err.response?.data?.message || 'Falha ao excluir usuário.');
    }
    setDeleteLoading(false);
  };

  // Funções para o Modal de Criação
  const handleShowCreateModal = () => {
    setCreateFormData({ nome: '', email: '', role: 'cliente', senha: '' });
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
  };

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async () => {
    setCreateLoading(true);
    setCreateError('');
    try {
      // Validação do formulário
      if (!createFormData.nome.trim() || !createFormData.email.trim() || !createFormData.senha || !createFormData.role) {
        throw new Error('Todos os campos são obrigatórios.');
      }
      if (createFormData.senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
        throw new Error('Email inválido.');
      }

      await api.post('/usuarios', createFormData);
      handleCloseCreateModal();
      fetchUsuarios();
    } catch (err) {
      console.error("Erro ao criar usuário:", err);
      setCreateError(err.response?.data?.message || err.message || 'Falha ao criar usuário.');
    }
    setCreateLoading(false);
  };

  if (loading) return <div className="text-center p-4"><Spinner animation="border" role="status"><span className="visually-hidden">Carregando Usuários...</span></Spinner></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2>Gerenciar Usuários</h2>
      <p>Esta área é restrita a administradores.</p>

      <div className="mb-3">
        <Button variant="success" onClick={handleShowCreateModal}>
          <i className="bi bi-plus-circle-fill"></i> Criar Novo Usuário
        </Button>
      </div>

      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nome}</td>
                <td>{usuario.email}</td>
                <td>
                  <Badge bg={usuario.role === 'admin' ? 'danger' : (usuario.role === 'operador' ? 'warning' : 'secondary')}>
                    {usuario.role}
                  </Badge>
                </td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(usuario)}>
                    <i className="bi bi-pencil-fill"></i> Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleShowDeleteConfirm(usuario)}>
                    <i className="bi bi-trash-fill"></i> Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de Criação */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Criar Novo Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createError && <Alert variant="danger">{createError}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="createFormNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control 
                type="text" 
                name="nome" 
                value={createFormData.nome}
                onChange={handleCreateFormChange}
                required
                placeholder="Digite o nome do usuário"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="createFormEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={createFormData.email}
                onChange={handleCreateFormChange}
                required
                placeholder="exemplo@dominio.com"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="createFormSenha">
              <Form.Label>Senha</Form.Label>
              <Form.Control 
                type="password" 
                name="senha" 
                value={createFormData.senha}
                onChange={handleCreateFormChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="createFormRole">
              <Form.Label>Papel</Form.Label>
              <Form.Select 
                name="role" 
                value={createFormData.role}
                onChange={handleCreateFormChange}
                aria-label="Selecione o papel"
              >
                <option value="cliente">Cliente</option>
                <option value="operador">Operador</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Apenas administradores podem definir o papel.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCreateModal} disabled={createLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateUser} disabled={createLoading}>
            {createLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Criando...</> : 'Criar Usuário'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Edição */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuário (ID: {editingUser?.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="editFormNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control 
                type="text" 
                name="nome" 
                value={editFormData.nome}
                onChange={handleEditFormChange}
                required
                placeholder="Digite o nome do usuário"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editFormEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={editFormData.email}
                onChange={handleEditFormChange}
                required
                placeholder="exemplo@dominio.com"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editFormSenha">
              <Form.Label>Nova Senha (opcional)</Form.Label>
              <Form.Control 
                type="password" 
                name="senha" 
                value={editFormData.senha}
                onChange={handleEditFormChange}
                placeholder="Deixe em branco para manter a senha atual"
                minLength={6}
              />
              <Form.Text className="text-muted">
                A senha deve ter pelo menos 6 caracteres. Deixe em branco para não alterar.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="editFormRole">
              <Form.Label>Papel</Form.Label>
              <Form.Select 
                name="role" 
                value={editFormData.role}
                onChange={handleEditFormChange}
                aria-label="Selecione o papel"
                required
              >
                <option value="cliente">Cliente</option>
                <option value="operador">Operador</option>
                <option value="admin">Admin</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Apenas administradores podem alterar o papel.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal} disabled={editLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveChanges} disabled={editLoading}>
            {editLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</> : 'Salvar Alterações'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteConfirm} onHide={handleCloseDeleteConfirm} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          Tem certeza que deseja excluir o usuário <strong>{deletingUser?.nome}</strong> (ID: {deletingUser?.id})?
          Esta ação não pode be desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirm} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteUser} disabled={deleteLoading}>
            {deleteLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Excluindo...</> : 'Excluir'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Usuarios;