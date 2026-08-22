import React, { useState } from 'react';

export default function WeightEvolutionChart({ consultations = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Formatação segura de data para o gráfico
  const formatChartDate = (dateVal, withYear = false) => {
    if (!dateVal) return '';
    try {
      if (dateVal instanceof Date) {
        return dateVal.toLocaleDateString('pt-BR', {
          timeZone: 'UTC',
          day: '2-digit',
          month: '2-digit',
          ...(withYear ? { year: '2-digit' } : {})
        });
      }
      const str = String(dateVal).split('T')[0];
      if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
          return withYear 
            ? `${parts[2]}/${parts[1]}/${parts[0].slice(2)}` 
            : `${parts[2]}/${parts[1]}`;
        }
      }
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR', {
          timeZone: 'UTC',
          day: '2-digit',
          month: '2-digit',
          ...(withYear ? { year: '2-digit' } : {})
        });
      }
    } catch {
      // fallback
    }
    return String(dateVal);
  };

  // Filtra apenas consultas que têm peso válido e ordena por data crescente para o gráfico
  const validData = (consultations || [])
    .filter(c => c && c.peso !== null && c.peso !== undefined && !isNaN(Number(c.peso)) && Number(c.peso) > 0)
    .map(c => {
      let dObj;
      if (c.data_consulta instanceof Date) {
        dObj = c.data_consulta;
      } else {
        dObj = new Date(c.data_consulta);
      }
      return {
        ...c,
        pesoNum: Number(c.peso),
        dateObj: isNaN(dObj.getTime()) ? new Date() : dObj
      };
    })
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  if (validData.length === 0) {
    return (
      <div className="empty-chart-container">
        <svg className="empty-chart-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="empty-chart-title">Nenhuma consulta registrada ainda</p>
        <span className="empty-chart-subtitle">Cadastre a primeira consulta para acompanhar o gráfico de evolução de peso do paciente ao longo do tempo.</span>
      </div>
    );
  }

  // Estatísticas de evolução
  const initialWeight = validData[0].pesoNum;
  const currentWeight = validData[validData.length - 1].pesoNum;
  const weightDiff = currentWeight - initialWeight;
  const minWeight = Math.min(...validData.map(d => d.pesoNum));
  const maxWeight = Math.max(...validData.map(d => d.pesoNum));

  // Dimensões do SVG
  const width = 680;
  const height = 260;
  const paddingX = 50;
  const paddingY = 40;

  const yMin = Math.max(0, Math.floor(minWeight - 3));
  const yMax = Math.ceil(maxWeight + 3);
  const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

  const getX = (index) => {
    if (validData.length === 1) return width / 2;
    return paddingX + (index / (validData.length - 1)) * (width - paddingX * 2);
  };

  const getY = (weight) => {
    return height - paddingY - ((weight - yMin) / yRange) * (height - paddingY * 2);
  };

  // Pontos calculados
  const points = validData.map((d, index) => ({
    ...d,
    x: getX(index),
    y: getY(d.pesoNum)
  }));

  // Gerar linhas do path
  let pathD = '';
  let areaD = '';

  if (points.length === 1) {
    pathD = `M ${points[0].x - 40} ${points[0].y} L ${points[0].x + 40} ${points[0].y}`;
    areaD = `M ${points[0].x - 40} ${height - paddingY} L ${points[0].x - 40} ${points[0].y} L ${points[0].x + 40} ${points[0].y} L ${points[0].x + 40} ${height - paddingY} Z`;
  } else {
    pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY} L ${points[0].x.toFixed(1)} ${height - paddingY} Z`;
  }

  // Linhas de grade horizontais (4 divisões)
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = yMin + (i * yRange) / gridSteps;
    return {
      val: val.toFixed(1),
      y: getY(val)
    };
  });

  return (
    <div className="weight-chart-wrapper">
      {/* Resumo no Topo do Gráfico */}
      <div className="weight-chart-summary">
        <div className="chart-stat-item">
          <span className="stat-name">Peso Inicial</span>
          <strong className="stat-val">{initialWeight} kg</strong>
        </div>
        <div className="chart-stat-item">
          <span className="stat-name">Peso Atual</span>
          <strong className="stat-val primary">{currentWeight} kg</strong>
        </div>
        <div className="chart-stat-item">
          <span className="stat-name">Evolução Total</span>
          <strong className={`stat-val ${weightDiff < 0 ? 'loss' : weightDiff > 0 ? 'gain' : 'neutral'}`}>
            {weightDiff > 0 ? `+${weightDiff.toFixed(1)}` : weightDiff.toFixed(1)} kg
          </strong>
        </div>
        <div className="chart-stat-item">
          <span className="stat-name">Menor Peso</span>
          <strong className="stat-val">{minWeight} kg</strong>
        </div>
      </div>

      {/* SVG Canvas do Gráfico */}
      <div className="svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="weight-svg-chart">
          <defs>
            <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-color, #ef4444)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary-color, #ef4444)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="weightLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="var(--primary-color, #dc2626)" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="var(--primary-color, #dc2626)" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Gridlines Horizontais */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="grid-group">
              <line 
                x1={paddingX - 10} 
                y1={line.y} 
                x2={width - paddingX + 10} 
                y2={line.y} 
                stroke="var(--border-color, #e2e8f0)" 
                strokeDasharray="4 4" 
                strokeWidth="1"
              />
              <text 
                x={paddingX - 16} 
                y={line.y + 4} 
                textAnchor="end" 
                fontSize="11" 
                fill="var(--text-subtle, #94a3b8)"
                fontFamily="inherit"
              >
                {line.val} kg
              </text>
            </g>
          ))}

          {/* Área sombreada */}
          <path d={areaD} fill="url(#weightAreaGrad)" />

          {/* Linha do gráfico */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="url(#weightLineGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow)"
          />

          {/* Pontos de dados */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint?.id === p.id;
            return (
              <g 
                key={p.id || idx} 
                className="point-group"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Linha vertical pontilhada no hover */}
                {isHovered && (
                  <line 
                    x1={p.x} 
                    y1={paddingY} 
                    x2={p.x} 
                    y2={height - paddingY} 
                    stroke="var(--primary-color)" 
                    strokeDasharray="2 2" 
                    strokeWidth="1.5"
                  />
                )}
                
                {/* Círculo externo pulsante */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isHovered ? 8 : 5.5} 
                  fill="var(--surface-card, #ffffff)" 
                  stroke="var(--primary-color, #dc2626)" 
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  style={{ transition: 'all 0.15s ease' }}
                />

                {/* Data no Eixo X */}
                <text 
                  x={p.x} 
                  y={height - paddingY + 20} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fill={isHovered ? 'var(--primary-color)' : 'var(--text-muted)'}
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="inherit"
                >
                  {formatChartDate(p.data_consulta, true)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip flutuante no hover */}
        {hoveredPoint && (
          <div 
            className="chart-tooltip-floating"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="tooltip-date">{formatChartDate(hoveredPoint.data_consulta, true)}</div>
            <div className="tooltip-weight">{hoveredPoint.pesoNum} kg</div>
            {hoveredPoint.percentual_gordura && (
              <div className="tooltip-extra">Gordura: {hoveredPoint.percentual_gordura}%</div>
            )}
            {hoveredPoint.cintura && (
              <div className="tooltip-extra">Cintura: {hoveredPoint.cintura} cm</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
