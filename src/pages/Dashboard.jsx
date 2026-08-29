import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { sql } from '../lib/db';
import { 
  UsersIcon, 
  CalendarIcon, 
  SparklesIcon, 
  ArrowRightIcon, 
  WhatsAppIcon, 
  PlusIcon,
  FlameIcon,
  CheckIcon
} from '../components/Icons';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [consultasSemana, setConsultasSemana] = useState(0);
  const [totalPlanos, setTotalPlanos] = useState(0);
  const [pacientesSemRetorno, setPacientesSemRetorno] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Total de pacientes ativos da nutricionista
        const pacientesCountRes = await sql`
          SELECT count(*)::int as total
          FROM public.pacientes
          WHERE nutricionista_id = ${user.id}
        `;
        setTotalPacientes(pacientesCountRes[0]?.total || 0);

        // 2. Consultas da semana atual
        const consultasSemanaRes = await sql`
          SELECT count(c.id)::int as total
          FROM public.consultas c
          JOIN public.pacientes p ON p.id = c.paciente_id
          WHERE p.nutricionista_id = ${user.id}
            AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
            AND c.data_consulta < date_trunc('week', CURRENT_DATE) + interval '7 days'
        `;
        setConsultasSemana(consultasSemanaRes[0]?.total || 0);

        // 3. Total de planos alimentares criados
        const planosCountRes = await sql`
          SELECT count(pl.id)::int as total
          FROM public.planos_alimentares pl
          JOIN public.pacientes p ON p.id = pl.paciente_id
          WHERE p.nutricionista_id = ${user.id}
        `;
        setTotalPlanos(planosCountRes[0]?.total || 0);

        // 4. Pacientes sem retorno (> 30 dias)
        const semRetornoRes = await sql`
          WITH UltimasConsultas AS (
            SELECT 
              c.paciente_id,
              c.data_consulta,
              c.proximo_retorno,
              ROW_NUMBER() OVER(PARTITION BY c.paciente_id ORDER BY c.data_consulta DESC, c.created_at DESC) as rn
            FROM public.consultas c
            JOIN public.pacientes p ON p.id = c.paciente_id
            WHERE p.nutricionista_id = ${user.id}
          )
          SELECT 
            p.id,
            p.nome,
            p.foto_url,
            p.whatsapp,
            uc.data_consulta as ultima_consulta_data,
            uc.proximo_retorno
          FROM public.pacientes p
          JOIN UltimasConsultas uc ON uc.paciente_id = p.id AND uc.rn = 1
          WHERE p.nutricionista_id = ${user.id}
            AND uc.data_consulta < (CURRENT_DATE - INTERVAL '30 days')
            AND (uc.proximo_retorno IS NULL OR uc.proximo_retorno < CURRENT_DATE)
          ORDER BY uc.data_consulta ASC
        `;
        setPacientesSemRetorno(semRetornoRes || []);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar as informações do dashboard. Verifique sua conexão.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const handlePatientClick = (patientId) => {
    navigate(`/pacientes/${patientId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <Layout>
      <div className="dashboard-view animate-fade">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Carregando dados do dashboard...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* Card 1: Total de pacientes */}
            <div className="dash-card stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper red">
                  <UsersIcon size={22} />
                </div>
                <span className="stat-tag">Total Cadastrado</span>
              </div>
              <div className="stat-body">
                <h3 className="stat-number">{totalPacientes}</h3>
                <p className="stat-label">Total de pacientes ativos</p>
              </div>
              <div className="stat-footer">
                <Link to="/pacientes" className="stat-link">
                  <span>Ver todos os pacientes</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>
            </div>

            {/* Card 2: Consultas da semana */}
            <div className="dash-card stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper orange">
                  <CalendarIcon size={22} />
                </div>
                <span className="stat-tag">Esta semana</span>
              </div>
              <div className="stat-body">
                <h3 className="stat-number">{consultasSemana}</h3>
                <p className="stat-label">Consultas da semana</p>
              </div>
              <div className="stat-footer">
                <span>Registradas de seg a dom</span>
              </div>
            </div>

            {/* Card 3: Planos Alimentares Criados */}
            <div className="dash-card stat-card">
              <div className="stat-card-header">
                <div className="stat-icon-wrapper purple" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                  <SparklesIcon size={22} />
                </div>
                <span className="stat-tag">Prescrições com IA</span>
              </div>
              <div className="stat-body">
                <h3 className="stat-number">{totalPlanos}</h3>
                <p className="stat-label">Planos alimentares no prontuário</p>
              </div>
              <div className="stat-footer">
                <span>Cardápios inteligentes</span>
              </div>
            </div>

            {/* Card 4: Ações Rápidas do Nutricionista */}
            <div className="dash-card quick-actions-card" style={{ gridColumn: 'span 3' }}>
              <div className="quick-actions-bar">
                <div className="quick-actions-info">
                  <h4>Atalhos Rápidos</h4>
                  <p>Inicie novos atendimentos ou acesse prontuários rapidamente</p>
                </div>
                <div className="quick-actions-buttons">
                  <Link to="/pacientes/novo" className="btn-primary">
                    <PlusIcon size={16} />
                    <span>Cadastrar Novo Paciente</span>
                  </Link>
                  <Link to="/pacientes" className="btn-secondary">
                    <UsersIcon size={16} />
                    <span>Buscar Paciente</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 5: Pacientes sem retorno */}
            <div className="dash-card list-card" style={{ gridColumn: 'span 3' }}>
              <div className="list-card-header">
                <div className="list-title-box">
                  <div className="stat-icon-wrapper yellow">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h3 className="card-title">Pacientes que precisam de retorno</h3>
                    <p className="card-subtitle">Última consulta há mais de 30 dias sem retorno agendado</p>
                  </div>
                </div>
                {pacientesSemRetorno.length > 0 && (
                  <span className="count-badge">{pacientesSemRetorno.length}</span>
                )}
              </div>

              <div className="list-body">
                {pacientesSemRetorno.length === 0 ? (
                  <div className="empty-state-small">
                    <CheckIcon size={20} className="text-primary" />
                    <span>Nenhum paciente pendente de retorno no momento. Todos em dia!</span>
                  </div>
                ) : (
                  <ul className="patient-list">
                    {pacientesSemRetorno.map((paciente) => (
                      <li key={paciente.id} className="patient-list-item">
                        <div 
                          className="patient-info-group clickable" 
                          onClick={() => handlePatientClick(paciente.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handlePatientClick(paciente.id)}
                        >
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
                          <div className="patient-names">
                            <h4 className="patient-name">{paciente.nome}</h4>
                            <span className="patient-meta">
                              Última consulta: <strong>{formatDate(paciente.ultima_consulta_data)}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="patient-actions">
                          {paciente.whatsapp ? (
                            <a 
                              href={`https://wa.me/55${paciente.whatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(paciente.nome.split(' ')[0])},%20aqui%20é%20seu%20nutricionista!%20Como%20está%20sua%20evolução?%20Vamos%20agendar%20seu%20retorno?`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-whatsapp-action"
                              title="Enviar mensagem de retorno no WhatsApp"
                            >
                              <WhatsAppIcon size={15} />
                              <span>Chamar no WhatsApp</span>
                            </a>
                          ) : (
                            <span className="no-whatsapp-label">Sem WhatsApp</span>
                          )}

                          <button 
                            className="btn-view-patient"
                            onClick={() => handlePatientClick(paciente.id)}
                            title="Acessar prontuário do paciente"
                          >
                            <span>Ver Prontuário</span>
                            <ArrowRightIcon size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
