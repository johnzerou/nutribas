import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { sql } from '../lib/db';
import WeightEvolutionChart from '../components/WeightEvolutionChart';
import ImageUpload from '../components/ImageUpload';

export default function PacienteDetalhes() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados da Página
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('dados'); // 'dados' | 'consultas' | 'planos'
  const [activeSubTab, setActiveSubTab] = useState('pessoal'); // 'pessoal' | 'clinico' | 'habitos'

  // Dados do Paciente (Formulário Editável)
  const [paciente, setPaciente] = useState(null);
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataInicioTratamento, setDataInicioTratamento] = useState('');
  const [sexo, setSexo] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  const [pesoInicial, setPesoInicial] = useState('');
  const [alturaCm, setAlturaCm] = useState('');
  const [objetivos, setObjetivos] = useState([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');

  const [patologias, setPatologias] = useState([]);
  const [patologiaLivre, setPatologiaLivre] = useState('');
  const [restricoes, setRestricoes] = useState([]);
  const [restricaoLivre, setRestricaoLivre] = useState('');
  const [alergias, setAlergias] = useState([]);
  const [alergiaLivre, setAlergiaLivre] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  const [refeicoesPorDia, setRefeicoesPorDia] = useState('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState('');
  const [atividadeFisica, setAtividadeFisica] = useState(null);
  const [atividadeFisicaDescricao, setAtividadeFisicaDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [savingPatient, setSavingPatient] = useState(false);

  // Consultas
  const [consultas, setConsultas] = useState([]);
  const [loadingConsultas, setLoadingConsultas] = useState(false);
  const [isModalConsultaOpen, setIsModalConsultaOpen] = useState(false);
  const [savingConsulta, setSavingConsulta] = useState(false);

  // Form Nova Consulta Modal
  const [novaConsultaData, setNovaConsultaData] = useState(() => new Date().toISOString().split('T')[0]);
  const [novaConsultaPeso, setNovaConsultaPeso] = useState('');
  const [novaConsultaCintura, setNovaConsultaCintura] = useState('');
  const [novaConsultaQuadril, setNovaConsultaQuadril] = useState('');
  const [novaConsultaGordura, setNovaConsultaGordura] = useState('');
  const [novaConsultaObservacoes, setNovaConsultaObservacoes] = useState('');
  const [novaConsultaRetorno, setNovaConsultaRetorno] = useState('');
  const [consultaError, setConsultaError] = useState('');

  // Planos Alimentares
  const [planos, setPlanos] = useState([]);
  const [loadingPlanos, setLoadingPlanos] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [showGerarPlanoModal, setShowGerarPlanoModal] = useState(false);

  // Opções pré-definidas
  const OPCOES_OBJETIVO = [
    'Emagrecer',
    'Ganhar massa',
    'Controlar diabetes',
    'Saúde geral',
    'Performance esportiva',
    'Reeducação alimentar'
  ];

  const OPCOES_NIVEL_ATIVIDADE = [
    'Sedentário',
    'Levemente ativo',
    'Moderadamente ativo',
    'Muito ativo',
    'Extremamente ativo'
  ];

  const OPCOES_PATOLOGIAS = [
    'Diabetes',
    'Hipertensão',
    'Hipotireoidismo',
    'Hipertireoidismo',
    'Síndrome do ovário policístico',
    'Doença celíaca',
    'Colesterol alto'
  ];

  const OPCOES_RESTRICOES = [
    'Lactose',
    'Glúten',
    'Açúcar',
    'Carne vermelha',
    'Frutos do mar'
  ];

  const OPCOES_ALERGIAS = [
    'Amendoim',
    'Leite',
    'Ovo',
    'Soja',
    'Trigo',
    'Frutos do mar'
  ];

  // Carregar dados iniciais do Paciente
  useEffect(() => {
    async function loadData() {
      if (!id || !user?.id) return;
      try {
        setLoading(true);
        setError(null);

        // 1. Busca paciente
        const res = await sql`
          SELECT * FROM public.pacientes 
          WHERE id = ${id} AND nutricionista_id = ${user.id}
        `;

        if (!res || res.length === 0) {
          setError('Paciente não encontrado ou você não tem permissão para acessá-lo.');
          setLoading(false);
          return;
        }

        const p = res[0];
        setPaciente(p);
        setNome(p.nome || '');
        setFotoUrl(p.foto_url || '');
        setDataNascimento(p.data_nascimento ? p.data_nascimento.toString().split('T')[0] : '');
        setDataInicioTratamento(p.data_inicio_tratamento ? p.data_inicio_tratamento.toString().split('T')[0] : '');
        setSexo(p.sexo || '');
        setWhatsapp(p.whatsapp || '');
        setEmail(p.email || '');

        setPesoInicial(p.peso_inicial !== null && p.peso_inicial !== undefined ? String(p.peso_inicial) : '');
        setAlturaCm(p.altura !== null && p.altura !== undefined ? String(p.altura) : '');
        setObjetivos(p.objetivos || []);
        setObjetivoTexto(p.objetivo_texto || '');
        setNivelAtividade(p.nivel_atividade || '');

        setPatologias(p.patologias || []);
        setRestricoes(p.restricoes_alimentares || []);
        setAlergias(p.alergias || []);
        setMedicamentos(p.medicamentos || '');
        setSuplementos(p.suplementos || '');

        setRefeicoesPorDia(p.refeicoes_por_dia !== null && p.refeicoes_por_dia !== undefined ? String(p.refeicoes_por_dia) : '');
        setHorarioAcorda(p.horario_acorda || '');
        setHorarioDorme(p.horario_dorme || '');
        setLitrosAgua(p.litros_agua !== null && p.litros_agua !== undefined ? String(p.litros_agua) : '');
        setAtividadeFisica(p.atividade_fisica);
        setAtividadeFisicaDescricao(p.atividade_fisica_descricao || '');
        setObservacoes(p.observacoes || '');

        // 2. Carrega consultas
        await fetchConsultas();

        // 3. Carrega planos alimentares
        await fetchPlanos();

      } catch (err) {
        console.error('Erro ao carregar dados do paciente:', err);
        setError('Erro ao carregar dados do paciente.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, user]);

  // Função para buscar consultas em tempo real
  const fetchConsultas = async () => {
    try {
      setLoadingConsultas(true);
      const res = await sql`
        SELECT * FROM public.consultas
        WHERE paciente_id = ${id}
        ORDER BY data_consulta DESC, created_at DESC
      `;
      setConsultas(res || []);
    } catch (err) {
      console.error('Erro ao buscar consultas:', err);
    } finally {
      setLoadingConsultas(false);
    }
  };

  // Função para buscar planos alimentares
  const fetchPlanos = async () => {
    try {
      setLoadingPlanos(true);
      const res = await sql`
        SELECT * FROM public.planos_alimentares
        WHERE paciente_id = ${id}
        ORDER BY created_at DESC
      `;
      setPlanos(res || []);
    } catch (err) {
      console.error('Erro ao buscar planos alimentares:', err);
    } finally {
      setLoadingPlanos(false);
    }
  };

  // Cálculo de Idade
  const idadeCalculada = useMemo(() => {
    if (!dataNascimento) return null;
    const birth = new Date(dataNascimento);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) || age < 0 ? null : age;
  }, [dataNascimento]);

  // Cálculo de IMC Atual ou Inicial
  const currentWeightForImc = useMemo(() => {
    if (consultas.length > 0 && consultas[0].peso) {
      return parseFloat(consultas[0].peso);
    }
    return pesoInicial ? parseFloat(pesoInicial) : null;
  }, [consultas, pesoInicial]);

  const imcCalculado = useMemo(() => {
    const p = currentWeightForImc;
    const a = parseFloat(alturaCm);
    if (!p || !a || a <= 0) return null;
    const alturaMetros = a / 100;
    const imc = p / (alturaMetros * alturaMetros);
    if (isNaN(imc) || imc <= 0 || imc > 120) return null;

    let classificacao = '';
    if (imc < 18.5) classificacao = 'Abaixo do peso';
    else if (imc < 25) classificacao = 'Peso normal';
    else if (imc < 30) classificacao = 'Sobrepeso';
    else if (imc < 35) classificacao = 'Obesidade Grau I';
    else if (imc < 40) classificacao = 'Obesidade Grau II';
    else classificacao = 'Obesidade Grau III';

    return {
      valor: imc.toFixed(1),
      classificacao
    };
  }, [currentWeightForImc, alturaCm]);

  // Formatação de WhatsApp: (XX) XXXXX-XXXX
  const formatPhone = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    try {
      if (dateStr instanceof Date) {
        return dateStr.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      }
      const str = String(dateStr).split('T')[0];
      if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      }
    } catch {
      // fallback
    }
    return String(dateStr);
  };

  // Salvar Alterações nos Dados do Paciente (Seção 1)
  const handleSavePatient = async (e) => {
    if (e) e.preventDefault();
    if (!nome.trim()) {
      setError('O campo Nome completo é obrigatório.');
      return;
    }

    try {
      setSavingPatient(true);
      setError(null);
      setSuccessMessage('');

      let finalPatologias = [...patologias];
      if (patologiaLivre.trim()) finalPatologias.push(patologiaLivre.trim());
      finalPatologias = finalPatologias.filter(p => p !== 'Nenhum');

      let finalRestricoes = [...restricoes];
      if (restricaoLivre.trim()) finalRestricoes.push(restricaoLivre.trim());
      finalRestricoes = finalRestricoes.filter(r => r !== 'Nenhum');

      let finalAlergias = [...alergias];
      if (alergiaLivre.trim()) finalAlergias.push(alergiaLivre.trim());
      finalAlergias = finalAlergias.filter(a => a !== 'Nenhum');

      await sql`
        UPDATE public.pacientes SET
          nome = ${nome.trim()},
          foto_url = ${fotoUrl || null},
          data_inicio_tratamento = ${dataInicioTratamento || null},
          data_nascimento = ${dataNascimento || null},
          sexo = ${sexo || null},
          whatsapp = ${whatsapp || null},
          email = ${email || null},
          peso_inicial = ${pesoInicial ? parseFloat(pesoInicial) : null},
          altura = ${alturaCm ? parseFloat(alturaCm) : null},
          objetivos = ${objetivos.length > 0 ? objetivos : null},
          objetivo_texto = ${objetivoTexto.trim() || null},
          nivel_atividade = ${nivelAtividade || null},
          patologias = ${finalPatologias.length > 0 ? finalPatologias : null},
          restricoes_alimentares = ${finalRestricoes.length > 0 ? finalRestricoes : null},
          alergias = ${finalAlergias.length > 0 ? finalAlergias : null},
          medicamentos = ${medicamentos.trim() || null},
          suplementos = ${suplementos.trim() || null},
          refeicoes_por_dia = ${refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null},
          horario_acorda = ${horarioAcorda || null},
          horario_dorme = ${horarioDorme || null},
          litros_agua = ${litrosAgua ? parseFloat(litrosAgua) : null},
          atividade_fisica = ${atividadeFisica},
          atividade_fisica_descricao = ${atividadeFisica ? atividadeFisicaDescricao.trim() || null : null},
          observacoes = ${observacoes.trim() || null}
        WHERE id = ${id} AND nutricionista_id = ${user.id}
      `;

      setSuccessMessage('Dados do paciente atualizados com sucesso no prontuário!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Erro ao atualizar paciente:', err);
      setError('Erro ao salvar alterações do paciente.');
    } finally {
      setSavingPatient(false);
    }
  };

  // Salvar Nova Consulta (Modal Seção 2)
  const handleSaveConsulta = async (e) => {
    e.preventDefault();
    setConsultaError('');

    if (!novaConsultaData) {
      setConsultaError('A data da consulta é obrigatória.');
      return;
    }
    if (!novaConsultaPeso || isNaN(Number(novaConsultaPeso)) || Number(novaConsultaPeso) <= 0) {
      setConsultaError('Informe um peso válido para a consulta.');
      return;
    }

    try {
      setSavingConsulta(true);

      await sql`
        INSERT INTO public.consultas (
          paciente_id,
          data_consulta,
          peso,
          cintura,
          quadril,
          percentual_gordura,
          observacoes,
          proximo_retorno
        ) VALUES (
          ${id},
          ${novaConsultaData},
          ${parseFloat(novaConsultaPeso)},
          ${novaConsultaCintura ? parseFloat(novaConsultaCintura) : null},
          ${novaConsultaQuadril ? parseFloat(novaConsultaQuadril) : null},
          ${novaConsultaGordura ? parseFloat(novaConsultaGordura) : null},
          ${novaConsultaObservacoes.trim() || null},
          ${novaConsultaRetorno || null}
        )
      `;

      // Recarrega lista e gráfico
      await fetchConsultas();
      setIsModalConsultaOpen(false);

      // Limpa campos do modal
      setNovaConsultaData(new Date().toISOString().split('T')[0]);
      setNovaConsultaPeso('');
      setNovaConsultaCintura('');
      setNovaConsultaQuadril('');
      setNovaConsultaGordura('');
      setNovaConsultaObservacoes('');
      setNovaConsultaRetorno('');

      setSuccessMessage('Nova consulta cadastrada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Erro ao salvar consulta:', err);
      setConsultaError(err?.message || 'Erro ao registrar consulta. Verifique os dados e tente novamente.');
    } finally {
      setSavingConsulta(false);
    }
  };

  // Deletar Consulta
  const handleDeleteConsulta = async (consultaId) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro de consulta?')) return;
    try {
      await sql`DELETE FROM public.consultas WHERE id = ${consultaId} AND paciente_id = ${id}`;
      await fetchConsultas();
      setSuccessMessage('Consulta removida com sucesso.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao excluir consulta:', err);
      setError('Não foi possível excluir a consulta.');
    }
  };

  // Handlers para seleção de chips
  const toggleChipSelection = (item, currentList, setList) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const togglePatologia = (item) => {
    if (item === 'Nenhum') {
      if (patologias.includes('Nenhum')) setPatologias([]);
      else { setPatologias(['Nenhum']); setPatologiaLivre(''); }
      return;
    }
    const nova = patologias.filter(p => p !== 'Nenhum');
    setPatologias(nova.includes(item) ? nova.filter(p => p !== item) : [...nova, item]);
  };

  const toggleRestricao = (item) => {
    if (item === 'Nenhum') {
      if (restricoes.includes('Nenhum')) setRestricoes([]);
      else { setRestricoes(['Nenhum']); setRestricaoLivre(''); }
      return;
    }
    const nova = restricoes.filter(r => r !== 'Nenhum');
    setRestricoes(nova.includes(item) ? nova.filter(p => p !== item) : [...nova, item]);
  };

  const toggleAlergia = (item) => {
    if (item === 'Nenhum') {
      if (alergias.includes('Nenhum')) setAlergias([]);
      else { setAlergias(['Nenhum']); setAlergiaLivre(''); }
      return;
    }
    const nova = alergias.filter(a => a !== 'Nenhum');
    setAlergias(nova.includes(item) ? nova.filter(p => p !== item) : [...nova, item]);
  };

  return (
    <Layout>
      <div className="patient-profile-page">
        {/* Header da Página */}
        <div className="page-header-actions">
          <div>
            <div className="breadcrumb-nav">
              <Link to="/pacientes">Pacientes</Link>
              <span>/</span>
              <span>{nome || paciente?.nome || 'Perfil do Paciente'}</span>
            </div>
            <div className="patient-profile-header-title-row">
              <h1 className="page-title">{nome || paciente?.nome || 'Perfil do Paciente'}</h1>
              {dataInicioTratamento && (
                <span className="treatment-start-tag">
                  Início: {formatDate(dataInicioTratamento)}
                </span>
              )}
            </div>
            <p className="page-subtitle">Prontuário clínico, acompanhamento de consultas e planos nutricionais.</p>
          </div>
          <div className="header-button-group">
            <button onClick={() => navigate('/pacientes')} className="btn-secondary">
              ← Voltar
            </button>
            {activeMainTab === 'dados' && (
              <button 
                type="button" 
                onClick={handleSavePatient} 
                disabled={savingPatient} 
                className="btn-primary"
              >
                {savingPatient ? 'Salvando...' : '✓ Salvar Alterações'}
              </button>
            )}
            {activeMainTab === 'consultas' && (
              <button 
                type="button" 
                onClick={() => setIsModalConsultaOpen(true)} 
                className="btn-primary"
              >
                + Nova Consulta
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {successMessage && <div className="success-banner animate-fade">{successMessage}</div>}

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Carregando prontuário do paciente...</p>
          </div>
        ) : paciente && (
          <div className="patient-profile-container">
            {/* Barra de Navegação Principal das 3 Seções */}
            <div className="patient-main-nav-tabs">
              <button 
                type="button"
                className={`main-tab-btn ${activeMainTab === 'dados' ? 'active' : ''}`}
                onClick={() => setActiveMainTab('dados')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>1. Dados do Paciente</span>
              </button>

              <button 
                type="button"
                className={`main-tab-btn ${activeMainTab === 'consultas' ? 'active' : ''}`}
                onClick={() => setActiveMainTab('consultas')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <span>2. Consultas & Evolução ({consultas.length})</span>
              </button>

              <button 
                type="button"
                className={`main-tab-btn ${activeMainTab === 'planos' ? 'active' : ''}`}
                onClick={() => setActiveMainTab('planos')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>3. Planos Alimentares ({planos.length})</span>
              </button>
            </div>

            {/* =========================================================
                SEÇÃO 1: DADOS DO PACIENTE (EDITÁVEIS)
               ========================================================= */}
            {activeMainTab === 'dados' && (
              <div className="section-dados-container animate-fade">
                <div className="form-card-container">
                  {/* Sub-Abas: Pessoal, Clínico, Hábitos */}
                  <div className="form-tabs-header">
                    <button 
                      type="button"
                      className={`tab-btn ${activeSubTab === 'pessoal' ? 'active' : ''}`}
                      onClick={() => setActiveSubTab('pessoal')}
                    >
                      <span className="tab-number">1</span>
                      <span>Pessoal & Foto</span>
                    </button>
                    <button 
                      type="button"
                      className={`tab-btn ${activeSubTab === 'clinico' ? 'active' : ''}`}
                      onClick={() => setActiveSubTab('clinico')}
                    >
                      <span className="tab-number">2</span>
                      <span>Clínico</span>
                    </button>
                    <button 
                      type="button"
                      className={`tab-btn ${activeSubTab === 'habitos' ? 'active' : ''}`}
                      onClick={() => setActiveSubTab('habitos')}
                    >
                      <span className="tab-number">3</span>
                      <span>Hábitos</span>
                    </button>
                  </div>

                  {/* SUB-ABA 1: PESSOAL */}
                  {activeSubTab === 'pessoal' && (
                    <div className="tab-content animate-fade">
                      <div className="form-section-title">
                        <h3>Identificação, Foto & Contato</h3>
                        <p>Altere os dados pessoais e clique em Salvar Alterações para atualizar.</p>
                      </div>

                      <div className="patient-photo-and-personal-grid">
                        <div className="photo-upload-container">
                          <label className="section-label">Foto de Perfil</label>
                          <ImageUpload 
                            value={fotoUrl} 
                            onChange={setFotoUrl} 
                            name={nome} 
                            size={110} 
                          />
                        </div>

                        <div className="form-grid-2">
                          <div className="form-group full-width">
                            <label>Nome completo <span className="required-star">*</span></label>
                            <input 
                              type="text" 
                              value={nome}
                              onChange={(e) => setNome(e.target.value)}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>Data de Início do Tratamento</label>
                            <input 
                              type="date" 
                              value={dataInicioTratamento}
                              onChange={(e) => setDataInicioTratamento(e.target.value)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Data de nascimento</label>
                            <input 
                              type="date" 
                              value={dataNascimento}
                              onChange={(e) => setDataNascimento(e.target.value)}
                            />
                            {idadeCalculada !== null && (
                              <span className="helper-badge">{idadeCalculada} anos</span>
                            )}
                          </div>

                          <div className="form-group">
                            <label>Sexo</label>
                            <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                              <option value="">Selecione...</option>
                              <option value="Feminino">Feminino</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Outro">Outro</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>WhatsApp</label>
                            <input 
                              type="text" 
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                            />
                          </div>

                          <div className="form-group full-width">
                            <label>Email</label>
                            <input 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="tab-footer-actions">
                        <div></div>
                        <button 
                          type="button" 
                          className="btn-primary"
                          onClick={() => setActiveSubTab('clinico')}
                        >
                          Próximo: Clínico →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-ABA 2: CLÍNICO */}
                  {activeSubTab === 'clinico' && (
                    <div className="tab-content animate-fade">
                      <div className="form-section-title">
                        <h3>Métricas, Objetivos & Saúde</h3>
                        <p>Altere métricas corporais, objetivos e patologias.</p>
                      </div>

                      {/* Métricas e IMC */}
                      <div className="metrics-row-card">
                        <div className="form-group">
                          <label>Peso Inicial (kg)</label>
                          <div className="input-affix-wrapper">
                            <input 
                              type="number" 
                              step="0.1" 
                              value={pesoInicial}
                              onChange={(e) => setPesoInicial(e.target.value)}
                            />
                            <span className="input-suffix">kg</span>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Altura (cm)</label>
                          <div className="input-affix-wrapper">
                            <input 
                              type="number" 
                              step="1" 
                              value={alturaCm}
                              onChange={(e) => setAlturaCm(e.target.value)}
                            />
                            <span className="input-suffix">cm</span>
                          </div>
                        </div>

                        <div className="imc-display-box">
                          <label>IMC Calculado {consultas.length > 0 ? '(Última consulta)' : '(Inicial)'}</label>
                          <div className="imc-result">
                            {imcCalculado ? (
                              <>
                                <span className="imc-value">{imcCalculado.valor} <small>kg/m²</small></span>
                                <span className="imc-class">{imcCalculado.classificacao}</span>
                              </>
                            ) : (
                              <span className="imc-placeholder">Informe peso e altura</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Objetivos */}
                      <div className="form-group-section">
                        <label className="section-label">Objetivos principais</label>
                        <div className="chip-selector-grid">
                          {OPCOES_OBJETIVO.map((obj) => {
                            const selected = objetivos.includes(obj);
                            return (
                              <button
                                key={obj}
                                type="button"
                                className={`chip-btn ${selected ? 'selected' : ''}`}
                                onClick={() => toggleChipSelection(obj, objetivos, setObjetivos)}
                              >
                                {selected && '✓ '}
                                {obj}
                              </button>
                            );
                          })}
                        </div>
                        <div className="form-group" style={{ marginTop: '1rem' }}>
                          <label>Detalhes do objetivo / meta</label>
                          <input 
                            type="text" 
                            value={objetivoTexto}
                            onChange={(e) => setObjetivoTexto(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Nível de Atividade */}
                      <div className="form-group-section">
                        <label className="section-label">Nível de atividade física diária</label>
                        <div className="radio-pills-row">
                          {OPCOES_NIVEL_ATIVIDADE.map((nivel) => (
                            <label 
                              key={nivel} 
                              className={`radio-pill ${nivelAtividade === nivel ? 'selected' : ''}`}
                            >
                              <input 
                                type="radio" 
                                name="nivelAtividadeEdit" 
                                value={nivel}
                                checked={nivelAtividade === nivel}
                                onChange={(e) => setNivelAtividade(e.target.value)}
                              />
                              <span>{nivel}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Patologias */}
                      <div className="form-group-section">
                        <label className="section-label">Patologias / Condições de saúde</label>
                        <div className="chip-selector-grid">
                          <button
                            type="button"
                            className={`chip-btn ${patologias.includes('Nenhum') ? 'selected-none' : ''}`}
                            onClick={() => togglePatologia('Nenhum')}
                          >
                            {patologias.includes('Nenhum') && '✓ '}
                            Nenhuma
                          </button>
                          {OPCOES_PATOLOGIAS.map((pat) => {
                            const selected = patologias.includes(pat);
                            return (
                              <button
                                key={pat}
                                type="button"
                                className={`chip-btn ${selected ? 'selected' : ''}`}
                                onClick={() => togglePatologia(pat)}
                              >
                                {selected && '✓ '}
                                {pat}
                              </button>
                            );
                          })}
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <input 
                            type="text" 
                            placeholder="Outra patologia..."
                            value={patologiaLivre}
                            onChange={(e) => setPatologiaLivre(e.target.value)}
                            disabled={patologias.includes('Nenhum')}
                          />
                        </div>
                      </div>

                      {/* Restrições */}
                      <div className="form-group-section">
                        <label className="section-label">Restrições alimentares</label>
                        <div className="chip-selector-grid">
                          <button
                            type="button"
                            className={`chip-btn ${restricoes.includes('Nenhum') ? 'selected-none' : ''}`}
                            onClick={() => toggleRestricao('Nenhum')}
                          >
                            {restricoes.includes('Nenhum') && '✓ '}
                            Nenhuma
                          </button>
                          {OPCOES_RESTRICOES.map((rest) => {
                            const selected = restricoes.includes(rest);
                            return (
                              <button
                                key={rest}
                                type="button"
                                className={`chip-btn ${selected ? 'selected' : ''}`}
                                onClick={() => toggleRestricao(rest)}
                              >
                                {selected && '✓ '}
                                {rest}
                              </button>
                            );
                          })}
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <input 
                            type="text" 
                            placeholder="Outra restrição..."
                            value={restricaoLivre}
                            onChange={(e) => setRestricaoLivre(e.target.value)}
                            disabled={restricoes.includes('Nenhum')}
                          />
                        </div>
                      </div>

                      {/* Alergias */}
                      <div className="form-group-section">
                        <label className="section-label">Alergias diagnosticadas</label>
                        <div className="chip-selector-grid">
                          <button
                            type="button"
                            className={`chip-btn ${alergias.includes('Nenhum') ? 'selected-none' : ''}`}
                            onClick={() => toggleAlergia('Nenhum')}
                          >
                            {alergias.includes('Nenhum') && '✓ '}
                            Nenhuma
                          </button>
                          {OPCOES_ALERGIAS.map((alerg) => {
                            const selected = alergias.includes(alerg);
                            return (
                              <button
                                key={alerg}
                                type="button"
                                className={`chip-btn ${selected ? 'selected' : ''}`}
                                onClick={() => toggleAlergia(alerg)}
                              >
                                {selected && '✓ '}
                                {alerg}
                              </button>
                            );
                          })}
                        </div>
                        <div className="form-group" style={{ marginTop: '0.75rem' }}>
                          <input 
                            type="text" 
                            placeholder="Outra alergia..."
                            value={alergiaLivre}
                            onChange={(e) => setAlergiaLivre(e.target.value)}
                            disabled={alergias.includes('Nenhum')}
                          />
                        </div>
                      </div>

                      {/* Medicamentos & Suplementos */}
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Medicamentos contínuos</label>
                          <textarea 
                            rows="3" 
                            value={medicamentos}
                            onChange={(e) => setMedicamentos(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Suplementos atuais</label>
                          <textarea 
                            rows="3" 
                            value={suplementos}
                            onChange={(e) => setSuplementos(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="tab-footer-actions">
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setActiveSubTab('pessoal')}
                        >
                          ← Voltar: Pessoal
                        </button>
                        <button 
                          type="button" 
                          className="btn-primary"
                          onClick={() => setActiveSubTab('habitos')}
                        >
                          Próximo: Hábitos →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB-ABA 3: HÁBITOS */}
                  {activeSubTab === 'habitos' && (
                    <div className="tab-content animate-fade">
                      <div className="form-section-title">
                        <h3>Rotina, Sono & Hábitos</h3>
                        <p>Configurações de rotina diária do paciente.</p>
                      </div>

                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Refeições por dia</label>
                          <input 
                            type="number" 
                            value={refeicoesPorDia}
                            onChange={(e) => setRefeicoesPorDia(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Consumo diário de água (Litros)</label>
                          <div className="input-affix-wrapper">
                            <input 
                              type="number" 
                              step="0.1" 
                              value={litrosAgua}
                              onChange={(e) => setLitrosAgua(e.target.value)}
                            />
                            <span className="input-suffix">Litros</span>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Horário que acorda</label>
                          <input 
                            type="text" 
                            value={horarioAcorda}
                            onChange={(e) => setHorarioAcorda(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Horário que dorme</label>
                          <input 
                            type="text" 
                            value={horarioDorme}
                            onChange={(e) => setHorarioDorme(e.target.value)}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label className="section-label">Pratica atividade física?</label>
                          <div className="radio-pills-row">
                            <label className={`radio-pill ${atividadeFisica === true ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="atividadeFisicaEdit" 
                                checked={atividadeFisica === true}
                                onChange={() => setAtividadeFisica(true)}
                              />
                              <span>Sim</span>
                            </label>
                            <label className={`radio-pill ${atividadeFisica === false ? 'selected' : ''}`}>
                              <input 
                                type="radio" 
                                name="atividadeFisicaEdit" 
                                checked={atividadeFisica === false}
                                onChange={() => setAtividadeFisica(false)}
                              />
                              <span>Não</span>
                            </label>
                          </div>
                        </div>

                        {atividadeFisica === true && (
                          <div className="form-group full-width animate-fade">
                            <label>Descrição das atividades</label>
                            <textarea 
                              rows="3" 
                              value={atividadeFisicaDescricao}
                              onChange={(e) => setAtividadeFisicaDescricao(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="form-group full-width">
                          <label>Observações gerais do prontuário</label>
                          <textarea 
                            rows="4" 
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="tab-footer-actions">
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setActiveSubTab('clinico')}
                        >
                          ← Voltar: Clínico
                        </button>
                        <button 
                          type="button" 
                          className="btn-primary"
                          onClick={handleSavePatient}
                          disabled={savingPatient}
                        >
                          {savingPatient ? 'Salvando...' : '✓ Salvar Alterações'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                SEÇÃO 2: CONSULTAS & EVOLUÇÃO
               ========================================================= */}
            {activeMainTab === 'consultas' && (
              <div className="section-consultas-container animate-fade">
                {/* 1. Gráfico de Evolução de Peso */}
                <div className="dash-card weight-chart-card">
                  <div className="list-card-header">
                    <div className="list-title-box">
                      <div className="stat-icon-wrapper red">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="card-title">Evolução do Peso Corporal</h3>
                        <p className="card-subtitle">Acompanhe a curva de evolução ao longo de cada consulta realizada</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setIsModalConsultaOpen(true)} 
                      className="btn-primary"
                    >
                      + Registrar Consulta
                    </button>
                  </div>

                  <WeightEvolutionChart consultations={consultas} />
                </div>

                {/* 2. Lista de Consultas */}
                <div className="dash-card consultas-history-card">
                  <div className="list-card-header">
                    <div className="list-title-box">
                      <h3 className="card-title">Histórico de Atendimentos</h3>
                      <span className="count-badge">{consultas.length}</span>
                    </div>
                  </div>

                  {consultas.length === 0 ? (
                    <div className="empty-state">
                      <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Nenhuma consulta registrada ainda</p>
                      <span>Clique no botão "Registrar Consulta" acima para adicionar o primeiro atendimento.</span>
                    </div>
                  ) : (
                    <div className="consultas-timeline-list">
                      {consultas.map((c, index) => {
                        // Calcula variação em relação à consulta anterior
                        const prevConsulta = consultas[index + 1];
                        let diffPeso = null;
                        if (c.peso && prevConsulta?.peso) {
                          diffPeso = Number(c.peso) - Number(prevConsulta.peso);
                        }

                        return (
                          <div key={c.id} className="consulta-card-row">
                            <div className="consulta-card-date-badge">
                              <span className="date-number">{formatDate(c.data_consulta)}</span>
                              {index === 0 && <span className="latest-badge">Mais Recente</span>}
                            </div>

                            <div className="consulta-card-metrics-grid">
                              <div className="consulta-metric">
                                <span className="metric-tag">Peso</span>
                                <strong className="metric-val">
                                  {c.peso ? `${c.peso} kg` : '-'}
                                  {diffPeso !== null && (
                                    <span className={`diff-pill ${diffPeso < 0 ? 'loss' : diffPeso > 0 ? 'gain' : 'neutral'}`}>
                                      {diffPeso > 0 ? `+${diffPeso.toFixed(1)}` : diffPeso.toFixed(1)} kg
                                    </span>
                                  )}
                                </strong>
                              </div>

                              {c.cintura && (
                                <div className="consulta-metric">
                                  <span className="metric-tag">Cintura</span>
                                  <strong className="metric-val">{c.cintura} cm</strong>
                                </div>
                              )}

                              {c.quadril && (
                                <div className="consulta-metric">
                                  <span className="metric-tag">Quadril</span>
                                  <strong className="metric-val">{c.quadril} cm</strong>
                                </div>
                              )}

                              {c.percentual_gordura && (
                                <div className="consulta-metric">
                                  <span className="metric-tag">% Gordura</span>
                                  <strong className="metric-val">{c.percentual_gordura}%</strong>
                                </div>
                              )}

                              {c.proximo_retorno && (
                                <div className="consulta-metric">
                                  <span className="metric-tag">Próximo Retorno</span>
                                  <strong className="metric-val return-date">{formatDate(c.proximo_retorno)}</strong>
                                </div>
                              )}
                            </div>

                            {c.observacoes && (
                              <div className="consulta-card-obs">
                                <strong>Observações:</strong>
                                <p>{c.observacoes}</p>
                              </div>
                            )}

                            <div className="consulta-card-actions">
                              <button 
                                type="button" 
                                className="btn-delete-consulta"
                                onClick={() => handleDeleteConsulta(c.id)}
                                title="Excluir consulta"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                <span>Excluir</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                SEÇÃO 3: PLANOS ALIMENTARES
               ========================================================= */}
            {activeMainTab === 'planos' && (
              <div className="section-planos-container animate-fade">
                <div className="dash-card">
                  <div className="list-card-header">
                    <div className="list-title-box">
                      <div className="stat-icon-wrapper orange">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="card-title">Planos Alimentares do Paciente</h3>
                        <p className="card-subtitle">Histórico e prescrição de planos nutricionais personalizados</p>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={() => setShowGerarPlanoModal(true)}
                    >
                      🥗 Gerar Plano Alimentar
                    </button>
                  </div>

                  {planos.length === 0 ? (
                    <div className="empty-state">
                      <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Nenhum plano alimentar gerado ainda</p>
                      <span>Clique em "Gerar Plano Alimentar" para criar uma dieta personalizada para este paciente.</span>
                    </div>
                  ) : (
                    <div className="planos-history-grid">
                      {planos.map((plano) => (
                        <div 
                          key={plano.id} 
                          className={`plano-card-item ${planoSelecionado?.id === plano.id ? 'active' : ''}`}
                          onClick={() => setPlanoSelecionado(plano)}
                        >
                          <div className="plano-card-header">
                            <span className="plano-tag">Plano Nutricional</span>
                            <span className="plano-date">{formatDate(plano.created_at)}</span>
                          </div>
                          <h4 className="plano-title">
                            {plano.conteudo?.titulo || `Plano de ${formatDate(plano.created_at)}`}
                          </h4>
                          <p className="plano-preview-text">
                            {plano.conteudo?.descricao || `${plano.conteudo?.refeicoes?.length || 0} refeições planejadas`}
                          </p>
                          <button type="button" className="btn-view-plano-link">
                            Visualizar conteúdo completo →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modal de visualização detalhada do plano selecionado */}
                  {planoSelecionado && (
                    <div className="plano-viewer-modal-backdrop" onClick={() => setPlanoSelecionado(null)}>
                      <div className="plano-viewer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <div>
                            <h3>{planoSelecionado.conteudo?.titulo || 'Plano Alimentar'}</h3>
                            <span className="modal-subtitle">Criado em {formatDate(planoSelecionado.created_at)}</span>
                          </div>
                          <button type="button" className="btn-close-modal" onClick={() => setPlanoSelecionado(null)}>✕</button>
                        </div>
                        <div className="modal-body plano-detail-content">
                          {typeof planoSelecionado.conteudo === 'object' ? (
                            <pre className="json-formatted-view">
                              {JSON.stringify(planoSelecionado.conteudo, null, 2)}
                            </pre>
                          ) : (
                            <p>{String(planoSelecionado.conteudo)}</p>
                          )}
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn-secondary" onClick={() => setPlanoSelecionado(null)}>Fechar</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            MODAL: NOVA CONSULTA
           ========================================================= */}
        {isModalConsultaOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalConsultaOpen(false)}>
            <div className="modal-card animate-fade" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Registrar Nova Consulta</h3>
                  <p className="modal-subtitle">Paciente: <strong>{nome}</strong></p>
                </div>
                <button 
                  type="button" 
                  className="btn-close-modal"
                  onClick={() => setIsModalConsultaOpen(false)}
                >
                  ✕
                </button>
              </div>

              {consultaError && <div className="error-banner" style={{ margin: '1rem 1.5rem 0' }}>{consultaError}</div>}

              <form onSubmit={handleSaveConsulta} className="modal-form">
                <div className="modal-body">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Data da Consulta <span className="required-star">*</span></label>
                      <input 
                        type="date" 
                        value={novaConsultaData}
                        onChange={(e) => setNovaConsultaData(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Peso Atual (kg) <span className="required-star">*</span></label>
                      <div className="input-affix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 73.2"
                          value={novaConsultaPeso}
                          onChange={(e) => setNovaConsultaPeso(e.target.value)}
                          required
                        />
                        <span className="input-suffix">kg</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Cintura (cm) <small>(opcional)</small></label>
                      <div className="input-affix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 82.0"
                          value={novaConsultaCintura}
                          onChange={(e) => setNovaConsultaCintura(e.target.value)}
                        />
                        <span className="input-suffix">cm</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Quadril (cm) <small>(opcional)</small></label>
                      <div className="input-affix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 98.5"
                          value={novaConsultaQuadril}
                          onChange={(e) => setNovaConsultaQuadril(e.target.value)}
                        />
                        <span className="input-suffix">cm</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>% de Gordura <small>(opcional)</small></label>
                      <div className="input-affix-wrapper">
                        <input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 22.4"
                          value={novaConsultaGordura}
                          onChange={(e) => setNovaConsultaGordura(e.target.value)}
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Próximo Retorno</label>
                      <input 
                        type="date" 
                        value={novaConsultaRetorno}
                        onChange={(e) => setNovaConsultaRetorno(e.target.value)}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Observações da Consulta</label>
                      <textarea 
                        rows="3" 
                        placeholder="Relatos do paciente sobre adesão à dieta, sintomas, rotina ou mudanças no treino..."
                        value={novaConsultaObservacoes}
                        onChange={(e) => setNovaConsultaObservacoes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsModalConsultaOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={savingConsulta}
                  >
                    {savingConsulta ? 'Salvando...' : 'Salvar Consulta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Info Gerar Plano */}
        {showGerarPlanoModal && (
          <div className="modal-backdrop" onClick={() => setShowGerarPlanoModal(false)}>
            <div className="modal-card animate-fade" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">Gerador de Planos Alimentares</h3>
                  <p className="modal-subtitle">Módulo inteligente de prescrição nutricional</p>
                </div>
                <button type="button" className="btn-close-modal" onClick={() => setShowGerarPlanoModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem 1.75rem', lineHeight: '1.6' }}>
                <p>O módulo de geração e inteligência de planos alimentares será conectado no próximo passo (Prompt 6).</p>
                <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                  Os dados do paciente (calorias, restrições, alergias e metas) já estão todos prontos e estruturados no prontuário para a criação do plano!
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-primary" onClick={() => setShowGerarPlanoModal(false)}>Entendido</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
