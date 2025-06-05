import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmSenha: '',
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Função de validação
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nome':
        const nomeRegex = /^[a-zA-ZÀ-ÿ\s]{3,}$/;
        if (!value) {
          newErrors.nome = 'Nome é obrigatório.';
        } else if (!nomeRegex.test(value)) {
          newErrors.nome = 'Nome deve conter apenas letras e espaços, com no mínimo 3 caracteres.';
        } else {
          delete newErrors.nome;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email é obrigatório.';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Por favor, insira um email válido.';
        } else {
          delete newErrors.email;
        }
        break;

      case 'telefone':
        const telefoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
        if (value && !telefoneRegex.test(value)) {
          newErrors.telefone = 'Telefone deve estar no formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX.';
        } else {
          delete newErrors.telefone;
        }
        break;

      case 'senha':
        const senhaRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!value) {
          newErrors.senha = 'Senha é obrigatória.';
        } else if (!senhaRegex.test(value)) {
          newErrors.senha = 'Senha deve ter pelo menos 8 caracteres, incluindo 1 maiúscula, 1 número e 1 caractere especial.';
        } else {
          delete newErrors.senha;
        }
        if (formData.confirmSenha && value !== formData.confirmSenha) {
          newErrors.confirmSenha = 'As senhas não coincidem.';
        } else if (formData.confirmSenha && !newErrors.senha) {
          delete newErrors.confirmSenha;
        }
        break;

      case 'confirmSenha':
        if (!value) {
          newErrors.confirmSenha = 'Confirmação de senha é obrigatória.';
        } else if (value !== formData.senha) {
          newErrors.confirmSenha = 'As senhas não coincidem.';
        } else {
          delete newErrors.confirmSenha;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar o formulário inteiro
  useEffect(() => {
    const isValid =
      formData.nome &&
      formData.email &&
      formData.telefone &&
      formData.senha &&
      formData.confirmSenha &&
      !errors.nome &&
      !errors.email &&
      !errors.telefone &&
      !errors.senha &&
      !errors.confirmSenha;
    setIsFormValid(isValid);
  }, [formData, errors]);

  // Manipulador de mudanças nos campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Manipulador de envio do formulário
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    const isNomeValid = validateField('nome', formData.nome);
    const isEmailValid = validateField('email', formData.email);
    const isTelefoneValid = validateField('telefone', formData.telefone);
    const isSenhaValid = validateField('senha', formData.senha);
    const isConfirmSenhaValid = validateField('confirmSenha', formData.confirmSenha);

    if (!isNomeValid || !isEmailValid || !isTelefoneValid || !isSenhaValid || !isConfirmSenhaValid) {
      return;
    }

    setLoading(true);
    try {
      await register(formData.nome, formData.email,formData.telefone, formData.senha );
      navigate('/');
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Falha no registro. Tente novamente.' });
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Registrar Nova Conta</h2>
            {errors.form && <div className="alert alert-danger">{errors.form}</div>}
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="nome" className="form-label">Nome Completo</label>
                <input
                  type="text"
                  className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="telefone" className="form-label">Telefone</label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={formData.telefone}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="text"
                      className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                      id="telefone"
                      name="telefone"
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  )}
                </InputMask>
                {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="senha" className="form-label">Senha</label>
                <input
                  type="password"
                  className={`form-control ${errors.senha ? 'is-invalid' : ''}`}
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.senha && <div className="invalid-feedback">{errors.senha}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="confirmSenha" className="form-label">Confirmar Senha</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmSenha ? 'is-invalid' : ''}`}
                  id="confirmSenha"
                  name="confirmSenha"
                  value={formData.confirmSenha}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.confirmSenha && <div className="invalid-feedback">{errors.confirmSenha}</div>}
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 mb-3"
                disabled={loading || !isFormValid}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
            <div className="text-center">
              <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;