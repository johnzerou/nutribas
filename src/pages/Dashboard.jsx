import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">Nutribas</div>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </header>
      
      <main>
        <h1>Bem-vindo(a), {user?.nome || 'Nutricionista'}!</h1>
        <p>Você está logado com o email: {user?.email}</p>
        <p>Seu dashboard está pronto para gerenciar seus pacientes, consultas e planos alimentares.</p>
      </main>
    </div>
  );
}
