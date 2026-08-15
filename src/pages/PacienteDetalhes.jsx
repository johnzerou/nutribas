import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { sql } from '../lib/db';

export default function PacienteDetalhes() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPaciente() {
      if (!id || !user?.id) return;
      try {
        setLoading(true);
        setError(null);

        const data = await sql`
          SELECT * FROM public.pacientes 
          WHERE id = ${id} AND nutricionista_id = ${user.id}
        `;

        if (data && data.length > 0) {
          setPaciente(data[0]);
        } else {
          setError('Paciente não encontrado ou você não tem permissão para acessá-lo.');
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes do paciente:', err);
        setError('Erro ao carregar os dados do paciente.');
      } finally {
        setLoading(false);
      }
    }

    loadPaciente();
  }, [id, user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const calculateAge = (dateStr) => {
    if (!dateStr) return null;
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateImc = (peso, altura) => {
    if (!peso || !altura) return null;
    const aMetros = altura / 100;
    const imc = peso / (aMetros * aMetros);
    return imc.toFixed(1);
  };

  return (
    <Layout>
      <div className="patient-profile-page">
        <div className="page-header-actions">
          <div>
            <div className="breadcrumb-nav">
              <Link to="/pacientes">Pacientes</Link>
              <span>/</span>
              <span>{paciente?.nome || 'Perfil do Paciente'}</span>
            </div>
            <h1 className="page-title">{paciente?.nome || 'Perfil do Paciente'}</h1>
            <p className="page-subtitle">Visualização completa do prontuário, hábitos e dados clínicos.</p>
          </div>
          <div className="header-button-group">
            <button onClick={() => navigate('/pacientes')} className="btn-secondary">
              ← Voltar para lista
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <div style={{ marginTop: '0.75rem' }}>
              <Link to="/pacientes" className="btn-primary" style={{ display: 'inline-flex' }}>
                Ver todos os pacientes
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Carregando prontuário do paciente...</p>
          </div>
        ) : paciente && (
          <div className="profile-grid">
            {/* Cartão de Resumo */}
            <div className="dash-card profile-summary-card">
              <div className="summary-avatar-big">
                {paciente.nome.charAt(0).toUpperCase()}
              </div>
              <h2 className="summary-name">{paciente.nome}</h2>
              <span className="summary-badge">{paciente.sexo || 'Sexo não informado'}</span>

              <div className="summary-details-list">
                <div className="summary-item">
                  <span className="label">WhatsApp</span>
                  <span className="value">{paciente.whatsapp || 'Não informado'}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Email</span>
                  <span className="value">{paciente.email || 'Não informado'}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Nascimento</span>
                  <span className="value">
                    {formatDate(paciente.data_nascimento)} 
                    {calculateAge(paciente.data_nascimento) !== null && ` (${calculateAge(paciente.data_nascimento)} anos)`}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Data de Cadastro</span>
                  <span className="value">{formatDate(paciente.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Coluna com Seções Detalhadas */}
            <div className="profile-details-column">
              {/* Clínico e Métricas */}
              <div className="dash-card">
                <h3 className="section-card-title">Métricas & Dados Clínicos</h3>
                <div className="metrics-summary-grid">
                  <div className="metric-box">
                    <span className="metric-label">Peso Inicial</span>
                    <span className="metric-number">{paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '-'}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Altura</span>
                    <span className="metric-number">{paciente.altura ? `${paciente.altura} cm` : '-'}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">IMC Inicial</span>
                    <span className="metric-number">
                      {calculateImc(paciente.peso_inicial, paciente.altura) ? `${calculateImc(paciente.peso_inicial, paciente.altura)}` : '-'}
                    </span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Nível Atividade</span>
                    <span className="metric-number" style={{ fontSize: '1rem', marginTop: '0.4rem' }}>
                      {paciente.nivel_atividade || 'Não informado'}
                    </span>
                  </div>
                </div>

                <div className="tags-sections-list">
                  <div className="tag-group">
                    <strong>Objetivos:</strong>
                    <div className="tag-chips-wrap">
                      {Array.isArray(paciente.objetivos) && paciente.objetivos.length > 0 ? (
                        paciente.objetivos.map(o => <span key={o} className="tag-chip">{o}</span>)
                      ) : (
                        <span className="tag-chip-muted">Nenhum selecionado</span>
                      )}
                      {paciente.objetivo_texto && <span className="tag-chip secondary">{paciente.objetivo_texto}</span>}
                    </div>
                  </div>

                  <div className="tag-group">
                    <strong>Patologias:</strong>
                    <div className="tag-chips-wrap">
                      {Array.isArray(paciente.patologias) && paciente.patologias.length > 0 ? (
                        paciente.patologias.map(p => <span key={p} className="tag-chip alert">{p}</span>)
                      ) : (
                        <span className="tag-chip-muted">Nenhuma</span>
                      )}
                    </div>
                  </div>

                  <div className="tag-group">
                    <strong>Restrições Alimentares:</strong>
                    <div className="tag-chips-wrap">
                      {Array.isArray(paciente.restricoes_alimentares) && paciente.restricoes_alimentares.length > 0 ? (
                        paciente.restricoes_alimentares.map(r => <span key={r} className="tag-chip orange">{r}</span>)
                      ) : (
                        <span className="tag-chip-muted">Nenhuma</span>
                      )}
                    </div>
                  </div>

                  <div className="tag-group">
                    <strong>Alergias:</strong>
                    <div className="tag-chips-wrap">
                      {Array.isArray(paciente.alergias) && paciente.alergias.length > 0 ? (
                        paciente.alergias.map(a => <span key={a} className="tag-chip alert">{a}</span>)
                      ) : (
                        <span className="tag-chip-muted">Nenhuma</span>
                      )}
                    </div>
                  </div>
                </div>

                {(paciente.medicamentos || paciente.suplementos) && (
                  <div className="notes-dual-grid">
                    {paciente.medicamentos && (
                      <div className="note-box">
                        <strong>Medicamentos em uso:</strong>
                        <p>{paciente.medicamentos}</p>
                      </div>
                    )}
                    {paciente.suplementos && (
                      <div className="note-box">
                        <strong>Suplementos:</strong>
                        <p>{paciente.suplementos}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Rotina e Hábitos */}
              <div className="dash-card">
                <h3 className="section-card-title">Rotina & Hábitos</h3>
                <div className="habits-summary-grid">
                  <div className="habit-item">
                    <span className="label">Refeições/dia:</span>
                    <span className="value">{paciente.refeicoes_por_dia || '-'}</span>
                  </div>
                  <div className="habit-item">
                    <span className="label">Ingestão de água:</span>
                    <span className="value">{paciente.litros_agua ? `${paciente.litros_agua} L/dia` : '-'}</span>
                  </div>
                  <div className="habit-item">
                    <span className="label">Horário que acorda:</span>
                    <span className="value">{paciente.horario_acorda || '-'}</span>
                  </div>
                  <div className="habit-item">
                    <span className="label">Horário que dorme:</span>
                    <span className="value">{paciente.horario_dorme || '-'}</span>
                  </div>
                  <div className="habit-item full">
                    <span className="label">Atividade Física:</span>
                    <span className="value">
                      {paciente.atividade_fisica ? `Sim — ${paciente.atividade_fisica_descricao || 'Ativo'}` : 'Não pratica'}
                    </span>
                  </div>
                </div>

                {paciente.observacoes && (
                  <div className="observations-box">
                    <strong>Observações Gerais:</strong>
                    <p>{paciente.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
