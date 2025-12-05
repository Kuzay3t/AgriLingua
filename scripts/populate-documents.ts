/**
 * Script to populate the RAG database with agricultural documents
 *
 * This script processes the uploaded PDF documents and stores them
 * as chunks in the database for RAG queries.
 */

// Document content extracted from the PDFs
const documents = [
  {
    name: "Soil Type Handout",
    chunks: [
      {
        content: `Soil Types and Classification:
- Clay soil: Must be more than 40% clay to be classified as clay soil
- Loam: 40% sand, 40% silt, and 20% clay (ideal for most crops)
- Sandy soil: Higher percentage of sand

Soil Characteristics by Type:
Clay: Poor compaction, poor drainage, poor aeration, excellent nutrient retention
Silt: Good compaction, good drainage, good aeration, poor nutrient retention
Sand: Excellent compaction, excellent drainage, excellent aeration, poor nutrient retention`,
        metadata: { section: "Soil Types", page: 1 },
      },
      {
        content: `WSU Percolation Test for Drainage:
- Dig a hole 1 foot wide by 1 foot deep
- Fill with water and observe drainage rate
- Ideal drainage: 2 inches per hour
- Good drainage: 3 inches per hour (somewhat sandy)
- Too slow: ≤1 inch per hour (likely wet soil, standing water during rain)
- Too fast: ≥4 inches per hour (dry or droughty soil)

Solutions for Drainage Problems:
- Too fast: Add organic material to retain moisture
- Too slow: Add amendments like gypsum and organic material to break up heavy soils
- Plant crops suited to soil conditions
- Build raised beds for better soil control`,
        metadata: { section: "Percolation Test", page: 1 },
      },
      {
        content: `Supporting Soil Biology - Key Practices:
- Feed the soil food web by adding compost (not just feeding plants)
- Use organic fertilizers and amendments
- Keep beds planted year-round with ground cover
- Add 12-18 inches of compost when making new beds (up to 30% but not more)
- Disturb soil as little as possible once planted
- Leave roots when plants die
- Avoid overwatering and soil compaction
- Add 1-2 inches of leaf mold and compost yearly to soil surface
- Mulch year-round
- Use mycorrhizal fungal products (endomycorrhizal and ectomycorrhizal)`,
        metadata: { section: "Soil Biology", page: 2 },
      },
    ],
  },
  {
    name: "Irrigation Water Management Guide",
    chunks: [
      {
        content: `Irrigation Water Management (IWM) Overview:
IWM is the process of determining and controlling volume, frequency, and application rate of irrigation water.

Purposes of IWM:
- Improve irrigation water use efficiency
- Minimize irrigation-induced soil erosion
- Protect surface and ground water quality
- Manage salts in crop root zone
- Manage air, soil, or plant microclimate
- Improve plant productivity and health
- Reduce energy use`,
        metadata: { section: "Overview", page: 1 },
      },
      {
        content: `Irrigation Scheduling Methods:
Timing based on:
- Soil moisture monitoring techniques
- Soil moisture sensors
- Appearance and feel method
- Plant monitoring (critical growth stage)

Volume (depth) needed based on:
- Available water-holding capacity of soil for crop rooting depth
- Management Allowable Depletion (MAD)
- Current soil moisture status
- Current crop/forage growth stage
- Distribution uniformity of irrigation event`,
        metadata: { section: "Scheduling", page: 1 },
      },
      {
        content: `Crop Rooting Depths:
Shallow (6-12"): Beet, Broccoli, Carrot, Cauliflower, Celery, Greens, Herbs, Onion, Pepper, Radish, Spinach

Moderate (18-24"): Brussels sprouts, Cabbage, Cantaloupe, Cucumber, Eggplant, Pea, Potato, Snap bean, Summer squash, Sweet corn, Tomato

Deep (>36"): Asparagus, Lima bean, Pumpkin, Sweet potato, Watermelon, Winter squash`,
        metadata: { section: "Rooting Depth", page: 2 },
      },
      {
        content: `Available Water Holding Capacity (AWHC):
AWHC is the maximum amount of water soil can hold that plants can absorb. It's between field capacity and permanent wilting point.

Key facts:
- Depends on soil texture, organic matter, and rooting depth
- Coarse soils (sands) hold less water than fine soils (clays)
- Each 1% increase in organic matter in top 12" increases moisture-holding capacity by ~380 gallons per 1,000 square feet
- High AWHC soils need less frequent irrigation but more water per application
- Monitor between field capacity and wilting point`,
        metadata: { section: "AWHC", page: 2 },
      },
      {
        content: `Critical Growth Stages for Irrigation:
Most vegetables are sensitive during:
- Two to three weeks before harvest
- During harvest period

Crop-specific critical stages:
- Broccoli, Cabbage, Cauliflower, Lettuce: Head development
- Root vegetables (Carrot, Radish, Beet, Turnip, Sweet Potato): Root enlargement
- Sweet Corn: Silking, tasseling, and ear development
- Cucumber, Eggplant, Pepper, Melon, Tomato: Flowering, fruit set, and maturation
- Beans, Peas: Flowering, fruit set, and development
- Onion: Bulb development
- Potato: Tuber set and enlargement`,
        metadata: { section: "Critical Growth Stages", page: 3 },
      },
      {
        content: `Management Allowable Depletion (MAD):
MAD is the percentage of soil available water that can be depleted between irrigation events without plant stress.

Average MAD for Midwest vegetables:
- Shallow rooted crops: 25%
- Moderately rooted crops: 30%
- Deep rooted crops: 40%

Calculate irrigation timing by knowing MAD, soil texture, AWHC, crop rooting depth, and current growth stage.`,
        metadata: { section: "MAD", page: 3 },
      },
      {
        content: `Irrigation and Mulching:
Plastic mulch: Lay over moist soil, not permeable, use drip tape underneath
Landscaping fabric: Permeable but partially obstructs water, lay over moist soil, drip tape underneath recommended
Natural mulches (straw, hay, compost, wood chips): Improve moisture efficiency by moderating temperature and reducing evaporation

Important: Monitor soil moisture regularly with any mulch as it's hard to see moisture levels. Check for clogged drip tape.`,
        metadata: { section: "Mulching", page: 4 },
      },
      {
        content: `Water Quality Testing:
Irrigation water quality directly affects crops, soils, and environment. Testing prevents adverse impacts.

Minimum analysis should include:
- Alkalinity
- pH
- Soluble salts
- Hardness
- Heavy metals

Apply filters to irrigation system and/or amendments to water as needed based on results.`,
        metadata: { section: "Water Quality", page: 4 },
      },
    ],
  },
  {
    name: "Vegetable Garden Planting Guide",
    chunks: [
      {
        content: `Vegetable Yields per 10 feet of row:
- Beans (snap bush): 12 lb, plant 15-16 feet per person
- Tomatoes: 10 lb, plant 3-5 plants per person
- Lettuce (head): 10 heads, plant 10 feet per person
- Carrots: 10 lb, plant 5-10 feet per person
- Peppers: 6 lb, plant 3-5 plants per person
- Sweet corn: 1 dozen, plant 10-15 feet per person
- Cucumbers: 12 lb, plant 1-2 hills per person
- Squash (summer): 15 lb, plant 2-3 hills per person`,
        metadata: { section: "Yields", page: 1 },
      },
      {
        content: `Frost Resistance Classifications:
Hardy: Can withstand heavy frosts (asparagus, broccoli, cabbage, kale, peas, spinach, turnips)
Half-Hardy: Tolerate light frosts (beets, carrots, cauliflower, lettuce, potatoes)
Tender: Injured by frost (beans, corn, tomatoes)
Very Tender: Injured by cool weather (cucumbers, eggplant, melons, peppers, squash)`,
        metadata: { section: "Frost Resistance", page: 3 },
      },
      {
        content: `Planting Depths and Spacing:
Beans: 2" deep, 3-5" within row, 36" between rows
Tomatoes: Transplant, 24-36" within row, 36-48" between rows
Lettuce: 1/4" deep, 4-12" within row, 18-24" between rows
Carrots: 1/2" deep, 1-2" within row, 18" between rows
Peppers: Transplant, 12-24" within row, 36" between rows
Corn: 2" deep, 8-12" within row, 36" between rows`,
        metadata: { section: "Planting Info", page: 3 },
      },
      {
        content: `Days to Germination at Optimal Temperature:
- Beans: 5-8 days at 70-85°F
- Tomatoes: 7-10 days (transplant)
- Lettuce: 6-8 days at 50-70°F
- Carrots: 10-12 days at 55-70°F
- Peppers: 10-14 days (transplant)
- Corn: 6-8 days at 70-80°F
- Cucumbers: 5-8 days at 75-85°F
- Squash: 7-10 days at 75-85°F`,
        metadata: { section: "Germination", page: 3 },
      },
      {
        content: `Common Garden Problems and Solutions:
Plants stunted, yellow: Lack of fertility, abnormal pH, poor drainage, or insect/disease damage
Solution: Fertilize per soil test (3-4 lbs per 100 sq ft), modify soil with organic matter, use pest control

Holes in leaves: Insect damage
Solution: Use recommended insecticides

Plant disease spots: Fungal or bacterial disease
Solution: Use resistant varieties, remove diseased plants, regular spray program

Blossom end rot on tomatoes: Calcium deficiency from uneven watering
Solution: Maintain uniform soil moisture, avoid overwatering and excessive nitrogen`,
        metadata: { section: "Problems", page: 6 },
      },
      {
        content: `Tips for Successful Garden:
- Use mulches to conserve moisture and control weeds
- Keep plants free of insects and diseases
- Examine plants often for problems
- Keep weeds out
- Remove tomato suckers when 1-2 inches long
- Test soil every 3-4 years
- Apply fertilizer as recommended
- Thin plants when small
- Avoid working in garden when wet
- Wash sprayer well after each use`,
        metadata: { section: "Tips", page: 6 },
      },
    ],
  },
];

export async function populateDocuments(supabaseUrl: string, supabaseKey: string) {
  const allChunks = documents.flatMap((doc) =>
    doc.chunks.map((chunk) => ({
      document_name: doc.name,
      content: chunk.content,
      metadata: chunk.metadata,
    }))
  );

  console.log(`Preparing to store ${allChunks.length} document chunks...`);

  const response = await fetch(`${supabaseUrl}/functions/v1/store-documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ chunks: allChunks }),
  });

  const result = await response.json();
  console.log("Result:", result);
  return result;
}

// If running directly
if (import.meta.main) {
  const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL");
  const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
    Deno.exit(1);
  }

  await populateDocuments(supabaseUrl, supabaseKey);
}
