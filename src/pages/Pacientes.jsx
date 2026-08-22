import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { sql } from '../lib/db';

export default function Pacientes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPacientes() {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);

        // Busca todos os pacientes da nutricionista com a data da última consulta
        const data = await sql`
          WITH UltimasConsultas AS (
            SELECT 
              paciente_id,
              data_consulta,
              ROW_NUMBER() OVER(PARTITION BY paciente_id ORDER BY data_consulta DESC, created_at DESC) as rn
            FROM public.consultas
          )
          SELECT 
            p.id,
            p.nome,
            p.foto_url,
            p.objetivos,
            p.objetivo_texto,
            p.email,
            p.whatsapp,
            p.created_at,
            uc.data_consulta as ultima_consulta
          FROM public.pacientes p
          LEFT JOIN UltimasConsultas uc ON uc.paciente_id = p.id AND uc.rn = 1
          WHERE p.nutricionista_id = ${user.id}
          ORDER BY p.nome ASC
        `;

        setPacientes(data || []);
      } catch (err) {
        console.error('Erro ao carregar pacientes:', err);
        setError('Não foi possível carregar a lista de pacientes.');
      } finally {
        setLoading(false);
      }
    }

    loadPacientes();
  }, [user]);

  const filteredPacientes = pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sem consultas';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const formatObjetivos = (p) => {
    const list = [];
    if (Array.isArray(p.objetivos) && p.objetivos.length > 0) {
      list.push(...p.objetivos);
    }
    if (p.objetivo_texto) {
      list.push(p.objetivo_texto);
    }
    if (list.length === 0) return 'Não informado';
    return list.join(', ');
  };

  return (
    <Layout>
      <div className="patients-page">
        <div className="page-header-actions">
          <div>
            <h1 className="page-title">Pacientes</h1>
            <p className="page-subtitle">Gerencie os pacientes cadastrados e seus históricos clínicos.</p>
          </div>
          <Link to="/pacientes/novo" className="btn-primary btn-add-patient">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Paciente
          </Link>
        </div>

        {/* Barra de pesquisa e estatísticas rápidas */}
        <div className="patients-toolbar">
          <div className="search-box">
            <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Buscar paciente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>
          <span className="results-count">
            {filteredPacientes.length} {filteredPacientes.length === 1 ? 'paciente' : 'pacientes'}
          </span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Carregando pacientes...</p>
          </div>
        ) : pacientes.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>Nenhum paciente cadastrado ainda</p>
            <span>Cadastre seu primeiro paciente para começar a gerenciar consultas e planos alimentares.</span>
            <Link to="/pacientes/novo" className="btn-primary" style={{ marginTop: '1.25rem' }}>
              Cadastrar Primeiro Paciente
            </Link>
          </div>
        ) : filteredPacientes.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum paciente encontrado com o nome "{searchTerm}"</p>
            <span>Tente buscar por outro termo ou limpe o campo de busca.</span>
          </div>
        ) : (
          <div className="patients-grid-list">
            {filteredPacientes.map((paciente) => (
              <div 
                key={paciente.id} 
                className="patient-card-item"
                onClick={() => navigate(`/pacientes/${paciente.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/pacientes/${paciente.id}`)}
              >
                <div className="patient-card-top">
                  <div className="patient-avatar-badge" style={{ overflow: 'hidden', padding: 0 }}>
                    {paciente.foto_url ? (
                      <img 
                        src={paciente.foto_url} 
                        alt={paciente.nome} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      paciente.nome.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="patient-card-titles">
                    <h3 className="patient-card-name">{paciente.nome}</h3>
                    <span className="patient-card-subtitle">{paciente.email || paciente.whatsapp || 'Sem contato'}</span>
                  </div>
                </div>

                <div className="patient-card-info-row">
                  <div className="info-block">
                    <span className="info-label">Objetivo</span>
                    <span className="info-value objective-tag">
                      {formatObjetivos(paciente)}
                    </span>
                  </div>

                  <div className="info-block">
                    <span className="info-label">Última consulta</span>
                    <span className={`info-value date-tag ${paciente.ultima_consulta ? 'has-date' : 'no-date'}`}>
                      {formatDate(paciente.ultima_consulta)}
                    </span>
                  </div>
                </div>

                <div className="patient-card-footer">
                  <span className="view-profile-link">
                    Acessar perfil
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
