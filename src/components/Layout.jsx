import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import CalculadoraMetabolica from './CalculadoraMetabolica';
import { 
  UsersIcon, 
  SparklesIcon, 
  CalculatorIcon, 
  CalendarIcon, 
  PlusIcon,
  HeartPulseIcon,
  FlameIcon
} from './Icons';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGlobalCalcOpen, setIsGlobalCalcOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Sidebar Lateral */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo to="/" showSubtitle size="medium" />
        </div>

        <div className="sidebar-scrollable-content">
          {/* Seção 1: Principal */}
          <div className="sidebar-section">
            <span className="sidebar-section-title">Menu Principal</span>
            <nav className="sidebar-nav">
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
              </NavLink>

              <NavLink 
                to="/pacientes" 
                className={({ isActive }) => `nav-link ${isActive && location.pathname === '/pacientes' ? 'active' : ''}`}
                end
              >
                <UsersIcon className="nav-icon" size={19} />
                <span>Pacientes</span>
              </NavLink>

              <NavLink 
                to="/pacientes/novo" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <PlusIcon className="nav-icon" size={19} />
                <span>Novo Paciente</span>
              </NavLink>
            </nav>
          </div>

          {/* Seção 2: Ferramentas Clínicas */}
          <div className="sidebar-section">
            <span className="sidebar-section-title">Ferramentas Clínicas</span>
            <nav className="sidebar-nav">
              <button 
                type="button" 
                className="nav-link nav-btn-action"
                onClick={() => setIsGlobalCalcOpen(true)}
                title="Abrir calculadora de TMB, GET e Macros"
              >
                <CalculatorIcon className="nav-icon text-orange" size={19} />
                <span className="nav-label-flex">
                  <span>Calculadora Metabólica</span>
                  <span className="sidebar-pill-badge">TMB</span>
                </span>
              </button>

              <button 
                type="button"
                className="nav-link nav-btn-action"
                onClick={() => navigate('/pacientes')}
                title="Gerar cardápios com Inteligência Artificial"
              >
                <SparklesIcon className="nav-icon text-sparkle" size={19} />
                <span className="nav-label-flex">
                  <span>Planos com IA</span>
                  <span className="sidebar-pill-badge ia-badge">IA</span>
                </span>
              </button>

              <button 
                type="button"
                className="nav-link nav-btn-action"
                onClick={() => navigate('/')}
                title="Acompanhar retornos de pacientes"
              >
                <CalendarIcon className="nav-icon text-yellow" size={19} />
                <span>Agenda & Retornos</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="sidebar-footer">
          <div className="sidebar-theme-row">
            <span className="sidebar-footer-label">Tema da interface</span>
            <ThemeToggle size="small" />
          </div>

          <div className="user-profile-preview">
            <div className="user-avatar">
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.nome || 'Nutricionista'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-sidebar-logout" title="Sair do sistema">
            <svg className="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-greeting">
            <div className="greeting-title-row">
              <h2>Olá, {user?.nome ? user.nome.split(' ')[0] : 'Nutricionista'}</h2>
              <span className="clinical-badge">
                <SparklesIcon size={12} className="text-sparkle" />
                <span>Clínica Nutricional</span>
              </span>
            </div>
            <p>Acompanhe aqui o resumo dos seus atendimentos, pacientes e cardápios inteligentes.</p>
          </div>
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>
        <div className="page-body">
          {children}
        </div>
      </main>

      {/* Modal Global da Calculadora Metabólica */}
      {isGlobalCalcOpen && (
        <CalculadoraMetabolica
          paciente={{
            nome: 'Estimativa Rápida',
            sexo: 'Feminino',
            idade: 30,
            peso: 70,
            altura: 170
          }}
          onClose={() => setIsGlobalCalcOpen(false)}
        />
      )}
    </div>
  );
}
