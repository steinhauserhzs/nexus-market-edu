import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewRequest {
  code: string;
  fileName: string;
  reviewType: 'security' | 'performance' | 'functionality' | 'complete';
  context?: string;
}

interface ReviewResponse {
  fileName: string;
  reviewType: string;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: 'security' | 'performance' | 'bug' | 'improvement';
    line?: number;
    description: string;
    suggestion: string;
    code?: string;
  }>;
  overallScore: number;
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, fileName, reviewType, context }: ReviewRequest = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Starting ${reviewType} review for ${fileName}`);

    const systemPrompt = getSystemPrompt(reviewType);
    const userPrompt = `
Analise o seguinte código do arquivo "${fileName}":

${context ? `Contexto adicional: ${context}` : ''}

\`\`\`typescript
${code}
\`\`\`

Forneça uma análise detalhada seguindo o formato JSON especificado.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reviewResult = JSON.parse(data.choices[0].message.content) as ReviewResponse;

    // Log the review in the database
    await supabase.from('code_reviews').insert({
      file_name: fileName,
      review_type: reviewType,
      issues_found: reviewResult.issues.length,
      overall_score: reviewResult.overallScore,
      critical_issues: reviewResult.issues.filter(i => i.severity === 'critical').length,
      high_issues: reviewResult.issues.filter(i => i.severity === 'high').length,
      medium_issues: reviewResult.issues.filter(i => i.severity === 'medium').length,
      low_issues: reviewResult.issues.filter(i => i.severity === 'low').length,
      review_data: reviewResult,
      created_at: new Date().toISOString()
    });

    console.log(`Review completed for ${fileName}: ${reviewResult.issues.length} issues found`);

    return new Response(JSON.stringify(reviewResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-code-reviewer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fileName: '',
      issues: [],
      overallScore: 0,
      summary: 'Erro durante a análise'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemPrompt(reviewType: string): string {
  const basePrompt = `
Você é um especialista em revisão de código TypeScript/React/Supabase com foco em segurança, performance e melhores práticas.

Analise o código fornecido e retorne um JSON válido no seguinte formato:
{
  "fileName": "nome do arquivo",
  "reviewType": "${reviewType}",
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "type": "security|performance|bug|improvement",
      "line": número_da_linha_opcional,
      "description": "Descrição clara do problema",
      "suggestion": "Sugestão específica de correção",
      "code": "Código corrigido (opcional)"
    }
  ],
  "overallScore": número_de_0_a_100,
  "summary": "Resumo geral da análise"
}
`;

  const specificGuidelines = {
    security: `
Foque especialmente em:
- Vulnerabilidades de injeção SQL
- Exposição de dados sensíveis
- Autenticação e autorização inadequadas
- Validação de entrada insuficiente
- Configurações de RLS do Supabase
- Gerenciamento de secrets e API keys
- CORS e headers de segurança
- XSS e CSRF
`,
    performance: `
Foque especialmente em:
- Renderizações desnecessárias do React
- Consultas ineficientes ao banco de dados
- Carregamento de recursos
- Bundle size e tree shaking
- Memoização inadequada
- Memory leaks
- Lazy loading
- Otimizações de imagens
`,
    functionality: `
Foque especialmente em:
- Bugs potenciais
- Tratamento de erros
- Edge cases
- Acessibilidade
- UX/UI
- Compatibilidade
- Testes necessários
- Documentação
`,
    complete: `
Faça uma análise completa considerando:
- Segurança
- Performance 
- Funcionalidade
- Manutenibilidade
- Escalabilidade
- Melhores práticas
`
  };

  return basePrompt + (specificGuidelines[reviewType as keyof typeof specificGuidelines] || specificGuidelines.complete);
}