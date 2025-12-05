import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PestIdentifierRequest {
  image: string;
}

interface PestIdentifierResponse {
  diseaseName: string;
  likelyCause: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  severity: string;
  additionalNotes: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { image }: PestIdentifierRequest = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    const demoResults: PestIdentifierResponse[] = [
      {
        diseaseName: "Fall Armyworm Infestation",
        likelyCause: "Attack by Spodoptera frugiperda, a major pest affecting maize and other cereals across Africa.",
        organicTreatment: [
          "Apply neem oil solution (5ml per liter of water) weekly",
          "Use Bacillus thuringiensis (Bt) spray - organic biological control",
          "Introduce natural predators like parasitic wasps",
          "Hand-pick and destroy egg masses and larvae"
        ],
        chemicalTreatment: [
          "Apply Emamectin benzoate 5% (e.g., Proclaim) at 50g per hectare",
          "Use Chlorantraniliprole (e.g., Ampligo) at recommended doses",
          "Apply Spinetoram (e.g., Radiant) 12% - safer option",
          "Rotate insecticides to prevent resistance"
        ],
        prevention: [
          "Practice crop rotation with non-host crops like cassava or legumes",
          "Early planting to avoid peak pest seasons",
          "Use resistant or tolerant maize varieties if available",
          "Maintain field hygiene - remove crop residues after harvest",
          "Set up pheromone traps for early detection and monitoring"
        ],
        severity: "High",
        additionalNotes: "Fall armyworm can cause 30-70% yield loss if not controlled early. Monitor fields regularly, especially 2-6 weeks after planting. Apply treatments in early morning or late evening when larvae are most active. For best results, combine multiple control methods."
      },
      {
        diseaseName: "Late Blight (Tomato)",
        likelyCause: "Fungal disease caused by Phytophthora infestans, thrives in cool, wet conditions with high humidity.",
        organicTreatment: [
          "Apply copper-based fungicides (Bordeaux mixture) - 25g per liter",
          "Use garlic extract spray - crush 100g garlic in 1 liter water",
          "Apply wood ash around plant base to reduce soil moisture",
          "Remove and destroy infected leaves immediately"
        ],
        chemicalTreatment: [
          "Apply Mancozeb 80% WP at 2.5kg per hectare",
          "Use Metalaxyl + Mancozeb combination fungicides",
          "Apply Dimethomorph (e.g., Acrobat) as preventive spray",
          "Alternate fungicides to prevent resistance development"
        ],
        prevention: [
          "Use certified disease-free seeds and transplants",
          "Space plants properly (60-90cm) for good air circulation",
          "Avoid overhead irrigation - use drip irrigation instead",
          "Apply preventive fungicide sprays before rainy season",
          "Mulch to prevent soil splash onto lower leaves",
          "Practice 3-year crop rotation with non-solanaceous crops"
        ],
        severity: "High",
        additionalNotes: "Late blight spreads rapidly in humid conditions and can destroy entire crops within days. Start preventive sprays 2-3 weeks after transplanting. Spray every 7-10 days during rainy season. Always spray after rainfall. Remove volunteer tomato plants that can harbor the disease."
      },
      {
        diseaseName: "Cassava Mosaic Disease",
        likelyCause: "Viral disease transmitted by whiteflies (Bemisia tabaci), one of the most serious cassava diseases in Africa.",
        organicTreatment: [
          "Remove and burn severely infected plants to prevent spread",
          "Apply neem oil spray to control whitefly vectors",
          "Use yellow sticky traps to monitor and reduce whitefly populations",
          "Plant natural whitefly repellents like marigold around field borders"
        ],
        chemicalTreatment: [
          "Apply Imidacloprid (e.g., Confidor) to control whiteflies",
          "Use Acetamiprid or Thiamethoxam for vector control",
          "Treat cuttings with insecticide before planting",
          "Note: No chemical cure for viral infection, only vector control"
        ],
        prevention: [
          "Plant only disease-free cuttings from healthy mother plants",
          "Use improved resistant varieties like TME 419, UMUCASS 36/37",
          "Remove and destroy infected plants within first 2 months",
          "Maintain at least 100m distance from infected fields",
          "Control weeds that harbor whiteflies",
          "Avoid planting near old cassava fields"
        ],
        severity: "High",
        additionalNotes: "Cassava mosaic can reduce yields by 20-95%. There is no cure once plants are infected - prevention is critical. Plant resistant varieties whenever possible. Roguing (removing infected plants) is most effective in first 2-3 months. Whitefly control reduces spread but cannot eliminate disease."
      },
      {
        diseaseName: "Anthracnose (Pepper/Tomato)",
        likelyCause: "Fungal disease caused by Colletotrichum species, affects fruits causing circular sunken lesions.",
        organicTreatment: [
          "Apply copper fungicides (Kocide) at first sign of disease",
          "Use neem oil mixed with liquid soap (5ml neem + 2ml soap per liter)",
          "Apply compost tea as foliar spray to boost plant immunity",
          "Remove infected fruits and plant debris regularly"
        ],
        chemicalTreatment: [
          "Apply Azoxystrobin (e.g., Amistar) at 200ml per hectare",
          "Use Chlorothalonil (e.g., Daconil) 720g/L",
          "Apply Propiconazole or Tebuconazole systemic fungicides",
          "Alternate different fungicide groups to prevent resistance"
        ],
        prevention: [
          "Use certified disease-free seeds",
          "Practice crop rotation - avoid planting peppers/tomatoes in same spot",
          "Ensure proper spacing for good air circulation",
          "Avoid working in fields when plants are wet",
          "Mulch to prevent soil splash onto fruits and leaves",
          "Harvest fruits before over-ripening",
          "Disinfect tools between plants"
        ],
        severity: "Medium",
        additionalNotes: "Anthracnose primarily affects ripe and ripening fruits, causing significant post-harvest losses. The fungus survives in crop debris and can remain in soil for years. Proper sanitation is crucial. Apply preventive fungicides starting at flowering stage, especially during humid weather."
      },
      {
        diseaseName: "Nitrogen Deficiency",
        likelyCause: "Insufficient nitrogen in soil due to poor fertility, excessive leaching, or high crop nitrogen demand.",
        organicTreatment: [
          "Apply well-decomposed animal manure (5-10 tons per hectare)",
          "Use compost rich in green materials (10-15 tons per hectare)",
          "Apply urine dilution (1:10 with water) as foliar spray",
          "Incorporate legume green manure crops like mucuna or lablab",
          "Apply fish emulsion or blood meal for quick nitrogen boost"
        ],
        chemicalTreatment: [
          "Apply urea 46% at 100-200kg per hectare (split applications)",
          "Use NPK 20-10-10 or similar high-nitrogen fertilizer",
          "Apply calcium ammonium nitrate (CAN) at 150kg per hectare",
          "Top-dress with ammonium sulfate for immediate response",
          "Consider foliar feeding with liquid nitrogen fertilizers"
        ],
        prevention: [
          "Conduct regular soil tests to monitor nitrogen levels",
          "Practice crop rotation including nitrogen-fixing legumes",
          "Apply organic matter regularly to improve soil fertility",
          "Use cover crops during fallow periods",
          "Apply nitrogen in split doses to reduce leaching losses",
          "Mulch to conserve soil nutrients and reduce leaching",
          "Avoid excessive irrigation which causes nutrient leaching"
        ],
        severity: "Medium",
        additionalNotes: "Nitrogen deficiency shows as yellowing of older leaves first (from bottom up), stunted growth, and pale green color. It's most common in sandy soils and during heavy rains. Response to nitrogen fertilizer is usually visible within 7-10 days. For vegetables and maize, apply nitrogen in 2-3 split applications for better efficiency."
      }
    ];

    const result = demoResults[Math.floor(Math.random() * demoResults.length)];

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in pest-identifier function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to identify pest or disease",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
