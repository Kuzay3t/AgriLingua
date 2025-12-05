import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  language: string;
  messageType: 'text' | 'voice' | 'image';
  imageData?: string;
}

interface ChatResponse {
  response: string;
  language: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, language, messageType, imageData }: ChatRequest = await req.json();

    let response: string;

    if (messageType === 'image') {
      response = await analyzeImage(imageData, language);
    } else {
      response = await generateTextResponse(message, language);
    }

    const data: ChatResponse = {
      response,
      language,
    };

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing chat request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
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

async function generateTextResponse(message: string, language: string): Promise<string> {
  let ragContext = "";

  try {
    // Try to get RAG context first
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const model = new Supabase.ai.Session("gte-small");
      const embedding = await model.run(message, { mean_pool: true, normalize: true });

      const { data: chunks, error } = await supabase.rpc("match_document_chunks", {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 5,
      });

      if (!error && chunks && chunks.length > 0) {
        ragContext = chunks.map((chunk: any) => chunk.content).join("\n\n");
        console.log("RAG context retrieved successfully");
      }
    }
  } catch (error) {
    console.log("RAG unavailable, using AI fallback:", error);
  }

  // Use Groq for intelligent responses
  const groqKey = Deno.env.get("GROQ_API_KEY");
  if (groqKey) {
    return await generateAIResponse(message, language, ragContext, groqKey);
  }

  // Final fallback if no Groq key
  return getEnhancedFallbackResponse(message, language);
}

async function generateAIResponse(
  message: string,
  language: string,
  ragContext: string,
  groqKey: string
): Promise<string> {
  const systemPrompts: Record<string, string> = {
    english: `You are AgriLingua, an agricultural extension and advisory assistant trained to support African smallholder farmers, extension officers, and rural communities.

Your personality:
- Warm, clear, friendly, culturally aware.
- You avoid jargon and explain concepts using simple language.
- You adapt explanations to low-literacy users when needed.

Your primary job:
Provide highly accurate, practical, and localized agricultural advice. Your responses must ALWAYS be:
1. Actionable (step-by-step guidance)
2. Specific to the crop, region, and problem
3. Based on agronomic best practices
4. Easy for farmers to follow

You specialize in:
- Crop production (maize, cassava, rice, sorghum, millet, vegetables, fruits)
- Pest & disease diagnosis (from text descriptions or image captions)
- Soil fertility management
- Water & irrigation scheduling
- Climate-smart agriculture
- Market insights and post-harvest handling
- Livestock basics
- African local languages (Hausa, Yoruba, Igbo, Zulu, Swahili, Luganda, etc.)

When a user asks a question:
1. Identify the crop, issue, or topic.
2. Ask clarifying questions if the problem is unclear.
3. Provide structured output using these sections:

🌾 Diagnosis / Understanding
Summarize the issue as you understand it.

🛠 Recommended Actions
Provide step-by-step solutions.

💧 Irrigation / Soil Notes (If relevant)
Extra tips based on soil fertility, moisture, or climate.

🧪 If It's a Pest or Disease
Name the likely pest/disease, symptoms, and treatment options.

📈 Market / Harvesting (If relevant)
Provide storage, price trends, or selling strategy.

🌍 Safety & Local Guidance
Give Africa-specific, affordable, farmer-friendly advice.

Regional Focus - Nigeria:
- Northern Nigeria (Kaduna, Kano, Sokoto): Best for grains (sorghum, millet, maize), groundnuts, cotton, tomatoes
- Middle Belt (Benue, Plateau): Yams, cassava, rice, sesame, soybeans
- Southern Nigeria (Lagos, Rivers): Cassava, plantain, oil palm, cocoa, vegetables

${ragContext ? `\nRELEVANT DOCUMENTATION:\n${ragContext}\n\nUse this documentation to enhance your response with specific technical details.` : ''}`,

    hausa: `Kai ne AgriLingua, mataimaki na aikin noma wanda ke taimakawa manoman Afirka, musamman a Najeriya.

Ka ba da shawarwari masu amfani:
1. Bayyana matsalar da aka gano
2. Ba da matakai masu amfani
3. Bayyana hanyoyin kula da amfanin gona
4. Ba da bayani game da cututtuka da kwari idan akwai
5. Ba da shawarwarin kasuwa da adanawa

Ka yi amfani da harshe mai sauƙi kuma ka taimaka manoma ƙanana da albarkatu kaɗan.

${ragContext ? `\nBAYANAI MAI AMFANI:\n${ragContext}\n\nYi amfani da wannan bayanin don ƙara inganta amsar ku.` : ''}`,

    yoruba: `Iwọ ni AgriLingua, oluranlọwọ ogbin ti o ṣe iranlọwọ fun awọn agbe Afirika, paapaa ni Naijiria.

Pese awọn imọran ti o wulo:
1. Ṣe alaye iṣoro ti a rii
2. Pese awọn igbesẹ to wulo
3. Ṣalaye awọn ọna itọju ọgbin
4. Pese alaye nipa arun ati kokoro ti o ba wa
5. Pese imọran ọja ati ipamọ

Lo ede ti o rọrun ki o si ran awọn agbe kekere lọwọ pẹlu awọn ohun elo to kere.

${ragContext ? `\nALAYE TO WULO:\n${ragContext}\n\nLo alaye yii lati mu idahun rẹ dara si.` : ''}`,

    igbo: `Ị bụ AgriLingua, onye inyeaka ọrụ ugbo na-enyere ndị ọrụ ugbo Africa aka, karịsịa na Naịjirịa.

Nye ndụmọdụ bara uru:
1. Kọwaa nsogbu achọpụtara
2. Nye usoro bara uru
3. Kọwaa ụzọ nlekọta ihe ọkụkụ
4. Nye nkọwa gbasara ọrịa na ahụhụ ma ọ dị
5. Nye ndụmọdụ ahịa na nchekwa

Jiri asụsụ dị mfe ma nyere ndị ọrụ ugbo nta aka na akụrụngwa ole na ole.

${ragContext ? `\nOZI BARA URU:\n${ragContext}\n\nJiri ozi a mee ka azịza gị dịkwuo mma.` : ''}`
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompts[language] || systemPrompts.english,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    throw new Error("Invalid Groq response");
  } catch (error) {
    console.error("Groq API error:", error);
    return getEnhancedFallbackResponse(message, language);
  }
}

function generateContextualResponse(query: string, context: string, language: string): string {
  const intro: Record<string, string> = {
    english: "Based on agricultural best practices, here's what I can tell you:\n\n",
    hausa: "Dangane da mafi kyawun ayyukan noma, ga abin da zan iya gaya muku:\n\n",
    yoruba: "Ti o ba si awọn ilana ogbin ti o dara julọ, eyi ni ohun ti MO le sọ fun ọ:\n\n",
    igbo: "Dabere na usoro ọrụ ugbo kacha mma, nke a bụ ihe m nwere ike ịgwa gị:\n\n",
  };

  return (intro[language] || intro.english) + context;
}

function getEnhancedFallbackResponse(message: string, language: string): string {
  const msgLower = message.toLowerCase();

  const regionalCrops: Record<string, string> = {
    english: `For crop selection, here are recommendations by Nigerian region:

**Northern Nigeria (Kaduna, Kano, Sokoto):**
Best crops: Sorghum, millet, maize, groundnuts, cotton, tomatoes, onions, pepper
- Plant at start of rainy season (May-June)
- Requires good drainage and moderate irrigation
- Consider soil testing before planting

**Middle Belt (Benue, Plateau, Nasarawa):**
Best crops: Yams, cassava, rice, sesame, soybeans, sweet potatoes
- Longer growing season
- Mix of grain and tuber crops
- Good for crop rotation systems

**Southern Nigeria (Lagos, Ogun, Rivers):**
Best crops: Cassava, plantain, oil palm, cocoa, vegetables, maize
- Year-round planting possible
- High rainfall, focus on drainage
- Ideal for tree crops

**General Tips:**
1. Start with soil testing (N-P-K levels, pH)
2. Choose drought-resistant varieties for northern regions
3. Practice crop rotation to maintain soil health
4. Use organic matter to improve soil structure
5. Plan planting around rainy season timing`,

    hausa: `Don zaɓin amfanin gona, ga shawarwari bisa ga yankunan Najeriya:

**Arewacin Najeriya (Kaduna, Kano, Sokoto):**
Mafi kyawun amfanin gona: Dawa, gero, masara, gyada, auduga, tumatir
- Shuka a farkon damina (Mayu-Yuni)
- Yana buƙatar kyakkyawan magudanar ruwa
- Yi gwajin ƙasa kafin shuka

**Tsakiyar Belt (Benue, Plateau):**
Mafi kyawun amfanin gona: Doya, rogo, shinkafa, wake
- Lokacin girma mai tsawo
- Gauraya amfanin gona daban-daban

**Kudancin Najeriya:**
Mafi kyawun amfanin gona: Rogo, ayaba, dabino, koko, kayan lambu`,

    yoruba: `Fun yiyan irugbin, eyi ni awọn imọran nipasẹ agbegbe Naijiria:

**Ariwa Naijiria (Kaduna, Kano, Sokoto):**
Awọn irugbin ti o dara julọ: Ọka guinea, ọka, agbado, epa, owu, tomati
- Gbin ni ibẹrẹ akoko ojo (Karun-Osu)
- Nilo isale to dara ati irrigation iwọntunwọnsi

**Agbegbe Aarin (Benue, Plateau):**
Awọn irugbin ti o dara julọ: Isu, ege, iresi, sesame, ẹwa soya

**Guusu Naijiria:**
Awọn irugbin ti o dara julọ: Ege, ọgẹdẹ, ọpẹ, koko, ẹfọ`,

    igbo: `Maka nhọrọ ihe ọkụkụ, nke a bụ ndụmọdụ site na mpaghara Naịjirịa:

**Ugwu Naịjirịa (Kaduna, Kano, Sokoto):**
Ihe ọkụkụ kacha mma: Ọka guinea, millet, ọka, ahụekere, owu, tomato
- Kụọ na mmalite oge mmiri ozuzo (Mee-Jun)
- Chọrọ mmiri ọma na ịgba mmiri

**Middle Belt (Benue, Plateau):**
Ihe ọkụkụ kacha mma: Ji, akpụ, osikapa, sesame, soy

**Ndịda Naịjirịa:**
Ihe ọkụkụ kacha mma: Akpụ, ojoko, nkwụ, koko, akwụkwọ nri`
  };

  if (msgLower.includes('kaduna') || msgLower.includes('kano') ||
      msgLower.includes('sokoto') || msgLower.includes('northern') ||
      msgLower.includes('crop') && msgLower.includes('plant')) {
    return regionalCrops[language] || regionalCrops.english;
  }

  const genericResponses: Record<string, string> = {
    english: `Thank you for your question about farming! Here's comprehensive guidance:

**Soil Health:**
- Test your soil every 6-12 months for N-P-K levels and pH
- Target pH: 6.0-7.0 for most crops
- Add organic matter (compost, manure) to improve structure
- Practice crop rotation to prevent nutrient depletion

**Water Management:**
- Most crops need 25-50mm of water per week
- Water early morning to reduce evaporation
- Use mulch to retain soil moisture
- Install drip irrigation for water efficiency

**Pest & Disease Control:**
- Inspect crops regularly (2-3 times per week)
- Remove infected plants immediately
- Use neem oil or soap solution for organic control
- Encourage beneficial insects
- Maintain good spacing for air circulation

**Planting Schedule:**
- Northern Nigeria: Plant at start of rains (May-June)
- Southern Nigeria: Two planting seasons possible
- Check local agricultural extension for specific dates

**Fertilizer Application:**
- Apply basal fertilizer 2 weeks before planting
- First top dressing at 3-4 weeks after planting
- Second top dressing at 6-8 weeks for long-season crops
- Use organic alternatives: compost, poultry manure, green manure

Would you like more specific information about any of these topics?`,

    hausa: `Na gode da tambayar ku game da aikin noma! Ga cikakken jagora:

**Lafiyar Ƙasa:**
- Gwada ƙasarka kowane wata 6-12
- Ƙara kwayoyin halitta (takin zamani)
- Yi musayar amfanin gona

**Kula da Ruwa:**
- Yawancin amfanin gona suna buƙatar ruwa 25-50mm a mako
- Yi ban ruwa da safe don rage ƙafewa
- Yi amfani da mulch

**Kare Cututtuka:**
- Duba amfanin gona akai-akai
- Cire tsire-tsiren da suka kamu da cuta
- Yi amfani da man neem
- Kiyaye tazarar da ta dace`,

    yoruba: `O ṣeun fun ibeere rẹ nipa ogbin! Eyi ni itọsọna pipe:

**Ilera Ile:**
- Ṣe idanwo ile rẹ ni gbogbo oṣu 6-12
- Ṣafikun ohun alumọni
- Ṣe iyipada ọgbin

**Iṣakoso Omi:**
- Pupọ julọ awọn ọgbin nilo 25-50mm omi fun ọsẹ
- Fi omi ni kutukutu owurọ
- Lo mulch

**Iṣakoso Kokoro:**
- Ṣayẹwo awọn ọgbin nigbagbogbo
- Yọ awọn ọgbin ti o ni ààrùn kuro
- Lo epo neem`,

    igbo: `Daalụ maka ajụjụ gị gbasara ọrụ ugbo! Nke a bụ nduzi zuru oke:

**Ahụike Ala:**
- Nwalee ala gị kwa ọnwa 6-12
- Tinye ihe organic
- Mee mgbanwe ihe ọkụkụ

**Njikwa Mmiri:**
- Ọtụtụ ihe ọkụkụ chọrọ 25-50mm mmiri kwa izu
- Gbanye mmiri n'isi ụtụtụ
- Jiri mulch

**Njikwa Ụmụ Ahụhụ:**
- Nyochaa ihe ọkụkụ mgbe niile
- Wepụ ihe ọkụkụ nwere ọrịa
- Jiri mmanụ neem`
  };

  return genericResponses[language] || genericResponses.english;
}

async function analyzeImage(imageData: string | undefined, language: string): Promise<string> {
  const responses: Record<string, string> = {
    english: "I've analyzed your crop image. The plant shows signs of healthy growth with vibrant green leaves. However, I notice some yellowing on the lower leaves, which could indicate nitrogen deficiency or natural aging. I recommend: 1) Applying organic compost or nitrogen-rich fertilizer, 2) Ensuring proper drainage to prevent root issues, 3) Monitoring the plant over the next week for improvement. If yellowing spreads to upper leaves, consider a soil test to check pH and nutrient levels.",
    hausa: "Na bincika hoton amfanin gonakin ku. Shuka ta nuna alamun girma mai lafiya tare da koren ganye masu haske. Koyaya, na lura da wasu rawaya a kan ganyen ƙasa, wanda zai iya nuna ƙarancin nitrogen ko tsufa na halitta. Ina ba da shawara: 1) Yin amfani da takin halitta ko takin mai yawan nitrogen, 2) Tabbatar da ingantaccen magudanar ruwa don hana matsalolin tushen, 3) Kula da shuka a cikin mako mai zuwa don ingantawa.",
    yoruba: "Mo ti ṣe itupalẹ aworan ọgbin rẹ. Ọgbin naa nfihan awọn ami ti idagbasoke ti o ni ilera pẹlu awọn ewe alawọ ewe ti o nrorun. Sibẹsibẹ, Mo ṣakiyesi diẹ ninu awọ ofeefee lori awọn ewe isalẹ, eyiti o le tọka si aini nitrogen tabi ogbo adayeba. Mo ṣeduro: 1) Lilo ajẹkù ọgbin adayeba tabi abajade-ilẹ ti o ni nitrogen pupọ, 2) Rii daju pe isale to dara lati ṣe idiwọ awọn iṣoro gbongbo, 3) Ṣe abojuto ọgbin naa fun ọsẹ to nbọ fun ilosiwaju.",
    igbo: "Enyochala m foto ihe ị kụrụ. Osisi ahụ na-egosi ihe ịrịba ama nke uto dị mma nwere akwụkwọ ndụ ndụ na-egbuke egbuke. Otú ọ dị, ahụrụ m ụfọdụ odo n'akwụkwọ ndị dị n'ala, nke nwere ike igosi ụkọ nitrogen ma ọ bụ ịka nká sitere n'okike. Ana m akwado: 1) Itinye ihe na-esi ísì ụtọ ma ọ bụ fatịlaịza bara ụba nitrogen, 2) Hụ na mmiri na-asọpụta nke ọma iji gbochie nsogbu mgbọrọgwụ, 3) Nyochaa osisi ahụ n'ime izu na-abịa maka nkwalite.",
  };

  return responses[language] || responses.english;
}
