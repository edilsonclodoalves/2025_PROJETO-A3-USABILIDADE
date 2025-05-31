import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Modal, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap'; // Usar react-bootstrap para modais e componentes

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o Modal de Edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ nome: '', email: '', role: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Estado para confirmação de exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Função para buscar usuários (usando useCallback para evitar recriação)
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
    setEditFormData({ nome: usuario.nome, email: usuario.email, role: usuario.role });
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
      // Apenas admin pode mudar o 'role'
      // A validação final é no backend, mas podemos adicionar uma checagem aqui se necessário
      const dataToSend = { ...editFormData };
      
      await api.put(`/usuarios/${editingUser.id}`, dataToSend);
      handleCloseEditModal();
      // Atualizar a lista após salvar
      fetchUsuarios(); 
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setEditError(err.response?.data?.message || 'Falha ao salvar alterações.');
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
      // Atualizar a lista após excluir
      fetchUsuarios(); 
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setDeleteError(err.response?.data?.message || 'Falha ao excluir usuário.');
    }
    setDeleteLoading(false);
  };


  if (loading) return <div className="text-center p-4"><Spinner animation="border" role="status"><span className="visually-hidden">Carregando Usuários...</span></Spinner></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;


  return (
    <div className="container mt-4">
      <h2>Gerenciar Usuários</h2>
      <p>Esta área é restrita a administradores.</p>
      
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
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editFormEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={editFormData.email}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editFormRole">
              <Form.Label>Papel</Form.Label>
              <Form.Select 
                name="role" 
                value={editFormData.role}
                onChange={handleEditFormChange}
                aria-label="Selecione o papel"
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
          Tem certeza que deseja excluir o usuário **{deletingUser?.nome}** (ID: {deletingUser?.id})?
          Esta ação não pode ser desfeita.
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
