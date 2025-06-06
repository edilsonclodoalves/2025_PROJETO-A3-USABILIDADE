import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge, Toast, ToastContainer } from "react-bootstrap";
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
  // if (dados.telefone && !validarTelefone(dados.telefone)) erros.push("Telefone deve estar no formato (XX) XXXXX-XXXX");
  //valida o telefone apenas se for
  
  return erros;
};

const validarResetSenha = (dados) => {
  const erros = [];
  
  if (!dados.novaSenha) erros.push("Nova senha é obrigatória");
  if (!dados.confirmarSenha) erros.push("Confirmação de senha é obrigatória");
  if (dados.novaSenha && dados.novaSenha.length < 6) erros.push("Senha deve ter pelo menos 6 caracteres");
  if (dados.novaSenha !== dados.confirmarSenha) erros.push("As senhas não coincidem");
  
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

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const showToast = useCallback((message, variant = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  return { toasts, showToast, removeToast };
};

// ============================================================================
// COMPONENTES
// ============================================================================

const LoadingSpinner = ({ message = "Carregando..." }) => (
  <div className="text-center p-4">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">{message}</span>
    </Spinner>
    <p className="mt-2 text-muted">{message}</p>
  </div>
);

const UserFormFields = ({ formData, handleChange, isEdit = false }) => (
  <>
    <Form.Group className="mb-3">
      <Form.Label>
        Nome <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        type="text"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        required
        placeholder="Digite o nome do usuário"
        aria-describedby="nome-help"
      />
      <Form.Text id="nome-help" className="text-muted">
        Nome completo do usuário
      </Form.Text>
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Label>
        Email <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="exemplo@dominio.com"
        aria-describedby="email-help"
      />
      <Form.Text id="email-help" className="text-muted">
        Endereço de email válido
      </Form.Text>
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Label>Telefone</Form.Label>
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
            aria-describedby="telefone-help"
          />
        )}
      </InputMask>
      <Form.Text id="telefone-help" className="text-muted">
        Use o formato (XX) XXXXX-XXXX{isEdit ? ". Deixe em branco para remover." : ". Campo opcional."}
      </Form.Text>
    </Form.Group>  
    <Form.Group className="mb-3">
      <Form.Label>
        Papel <span className="text-danger">*</span>
      </Form.Label>
      <Form.Select
        name="role"
        value={formData.role}
        onChange={handleChange}
        required
        aria-describedby="role-help"
      >
        <option value="">Selecione um papel</option>
        <option value="cliente">Cliente</option>
        <option value="operador">Operador</option>
        <option value="admin">Admin</option>
      </Form.Select>
      <Form.Text id="role-help" className="text-muted">
        Define as permissões do usuário no sistema
      </Form.Text>
    </Form.Group>
  </>
);

const ResetPasswordFields = ({ formData, handleChange }) => (
  <>
    <Form.Group className="mb-3">
      <Form.Label>
        Nova Senha <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control 
        type="password" 
        name="novaSenha" 
        value={formData.novaSenha}
        onChange={handleChange}
        required
        placeholder="Digite a nova senha"
        minLength={6}
        aria-describedby="nova-senha-help"
      />
      <Form.Text id="nova-senha-help" className="text-muted">
        A senha deve ter pelo menos 6 caracteres
      </Form.Text>
    </Form.Group>
    
    <Form.Group className="mb-3">
      <Form.Label>
        Confirmar Nova Senha <span className="text-danger">*</span>
      </Form.Label>
      <Form.Control 
        type="password" 
        name="confirmarSenha" 
        value={formData.confirmarSenha}
        onChange={handleChange}
        required
        placeholder="Confirme a nova senha"
        minLength={6}
        aria-describedby="confirmar-senha-help"
      />
      <Form.Text id="confirmar-senha-help" className="text-muted">
        Digite a mesma senha para confirmação
      </Form.Text>
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
  <Modal show={show} onHide={onHide} centered size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
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

const ResetPasswordModal = ({ 
  show, 
  onHide, 
  user, 
  formData, 
  handleChange, 
  onSubmit, 
  loading, 
  error 
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Reset de Senha - {user?.nome}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <Form>
        <ResetPasswordFields 
          formData={formData} 
          handleChange={handleChange} 
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
            {" "}Resetando...
          </>
        ) : (
          "Reset Senha"
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
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <p>
        Tem certeza que deseja excluir o usuário{" "}
        <strong>{user?.nome}</strong> (ID: {user?.id})? 
      </p>
      <Alert variant="warning" className="mb-0">
        <strong>Atenção:</strong> Esta ação não pode ser desfeita.
      </Alert>
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

const UserTable = ({ usuarios, onEdit, onDelete, onResetPassword }) => {
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "admin": return "danger";
      case "operador": return "warning";
      default: return "secondary";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin": return "Administrador";
      case "operador": return "Operador";
      case "cliente": return "Cliente";
      default: return role;
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
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
                  {getRoleLabel(usuario.role)}
                </Badge>
              </td>
              <td>
                <div className="btn-group" role="group" aria-label="Ações do usuário">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onEdit(usuario)}
                    title="Editar usuário"
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => onResetPassword(usuario)}
                    title="Reset de senha"
                  >
                    <i className="bi bi-key-fill"></i>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(usuario)}
                    title="Excluir usuário"
                  >
                    <i className="bi bi-trash-fill"></i>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ToastNotifications = ({ toasts, onRemove }) => (
  <ToastContainer position="top-end" className="p-3">
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        onClose={() => onRemove(toast.id)}
        show={true}
        delay={5000}
        autohide
        bg={toast.variant}
      >
        <Toast.Header>
          <strong className="me-auto">
            {toast.variant === "success" ? "Sucesso" : "Notificação"}
          </strong>
        </Toast.Header>
        <Toast.Body className={toast.variant === "success" ? "text-white" : ""}>
          {toast.message}
        </Toast.Body>
      </Toast>
    ))}
  </ToastContainer>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Hooks customizados
  const createModal = useModal();
  const editModal = useModal();
  const resetPasswordModal = useModal();
  const deleteModal = useModal();
  const { toasts, showToast, removeToast } = useToast();

  // Formulários
  const createForm = useForm({
    nome: "",
    email: "",
    telefone: "",
    role: "",
    senha: "",
  });

  const editForm = useForm({
    nome: "",
    email: "",
    telefone: "",
    role: "",
  });

  const resetPasswordForm = useForm({
    novaSenha: "",
    confirmarSenha: "",
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

  const handleOpenResetPasswordModal = useCallback((usuario) => {
    setResetPasswordUser(usuario);
    resetPasswordForm.reset();
    resetPasswordModal.open();
  }, [resetPasswordForm, resetPasswordModal]);

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

      await api.post("/usuarios/admin/create", dataToSend);
      createModal.close();
      createForm.reset();
      fetchUsuarios();
      showToast("Usuário criado com sucesso!", "success");
    } catch (err) {
      createModal.setError(err.response?.data?.message || "Falha ao criar usuário.");
    }
    createModal.setLoading(false);
  }, [createForm, createModal, fetchUsuarios, showToast]);

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
      showToast("Usuário atualizado com sucesso!", "success");
    } catch (err) {
      editModal.setError(err.response?.data?.message || "Falha ao salvar alterações.");
    }
    editModal.setLoading(false);
  }, [editingUser, editForm, editModal, fetchUsuarios, showToast]);

  const handleResetPassword = useCallback(async () => {
    if (!resetPasswordUser) return;

    const erros = validarResetSenha(resetPasswordForm.formData);
    if (erros.length > 0) {
      resetPasswordModal.setError(erros.join(", "));
      return;
    }

    resetPasswordModal.setLoading(true);
    resetPasswordModal.setError("");

    try {
      await api.put(`/usuarios/${resetPasswordUser.id}/reset-password`, {
        novaSenha: resetPasswordForm.formData.novaSenha
      });
      resetPasswordModal.close();
      setResetPasswordUser(null);
      showToast(`Senha do usuário ${resetPasswordUser.nome} foi resetada com sucesso!`, "success");
    } catch (err) {
      resetPasswordModal.setError(err.response?.data?.message || "Falha ao resetar senha.");
    }
    resetPasswordModal.setLoading(false);
  }, [resetPasswordUser, resetPasswordForm, resetPasswordModal, showToast]);

  const handleDeleteUser = useCallback(async () => {
    if (!deletingUser) return;

    deleteModal.setLoading(true);
    deleteModal.setError("");

    try {
      await api.delete(`/usuarios/${deletingUser.id}`);
      deleteModal.close();
      setDeletingUser(null);
      fetchUsuarios();
      showToast(`Usuário ${deletingUser.nome} foi excluído com sucesso!`, "success");
    } catch (err) {
      deleteModal.setError(err.response?.data?.message || "Falha ao excluir usuário.");
    }
    deleteModal.setLoading(false);
  }, [deletingUser, deleteModal, fetchUsuarios, showToast]);

  // ============================================================================
  // HANDLERS DE FECHAMENTO
  // ============================================================================

  const handleCloseEditModal = useCallback(() => {
    editModal.close();
    setEditingUser(null);
  }, [editModal]);

  const handleCloseResetPasswordModal = useCallback(() => {
    resetPasswordModal.close();
    setResetPasswordUser(null);
  }, [resetPasswordModal]);

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

  if (loading) return <LoadingSpinner message="Carregando usuários..." />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Gerenciar Usuários</h2>
              <p className="text-muted mb-0">
                Esta área é restrita a administradores. Total de usuários: {usuarios.length}
              </p>
            </div>
            <Button 
              variant="success" 
              onClick={handleOpenCreateModal}
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-circle-fill"></i> 
              Criar Novo Usuário
            </Button>
          </div>

          {usuarios.length === 0 ? (
            <Alert variant="info">
              <i className="bi bi-info-circle-fill me-2"></i>
              Nenhum usuário encontrado. Clique em "Criar Novo Usuário" para adicionar o primeiro usuário.
            </Alert>
          ) : (
            <div className="card">
              <div className="card-body p-0">
                <UserTable 
                  usuarios={usuarios} 
                  onEdit={handleOpenEditModal} 
                  onDelete={handleOpenDeleteModal}
                  onResetPassword={handleOpenResetPasswordModal}
                />
              </div>
            </div>
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
            title={`Editar Usuário: ${editingUser?.nome} (ID: ${editingUser?.id})`}
            formData={editForm.formData}
            handleChange={editForm.handleChange}
            onSubmit={handleEditUser}
            loading={editModal.loading}
            error={editModal.error}
            submitText={editSubmitText}
            isEdit={true}
          />

          {/* Modal de Reset de Senha */}
          <ResetPasswordModal
            show={resetPasswordModal.isOpen}
            onHide={handleCloseResetPasswordModal}
            user={resetPasswordUser}
            formData={resetPasswordForm.formData}
            handleChange={resetPasswordForm.handleChange}
            onSubmit={handleResetPassword}
            loading={resetPasswordModal.loading}
            error={resetPasswordModal.error}
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

          {/* Notificações Toast */}
          <ToastNotifications 
            toasts={toasts} 
            onRemove={removeToast} 
          />
        </div>
      </div>
    </div>
  );
};

export default Usuarios;

