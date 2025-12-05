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

async function analyzeImage(imageBase64: string): Promise<AnalysisResult> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);

    return {
      healthStatus: 'Unable to analyze',
      confidence: 0,
      issues: ['Image analysis failed. Please ensure the image clearly shows the crop leaves or plant.'],
      nutrientDeficiencies: [],
      recommendations: [
        'Try uploading a clearer image with better lighting',
        'Ensure the crop leaves are clearly visible',
        'Avoid blurry or distant shots',
      ],
    };
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
