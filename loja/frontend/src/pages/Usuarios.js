import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import InputMask from "react-input-mask";
import api from "../services/api";

// ============================================================================
// UTILITÁRIOS E VALIDAÇÕES
// ============================================================================

const formatTelefone = (telefone) => {
  if (!telefone) return "Não informado";
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length !== 11) return telefone;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
};

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarTelefone = (telefone) => !telefone || /^\(\d{2}\)\s?\d{5}-\d{4}$/.test(telefone);
const validarSenha = (senha) => !senha || senha.length >= 6;
const limparTelefone = (telefone) => telefone?.replace(/\D/g, "") || null;

const validarFormulario = (dados, isEdit = false) => {
  const erros = [];
  
  if (!dados.nome?.trim()) erros.push("Nome é obrigatório");
  if (!dados.email?.trim()) erros.push("Email é obrigatório");
  if (!dados.role) erros.push("Papel é obrigatório");
  if (!isEdit && !dados.senha) erros.push("Senha é obrigatória");
  
  if (dados.email && !validarEmail(dados.email)) erros.push("Email inválido");
  if (dados.senha && !validarSenha(dados.senha)) erros.push("Senha deve ter pelo menos 6 caracteres");
  if (dados.telefone && !validarTelefone(dados.telefone)) erros.push("Telefone deve estar no formato (XX) XXXXX-XXXX");
  
  return erros;
};

// ============================================================================
// HOOKS CUSTOMIZADOS
// ============================================================================

const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const reset = useCallback(() => setFormData(initialState), [initialState]);
  const setData = useCallback((data) => setFormData(data), []);
  
  return { formData, handleChange, reset, setData };
};

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const open = useCallback(() => {
    setIsOpen(true);
    setError("");
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
    setError("");
    setLoading(false);
  }, []);
  
  return { isOpen, loading, error, open, close, setLoading, setError };
};

// ============================================================================
// COMPONENTES
// ============================================================================

const LoadingSpinner = ({ message = "Carregando..." }) => (
  <div className="text-center p-4">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">{message}</span>
    </Spinner>
  </div>
);

const UserFormFields = ({ formData, handleChange, isEdit = false }) => (
  <>
    <Form.Group className="mb-3">
      <Form.Label>Nome</Form.Label>
      <Form.Control
        type="text"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        required
        placeholder="Digite o nome do usuário"
      />
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Label>Email</Form.Label>
      <Form.Control
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="exemplo@dominio.com"
      />
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Label>Telefone (opcional)</Form.Label>
      <InputMask
        mask="(99) 99999-9999"
        value={formData.telefone}
        onChange={handleChange}
      >
        {(inputProps) => (
          <Form.Control
            {...inputProps}
            type="text"
            name="telefone"
            placeholder="(XX) XXXXX-XXXX"
          />
        )}
      </InputMask>
      <Form.Text className="text-muted">
        Use o formato (XX) XXXXX-XXXX{isEdit ? ". Deixe em branco para remover." : "."}
      </Form.Text>
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Label>{isEdit ? "Nova Senha (opcional)" : "Senha"}</Form.Label>
      <Form.Control
        type="password"
        name="senha"
        value={formData.senha}
        onChange={handleChange}
        required={!isEdit}
        placeholder={isEdit ? "Deixe em branco para manter a senha atual" : "Mínimo 6 caracteres"}
        minLength={6}
      />
      {isEdit && (
        <Form.Text className="text-muted">
          A senha deve ter pelo menos 6 caracteres. Deixe em branco para não alterar.
        </Form.Text>
      )}
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Label>Papel</Form.Label>
      <Form.Select
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
      >
        <option value="cliente">Cliente</option>
        <option value="operador">Operador</option>
        <option value="admin">Admin</option>
      </Form.Select>
    </Form.Group>
  </>
);

const UserModal = ({ 
  show, 
  onHide, 
  title, 
  formData, 
  handleChange, 
  onSubmit, 
  loading, 
  error, 
  submitText,
  isEdit = false 
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <UserFormFields 
          formData={formData} 
          handleChange={handleChange} 
          isEdit={isEdit} 
        />
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide} disabled={loading}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onSubmit} disabled={loading}>
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            {" "}{submitText.loading}
          </>
        ) : (
          submitText.default
        )}
      </Button>
    </Modal.Footer>
  </Modal>
);

const DeleteConfirmModal = ({ show, onHide, user, onConfirm, loading, error }) => (
  <Modal show={show} onHide={onHide} centered size="sm">
    <Modal.Header closeButton>
      <Modal.Title>Confirmar Exclusão</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      Tem certeza que deseja excluir o usuário{" "}
      <strong>{user?.nome}</strong> (ID: {user?.id})? Esta ação não pode ser desfeita.
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide} disabled={loading}>
        Cancelar
      </Button>
      <Button variant="danger" onClick={onConfirm} disabled={loading}>
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            {" "}Excluindo...
          </>
        ) : (
          "Excluir"
        )}
      </Button>
    </Modal.Footer>
  </Modal>
);

const UserTable = ({ usuarios, onEdit, onDelete }) => {
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin": return "danger";
      case "operador": return "warning";
      default: return "secondary";
    }
  };

  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>Papel</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => (
          <tr key={usuario.id}>
            <td>{usuario.id}</td>
            <td>{usuario.nome}</td>
            <td>{usuario.email}</td>
            <td>{formatTelefone(usuario.telefone)}</td>
            <td>
              <Badge bg={getRoleBadgeVariant(usuario.role)}>
                {usuario.role}
              </Badge>
            </td>
            <td>
              <Button
                variant="warning"
                size="sm"
                className="me-2"
                onClick={() => onEdit(usuario)}
              >
                <i className="bi bi-pencil-fill"></i> Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(usuario)}
              >
                <i className="bi bi-trash-fill"></i> Excluir
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  // Modais
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const [deletingUser, setDeletingUser] = useState(null);

  // Formulários
  const createForm = useForm({
    nome: "",
    email: "",
    telefone: "",
    role: "cliente",
    senha: "",
  });

  const editForm = useForm({
    nome: "",
    email: "",
    telefone: "",
    role: "",
    senha: "",
  });

  // ============================================================================
  // EFEITOS E FUNÇÕES DE API
  // ============================================================================

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (err) {
      setError("Falha ao carregar usuários. Você tem permissão para acessar esta página?");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // ============================================================================
  // HANDLERS DOS MODAIS
  // ============================================================================

  const handleOpenCreateModal = useCallback(() => {
    createForm.reset();
    createModal.open();
  }, [createForm, createModal]);

  const handleOpenEditModal = useCallback((usuario) => {
    setEditingUser(usuario);
    editForm.setData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || "",
      role: usuario.role,
      senha: "",
    });
    editModal.open();
  }, [editForm, editModal]);

  const handleOpenDeleteModal = useCallback((usuario) => {
    setDeletingUser(usuario);
    deleteModal.open();
  }, [deleteModal]);

  // ============================================================================
  // HANDLERS DE CRUD
  // ============================================================================

  const handleCreateUser = useCallback(async () => {
    const erros = validarFormulario(createForm.formData);
    if (erros.length > 0) {
      createModal.setError(erros.join(", "));
      return;
    }

    createModal.setLoading(true);
    createModal.setError("");

    try {
      const dataToSend = {
        nome: createForm.formData.nome.trim(),
        email: createForm.formData.email.trim(),
        senha: createForm.formData.senha,
        role: createForm.formData.role,
        telefone: limparTelefone(createForm.formData.telefone),
      };

      await api.post("/usuarios", dataToSend);
      createModal.close();
      createForm.reset();
      fetchUsuarios();
    } catch (err) {
      createModal.setError(err.response?.data?.message || "Falha ao criar usuário.");
    }
    createModal.setLoading(false);
  }, [createForm, createModal, fetchUsuarios]);

  const handleEditUser = useCallback(async () => {
    if (!editingUser) return;

    const erros = validarFormulario(editForm.formData, true);
    if (erros.length > 0) {
      editModal.setError(erros.join(", "));
      return;
    }

    editModal.setLoading(true);
    editModal.setError("");

    try {
      const dataToSend = {
        nome: editForm.formData.nome.trim(),
        email: editForm.formData.email.trim(),
        telefone: limparTelefone(editForm.formData.telefone),
        role: editForm.formData.role,
      };

      if (editForm.formData.senha) {
        dataToSend.senha = editForm.formData.senha;
      }

      await api.put(`/usuarios/${editingUser.id}`, dataToSend);
      editModal.close();
      setEditingUser(null);
      fetchUsuarios();
    } catch (err) {
      editModal.setError(err.response?.data?.message || "Falha ao salvar alterações.");
    }
    editModal.setLoading(false);
  }, [editingUser, editForm, editModal, fetchUsuarios]);

  const handleDeleteUser = useCallback(async () => {
    if (!deletingUser) return;

    deleteModal.setLoading(true);
    deleteModal.setError("");

    try {
      await api.delete(`/usuarios/${deletingUser.id}`);
      deleteModal.close();
      setDeletingUser(null);
      fetchUsuarios();
    } catch (err) {
      deleteModal.setError(err.response?.data?.message || "Falha ao excluir usuário.");
    }
    deleteModal.setLoading(false);
  }, [deletingUser, deleteModal, fetchUsuarios]);

  // ============================================================================
  // HANDLERS DE FECHAMENTO
  // ============================================================================

  const handleCloseEditModal = useCallback(() => {
    editModal.close();
    setEditingUser(null);
  }, [editModal]);

  const handleCloseDeleteModal = useCallback(() => {
    deleteModal.close();
    setDeletingUser(null);
  }, [deleteModal]);

  // ============================================================================
  // MEMOIZAÇÕES
  // ============================================================================

  const createSubmitText = useMemo(() => ({
    default: "Criar Usuário",
    loading: "Criando..."
  }), []);

  const editSubmitText = useMemo(() => ({
    default: "Salvar Alterações",
    loading: "Salvando..."
  }), []);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) return <LoadingSpinner message="Carregando Usuários..." />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h2>Gerenciar Usuários</h2>
      <p>Esta área é restrita a administradores.</p>

      <div className="mb-3">
        <Button variant="success" onClick={handleOpenCreateModal}>
          <i className="bi bi-plus-circle-fill"></i> Criar Novo Usuário
        </Button>
      </div>

      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <UserTable 
          usuarios={usuarios} 
          onEdit={handleOpenEditModal} 
          onDelete={handleOpenDeleteModal} 
        />
      )}

      {/* Modal de Criação */}
      <UserModal
        show={createModal.isOpen}
        onHide={createModal.close}
        title="Criar Novo Usuário"
        formData={createForm.formData}
        handleChange={createForm.handleChange}
        onSubmit={handleCreateUser}
        loading={createModal.loading}
        error={createModal.error}
        submitText={createSubmitText}
      />

      {/* Modal de Edição */}
      <UserModal
        show={editModal.isOpen}
        onHide={handleCloseEditModal}
        title={`Editar Usuário (ID: ${editingUser?.id})`}
        formData={editForm.formData}
        handleChange={editForm.handleChange}
        onSubmit={handleEditUser}
        loading={editModal.loading}
        error={editModal.error}
        submitText={editSubmitText}
        isEdit={true}
      />

      {/* Modal de Exclusão */}
      <DeleteConfirmModal
        show={deleteModal.isOpen}
        onHide={handleCloseDeleteModal}
        user={deletingUser}
        onConfirm={handleDeleteUser}
        loading={deleteModal.loading}
        error={deleteModal.error}
      />
    </div>
  );
};

export default Usuarios;

