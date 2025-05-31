import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Modal, Button, Form, Spinner, Alert, Table, Image } from 'react-bootstrap'; // Usar react-bootstrap

const AdminProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o Modal de Cadastro/Edição
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduto, setCurrentProduto] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', preco: '', imagemUrl: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Estado para confirmação de exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProduto, setDeletingProduto] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Função para buscar produtos
  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError('Falha ao carregar produtos.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  // Funções para o Modal de Cadastro/Edição
  const handleShowCreateModal = () => {
    setIsEditing(false);
    setCurrentProduto(null);
    setFormData({ nome: '', descricao: '', preco: '', imagemUrl: '' });
    setModalError('');
    setShowModal(true);
  };

  const handleShowEditModal = (produto) => {
    setIsEditing(true);
    setCurrentProduto(produto);
    setFormData({ nome: produto.nome, descricao: produto.descricao, preco: produto.preco, imagemUrl: produto.imagemUrl || '' });
    setModalError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    setModalLoading(true);
    setModalError('');
    const dataToSend = { ...formData, preco: parseFloat(formData.preco) }; // Converter preço para número

    try {
      if (isEditing && currentProduto) {
        // Atualizar Produto (PUT)
        await api.put(`/produtos/${currentProduto.id}`, dataToSend);
      } else {
        // Criar Novo Produto (POST)
        await api.post('/produtos', dataToSend);
      }
      handleCloseModal();
      fetchProdutos(); // Atualizar lista
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      setModalError(err.response?.data?.message || 'Falha ao salvar produto.');
    }
    setModalLoading(false);
  };

  // Funções para Exclusão
  const handleShowDeleteConfirm = (produto) => {
    setDeletingProduto(produto);
    setDeleteError('');
    setShowDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingProduto(null);
    setDeleteError('');
  };

  const handleDeleteProduto = async () => {
    if (!deletingProduto) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/produtos/${deletingProduto.id}`);
      handleCloseDeleteConfirm();
      fetchProdutos(); // Atualizar lista
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      setDeleteError(err.response?.data?.message || 'Falha ao excluir produto.');
    }
    setDeleteLoading(false);
  };

  if (loading) return <div className="text-center p-4"><Spinner animation="border" role="status"><span className="visually-hidden">Carregando Produtos...</span></Spinner></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gerenciar Produtos</h2>
        <Button variant="primary" onClick={handleShowCreateModal}>
          <i className="bi bi-plus-circle-fill"></i> Cadastrar Novo Produto
        </Button>
      </div>

      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Preço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(produto => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>
                  {produto.imagemUrl ? 
                    <Image src={produto.imagemUrl} alt={produto.nome} thumbnail width="50" /> : 
                    <span className="text-muted">Sem Imagem</span>}
                </td>
                <td>{produto.nome}</td>
                <td>{produto.descricao}</td>
                <td>R$ {isNaN(Number(produto.preco)) ? '0.00' : Number(produto.preco).toFixed(2)}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEditModal(produto)}>
                    <i className="bi bi-pencil-fill"></i> Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleShowDeleteConfirm(produto)}>
                    <i className="bi bi-trash-fill"></i> Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de Cadastro/Edição */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="formNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control 
                type="text" 
                name="nome" 
                value={formData.nome}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescricao">
              <Form.Label>Descrição</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="descricao" 
                value={formData.descricao}
                onChange={handleFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPreco">
              <Form.Label>Preço (R$)</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01"
                name="preco" 
                value={formData.preco}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formImagemUrl">
              <Form.Label>URL da Imagem</Form.Label>
              <Form.Control 
                type="text" 
                name="imagemUrl" 
                value={formData.imagemUrl}
                onChange={handleFormChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={modalLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleFormSubmit} disabled={modalLoading}>
            {modalLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</> : (isEditing ? 'Salvar Alterações' : 'Cadastrar Produto')}
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
          Tem certeza que deseja excluir o produto **{deletingProduto?.nome}** (ID: {deletingProduto?.id})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirm} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteProduto} disabled={deleteLoading}>
            {deleteLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Excluindo...</> : 'Excluir'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AdminProdutos;

