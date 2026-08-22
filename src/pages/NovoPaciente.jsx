import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { sql } from '../lib/db';
import ImageUpload from '../components/ImageUpload';

export default function NovoPaciente() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pessoal'); // 'pessoal' | 'clinico' | 'habitos'
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Aba 1 - Pessoal
  const [nome, setNome] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [dataInicioTratamento, setDataInicioTratamento] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
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
      if (num >= 0 && num <= 23) {
        return `${clean}:00`;
      }
      return `${clean[0]}:0${clean[1]}`;
    }
    if (clean.length === 3) {
      return `0${clean[0]}:${clean.slice(1)}`;
    }
    if (clean.length >= 4) {
      return `${clean.slice(0, 2)}:${clean.slice(2, 4)}`;
    }
    return raw;
  };

  // Handlers para seleção de múltiplos chips
  const toggleChipSelection = (item, currentList, setList) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(i => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  // Manipulação de Patologias com suporte a "Nenhum"
  const togglePatologia = (item) => {
    if (item === 'Nenhum') {
      if (patologiasSelecionadas.includes('Nenhum')) {
        setPatologiasSelecionadas([]);
      } else {
        setPatologiasSelecionadas(['Nenhum']);
        setPatologiaLivre('');
      }
      return;
    }

    const novaLista = patologiasSelecionadas.filter(p => p !== 'Nenhum');
    if (novaLista.includes(item)) {
      setPatologiasSelecionadas(novaLista.filter(p => p !== item));
    } else {
      setPatologiasSelecionadas([...novaLista, item]);
    }
  };

  // Manipulação de Restrições com suporte a "Nenhuma"
  const toggleRestricao = (item) => {
    if (item === 'Nenhum') {
      if (restricoesSelecionadas.includes('Nenhum')) {
        setRestricoesSelecionadas([]);
      } else {
        setRestricoesSelecionadas(['Nenhum']);
        setRestricaoLivre('');
      }
      return;
    }

    const novaLista = restricoesSelecionadas.filter(r => r !== 'Nenhum');
    if (novaLista.includes(item)) {
      setRestricoesSelecionadas(novaLista.filter(r => r !== item));
    } else {
      setRestricoesSelecionadas([...novaLista, item]);
    }
  };

  // Manipulação de Alergias com suporte a "Nenhuma"
  const toggleAlergia = (item) => {
    if (item === 'Nenhum') {
      if (alergiasSelecionadas.includes('Nenhum')) {
        setAlergiasSelecionadas([]);
      } else {
        setAlergiasSelecionadas(['Nenhum']);
        setAlergiaLivre('');
      }
      return;
    }

    const novaLista = alergiasSelecionadas.filter(a => a !== 'Nenhum');
    if (novaLista.includes(item)) {
      setAlergiasSelecionadas(novaLista.filter(a => a !== item));
    } else {
      setAlergiasSelecionadas([...novaLista, item]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
          foto_url,
          data_inicio_tratamento,
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
          ${fotoUrl || null},
          ${dataInicioTratamento || null},
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

        // Se informou a data de início do tratamento ou peso inicial, registra a 1ª consulta automaticamente
        if (dataInicioTratamento) {
          try {
            await sql`
              INSERT INTO public.consultas (
                paciente_id,
                data_consulta,
                peso,
                observacoes
              ) VALUES (
                ${newPatient.id},
                ${dataInicioTratamento},
                ${pesoAtual ? parseFloat(pesoAtual) : null},
                'Primeira consulta (início do tratamento)'
              )
            `;
          } catch (cErr) {
            console.warn('Aviso: Não foi possível registrar a 1ª consulta inicial automaticamente:', cErr);
          }
        }

        setSuccessMessage(`Paciente ${newPatient.nome} cadastrado com sucesso! Redirecionando...`);
        setTimeout(() => {
          navigate(`/pacientes/${newPatient.id}`);
        }, 1000);
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
                  <h3>Dados Pessoais & Foto</h3>
                  <p>Informações básicas de identificação, foto e contato do paciente.</p>
                </div>

                <div className="patient-photo-and-personal-grid">
                  {/* Foto do Paciente */}
                  <div className="photo-upload-container">
                    <label className="section-label">Foto do Paciente</label>
                    <ImageUpload 
                      value={fotoUrl} 
                      onChange={setFotoUrl} 
                      name={nome} 
                      size={100}
                    />
                  </div>

                  {/* Campos Pessoais */}
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
                      <label>Data de Início do Tratamento (1ª Consulta)</label>
                      <input 
                        type="date" 
                        value={dataInicioTratamento}
                        onChange={(e) => setDataInicioTratamento(e.target.value)}
                      />
                      <span className="helper-badge">Registrada como primeira consulta</span>
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

                    <div className="form-group full-width">
                      <label>Email</label>
                      <input 
                        type="email" 
                        placeholder="paciente@exemplo.com"
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
                  <h3>Dados Clínicos & Antropométricos</h3>
                  <p>Métricas corporais, objetivos e histórico de saúde.</p>
                </div>

                {/* Métricas e IMC */}
                <div className="metrics-row-card">
                  <div className="form-group">
                    <label>Peso atual (kg)</label>
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
                    <label>Altura (cm)</label>
                    <div className="input-affix-wrapper">
                      <input 
                        type="number" 
                        step="1" 
                        placeholder="Ex: 168"
                        value={alturaCm}
                        onChange={(e) => setAlturaCm(e.target.value)}
                      />
                      <span className="input-suffix">cm</span>
                    </div>
                  </div>

                  <div className="imc-display-box">
                    <label>IMC Calculado</label>
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
                      const selected = objetivosSelecionados.includes(obj);
                      return (
                        <button
                          key={obj}
                          type="button"
                          className={`chip-btn ${selected ? 'selected' : ''}`}
                          onClick={() => toggleChipSelection(obj, objetivosSelecionados, setObjetivosSelecionados)}
                        >
                          {selected && '✓ '}
                          {obj}
                        </button>
                      );
                    })}
                  </div>
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label>Detalhes do objetivo / meta do paciente</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Deseja perder 5kg até o final do ano para correr uma prova de 10km"
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
                          name="nivelAtividade" 
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
                      className={`chip-btn ${patologiasSelecionadas.includes('Nenhum') ? 'selected-none' : ''}`}
                      onClick={() => togglePatologia('Nenhum')}
                    >
                      {patologiasSelecionadas.includes('Nenhum') && '✓ '}
                      Nenhuma
                    </button>
                    {OPCOES_PATOLOGIAS.map((pat) => {
                      const selected = patologiasSelecionadas.includes(pat);
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
                      placeholder="Outra patologia não listada (opcional)"
                      value={patologiaLivre}
                      onChange={(e) => setPatologiaLivre(e.target.value)}
                      disabled={patologiasSelecionadas.includes('Nenhum')}
                    />
                  </div>
                </div>

                {/* Restrições Alimentares */}
                <div className="form-group-section">
                  <label className="section-label">Restrições alimentares / Intolerâncias</label>
                  <div className="chip-selector-grid">
                    <button
                      type="button"
                      className={`chip-btn ${restricoesSelecionadas.includes('Nenhum') ? 'selected-none' : ''}`}
                      onClick={() => toggleRestricao('Nenhum')}
                    >
                      {restricoesSelecionadas.includes('Nenhum') && '✓ '}
                      Nenhuma
                    </button>
                    {OPCOES_RESTRICOES.map((rest) => {
                      const selected = restricoesSelecionadas.includes(rest);
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
                      placeholder="Outra restrição alimentar (opcional)"
                      value={restricaoLivre}
                      onChange={(e) => setRestricaoLivre(e.target.value)}
                      disabled={restricoesSelecionadas.includes('Nenhum')}
                    />
                  </div>
                </div>

                {/* Alergias */}
                <div className="form-group-section">
                  <label className="section-label">Alergias diagnosticadas</label>
                  <div className="chip-selector-grid">
                    <button
                      type="button"
                      className={`chip-btn ${alergiasSelecionadas.includes('Nenhum') ? 'selected-none' : ''}`}
                      onClick={() => toggleAlergia('Nenhum')}
                    >
                      {alergiasSelecionadas.includes('Nenhum') && '✓ '}
                      Nenhuma
                    </button>
                    {OPCOES_ALERGIAS.map((alerg) => {
                      const selected = alergiasSelecionadas.includes(alerg);
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
                      placeholder="Outra alergia (opcional)"
                      value={alergiaLivre}
                      onChange={(e) => setAlergiaLivre(e.target.value)}
                      disabled={alergiasSelecionadas.includes('Nenhum')}
                    />
                  </div>
                </div>

                {/* Medicamentos e Suplementos */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Medicamentos contínuos</label>
                    <textarea 
                      rows="3" 
                      placeholder="Ex: Metformina 500mg (1x ao dia), Losartana..."
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Suplementos atuais</label>
                    <textarea 
                      rows="3" 
                      placeholder="Ex: Creatina 5g/dia, Whey Protein pós-treino, Vitamina D..."
                      value={suplementos}
                      onChange={(e) => setSuplementos(e.target.value)}
                    />
                  </div>
                </div>

                <div className="tab-footer-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setActiveTab('pessoal')}
                  >
                    ← Voltar: Pessoal
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
                  <h3>Hábitos & Rotina de Vida</h3>
                  <p>Informações sobre rotina, sono, hidratação e atividade física.</p>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Número de refeições por dia</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      placeholder="Ex: 4"
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
                        placeholder="Ex: 2.5"
                        value={litrosAgua}
                        onChange={(e) => setLitrosAgua(e.target.value)}
                      />
                      <span className="input-suffix">Litros</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Horário em que costuma acordar</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 06:30 ou 6"
                      value={horarioAcordaRaw}
                      onChange={(e) => setHorarioAcordaRaw(e.target.value)}
                    />
                    {horarioAcordaRaw && (
                      <span className="helper-badge">Será salvo como: {formatTime(horarioAcordaRaw)}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Horário em que costuma dormir</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 23:00 ou 23"
                      value={horarioDormeRaw}
                      onChange={(e) => setHorarioDormeRaw(e.target.value)}
                    />
                    {horarioDormeRaw && (
                      <span className="helper-badge">Será salvo como: {formatTime(horarioDormeRaw)}</span>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label className="section-label">Pratica atividade física?</label>
                    <div className="radio-pills-row">
                      <label className={`radio-pill ${praticaAtividadeFisica === true ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="praticaAtividade" 
                          checked={praticaAtividadeFisica === true}
                          onChange={() => setPraticaAtividadeFisica(true)}
                        />
                        <span>Sim</span>
                      </label>
                      <label className={`radio-pill ${praticaAtividadeFisica === false ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="praticaAtividade" 
                          checked={praticaAtividadeFisica === false}
                          onChange={() => setPraticaAtividadeFisica(false)}
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  </div>

                  {praticaAtividadeFisica === true && (
                    <div className="form-group full-width animate-fade">
                      <label>Quais atividades, frequência e intensidade?</label>
                      <textarea 
                        rows="3" 
                        placeholder="Ex: Musculação 4x na semana (1 hora) e corrida no fim de semana..."
                        value={atividadeFisicaDescricao}
                        onChange={(e) => setAtividadeFisicaDescricao(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="form-group full-width">
                    <label>Observações gerais e anotações do nutricionista</label>
                    <textarea 
                      rows="4" 
                      placeholder="Anotações adicionais, histórico familiar, preferências ou comportamento alimentar..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="tab-footer-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setActiveTab('clinico')}
                  >
                    ← Voltar: Clínico
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? 'Salvando Paciente...' : '✓ Concluir Cadastro'}
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
