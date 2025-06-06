import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Modal, Button, Form, Spinner, Alert, Table, Image, ProgressBar } from 'react-bootstrap'; // Usar react-bootstrap
import { toast } from 'react-toastify';

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

  // Estados para upload CSV
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvProgress, setCsvProgress] = useState(0);
  const [csvResults, setCsvResults] = useState(null);

  // Estados para upload de imagem
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

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
    setSelectedImage(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleShowEditModal = (produto) => {
    setIsEditing(true);
    setCurrentProduto(produto);
    setFormData({ nome: produto.nome, descricao: produto.descricao, preco: produto.preco, imagemUrl: produto.imagemUrl || '' });
    setModalError('');
    setSelectedImage(null);
    setImagePreview(produto.imagemUrl || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError('');
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Funções para upload de imagem
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos de imagem são permitidos (JPEG, JPG, PNG, GIF, WebP)');
        event.target.value = '';
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB');
        event.target.value = '';
        return;
      }

      setSelectedImage(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      toast.error('Selecione uma imagem primeiro');
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('imagem', selectedImage);

      const response = await api.post('/produtos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Atualizar URL da imagem no formulário
      setFormData(prev => ({ ...prev, imagemUrl: response.data.imagemUrl }));
      setImagePreview(response.data.imagemUrl);
      toast.success('Imagem enviada com sucesso!');
      
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar imagem');
    }
    
    setUploadingImage(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imagemUrl: '' }));
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

  // Funções para upload CSV
  const handleShowCsvModal = () => {
    setCsvFile(null);
    setCsvResults(null);
    setCsvProgress(0);
    setShowCsvModal(true);
  };

  const handleCloseCsvModal = () => {
    setShowCsvModal(false);
    setCsvFile(null);
    setCsvResults(null);
    setCsvProgress(0);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast.error('Por favor, selecione um arquivo CSV válido.');
      event.target.value = '';
    }
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('Arquivo CSV deve conter pelo menos uma linha de cabeçalho e uma linha de dados.');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = ['nome', 'descricao', 'preco', 'imagemurl'];
    
    // Verificar se todos os cabeçalhos necessários estão presentes
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`);
    }

    const produtos = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 3) { // Pelo menos nome, descrição e preço
        const produto = {};
        headers.forEach((header, index) => {
          if (header === 'nome') produto.nome = values[index] || '';
          else if (header === 'descricao') produto.descricao = values[index] || '';
          else if (header === 'preco') produto.preco = values[index] || '';
          else if (header === 'imagemurl') produto.imagemUrl = values[index] || '';
        });
        produtos.push(produto);
      }
    }

    return produtos;
  };

  const handleUploadCSV = async () => {
    if (!csvFile) {
      toast.error('Por favor, selecione um arquivo CSV.');
      return;
    }

    setCsvLoading(true);
    setCsvProgress(0);
    setCsvResults(null);

    try {
      // Ler arquivo CSV
      const csvText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(csvFile);
      });

      setCsvProgress(25);

      // Parsear CSV
      const produtos = parseCSV(csvText);
      setCsvProgress(50);

      // Enviar para o backend
      const response = await api.post('/produtos/bulk', { produtos });
      setCsvProgress(100);

      setCsvResults(response.data.resultados);
      toast.success(response.data.message);
      
      // Atualizar lista de produtos se houve sucessos
      if (response.data.resultados.sucessos.length > 0) {
        fetchProdutos();
      }

    } catch (error) {
      console.error('Erro no upload CSV:', error);
      toast.error(error.message || 'Erro ao processar arquivo CSV.');
    }

    setCsvLoading(false);
  };

  const downloadExampleCSV = () => {
    const csvContent = `nome,descricao,preco,imagemUrl
Sorvete de Chocolate,Delicioso sorvete artesanal de chocolate,15.90,https://exemplo.com/chocolate.jpg
Sorvete de Morango,Sorvete cremoso com pedaços de morango,12.50,https://exemplo.com/morango.jpg
Sorvete de Baunilha,Clássico sorvete de baunilha,10.00,https://exemplo.com/baunilha.jpg`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'exemplo_produtos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center p-4"><Spinner animation="border" role="status"><span className="visually-hidden">Carregando Produtos...</span></Spinner></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gerenciar Produtos</h2>
        <div>
          <Button variant="success" className="me-2" onClick={handleShowCsvModal}>
            <i className="bi bi-file-earmark-excel"></i> Cadastrar em Massa (CSV)
          </Button>
          <Button variant="primary" onClick={handleShowCreateModal}>
            <i className="bi bi-plus-circle-fill"></i> Cadastrar Novo Produto
          </Button>
        </div>
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
              <div className="d-flex mb-2">
                <Form.Control 
                  type="text" 
                  name="imagemUrl" 
                  value={formData.imagemUrl}
                  onChange={handleFormChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="me-2"
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={uploadingImage}
                >
                  <i className="bi bi-upload"></i>
                </Button>
              </div>
              
              {/* Input de arquivo oculto */}
              <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              />
              
              {/* Área de upload e preview */}
              <div className="mt-2">
                {imagePreview && (
                  <div className="text-center mb-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} 
                      className="border rounded"
                    />
                  </div>
                )}
                
                <div className="d-flex justify-content-center">
                  {selectedImage && !uploadingImage && (
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={handleUploadImage} 
                      className="me-2"
                    >
                      <i className="bi bi-cloud-arrow-up"></i> Enviar Imagem
                    </Button>
                  )}
                  
                  {uploadingImage && (
                    <Button variant="success" size="sm" disabled className="me-2">
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Enviando...
                    </Button>
                  )}
                  
                  {imagePreview && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                    >
                      <i className="bi bi-trash"></i> Remover
                    </Button>
                  )}
                </div>
              </div>
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

      {/* Modal de Upload CSV */}
      <Modal show={showCsvModal} onHide={handleCloseCsvModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Cadastrar Produtos em Massa (CSV)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Alert variant="info">
              <strong>Formato do arquivo CSV:</strong><br />
              O arquivo deve conter as colunas: <code>nome,descricao,preco,imagemUrl</code><br />
              <Button variant="link" className="p-0" onClick={downloadExampleCSV}>
                <i className="bi bi-download"></i> Baixar arquivo de exemplo
              </Button>
            </Alert>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Selecionar arquivo CSV</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={csvLoading}
            />
            {csvFile && (
              <Form.Text className="text-muted">
                Arquivo selecionado: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
              </Form.Text>
            )}
          </Form.Group>

          {csvLoading && (
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Processando arquivo...</span>
                <span>{csvProgress}%</span>
              </div>
              <ProgressBar now={csvProgress} />
            </div>
          )}

          {csvResults && (
            <div className="mb-3">
              <Alert variant={csvResults.erros.length === 0 ? "success" : "warning"}>
                <strong>Resultado do processamento:</strong><br />
                ✅ Sucessos: {csvResults.sucessos.length}<br />
                ❌ Erros: {csvResults.erros.length}<br />
                📊 Total processado: {csvResults.total}
              </Alert>

              {csvResults.sucessos.length > 0 && (
                <div className="mb-3">
                  <h6>Produtos cadastrados com sucesso:</h6>
                  <ul className="list-unstyled">
                    {csvResults.sucessos.slice(0, 5).map((sucesso, index) => (
                      <li key={index} className="text-success">
                        ✅ Linha {sucesso.linha}: {sucesso.nome}
                      </li>
                    ))}
                    {csvResults.sucessos.length > 5 && (
                      <li className="text-muted">... e mais {csvResults.sucessos.length - 5} produtos</li>
                    )}
                  </ul>
                </div>
              )}

              {csvResults.erros.length > 0 && (
                <div className="mb-3">
                  <h6>Erros encontrados:</h6>
                  <ul className="list-unstyled">
                    {csvResults.erros.slice(0, 5).map((erro, index) => (
                      <li key={index} className="text-danger">
                        ❌ Linha {erro.linha}: {erro.nome} - {erro.erro}
                      </li>
                    ))}
                    {csvResults.erros.length > 5 && (
                      <li className="text-muted">... e mais {csvResults.erros.length - 5} erros</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCsvModal} disabled={csvLoading}>
            {csvResults ? 'Fechar' : 'Cancelar'}
          </Button>
          {!csvResults && (
            <Button 
              variant="primary" 
              onClick={handleUploadCSV} 
              disabled={!csvFile || csvLoading}
            >
              {csvLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  {' '}Processando...
                </>
              ) : (
                <>
                  <i className="bi bi-upload"></i> Processar CSV
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AdminProdutos;