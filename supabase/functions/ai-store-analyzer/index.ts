import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, fileName, analysisType } = await req.json();

    console.log(`Analyzing file: ${fileName} with type: ${analysisType}`);

    const systemPrompt = `Você é um especialista em desenvolvimento React/TypeScript e arquitetura de software especializado em sistemas de e-commerce e personalização de lojas. 

Analise o código fornecido e forneça:

1. **PROBLEMAS IDENTIFICADOS**: Liste todos os problemas, bugs potenciais, e falhas de funcionalidade
2. **MELHORIAS DE CÓDIGO**: Sugira otimizações, melhor estrutura e padrões
3. **FUNCIONALIDADES FALTANTES**: Identifique funcionalidades importantes que estão ausentes
4. **CÓDIGO CORRIGIDO**: Forneça o código completo corrigido e melhorado
5. **FUNCIONALIDADES ADICIONAIS**: Sugira novas funcionalidades que agreguem valor

Foque especialmente em:
- Performance e otimização
- Experiência do usuário (UX/UI)
- Funcionalidades de personalização de loja
- Gestão de estado e dados
- Validação e tratamento de erros
- Acessibilidade e responsividade
- Segurança

Seja detalhado e prático nas suas sugestões.`;

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
          { 
            role: 'user', 
            content: `Arquivo: ${fileName}\nTipo de Análise: ${analysisType}\n\nCódigo:\n\`\`\`\n${code}\n\`\`\`` 
          }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      analysis,
      fileName,
      analysisType 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-store-analyzer function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});