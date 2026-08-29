import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, SparklesIcon, CheckIcon, ArrowRightIcon } from '../components/Icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
    setIsLoading(false);
  };

  const handleDemoFill = () => {
    setEmail('nutri@nutribas.com');
    setPassword('nutri123');
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
              <span>Plataforma Clínica com IA</span>
            </div>
          </div>

          <div className="auth-hero-bottom">
            <h1 className="auth-hero-headline">
              Eleve a gestão da sua clínica nutricional ao próximo nível.
            </h1>
            <p className="auth-hero-description">
              Prescrição inteligente de cardápios com IA, acompanhamento detalhado de evolução antropométrica e prontuários completos em uma única experiência moderna.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="feature-check-icon"><CheckIcon size={14} /></div>
                <span>Planos alimentares estruturados com Inteligência Artificial</span>
              </div>
              <div className="auth-feature-item">
                <div className="feature-check-icon"><CheckIcon size={14} /></div>
                <span>Gráficos de bioimpedância e acompanhamento de peso</span>
              </div>
              <div className="auth-feature-item">
                <div className="feature-check-icon"><CheckIcon size={14} /></div>
                <span>Cálculos automáticos de TMB, GET e Macronutrientes</span>
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
            <h2 className="auth-title">Bem-vindo de volta!</h2>
            <p className="auth-subtitle">Acesse sua conta para gerenciar seus pacientes e cardápios.</p>
          </div>

          {error && (
            <div className="error-banner animate-fade">
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
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
              <div className="form-label-row">
                <label htmlFor="password">Senha de Acesso</label>
              </div>
              <div className="input-with-icon-wrapper">
                <span className="input-leading-icon"><LockIcon size={18} /></span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button type="submit" className="btn-primary btn-auth-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="ai-mini-spinner"></span>
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-demo-hint">
            <button type="button" className="btn-quick-demo" onClick={handleDemoFill}>
              💡 Preencher dados de teste rápido
            </button>
          </div>

          <div className="auth-bottom-switch">
            <span>Ainda não possui uma conta?</span>
            <Link to="/cadastro" className="auth-switch-link">
              Cadastre-se gratuitamente →
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
