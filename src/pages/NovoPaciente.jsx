import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { sql } from '../lib/db';

export default function NovoPaciente() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pessoal'); // 'pessoal' | 'clinico' | 'habitos'
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Aba 1 - Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Aba 2 - Clínico
  const [pesoAtual, setPesoAtual] = useState('');
  const [alturaCm, setAlturaCm] = useState('');
  const [objetivosSelecionados, setObjetivosSelecionados] = useState([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  
  const [patologiasSelecionadas, setPatologiasSelecionadas] = useState([]);
  const [patologiaLivre, setPatologiaLivre] = useState('');
  
  const [restricoesSelecionadas, setRestricoesSelecionadas] = useState([]);
  const [restricaoLivre, setRestricaoLivre] = useState('');
  
  const [alergiasSelecionadas, setAlergiasSelecionadas] = useState([]);
  const [alergiaLivre, setAlergiaLivre] = useState('');
  
  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Aba 3 - Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState('');
  const [horarioAcordaRaw, setHorarioAcordaRaw] = useState('');
  const [horarioDormeRaw, setHorarioDormeRaw] = useState('');
  const [litrosAgua, setLitrosAgua] = useState('');
  const [praticaAtividadeFisica, setPraticaAtividadeFisica] = useState(null); // true | false | null
  const [atividadeFisicaDescricao, setAtividadeFisicaDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

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

  // Cálculo automático de idade
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

  // Cálculo automático de IMC: Peso / ((Altura/100) ^ 2)
  const imcCalculado = useMemo(() => {
    const p = parseFloat(pesoAtual);
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
  }, [pesoAtual, alturaCm]);

  // Formatação de WhatsApp: (XX) XXXXX-XXXX
  const formatPhone = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handleWhatsappChange = (e) => {
    setWhatsapp(formatPhone(e.target.value));
  };

  // Conversão de horário: ex: 6 -> 06:00, 630 -> 06:30, 23 -> 23:00, 2230 -> 22:30
  const formatTime = (raw) => {
    if (!raw) return '';
    const clean = raw.toString().replace(/\D/g, '');
    if (!clean) return '';
    if (clean.length === 1) {
      return `0${clean}:00`;
    }
    if (clean.length === 2) {
      const num = parseInt(clean, 10);
      if (num <= 23) {
        return `${clean.padStart(2, '0')}:00`;
      }
      return `${clean[0]}:0${clean[1]}`;
    }
    if (clean.length === 3) {
      const h = `0${clean[0]}`;
      const m = clean.slice(1, 3);
      return `${h}:${m}`;
    }
    if (clean.length >= 4) {
      const h = clean.slice(0, 2);
      const m = clean.slice(2, 4);
      return `${h}:${m}`;
    }
    return raw;
  };

  // Helper para múltipla escolha com suporte a "Nenhum"
  const toggleMultiSelect = (item, currentList, setList) => {
    if (item === 'Nenhum') {
      if (currentList.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    const withoutNenhum = currentList.filter(i => i !== 'Nenhum');
    if (withoutNenhum.includes(item)) {
      setList(withoutNenhum.filter(i => i !== item));
    } else {
      setList([...withoutNenhum, item]);
    }
  };

  // Toggle simples de lista
  const toggleItem = (item, currentList, setList) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!nome.trim()) {
      setActiveTab('pessoal');
      setErrorMessage('O campo Nome completo é obrigatório.');
      return;
    }

    try {
      setSaving(true);

      // Tratamento de Patologias
      let finalPatologias = [...patologiasSelecionadas];
      if (patologiaLivre.trim()) {
        finalPatologias.push(patologiaLivre.trim());
      }
      finalPatologias = finalPatologias.filter(p => p !== 'Nenhum');

      // Tratamento de Restrições
      let finalRestricoes = [...restricoesSelecionadas];
      if (restricaoLivre.trim()) {
        finalRestricoes.push(restricaoLivre.trim());
      }
      finalRestricoes = finalRestricoes.filter(r => r !== 'Nenhum');

      // Tratamento de Alergias
      let finalAlergias = [...alergiasSelecionadas];
      if (alergiaLivre.trim()) {
        finalAlergias.push(alergiaLivre.trim());
      }
      finalAlergias = finalAlergias.filter(a => a !== 'Nenhum');

      // Horários formatados
      const horaAcorda = formatTime(horarioAcordaRaw);
      const horaDorme = formatTime(horarioDormeRaw);

      const result = await sql`
        INSERT INTO public.pacientes (
          nutricionista_id,
          nome,
          data_nascimento,
          sexo,
          whatsapp,
          email,
          peso_inicial,
          altura,
          objetivos,
          objetivo_texto,
          nivel_atividade,
          patologias,
          restricoes_alimentares,
          alergias,
          medicamentos,
          suplementos,
          refeicoes_por_dia,
          horario_acorda,
          horario_dorme,
          litros_agua,
          atividade_fisica,
          atividade_fisica_descricao,
          observacoes
        ) VALUES (
          ${user.id},
          ${nome.trim()},
          ${dataNascimento ? dataNascimento : null},
          ${sexo || null},
          ${whatsapp || null},
          ${email || null},
          ${pesoAtual ? parseFloat(pesoAtual) : null},
          ${alturaCm ? parseFloat(alturaCm) : null},
          ${objetivosSelecionados.length > 0 ? objetivosSelecionados : null},
          ${objetivoTexto.trim() || null},
          ${nivelAtividade || null},
          ${finalPatologias.length > 0 ? finalPatologias : null},
          ${finalRestricoes.length > 0 ? finalRestricoes : null},
          ${finalAlergias.length > 0 ? finalAlergias : null},
          ${medicamentos.trim() || null},
          ${suplementos.trim() || null},
          ${refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null},
          ${horaAcorda || null},
          ${horaDorme || null},
          ${litrosAgua ? parseFloat(litrosAgua) : null},
          ${praticaAtividadeFisica},
          ${praticaAtividadeFisica ? atividadeFisicaDescricao.trim() || null : null},
          ${observacoes.trim() || null}
        )
        RETURNING id, nome
      `;

      if (result && result.length > 0) {
        const newPatient = result[0];
        setSuccessMessage(`Paciente ${newPatient.nome} cadastrado com sucesso! Redirecionando...`);
        setTimeout(() => {
          navigate(`/pacientes/${newPatient.id}`);
        }, 1200);
      } else {
        throw new Error('Falha ao registrar paciente.');
      }
    } catch (err) {
      console.error('Erro ao cadastrar paciente:', err);
      setErrorMessage('Erro ao salvar paciente. Verifique os dados e tente novamente.');
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="new-patient-page">
        <div className="page-header-actions">
          <div>
            <div className="breadcrumb-nav">
              <Link to="/pacientes">Pacientes</Link>
              <span>/</span>
              <span>Novo Paciente</span>
            </div>
            <h1 className="page-title">Novo Paciente</h1>
            <p className="page-subtitle">Preencha as informações pessoais, clínicas e hábitos para cadastrar.</p>
          </div>
          <div className="header-button-group">
            <button 
              type="button" 
              onClick={() => navigate('/pacientes')} 
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={saving} 
              className="btn-primary"
            >
              {saving ? 'Salvando...' : 'Salvar Paciente'}
            </button>
          </div>
        </div>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}
        {successMessage && <div className="success-banner">{successMessage}</div>}

        <div className="form-card-container">
          {/* Navegação por Abas */}
          <div className="form-tabs-header">
            <button 
              type="button"
              className={`tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`}
              onClick={() => setActiveTab('pessoal')}
            >
              <span className="tab-number">1</span>
              <span>Pessoal</span>
            </button>
            <button 
              type="button"
              className={`tab-btn ${activeTab === 'clinico' ? 'active' : ''}`}
              onClick={() => setActiveTab('clinico')}
            >
              <span className="tab-number">2</span>
              <span>Clínico</span>
            </button>
            <button 
              type="button"
              className={`tab-btn ${activeTab === 'habitos' ? 'active' : ''}`}
              onClick={() => setActiveTab('habitos')}
            >
              <span className="tab-number">3</span>
              <span>Hábitos</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="patient-multitab-form">
            {/* ================= ABA 1: PESSOAL ================= */}
            {activeTab === 'pessoal' && (
              <div className="tab-content animate-fade">
                <div className="form-section-title">
                  <h3>Dados Pessoais</h3>
                  <p>Informações básicas de identificação e contato do paciente.</p>
                </div>

                <div className="form-grid-2">
                  <div className="form-group full-width">
                    <label>Nome completo <span className="required-star">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Ex: Maria Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
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
                      placeholder="(99) 99999-9999"
                      value={whatsapp}
                      onChange={handleWhatsappChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      placeholder="paciente@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="tab-footer-actions">
                  <div></div>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => setActiveTab('clinico')}
                  >
                    Próximo: Clínico →
                  </button>
                </div>
              </div>
            )}

            {/* ================= ABA 2: CLÍNICO ================= */}
            {activeTab === 'clinico' && (
              <div className="tab-content animate-fade">
                <div className="form-section-title">
                  <h3>Avaliação Clínica & Antropométrica</h3>
                  <p>Métricas corporais, condições de saúde, restrições e objetivos do tratamento.</p>
                </div>

                {/* Métricas Corporais & IMC */}
                <div className="metrics-row-card">
                  <div className="form-group">
                    <label>Peso atual</label>
                    <div className="input-affix-wrapper">
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="Ex: 72.5"
                        value={pesoAtual}
                        onChange={(e) => setPesoAtual(e.target.value)}
                      />
                      <span className="input-suffix">kg</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Altura</label>
                    <div className="input-affix-wrapper">
                      <input 
                        type="number" 
                        step="1"
                        placeholder="Ex: 170"
                        value={alturaCm}
                        onChange={(e) => setAlturaCm(e.target.value)}
                      />
                      <span className="input-suffix">cm</span>
                    </div>
                  </div>

                  <div className="form-group imc-display-box">
                    <label>IMC (Calculado automaticamente)</label>
                    <div className="imc-result">
                      {imcCalculado ? (
                        <>
                          <span className="imc-value">{imcCalculado.valor} <small>kg/m²</small></span>
                          <span className="imc-class">{imcCalculado.classificacao}</span>
                        </>
                      ) : (
                        <span className="imc-placeholder">Preencha peso e altura</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Objetivos */}
                <div className="form-group-section">
                  <label className="section-label">Objetivo do paciente (Múltipla escolha)</label>
                  <div className="chip-selector-grid">
                    {OPCOES_OBJETIVO.map((obj) => (
                      <button
                        key={obj}
                        type="button"
                        className={`chip-btn ${objetivosSelecionados.includes(obj) ? 'selected' : ''}`}
                        onClick={() => toggleItem(obj, objetivosSelecionados, setObjetivosSelecionados)}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <input 
                      type="text" 
                      placeholder="Outro objetivo ou observação específica sobre a meta..."
                      value={objetivoTexto}
                      onChange={(e) => setObjetivoTexto(e.target.value)}
                    />
                  </div>
                </div>

                {/* Nível de atividade */}
                <div className="form-group-section">
                  <label className="section-label">Nível de atividade física</label>
                  <div className="radio-pills-row">
                    {OPCOES_NIVEL_ATIVIDADE.map((nivel) => (
                      <label key={nivel} className={`radio-pill ${nivelAtividade === nivel ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="nivelAtividade" 
                          value={nivel}
                          checked={nivelAtividade === nivel}
                          onChange={(e) => setNivelAtividade(e.target.value)}
                        />
                        {nivel}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Patologias */}
                <div className="form-group-section">
                  <label className="section-label">Patologias ou condições de saúde</label>
                  <div className="chip-selector-grid">
                    <button
                      type="button"
                      className={`chip-btn ${patologiasSelecionadas.includes('Nenhum') ? 'selected-none' : ''}`}
                      onClick={() => toggleMultiSelect('Nenhum', patologiasSelecionadas, setPatologiasSelecionadas)}
                    >
                      Nenhum
                    </button>
                    {OPCOES_PATOLOGIAS.map((pat) => (
                      <button
                        key={pat}
                        type="button"
                        className={`chip-btn ${patologiasSelecionadas.includes(pat) ? 'selected' : ''}`}
                        onClick={() => toggleMultiSelect(pat, patologiasSelecionadas, setPatologiasSelecionadas)}
                      >
                        {pat}
                      </button>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <input 
                      type="text" 
                      placeholder="Outra patologia ou condição não listada..."
                      value={patologiaLivre}
                      onChange={(e) => setPatologiaLivre(e.target.value)}
                    />
                  </div>
                </div>

                {/* Restrições */}
                <div className="form-group-section">
                  <label className="section-label">Restrições alimentares</label>
                  <div className="chip-selector-grid">
                    <button
                      type="button"
                      className={`chip-btn ${restricoesSelecionadas.includes('Nenhum') ? 'selected-none' : ''}`}
                      onClick={() => toggleMultiSelect('Nenhum', restricoesSelecionadas, setRestricoesSelecionadas)}
                    >
                      Nenhum
                    </button>
                    {OPCOES_RESTRICOES.map((res) => (
                      <button
                        key={res}
                        type="button"
                        className={`chip-btn ${restricoesSelecionadas.includes(res) ? 'selected' : ''}`}
                        onClick={() => toggleMultiSelect(res, restricoesSelecionadas, setRestricoesSelecionadas)}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <input 
                      type="text" 
                      placeholder="Outra restrição alimentar..."
                      value={restricaoLivre}
                      onChange={(e) => setRestricaoLivre(e.target.value)}
                    />
                  </div>
                </div>

                {/* Alergias */}
                <div className="form-group-section">
                  <label className="section-label">Alergias alimentares</label>
                  <div className="chip-selector-grid">
                    <button
                      type="button"
                      className={`chip-btn ${alergiasSelecionadas.includes('Nenhum') ? 'selected-none' : ''}`}
                      onClick={() => toggleMultiSelect('Nenhum', alergiasSelecionadas, setAlergiasSelecionadas)}
                    >
                      Nenhum
                    </button>
                    {OPCOES_ALERGIAS.map((al) => (
                      <button
                        key={al}
                        type="button"
                        className={`chip-btn ${alergiasSelecionadas.includes(al) ? 'selected' : ''}`}
                        onClick={() => toggleMultiSelect(al, alergiasSelecionadas, setAlergiasSelecionadas)}
                      >
                        {al}
                      </button>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <input 
                      type="text" 
                      placeholder="Outra alergia alimentar..."
                      value={alergiaLivre}
                      onChange={(e) => setAlergiaLivre(e.target.value)}
                    />
                  </div>
                </div>

                {/* Medicamentos e Suplementos */}
                <div className="form-grid-2" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Medicamentos contínuos</label>
                    <textarea 
                      rows="3"
                      placeholder="Ex: Losartana 50mg pela manhã, Metformina..."
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Suplementos em uso</label>
                    <textarea 
                      rows="3"
                      placeholder="Ex: Whey protein 30g pós-treino, Creatina 5g, Vitamina D..."
                      value={suplementos}
                      onChange={(e) => setSuplementos(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="tab-footer-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setActiveTab('pessoal')}
                  >
                    ← Voltar para Pessoal
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={() => setActiveTab('habitos')}
                  >
                    Próximo: Hábitos →
                  </button>
                </div>
              </div>
            )}

            {/* ================= ABA 3: HÁBITOS ================= */}
            {activeTab === 'habitos' && (
              <div className="tab-content animate-fade">
                <div className="form-section-title">
                  <h3>Rotina & Hábitos de Vida</h3>
                  <p>Informações sobre rotina de sono, hidratação, refeições e atividade física.</p>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Quantas refeições faz por dia?</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="12"
                      placeholder="Ex: 4"
                      value={refeicoesPorDia}
                      onChange={(e) => setRefeicoesPorDia(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantidade de água por dia</label>
                    <div className="input-affix-wrapper">
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="Ex: 2.5"
                        value={litrosAgua}
                        onChange={(e) => setLitrosAgua(e.target.value)}
                      />
                      <span className="input-suffix">litros</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Horário que acorda</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 6 ou 630 (vira 06:30)"
                      value={horarioAcordaRaw}
                      onChange={(e) => setHorarioAcordaRaw(e.target.value)}
                      onBlur={(e) => setHorarioAcordaRaw(formatTime(e.target.value))}
                    />
                    {horarioAcordaRaw && (
                      <span className="helper-badge">Formato: {formatTime(horarioAcordaRaw)}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Horário que dorme</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 23 ou 2230 (vira 22:30)"
                      value={horarioDormeRaw}
                      onChange={(e) => setHorarioDormeRaw(e.target.value)}
                      onBlur={(e) => setHorarioDormeRaw(formatTime(e.target.value))}
                    />
                    {horarioDormeRaw && (
                      <span className="helper-badge">Formato: {formatTime(horarioDormeRaw)}</span>
                    )}
                  </div>
                </div>

                {/* Prática de atividade física */}
                <div className="form-group-section" style={{ marginTop: '1.25rem' }}>
                  <label className="section-label">Pratica atividade física?</label>
                  <div className="radio-pills-row">
                    <label className={`radio-pill ${praticaAtividadeFisica === true ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="atividadeFisica" 
                        checked={praticaAtividadeFisica === true}
                        onChange={() => setPraticaAtividadeFisica(true)}
                      />
                      Sim
                    </label>
                    <label className={`radio-pill ${praticaAtividadeFisica === false ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="atividadeFisica" 
                        checked={praticaAtividadeFisica === false}
                        onChange={() => setPraticaAtividadeFisica(false)}
                      />
                      Não
                    </label>
                  </div>

                  {praticaAtividadeFisica === true && (
                    <div className="form-group animate-fade" style={{ marginTop: '0.85rem' }}>
                      <label>Qual atividade e frequência semanal?</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Musculação 4x na semana + Corrida aos sábados"
                        value={atividadeFisicaDescricao}
                        onChange={(e) => setAtividadeFisicaDescricao(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Observações gerais */}
                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                  <label>Observações gerais</label>
                  <textarea 
                    rows="4"
                    placeholder="Anotações adicionais, histórico alimentar, preferências, aversões ou comentários do paciente..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  ></textarea>
                </div>

                <div className="tab-footer-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setActiveTab('clinico')}
                  >
                    ← Voltar para Clínico
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="btn-primary"
                  >
                    {saving ? 'Salvando Paciente...' : '✓ Concluir e Salvar Paciente'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
