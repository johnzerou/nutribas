import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { sql } from '../lib/db';
import { 
  UsersIcon, 
  SearchIcon, 
  PlusIcon, 
  TargetIcon, 
  CalendarIcon, 
  ArrowRightIcon, 
  WhatsAppIcon,
  FilterIcon
} from '../components/Icons';

const OBJETIVO_FILTERS = [
  'Todos',
  'Emagrecer',
  'Ganhar massa',
  'Saúde geral',
  'Reeducação alimentar',
  'Performance esportiva'
];

export default function Pacientes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjectiveFilter, setSelectedObjectiveFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('nome_asc');
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

  const filteredPacientes = useMemo(() => {
    let result = pacientes.filter(p => {
      const matchSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.whatsapp && p.whatsapp.includes(searchTerm));

      if (!matchSearch) return false;

      if (selectedObjectiveFilter !== 'Todos') {
        const objs = Array.isArray(p.objetivos) ? p.objetivos : [];
        const hasObj = objs.some(o => o.toLowerCase().includes(selectedObjectiveFilter.toLowerCase())) ||
          (p.objetivo_texto && p.objetivo_texto.toLowerCase().includes(selectedObjectiveFilter.toLowerCase()));
        if (!hasObj) return false;
      }

      return true;
    });

    if (sortBy === 'nome_asc') {
      result.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
    } else if (sortBy === 'nome_desc') {
      result.sort((a, b) => (b.nome || '').localeCompare(a.nome || ''));
    } else if (sortBy === 'recentes') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'ultima_consulta') {
      result.sort((a, b) => {
        if (!a.ultima_consulta) return 1;
        if (!b.ultima_consulta) return -1;
        return new Date(b.ultima_consulta) - new Date(a.ultima_consulta);
      });
    }

    return result;
  }, [pacientes, searchTerm, selectedObjectiveFilter, sortBy]);

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
    if (list.length === 0) return 'Nutrição Geral';
    return list.slice(0, 2).join(' • ');
  };

  return (
    <Layout>
      <div className="patients-page animate-fade">
        <div className="page-header-actions">
          <div>
            <h1 className="page-title">Pacientes</h1>
            <p className="page-subtitle">Gerencie os pacientes cadastrados, acompanhamentos clínicos e dietas com IA.</p>
          </div>
          <Link to="/pacientes/novo" className="btn-primary btn-add-patient">
            <PlusIcon size={18} />
            <span>Novo Paciente</span>
          </Link>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="patients-toolbar-card">
          <div className="patients-toolbar-top">
            <div className="search-box">
              <SearchIcon className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome, email ou whatsapp..."
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

            <div className="sort-box">
              <span className="sort-label">Ordenar por:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="nome_asc">Nome (A - Z)</option>
                <option value="nome_desc">Nome (Z - A)</option>
                <option value="recentes">Mais recentes</option>
                <option value="ultima_consulta">Última consulta</option>
              </select>
            </div>
          </div>

          {/* Chips de filtro por Objetivo */}
          <div className="filter-chips-row">
            <span className="filter-chips-label">
              <FilterIcon size={14} />
              <span>Objetivo:</span>
            </span>
            <div className="filter-chips-list">
              {OBJETIVO_FILTERS.map((obj) => (
                <button
                  key={obj}
                  type="button"
                  className={`filter-chip-btn ${selectedObjectiveFilter === obj ? 'active' : ''}`}
                  onClick={() => setSelectedObjectiveFilter(obj)}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="results-count-bar">
          <span className="results-count">
            Exibindo {filteredPacientes.length} de {pacientes.length} {pacientes.length === 1 ? 'paciente' : 'pacientes'}
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
            <UsersIcon size={48} className="text-muted" />
            <p>Nenhum paciente cadastrado ainda</p>
            <span>Cadastre seu primeiro paciente para começar a prescrever cardápios inteligentes e acompanhar a evolução.</span>
            <Link to="/pacientes/novo" className="btn-primary" style={{ marginTop: '1.25rem' }}>
              <PlusIcon size={16} />
              <span>Cadastrar Primeiro Paciente</span>
            </Link>
          </div>
        ) : filteredPacientes.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum paciente encontrado com esses filtros.</p>
            <span>Tente limpar a busca ou selecionar outro objetivo.</span>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedObjectiveFilter('Todos');
              }}
            >
              Limpar Filtros
            </button>
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
                    <span className="info-label">
                      <TargetIcon size={12} />
                      <span>Objetivo</span>
                    </span>
                    <span className="info-value objective-tag">
                      {formatObjetivos(paciente)}
                    </span>
                  </div>

                  <div className="info-block">
                    <span className="info-label">
                      <CalendarIcon size={12} />
                      <span>Última consulta</span>
                    </span>
                    <span className={`info-value date-tag ${paciente.ultima_consulta ? 'has-date' : 'no-date'}`}>
                      {formatDate(paciente.ultima_consulta)}
                    </span>
                  </div>
                </div>

                <div className="patient-card-footer">
                  {paciente.whatsapp && (
                    <a
                      href={`https://wa.me/55${paciente.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="patient-card-whatsapp"
                      onClick={(e) => e.stopPropagation()}
                      title="Chamar no WhatsApp"
                    >
                      <WhatsAppIcon size={15} />
                    </a>
                  )}
                  <span className="view-profile-link">
                    <span>Acessar perfil</span>
                    <ArrowRightIcon size={14} />
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
