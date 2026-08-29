import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, SparklesIcon, CheckIcon, ArrowRightIcon } from '../components/Icons';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    const result = await register(nome, email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Erro ao criar conta.');
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-split-wrapper">
      {/* Coluna Visual Esquerda (Background Imagem & Branding) */}
      <div className="auth-hero-column" style={{ backgroundImage: `url('/login-bg.jpg')` }}>
        <div className="auth-hero-overlay"></div>
        <div className="auth-hero-content">
          <div className="auth-hero-top">
            <Logo size="large" showSubtitle={false} className="auth-white-logo" />
            <div className="hero-badge">
              <SparklesIcon size={14} className="text-sparkle" />
              <span>Cadastro Nutricionista</span>
            </div>
          </div>

          <div className="auth-hero-bottom">
            <h1 className="auth-hero-headline">
              Transforme a rotina dos seus atendimentos nutricionais.
            </h1>
            <p className="auth-hero-description">
              Junte-se a nutricionistas que prescrevem planos inteligentes, economizam horas semanais e entregam resultados extraordinários.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="feature-check-icon"><CheckIcon size={14} /></div>
                <span>Sem taxa de instalação • Banco de dados Neon seguro</span>
              </div>
              <div className="auth-feature-item">
                <div className="feature-check-icon"><CheckIcon size={14} /></div>
                <span>IA especializada em culinária brasileira e restrições</span>
              </div>
              <div className="auth-feature-item">
                <div className="feature-check-icon"><CheckIcon size={14} /></div>
                <span>Prontuário completo com fotos e acompanhamento visual</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Formulário Direita */}
      <div className="auth-form-column">
        <div className="auth-form-top-bar">
          <div className="auth-mobile-logo">
            <Logo size="medium" showSubtitle />
          </div>
          <ThemeToggle />
        </div>

        <div className="auth-card-inner animate-fade">
          <div className="auth-header-texts">
            <h2 className="auth-title">Crie sua conta profissional</h2>
            <p className="auth-subtitle">Preencha seus dados para começar a utilizar o Nutribas.</p>
          </div>

          {error && (
            <div className="error-banner animate-fade">
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              <div className="input-with-icon-wrapper">
                <span className="input-leading-icon"><UserIcon size={18} /></span>
                <input 
                  type="text" 
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Dra. Juliana Mendes"
                  required 
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Profissional</label>
              <div className="input-with-icon-wrapper">
                <span className="input-leading-icon"><MailIcon size={18} /></span>
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@nutribas.com"
                  required 
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha de Acesso</label>
              <div className="input-with-icon-wrapper">
                <span className="input-leading-icon"><LockIcon size={18} /></span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  required 
                  className="input-with-icon"
                />
                <button 
                  type="button" 
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <div className="input-with-icon-wrapper">
                <span className="input-leading-icon"><LockIcon size={18} /></span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha de acesso"
                  required 
                  className="input-with-icon"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary btn-auth-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="ai-mini-spinner"></span>
                  <span>Criando Conta...</span>
                </>
              ) : (
                <>
                  <span>Cadastrar e Começar</span>
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-bottom-switch">
            <span>Já possui uma conta?</span>
            <Link to="/login" className="auth-switch-link">
              Faça login no sistema →
            </Link>
          </div>
        </div>

        <div className="auth-copyright">
          Nutribas Clínico © {new Date().getFullYear()} • Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
