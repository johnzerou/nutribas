import React, { useState, useMemo } from 'react';
import { FlameIcon, ScaleIcon, CalculatorIcon, TargetIcon, WaterIcon, CheckIcon, CopyIcon } from './Icons';

export default function CalculadoraMetabolica({ paciente = {}, onClose, onAplicarMeta }) {
  const [sexo, setSexo] = useState(paciente.sexo || 'Feminino');
  const [idade, setIdade] = useState(paciente.idade ? String(paciente.idade) : '30');
  const [peso, setPeso] = useState(paciente.peso || paciente.peso_inicial ? String(paciente.peso || paciente.peso_inicial) : '70');
  const [altura, setAltura] = useState(paciente.altura ? String(paciente.altura) : '170');
  const [fatorAtividade, setFatorAtividade] = useState('1.375'); // 1.2 Sedentário, 1.375 Leve, 1.55 Moderado, 1.725 Intenso, 1.9 Muito Intenso
  const [objetivoCalorico, setObjetivoCalorico] = useState('-400'); // -400 Emagrecimento, 0 Manutenção, +350 Hipertrofia
  const [distribuicaoMacros, setDistribuicaoMacros] = useState('equilibrada'); // 'equilibrada', 'lowcarb', 'hipertrofia'
  const [copiado, setCopiado] = useState(false);

  // Fórmulas Clínicas (Mifflin-St Jeor)
  const calculos = useMemo(() => {
    const p = parseFloat(peso) || 0;
    const a = parseFloat(altura) || 0;
    const i = parseFloat(idade) || 0;
    const fa = parseFloat(fatorAtividade) || 1.2;
    const objCal = parseFloat(objetivoCalorico) || 0;

    if (p <= 0 || a <= 0 || i <= 0) return null;

    // TMB (Mifflin-St Jeor)
    let tmb = 0;
    if (sexo === 'Masculino' || sexo === 'M') {
      tmb = (10 * p) + (6.25 * a) - (5 * i) + 5;
    } else {
      tmb = (10 * p) + (6.25 * a) - (5 * i) - 161;
    }

    // GET (Gasto Energético Total)
    const get = tmb * fa;

    // Meta Calórica Diária Prescrita
    const metaCalorica = Math.max(1000, Math.round(get + objCal));

    // Distribuição de Macronutrientes
    let pctP = 0.25, pctC = 0.50, pctG = 0.25;
    if (distribuicaoMacros === 'lowcarb') {
      pctP = 0.30; pctC = 0.25; pctG = 0.45;
    } else if (distribuicaoMacros === 'hipertrofia') {
      pctP = 0.30; pctC = 0.50; pctG = 0.20;
    }

    const kcalP = metaCalorica * pctP;
    const kcalC = metaCalorica * pctC;
    const kcalG = metaCalorica * pctG;

    const gP = Math.round(kcalP / 4);
    const gC = Math.round(kcalC / 4);
    const gG = Math.round(kcalG / 9);

    const proteinaPorKg = (gP / p).toFixed(1);
    const aguaRecomendada = ((p * 35) / 1000).toFixed(1); // 35ml/kg

    return {
      tmb: Math.round(tmb),
      get: Math.round(get),
      metaCalorica,
      gP,
      gC,
      gG,
      kcalP: Math.round(kcalP),
      kcalC: Math.round(kcalC),
      kcalG: Math.round(kcalG),
      pctP: Math.round(pctP * 100),
      pctC: Math.round(pctC * 100),
      pctG: Math.round(pctG * 100),
      proteinaPorKg,
      aguaRecomendada
    };
  }, [sexo, idade, peso, altura, fatorAtividade, objetivoCalorico, distribuicaoMacros]);

  const handleCopiarResumo = () => {
    if (!calculos) return;
    const texto = `📊 PLANEJAMENTO METABÓLICO & METAS - ${paciente.nome || 'Paciente'}
• Taxa Metabólica Basal (TMB): ${calculos.tmb} kcal/dia
• Gasto Energético Total (GET): ${calculos.get} kcal/dia
• Meta Calórica Prescrita: ${calculos.metaCalorica} kcal/dia
• Macronutrientes Diários:
   - Proteínas: ${calculos.gP}g (${calculos.pctP}% | ${calculos.proteinaPorKg}g/kg)
   - Carboidratos: ${calculos.gC}g (${calculos.pctC}%)
   - Gorduras: ${calculos.gG}g (${calculos.pctG}%)
• Meta Hídrica Mínima: ${calculos.aguaRecomendada} Litros/dia (35ml/kg)
`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card calc-modal animate-fade" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="calc-modal-header-title">
            <div className="stat-icon-wrapper orange">
              <CalculatorIcon size={20} />
            </div>
            <div>
              <h3 className="modal-title">Calculadora Metabólica & Macros</h3>
              <p className="modal-subtitle">Estimativas clínicas de TMB (Mifflin-St Jeor), GET e partição de macronutrientes</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body calc-modal-body">
          <div className="calc-grid-layout">
            {/* Coluna 1: Parâmetros */}
            <div className="calc-inputs-col">
              <h4 className="calc-section-title">Parâmetros Biométricos</h4>
              
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="field-label">Sexo Biológico</label>
                  <select value={sexo} onChange={e => setSexo(e.target.value)} className="calc-select">
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label">Idade (anos)</label>
                  <input type="number" min="10" max="120" value={idade} onChange={e => setIdade(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="field-label">Peso Atual (kg)</label>
                  <input type="number" step="0.1" value={peso} onChange={e => setPeso(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="field-label">Altura (cm)</label>
                  <input type="number" value={altura} onChange={e => setAltura(e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="field-label">Nível de Atividade Física</label>
                <select value={fatorAtividade} onChange={e => setFatorAtividade(e.target.value)} className="calc-select">
                  <option value="1.2">Sedentário (pouco ou nenhum exercício)</option>
                  <option value="1.375">Leve (exercício 1-3 dias/semana)</option>
                  <option value="1.55">Moderado (exercício 3-5 dias/semana)</option>
                  <option value="1.725">Intenso (exercício 6-7 dias/semana)</option>
                  <option value="1.9">Muito Intenso (atleta / treino 2x ao dia)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">Objetivo Nutricional</label>
                <select value={objetivoCalorico} onChange={e => setObjetivoCalorico(e.target.value)} className="calc-select">
                  <option value="-600">Déficit Agressivo (-600 kcal) • Emagrecimento Rápido</option>
                  <option value="-400">Déficit Moderado (-400 kcal) • Emagrecimento Sustentável</option>
                  <option value="-200">Déficit Leve (-200 kcal) • Redução gradual de gordura</option>
                  <option value="0">Normocalórica (Manutenção / Reeducação)</option>
                  <option value="250">Superávit Leve (+250 kcal) • Hipertrofia limpa</option>
                  <option value="500">Superávit Moderado (+500 kcal) • Ganho de massa</option>
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">Estratégia de Macronutrientes</label>
                <select value={distribuicaoMacros} onChange={e => setDistribuicaoMacros(e.target.value)} className="calc-select">
                  <option value="equilibrada">Equilibrada (50% Carb, 25% Prot, 25% Gord)</option>
                  <option value="hipertrofia">Hipertrofia / Performance (50% Carb, 30% Prot, 20% Gord)</option>
                  <option value="lowcarb">Low Carb Moderado (25% Carb, 30% Prot, 45% Gord)</option>
                </select>
              </div>
            </div>

            {/* Coluna 2: Resultados Clínicos */}
            <div className="calc-results-col">
              <h4 className="calc-section-title">Resultados Estimados</h4>

              {calculos ? (
                <div className="calc-results-cards-wrapper">
                  <div className="calc-meta-highlight-box">
                    <span className="calc-meta-label">Meta Calórica Diária</span>
                    <div className="calc-meta-number-row">
                      <FlameIcon className="text-primary" size={28} />
                      <span className="calc-meta-value">{calculos.metaCalorica}</span>
                      <span className="calc-meta-unit">kcal/dia</span>
                    </div>
                    <div className="calc-meta-sub-pills">
                      <span>TMB: <strong>{calculos.tmb} kcal</strong></span>
                      <span>GET: <strong>{calculos.get} kcal</strong></span>
                    </div>
                  </div>

                  {/* Macronutrientes */}
                  <div className="calc-macros-grid">
                    <div className="calc-macro-card protein">
                      <span className="macro-tag">Proteínas</span>
                      <strong className="macro-gram">{calculos.gP}g</strong>
                      <span className="macro-meta">{calculos.pctP}% • {calculos.proteinaPorKg}g/kg</span>
                    </div>

                    <div className="calc-macro-card carb">
                      <span className="macro-tag">Carboidratos</span>
                      <strong className="macro-gram">{calculos.gC}g</strong>
                      <span className="macro-meta">{calculos.pctC}% • {calculos.kcalC} kcal</span>
                    </div>

                    <div className="calc-macro-card fat">
                      <span className="macro-tag">Gorduras</span>
                      <strong className="macro-gram">{calculos.gG}g</strong>
                      <span className="macro-meta">{calculos.pctG}% • {calculos.kcalG} kcal</span>
                    </div>
                  </div>

                  {/* Hidratação */}
                  <div className="calc-water-box">
                    <div className="calc-water-icon">
                      <WaterIcon size={20} />
                    </div>
                    <div className="calc-water-text">
                      <strong>Meta Hídrica Mínima: {calculos.aguaRecomendada} Litros/dia</strong>
                      <span>Cálculo baseado no padrão clínico de 35ml por kg de peso corporal.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Preencha os campos biométricos para calcular.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={handleCopiarResumo} disabled={!calculos}>
            {copiado ? <><CheckIcon size={16} /> Copiado!</> : <><CopyIcon size={16} /> Copiar Planejamento</>}
          </button>
          {onAplicarMeta && calculos && (
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => {
                onAplicarMeta(calculos);
                onClose();
              }}
            >
              <CheckIcon size={16} /> Aplicar ao Paciente
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
