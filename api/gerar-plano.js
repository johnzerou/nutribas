import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Schema estruturado para retorno estrito do Gemini
const planoAlimentarSchema = {
  type: SchemaType.OBJECT,
  description: 'Plano alimentar semanal estruturado para nutricionistas',
  properties: {
    plano_semanal: {
      type: SchemaType.ARRAY,
      description: 'Lista dos 7 dias da semana com suas respectivas refeições',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          dia: {
            type: SchemaType.STRING,
            description: 'Nome do dia da semana (ex: Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado, Domingo)'
          },
          refeicoes: {
            type: SchemaType.OBJECT,
            description: 'Refeições do dia com 5 opções cada',
            properties: {
              cafe_da_manha: {
                type: SchemaType.ARRAY,
                description: '5 opções balanceadas e diversificadas de café da manhã brasileiro',
                items: { type: SchemaType.STRING }
              },
              lanche_manha: {
                type: SchemaType.ARRAY,
                description: '5 opções práticas de lanche da manhã',
                items: { type: SchemaType.STRING }
              },
              almoco: {
                type: SchemaType.ARRAY,
                description: '5 opções de almoço nutritivo e culturalmente aceito',
                items: { type: SchemaType.STRING }
              },
              lanche_tarde: {
                type: SchemaType.ARRAY,
                description: '5 opções saudáveis e equilibradas de lanche da tarde',
                items: { type: SchemaType.STRING }
              },
              jantar: {
                type: SchemaType.ARRAY,
                description: '5 opções leves e completas de jantar',
                items: { type: SchemaType.STRING }
              }
            },
            required: ['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar']
          }
        },
        required: ['dia', 'refeicoes']
      }
    }
  },
  required: ['plano_semanal']
};

/**
 * Monta o bloco de texto formatado com os dados clínicos do paciente
 */
function formatarDadosPaciente(paciente = {}) {
  const formatList = (arr) => {
    if (!arr) return 'Nenhum informado';
    if (Array.isArray(arr)) {
      const valid = arr.filter(item => item && item !== 'Nenhum');
      return valid.length > 0 ? valid.join(', ') : 'Nenhum informado';
    }
    return String(arr);
  };

  return `
- Nome: ${paciente.nome || 'Paciente'}
- Sexo: ${paciente.sexo || 'Não informado'}
- Idade: ${paciente.idade ? `${paciente.idade} anos` : 'Não informada'}
- Peso Atual/Inicial: ${paciente.peso ? `${paciente.peso} kg` : (paciente.peso_inicial ? `${paciente.peso_inicial} kg` : 'Não informado')}
- Altura: ${paciente.altura ? `${paciente.altura} cm` : 'Não informada'}
- IMC: ${paciente.imc ? `${paciente.imc.valor || paciente.imc} (${paciente.imc.classificacao || ''})` : 'Não calculado'}
- Metas / Objetivos: ${formatList(paciente.objetivos)}
- Detalhes do Objetivo: ${paciente.objetivo_texto || 'Não especificado'}
- Nível de Atividade Física: ${paciente.nivel_atividade || 'Não informado'}
- Prática de Atividade Física: ${paciente.atividade_fisica ? `Sim (${paciente.atividade_fisica_descricao || 'Sem detalhes'})` : 'Não pratica ou não informado'}
- Patologias / Condições de Saúde: ${formatList(paciente.patologias)}
- Restrições Alimentares: ${formatList(paciente.restricoes_alimentares || paciente.restricoes)}
- Alergias Alimentares: ${formatList(paciente.alergias)}
- Medicamentos em Uso: ${paciente.medicamentos || 'Nenhum informado'}
- Suplementos em Uso: ${paciente.suplementos || 'Nenhum informado'}
- Rotina Diária: Acorda às ${paciente.horario_acorda || 'não informado'}, Dorme às ${paciente.horario_dorme || 'não informado'}
- Meta / Consumo de Água: ${paciente.litros_agua ? `${paciente.litros_agua} litros/dia` : 'Não informado'}
- Refeições desejadas por dia: ${paciente.refeicoes_por_dia || '5 refeições diárias'}
- Observações Clínicas Adicionais: ${paciente.observacoes || 'Nenhuma observação adicional'}
  `.trim();
}

/**
 * Handler principal para Serverless Function (Vercel & Vite Dev Server Middleware)
 */
export default async function handler(req, res) {
  // Configuração de Headers CORS e Content-Type
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({
      error: 'Método não permitido. Utilize POST para gerar o plano alimentar.'
    }));
  }

  try {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.error('[API /api/gerar-plano] ERRO: Variável de ambiente GOOGLE_API_KEY não configurada.');
      res.statusCode = 500;
      return res.end(JSON.stringify({
        error: 'Chave de API do Google Generative AI (GOOGLE_API_KEY) não encontrada nas variáveis de ambiente do servidor.'
      }));
    }

    // Leitura do corpo da requisição
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // body remains string
      }
    }

    const paciente = body?.paciente || body;

    if (!paciente || typeof paciente !== 'object') {
      res.statusCode = 400;
      return res.end(JSON.stringify({
        error: 'Dados do paciente não foram fornecidos ou formato inválido.'
      }));
    }

    const dadosDoPacienteFormatados = formatarDadosPaciente(paciente);

    // Prompt exato especificado no Prompt 6
    const promptFinal = `
Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${dadosDoPacienteFormatados}

# Regras Críticas de Execução:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Não inclua blocos de código markdown (como \`\`\`json ... \`\`\`), explicações, introduções ou textos complementares.
- Adapte o cardápio rigorosamente a quaisquer alergias ou restrições descritas nos dados.
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    }
  ]
}
`.trim();

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTry = [
      'gemini-3.6-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ];

    let generatedText = null;
    let lastError = null;

    // Tentativas com retry para lidar com eventuais oscilações temporárias (ex: 503)
    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: planoAlimentarSchema,
              temperature: 0.3
            }
          });

          const result = await model.generateContent(promptFinal);
          const response = await result.response;
          generatedText = response.text();
          if (generatedText) break;
        } catch (err) {
          lastError = err;
          console.warn(`[API /api/gerar-plano] Tentativa ${attempt} com modelo ${modelName} falhou:`, err.message);
          if (attempt < 2) {
            await new Promise(r => setTimeout(r, 1200));
          }
        }
      }
      if (generatedText) break;
    }

    if (!generatedText) {
      throw lastError || new Error('Não foi possível obter resposta do serviço de IA.');
    }

    // Validação e parse seguro do JSON retornado
    let parsedData;
    try {
      const cleanJson = generatedText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('[API /api/gerar-plano] Erro ao interpretar JSON da IA:', parseError, generatedText);
      throw new Error('A resposta gerada pela IA não pôde ser interpretada como JSON válido.');
    }

    if (!parsedData || !Array.isArray(parsedData.plano_semanal) || parsedData.plano_semanal.length === 0) {
      throw new Error('O formato retornado pela IA está incompleto.');
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({
      success: true,
      dados: parsedData
    }));

  } catch (err) {
    console.error('[API /api/gerar-plano] Erro na execução:', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({
      success: false,
      error: err.message || 'Erro interno ao processar a geração do plano alimentar com IA.'
    }));
  }
}
