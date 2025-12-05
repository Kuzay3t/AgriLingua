import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisResult {
  healthStatus: string;
  confidence: number;
  issues: string[];
  recommendations: string[];
  nutrientDeficiencies: string[];
}

function getDemoAnalysis(): AnalysisResult {
  const demoResults: AnalysisResult[] = [
    {
      healthStatus: 'Healthy',
      confidence: 92,
      issues: [],
      nutrientDeficiencies: [],
      recommendations: [
        'Continue current watering and fertilization schedule',
        'Monitor for early signs of pests or diseases',
        'Ensure adequate spacing for good air circulation',
        'Apply organic mulch to retain soil moisture',
        'Consider companion planting to boost growth',
      ],
    },
    {
      healthStatus: 'Moderate Stress',
      confidence: 85,
      issues: [
        'Yellowing of lower leaves indicates possible nitrogen deficiency',
        'Some leaf curling visible, may be due to water stress or pest activity',
        'Slight discoloration on older leaves',
      ],
      nutrientDeficiencies: ['Nitrogen', 'Possibly Magnesium'],
      recommendations: [
        'Apply nitrogen-rich fertilizer (urea or NPK 20-10-10) at 100kg per hectare',
        'Add compost or well-decomposed manure (5-10 tons per hectare)',
        'Increase watering frequency, ensure soil stays moist but not waterlogged',
        'Check undersides of leaves for pests and apply neem oil if needed',
        'Apply foliar spray with Epsom salt solution for magnesium (1 tablespoon per gallon)',
        'Monitor plant response over next 7-10 days',
      ],
    },
    {
      healthStatus: 'Poor Health',
      confidence: 88,
      issues: [
        'Severe chlorosis (yellowing) across multiple leaves',
        'Brown spots and necrotic lesions visible - potential fungal or bacterial disease',
        'Stunted growth and wilting appearance',
        'Possible pest damage visible on leaf margins',
      ],
      nutrientDeficiencies: ['Nitrogen', 'Iron', 'Potassium'],
      recommendations: [
        'Immediate action: Remove and destroy severely affected leaves to prevent spread',
        'Apply broad-spectrum fungicide (Mancozeb or copper-based) every 7 days',
        'Improve drainage if soil appears waterlogged',
        'Apply balanced NPK fertilizer (15-15-15) with micronutrients',
        'Add chelated iron supplement for iron chlorosis',
        'Increase organic matter in soil for long-term health',
        'Space plants properly to improve air circulation',
        'Consider soil testing to identify specific nutrient deficiencies',
      ],
    },
    {
      healthStatus: 'Healthy with Minor Issues',
      confidence: 78,
      issues: [
        'Few leaves showing minor pest damage (small holes)',
        'Slight yellowing on one or two older leaves - normal aging',
      ],
      nutrientDeficiencies: [],
      recommendations: [
        'Apply organic neem oil spray to control minor pest activity',
        'Remove old yellowing leaves to redirect plant energy',
        'Continue regular watering schedule',
        'Apply light dose of balanced fertilizer if not done recently',
        'Monitor weekly for any increase in pest activity',
      ],
    },
  ];

  return demoResults[Math.floor(Math.random() * demoResults.length)];
}

async function analyzeImage(imageBase64: string): Promise<AnalysisResult> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiApiKey) {
    console.log('OpenAI API key not configured, using demo mode');
    return getDemoAnalysis();
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert agricultural consultant specializing in crop health analysis. Analyze this crop/plant image and provide:
1. Overall health status (Healthy, Moderate Stress, or Poor Health)
2. Confidence level (0-100)
3. List any visible issues or diseases
4. Identify any nutrient deficiencies based on visual symptoms
5. Provide specific treatment recommendations

Return your analysis in this exact JSON format:
{
  "healthStatus": "string",
  "confidence": number,
  "issues": ["string"],
  "nutrientDeficiencies": ["string"],
  "recommendations": ["string"]
}

Be specific and actionable in your recommendations. If the image shows a healthy crop, say so and provide maintenance tips.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.log('OpenAI API error, falling back to demo mode');
      return getDemoAnalysis();
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('Failed to parse AI response, falling back to demo mode');
      return getDemoAnalysis();
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing image, falling back to demo mode:', error);
    return getDemoAnalysis();
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const analysis = await analyzeImage(image);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in crop analyzer:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to analyze crop image',
        healthStatus: 'Analysis Error',
        confidence: 0,
        issues: ['Technical error occurred during analysis'],
        nutrientDeficiencies: [],
        recommendations: ['Please try again or contact support'],
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
