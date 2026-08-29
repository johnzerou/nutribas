import React, { useState, useEffect, useRef } from 'react';
import { sql } from '../lib/db';
import { 
  SparklesIcon, 
  CoffeeIcon, 
  AppleIcon, 
  SaladIcon, 
  SandwichIcon, 
  SoupIcon, 
  TargetIcon, 
  AlertTriangleIcon, 
  ShieldAlertIcon, 
  RefreshCwIcon, 
  EditIcon, 
  CheckIcon, 
  PlusIcon,
  CalculatorIcon,
  FlameIcon
} from './Icons';

const DIAS_SEMANA_DEFAULT = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

const REFEICOES_KEYS = [
  { key: 'cafe_da_manha', label: 'Café da Manhã', Icon: CoffeeIcon, horario: '07:30' },
  { key: 'lanche_manha', label: 'Lanche da Manhã', Icon: AppleIcon, horario: '10:00' },
  { key: 'almoco', label: 'Almoço', Icon: SaladIcon, horario: '12:30' },
  { key: 'lanche_tarde', label: 'Lanche da Tarde', Icon: SandwichIcon, horario: '16:00' },
  { key: 'jantar', label: 'Jantar', Icon: SoupIcon, horario: '19:30' }
];

const LOADING_MESSAGES = [
  'Lendo perfil e objetivos biométricos do paciente...',
  'Analisando restrições e alergias alimentares cadastradas...',
  'Consultando Inteligência Artificial com parâmetros clínicos...',
  'Gerando opções diversificadas para os 7 dias da semana...',
  'Estruturando cardápio semanal completo...'
];

function gerarPlanoVazio() {
  return DIAS_SEMANA_DEFAULT.map(dia => ({
    dia,
    refeicoes: {
      cafe_da_manha: ['', '', '', '', ''],
      lanche_manha: ['', '', '', '', ''],
      almoco: ['', '', '', '', ''],
      lanche_tarde: ['', '', '', '', ''],
      jantar: ['', '', '', '', '']
    }
  }));
}

export default function GeradorPlanoAlimentar({ paciente, onPlanoSalvo, onCancelar }) {
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [errorToast, setErrorToast] = useState(null);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState(0);
  const [planoSemanal, setPlanoSemanal] = useState(null);
  const [tituloPlano, setTituloPlano] = useState('');
  const [observacoesPlano, setObservacoesPlano] = useState('');
  const [savingPlano, setSavingPlano] = useState(false);
  const [sucessoSalvar, setSucessoSalvar] = useState(false);

  const loadingIntervalRef = useRef(null);

  useEffect(() => {
    if (paciente?.nome) {
      const hoje = new Date().toLocaleDateString('pt-BR');
      const objetivo = (paciente.objetivos && paciente.objetivos[0]) || 'Nutrição Personalizada';
      setTituloPlano(`Plano Alimentar - ${objetivo} (${hoje})`);
      setObservacoesPlano(
        `Meta hídrica: ${paciente.litros_agua ? `${paciente.litros_agua}L/dia` : '2 a 3 litros/dia'}. ` +
        `Priorizar alimentos in natura, mastigação calma e hidratação regular.`
      );
    }
  }, [paciente]);

  useEffect(() => {
    if (loadingAI) {
      setLoadingMessageIndex(0);
      loadingIntervalRef.current = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2400);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [loadingAI]);

  const handleGerarPlanoIA = async () => {
    try {
      setLoadingAI(true);
      setErrorToast(null);
      setShowRetryModal(false);

      const payload = {
        paciente: {
          id: paciente.id,
          nome: paciente.nome,
          sexo: paciente.sexo,
          data_nascimento: paciente.data_nascimento,
          idade: paciente.idade || undefined,
          peso: paciente.peso || paciente.peso_inicial,
          peso_inicial: paciente.peso_inicial,
          altura: paciente.altura,
          imc: paciente.imc,
          objetivos: paciente.objetivos,
          objetivo_texto: paciente.objetivo_texto,
          nivel_atividade: paciente.nivel_atividade,
          atividade_fisica: paciente.atividade_fisica,
          atividade_fisica_descricao: paciente.atividade_fisica_descricao,
          patologias: paciente.patologias,
          restricoes_alimentares: paciente.restricoes_alimentares || paciente.restricoes,
          alergias: paciente.alergias,
          medicamentos: paciente.medicamentos,
          suplementos: paciente.suplementos,
          refeicoes_por_dia: paciente.refeicoes_por_dia,
          horario_acorda: paciente.horario_acorda,
          horario_dorme: paciente.horario_dorme,
          litros_agua: paciente.litros_agua,
          observacoes: paciente.observacoes
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 65000);

      const res = await fetch('/api/gerar-plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errData = {};
        try {
          errData = await res.json();
        } catch {
          // json parse error
        }
        throw new Error(errData.error || `Erro HTTP ${res.status} ao conectar com a IA`);
      }

      const data = await res.json();

      if (!data.success || !data.dados?.plano_semanal) {
        throw new Error(data.error || 'A IA não retornou um formato semanal reconhecido.');
      }

      const planoNormalizado = data.dados.plano_semanal.map((diaObj, idx) => {
        const diaNome = diaObj.dia || DIAS_SEMANA_DEFAULT[idx] || `Dia ${idx + 1}`;
        const refObj = diaObj.refeicoes || {};

        const refeicoesNormalizadas = {};
        REFEICOES_KEYS.forEach(({ key }) => {
          let listaOpcoes = Array.isArray(refObj[key]) ? [...refObj[key]] : [];
          while (listaOpcoes.length < 5) {
            listaOpcoes.push('');
          }
          refeicoesNormalizadas[key] = listaOpcoes;
        });

        return {
          dia: diaNome,
          refeicoes: refeicoesNormalizadas
        };
      });

      setPlanoSemanal(planoNormalizado);
      setActiveDayTab(0);

    } catch (err) {
      console.error('Erro na geração com IA:', err);
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout 
        ? 'A requisição demorou mais que o esperado (Timeout).' 
        : (err.message || 'Erro inesperado ao gerar com IA.');
      
      setErrorToast(`Não foi possível gerar o plano com IA no momento: ${msg}`);
      setShowRetryModal(true);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCriarPlanoManual = () => {
    setPlanoSemanal(gerarPlanoVazio());
    setShowRetryModal(false);
    setErrorToast(null);
    setActiveDayTab(0);
  };

  const handleOpcaoChange = (diaIdx, refeicaoKey, opcaoIdx, novoValor) => {
    setPlanoSemanal(prevPlano => {
      if (!prevPlano) return prevPlano;
      const novo = [...prevPlano];
      const dia = { ...novo[diaIdx] };
      const refeicoes = { ...dia.refeicoes };
      const opcoes = [...(refeicoes[refeicaoKey] || [])];
      opcoes[opcaoIdx] = novoValor;
      refeicoes[refeicaoKey] = opcoes;
      dia.refeicoes = refeicoes;
      novo[diaIdx] = dia;
      return novo;
    });
  };

  const handleSalvarPlano = async () => {
    if (!planoSemanal || planoSemanal.length === 0) {
      alert('Gere ou preencha um plano antes de salvar.');
      return;
    }

    try {
      setSavingPlano(true);
      setErrorToast(null);

      const conteudoJson = {
        titulo: tituloPlano.trim() || 'Plano Alimentar Semanal',
        observacoes: observacoesPlano.trim(),
        criado_com_ia: !showRetryModal,
        data_geracao: new Date().toISOString(),
        paciente_info: {
          nome: paciente.nome,
          objetivos: paciente.objetivos,
          restricoes: paciente.restricoes_alimentares || paciente.restricoes,
          alergias: paciente.alergias
        },
        plano_semanal: planoSemanal
      };

      await sql`
        INSERT INTO public.planos_alimentares (
          paciente_id,
          conteudo
        ) VALUES (
          ${paciente.id},
          ${conteudoJson}
        )
      `;

      setSucessoSalvar(true);
      setTimeout(() => {
        if (onPlanoSalvo) onPlanoSalvo();
      }, 1200);

    } catch (err) {
      console.error('Erro ao salvar plano alimentar no Neon:', err);
      setErrorToast('Erro ao salvar o plano no banco de dados. Tente novamente.');
    } finally {
      setSavingPlano(false);
    }
  };

  const diaAtual = planoSemanal ? planoSemanal[activeDayTab] : null;

  return (
    <div className="gerador-plano-container animate-fade">
      {/* Toast de Erro com opções de ação */}
      {errorToast && (
        <div className="plano-toast-error animate-fade">
          <div className="toast-content">
            <AlertTriangleIcon size={20} className="text-warning" />
            <div className="toast-text">
              <strong>Atenção:</strong> {errorToast}
            </div>
          </div>
          <div className="toast-actions">
            <button 
              type="button" 
              className="btn-toast-retry" 
              onClick={handleGerarPlanoIA}
              disabled={loadingAI}
            >
              <RefreshCwIcon size={14} />
              <span>Tentar Novamente</span>
            </button>
            <button 
              type="button" 
              className="btn-toast-manual" 
              onClick={handleCriarPlanoManual}
            >
              <EditIcon size={14} />
              <span>Criar Manualmente</span>
            </button>
            <button 
              type="button" 
              className="btn-toast-close" 
              onClick={() => setErrorToast(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Banner de Sucesso ao Salvar */}
      {sucessoSalvar && (
        <div className="success-banner animate-fade" style={{ marginBottom: '1.5rem' }}>
          <CheckIcon size={18} />
          <span>Plano alimentar salvo com sucesso no prontuário do paciente! Atualizando histórico...</span>
        </div>
      )}

      {/* Cabeçalho do Gerador */}
      <div className="gerador-header-card">
        <div className="gerador-header-info">
          <div className="ai-badge-header">
            <SparklesIcon size={14} className="text-sparkle" />
            <span className="ai-badge-text">Inteligência Artificial Clínica Nutribas</span>
          </div>
          <h2 className="gerador-title">Prescrição Nutricional Semanal</h2>
          <p className="gerador-subtitle">
            Gera cardápio personalizado para <strong>{paciente?.nome}</strong> respeitando metas, patologias e preferências.
          </p>

          {/* Resumo clínico rápido */}
          <div className="patient-quick-tags">
            {paciente?.objetivos?.map((obj, i) => (
              <span key={i} className="quick-tag goal">
                <TargetIcon size={13} />
                <span>{obj}</span>
              </span>
            ))}
            {paciente?.alergias?.filter(a => a !== 'Nenhum').map((alerg, i) => (
              <span key={i} className="quick-tag allergy">
                <ShieldAlertIcon size={13} />
                <span>Alergia: {alerg}</span>
              </span>
            ))}
            {paciente?.restricoes_alimentares?.filter(r => r !== 'Nenhum').map((rest, i) => (
              <span key={i} className="quick-tag restriction">
                <AlertTriangleIcon size={13} />
                <span>Restrição: {rest}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="gerador-action-buttons">
          {!planoSemanal ? (
            <div className="initial-cta-box">
              <button
                type="button"
                className="btn-ai-generate pulse-glow"
                onClick={handleGerarPlanoIA}
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <>
                    <span className="ai-mini-spinner"></span>
                    <span>Gerando com IA...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon size={18} />
                    <span>Gerar Plano com IA</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary btn-manual-plan"
                onClick={handleCriarPlanoManual}
                disabled={loadingAI}
              >
                <EditIcon size={16} />
                <span>Criar Manualmente</span>
              </button>
              {onCancelar && (
                <button
                  type="button"
                  className="btn-text-cancel"
                  onClick={onCancelar}
                  disabled={loadingAI}
                >
                  Cancelar
                </button>
              )}
            </div>
          ) : (
            <div className="editor-controls-box">
              <button
                type="button"
                className="btn-ai-regenerate"
                onClick={handleGerarPlanoIA}
                disabled={loadingAI || savingPlano}
                title="Regerar novo cardápio com IA"
              >
                {loadingAI ? (
                  <>
                    <RefreshCwIcon size={15} className="spin-icon" />
                    <span>Regerando...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon size={15} />
                    <span>Regerar com IA</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-primary btn-save-plan"
                onClick={handleSalvarPlano}
                disabled={savingPlano || loadingAI}
              >
                {savingPlano ? (
                  <>
                    <span className="ai-mini-spinner"></span>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon size={16} />
                    <span>Salvar Plano Alimentar</span>
                  </>
                )}
              </button>
              {onCancelar && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onCancelar}
                  disabled={savingPlano}
                >
                  Fechar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading Visual com Mensagens Dinâmicas */}
      {loadingAI && (
        <div className="ai-loading-card animate-fade">
          <div className="ai-loading-animation">
            <div className="sparkle-orbit-1"></div>
            <div className="sparkle-orbit-2"></div>
            <div className="ai-core-icon">
              <SaladIcon size={36} className="text-primary" />
            </div>
          </div>
          <h3 className="ai-loading-title">A Inteligência Artificial está preparando a dieta...</h3>
          <p className="ai-loading-message animate-fade-text" key={loadingMessageIndex}>
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
          <div className="ai-progress-bar">
            <div className="ai-progress-indicator"></div>
          </div>
        </div>
      )}

      {/* Modal / Diálogo de Fallback quando a IA falhar */}
      {showRetryModal && !loadingAI && (
        <div className="modal-backdrop" onClick={() => setShowRetryModal(false)}>
          <div className="modal-card animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Assistente de Prescrição Nutricional</h3>
                <p className="modal-subtitle">Opções de cardápio semanal</p>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setShowRetryModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', lineHeight: '1.6' }}>
              <p>Não foi possível obter a resposta da IA no momento.</p>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                Você pode tentar gerar novamente ou abrir a estrutura de 7 dias para prescrever o plano alimentar manualmente.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={handleCriarPlanoManual}>
                <EditIcon size={16} /> Criar Manualmente
              </button>
              <button type="button" className="btn-primary" onClick={handleGerarPlanoIA}>
                <RefreshCwIcon size={16} /> Tentar Novamente com IA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          INTERFACE DE EDIÇÃO EM ABAS (DIAS DA SEMANA & 5 REFEIÇÕES)
          ======================================================= */}
      {planoSemanal && !loadingAI && (
        <div className="plano-editor-wrapper animate-fade">
          {/* Metadados do Plano (Título e Observações) */}
          <div className="plano-meta-card">
            <div className="form-grid-2">
              <div className="form-group full-width">
                <label className="field-label">Título do Plano Alimentar <span className="required-star">*</span></label>
                <input
                  type="text"
                  className="input-plano-title"
                  placeholder="Ex: Plano Alimentar - Hipertrofia e Performance"
                  value={tituloPlano}
                  onChange={(e) => setTituloPlano(e.target.value)}
                />
              </div>
              <div className="form-group full-width">
                <label className="field-label">Orientações Gerais & Recomendações</label>
                <textarea
                  rows="2"
                  className="input-plano-obs"
                  placeholder="Ex: Ingerir 3L de água por dia. Intervalos de 3 horas entre as refeições..."
                  value={observacoesPlano}
                  onChange={(e) => setObservacoesPlano(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Abas dos Dias da Semana */}
          <div className="dias-tabs-container">
            <div className="dias-tabs-header" role="tablist">
              {planoSemanal.map((diaItem, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={activeDayTab === idx}
                  className={`dia-tab-btn ${activeDayTab === idx ? 'active' : ''}`}
                  onClick={() => setActiveDayTab(idx)}
                >
                  <span className="dia-tab-badge">{idx + 1}</span>
                  <span className="dia-tab-label">{diaItem.dia}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Refeições do Dia Ativo */}
          {diaAtual && (
            <div className="dia-refeicoes-container animate-fade" key={activeDayTab}>
              <div className="dia-refeicoes-header">
                <h3 className="dia-heading">Cardápio de {diaAtual.dia}</h3>
                <span className="dia-counter-badge">5 Refeições • 5 Opções Editáveis cada</span>
              </div>

              <div className="refeicoes-grid">
                {REFEICOES_KEYS.map(({ key, label, Icon, horario }) => {
                  const opcoes = diaAtual.refeicoes[key] || ['', '', '', '', ''];

                  return (
                    <div key={key} className="refeicao-card">
                      <div className="refeicao-header">
                        <div className="refeicao-title-box">
                          <div className="refeicao-icon-wrapper">
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className="refeicao-title">{label}</h4>
                            <span className="refeicao-horario">Sugerido: ~{horario}</span>
                          </div>
                        </div>
                        <span className="refeicao-count-tag">{opcoes.filter(o => o.trim()).length}/5 preenchidas</span>
                      </div>

                      <div className="refeicao-options-list">
                        {opcoes.map((opcaoTexto, opIdx) => (
                          <div key={opIdx} className="opcao-input-row">
                            <span className="opcao-number-pill">Opção {opIdx + 1}</span>
                            <input
                              type="text"
                              className="opcao-text-input"
                              placeholder={`Ex: Opção ${opIdx + 1} para ${label.toLowerCase()}...`}
                              value={opcaoTexto}
                              onChange={(e) => handleOpcaoChange(activeDayTab, key, opIdx, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botão de Salvar Rodapé */}
          <div className="plano-bottom-bar">
            <div className="bottom-bar-info">
              <span>Você pode editar qualquer opção diretamente antes de salvar no prontuário.</span>
            </div>
            <div className="bottom-bar-actions">
              {onCancelar && (
                <button type="button" className="btn-secondary" onClick={onCancelar} disabled={savingPlano}>
                  Cancelar
                </button>
              )}
              <button
                type="button"
                className="btn-primary btn-save-large"
                onClick={handleSalvarPlano}
                disabled={savingPlano}
              >
                {savingPlano ? (
                  <>
                    <span className="ai-mini-spinner"></span>
                    <span>Salvando no Prontuário...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon size={18} />
                    <span>Salvar Plano Alimentar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
