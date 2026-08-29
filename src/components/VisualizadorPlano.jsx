import React, { useState } from 'react';
import { 
  CoffeeIcon, 
  AppleIcon, 
  SaladIcon, 
  SandwichIcon, 
  SoupIcon, 
  PrinterIcon, 
  CopyIcon, 
  WhatsAppIcon, 
  TrashIcon, 
  CheckIcon, 
  SparklesIcon, 
  EditIcon,
  CalendarIcon,
  FileTextIcon
} from './Icons';

const REFEICOES_KEYS = [
  { key: 'cafe_da_manha', label: 'Café da Manhã', Icon: CoffeeIcon, horario: '07:30' },
  { key: 'lanche_manha', label: 'Lanche da Manhã', Icon: AppleIcon, horario: '10:00' },
  { key: 'almoco', label: 'Almoço', Icon: SaladIcon, horario: '12:30' },
  { key: 'lanche_tarde', label: 'Lanche da Tarde', Icon: SandwichIcon, horario: '16:00' },
  { key: 'jantar', label: 'Jantar', Icon: SoupIcon, horario: '19:30' }
];

export default function VisualizadorPlano({ plano, paciente = {}, onClose, onExcluir }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [viewMode, setViewMode] = useState('diario'); // 'diario' | 'semanal'
  const [copiado, setCopiado] = useState(false);

  if (!plano) return null;

  const conteudo = plano.conteudo || {};
  const planoSemanal = conteudo.plano_semanal || [];
  const diaAtual = planoSemanal[activeDayIdx] || null;

  const dataFormatada = (() => {
    try {
      const d = new Date(plano.created_at || conteudo.data_geracao);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data não disponível';
    }
  })();

  const gerarTextoPlano = () => {
    let texto = `🥑 *PLANO ALIMENTAR NUTRIBAS*\n`;
    texto += `👤 *Paciente:* ${paciente.nome || conteudo.paciente_info?.nome || 'Paciente'}\n`;
    texto += `📋 *Plano:* ${conteudo.titulo || 'Prescrição Semanal'}\n`;
    texto += `📅 *Data:* ${dataFormatada}\n`;
    if (conteudo.observacoes) {
      texto += `\n💡 *Orientações Gerais:*\n${conteudo.observacoes}\n`;
    }

    planoSemanal.forEach((diaItem) => {
      texto += `\n━━━━━━━━━━━━━━━━━━━━\n`;
      texto += `🗓️ *${diaItem.dia.toUpperCase()}*\n`;
      texto += `━━━━━━━━━━━━━━━━━━━━\n`;
      
      REFEICOES_KEYS.forEach(({ key, label }) => {
        const opcoes = diaItem.refeicoes?.[key] || [];
        const validas = opcoes.filter(o => o && o.trim());
        if (validas.length > 0) {
          texto += `\n*${label}:*\n`;
          validas.forEach((op, idx) => {
            texto += `  ${idx + 1}. ${op}\n`;
          });
        }
      });
    });

    texto += `\n✨ _Gerado com carinho pelo seu nutricionista no Nutribas._`;
    return texto;
  };

  const handleCopiarTexto = () => {
    const texto = gerarTextoPlano();
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(gerarTextoPlano());
    const cleanPhone = (paciente.whatsapp || '').replace(/\D/g, '');
    const url = cleanPhone.length >= 10
      ? `https://wa.me/55${cleanPhone}?text=${texto}`
      : `https://api.whatsapp.com/send?text=${texto}`;
    window.open(url, '_blank');
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="plano-viewer-modal-backdrop" onClick={onClose}>
      <div className="plano-viewer-modal animate-fade print-container" onClick={(e) => e.stopPropagation()}>
        {/* Header do Modal */}
        <div className="modal-header">
          <div className="plano-viewer-header-info">
            <div className="plano-tag-badge">
              {conteudo.criado_com_ia ? (
                <>
                  <SparklesIcon size={12} />
                  <span>Gerado com IA</span>
                </>
              ) : (
                <>
                  <EditIcon size={12} />
                  <span>Plano Nutricional</span>
                </>
              )}
            </div>
            <h3 className="modal-title">{conteudo.titulo || 'Plano Alimentar Semanal'}</h3>
            <span className="modal-subtitle">Prescrito em {dataFormatada}</span>
          </div>

          <div className="plano-viewer-header-actions no-print">
            <button
              type="button"
              className="btn-action-icon btn-whatsapp"
              onClick={handleWhatsApp}
              title="Compartilhar plano no WhatsApp"
            >
              <WhatsAppIcon size={15} />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              className="btn-action-icon"
              onClick={handleCopiarTexto}
              title="Copiar texto formatado"
            >
              {copiado ? <><CheckIcon size={15} /> Copiado!</> : <><CopyIcon size={15} /> Copiar</>}
            </button>
            <button
              type="button"
              className="btn-action-icon"
              onClick={handleImprimir}
              title="Imprimir plano ou salvar PDF"
            >
              <PrinterIcon size={15} />
              <span>Imprimir</span>
            </button>
            {onExcluir && (
              <button
                type="button"
                className="btn-action-icon text-danger"
                onClick={() => onExcluir(plano.id)}
                title="Excluir este plano"
              >
                <TrashIcon size={15} />
              </button>
            )}
            <button type="button" className="btn-close-modal" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-body plano-viewer-body">
          {/* Informações Clínicas do Plano */}
          {conteudo.observacoes && (
            <div className="plano-viewer-obs-card">
              <div className="obs-card-header">
                <FileTextIcon size={16} className="text-primary" />
                <strong>Orientações Gerais & Recomendações:</strong>
              </div>
              <p>{conteudo.observacoes}</p>
            </div>
          )}

          {planoSemanal.length === 0 ? (
            <div className="empty-state">
              <p>Estrutura de plano alimentar não encontrada para este registro.</p>
            </div>
          ) : (
            <>
              {/* Controle de Modo de Visualização */}
              <div className="viewer-controls-bar no-print">
                <div className="viewer-mode-switch">
                  <button 
                    type="button" 
                    className={`mode-btn ${viewMode === 'diario' ? 'active' : ''}`}
                    onClick={() => setViewMode('diario')}
                  >
                    Visualização por Dia
                  </button>
                  <button 
                    type="button" 
                    className={`mode-btn ${viewMode === 'semanal' ? 'active' : ''}`}
                    onClick={() => setViewMode('semanal')}
                  >
                    Visão Geral dos 7 Dias
                  </button>
                </div>
              </div>

              {/* Modo Diário com Abas */}
              {viewMode === 'diario' && (
                <>
                  <div className="dias-tabs-header viewer-tabs no-print" role="tablist">
                    {planoSemanal.map((diaItem, idx) => (
                      <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={activeDayIdx === idx}
                        className={`dia-tab-btn ${activeDayIdx === idx ? 'active' : ''}`}
                        onClick={() => setActiveDayIdx(idx)}
                      >
                        <span className="dia-tab-badge">{idx + 1}</span>
                        <span className="dia-tab-label">{diaItem.dia}</span>
                      </button>
                    ))}
                  </div>

                  <div className="viewer-active-day">
                    <div className="viewer-day-header-row">
                      <h4 className="viewer-day-title">{diaAtual.dia}</h4>
                      <span className="viewer-day-meals-count">5 Refeições Planejadas</span>
                    </div>

                    <div className="viewer-meals-grid">
                      {REFEICOES_KEYS.map(({ key, label, Icon, horario }) => {
                        const opcoes = diaAtual.refeicoes?.[key] || [];
                        const validas = opcoes.filter(o => o && o.trim());

                        if (validas.length === 0) return null;

                        return (
                          <div key={key} className="viewer-meal-card">
                            <div className="viewer-meal-header">
                              <div className="viewer-meal-icon-wrapper">
                                <Icon size={18} />
                              </div>
                              <div className="viewer-meal-title-box">
                                <h5 className="viewer-meal-name">{label}</h5>
                                <span className="viewer-meal-time">Horário Sugerido: {horario}</span>
                              </div>
                            </div>
                            <ul className="viewer-options-list">
                              {validas.map((op, oIdx) => (
                                <li key={oIdx} className="viewer-option-item">
                                  <span className="option-number-badge">{oIdx + 1}</span>
                                  <span className="option-text">{op}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Modo Semanal Completo (ou Modo Impressão) */}
              {(viewMode === 'semanal' || true) && (
                <div className={`viewer-all-days-list ${viewMode === 'diario' ? 'print-only' : ''}`}>
                  {planoSemanal.map((diaItem, dIdx) => (
                    <div key={dIdx} className="viewer-day-section-block">
                      <div className="viewer-day-banner">
                        <CalendarIcon size={16} />
                        <h4>{diaItem.dia}</h4>
                      </div>

                      <div className="viewer-meals-grid">
                        {REFEICOES_KEYS.map(({ key, label, Icon }) => {
                          const opcoes = diaItem.refeicoes?.[key] || [];
                          const validas = opcoes.filter(o => o && o.trim());
                          if (validas.length === 0) return null;

                          return (
                            <div key={key} className="viewer-meal-card">
                              <div className="viewer-meal-header">
                                <div className="viewer-meal-icon-wrapper">
                                  <Icon size={16} />
                                </div>
                                <h5 className="viewer-meal-name">{label}</h5>
                              </div>
                              <ul className="viewer-options-list">
                                {validas.map((op, oIdx) => (
                                  <li key={oIdx} className="viewer-option-item">
                                    <span className="option-number-badge">{oIdx + 1}</span>
                                    <span className="option-text">{op}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="modal-footer no-print">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
