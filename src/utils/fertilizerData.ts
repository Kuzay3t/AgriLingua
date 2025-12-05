export interface FertilizerInput {
  cropType: string;
  soilType: string;
  fieldSize: number;
}

export interface FertilizerRecommendation {
  fertilizerType: string;
  npkRatio: string;
  quantityPerHectare: string;
  totalQuantity: string;
  applicationSchedule: ApplicationSchedule[];
  additionalNotes: string;
  estimatedCost: string;
}

export interface ApplicationSchedule {
  stage: string;
  timing: string;
  amount: string;
  method: string;
}

const fertilizerDatabase: Record<string, {
  npk: string;
  kgPerHectare: number;
  schedule: ApplicationSchedule[];
  notes: string;
}> = {
  'Rice': {
    npk: '15-15-15',
    kgPerHectare: 400,
    schedule: [
      { stage: 'Basal Application', timing: 'At planting', amount: '50%', method: 'Broadcast and incorporate' },
      { stage: 'Tillering Stage', timing: '3-4 weeks after planting', amount: '25%', method: 'Top dressing' },
      { stage: 'Panicle Initiation', timing: '6-7 weeks after planting', amount: '25%', method: 'Top dressing' }
    ],
    notes: 'Add urea for nitrogen boost during vegetative stage. Consider zinc sulfate if deficiency symptoms appear.'
  },
  'Maize (Corn)': {
    npk: '20-10-10',
    kgPerHectare: 350,
    schedule: [
      { stage: 'At Planting', timing: 'During sowing', amount: '40%', method: 'Band placement near seed' },
      { stage: 'Knee-High Stage', timing: '4-5 weeks after planting', amount: '40%', method: 'Side dressing' },
      { stage: 'Tasseling', timing: '8-9 weeks after planting', amount: '20%', method: 'Top dressing' }
    ],
    notes: 'Maize is a heavy nitrogen feeder. Consider foliar feeding during critical growth stages.'
  },
  'Cassava': {
    npk: '15-15-15',
    kgPerHectare: 200,
    schedule: [
      { stage: 'At Planting', timing: 'During planting', amount: '50%', method: 'Apply in planting holes' },
      { stage: 'Early Growth', timing: '2-3 months after planting', amount: '50%', method: 'Ring application around plants' }
    ],
    notes: 'Cassava requires potassium for tuber development. Add organic matter to improve soil structure.'
  },
  'Yam': {
    npk: '12-12-17',
    kgPerHectare: 300,
    schedule: [
      { stage: 'At Planting', timing: 'During planting', amount: '40%', method: 'Apply in mounds' },
      { stage: 'Vegetative Stage', timing: '6-8 weeks after planting', amount: '40%', method: 'Side dressing' },
      { stage: 'Tuber Bulking', timing: '12-14 weeks after planting', amount: '20%', method: 'Top dressing' }
    ],
    notes: 'High potassium requirement for tuber development. Ensure adequate organic matter.'
  },
  'Tomatoes': {
    npk: '10-20-20',
    kgPerHectare: 450,
    schedule: [
      { stage: 'At Transplanting', timing: 'During transplanting', amount: '30%', method: 'Apply in transplant holes' },
      { stage: 'Early Growth', timing: '2 weeks after transplanting', amount: '30%', method: 'Side dressing' },
      { stage: 'Flowering', timing: 'At first flower', amount: '20%', method: 'Fertigation or foliar' },
      { stage: 'Fruit Development', timing: 'During fruiting', amount: '20%', method: 'Weekly fertigation' }
    ],
    notes: 'High phosphorus for root development and potassium for fruit quality. Consider calcium supplements to prevent blossom end rot.'
  },
  'Pepper': {
    npk: '10-20-20',
    kgPerHectare: 400,
    schedule: [
      { stage: 'At Transplanting', timing: 'During transplanting', amount: '30%', method: 'Apply in transplant holes' },
      { stage: 'Vegetative Stage', timing: '3 weeks after transplanting', amount: '35%', method: 'Side dressing' },
      { stage: 'Flowering & Fruiting', timing: 'At flowering', amount: '35%', method: 'Split into 2-3 applications' }
    ],
    notes: 'Balanced nutrition important. Avoid excessive nitrogen which promotes vegetative growth over fruiting.'
  },
  'Groundnut (Peanut)': {
    npk: '0-20-20',
    kgPerHectare: 200,
    schedule: [
      { stage: 'At Planting', timing: 'During sowing', amount: '100%', method: 'Broadcast and incorporate' }
    ],
    notes: 'As a legume, groundnut fixes nitrogen. Focus on phosphorus and potassium. Gypsum application improves pod development.'
  },
  'Beans': {
    npk: '0-20-20',
    kgPerHectare: 150,
    schedule: [
      { stage: 'At Planting', timing: 'During sowing', amount: '100%', method: 'Band placement or broadcast' }
    ],
    notes: 'Legume crop that fixes nitrogen. Phosphorus important for nodulation and root development.'
  }
};

const soilAdjustments: Record<string, number> = {
  'Clay Soil': 1.1,
  'Sandy Soil': 1.3,
  'Loamy Soil': 1.0,
  'Silt Soil': 1.05,
  'Peaty Soil': 0.9,
  'Chalky Soil': 1.15,
  'Not Sure': 1.1
};

export function generateFertilizerRecommendation(input: FertilizerInput): FertilizerRecommendation {
  const { cropType, soilType, fieldSize } = input;

  const cropData = fertilizerDatabase[cropType] || fertilizerDatabase['Maize (Corn)'];
  const soilMultiplier = soilAdjustments[soilType] || 1.1;

  const adjustedKgPerHectare = Math.round(cropData.kgPerHectare * soilMultiplier);
  const totalQuantity = Math.round(adjustedKgPerHectare * fieldSize);

  const estimatedCostPerKg = 250;
  const totalCost = totalQuantity * estimatedCostPerKg;

  let soilNotes = '';
  if (soilType === 'Sandy Soil') {
    soilNotes = ' Sandy soils require more frequent applications in smaller doses due to leaching. ';
  } else if (soilType === 'Clay Soil') {
    soilNotes = ' Clay soils retain nutrients well but may need lime to improve availability. ';
  } else if (soilType === 'Loamy Soil') {
    soilNotes = ' Your loamy soil is ideal for nutrient retention and plant uptake. ';
  }

  return {
    fertilizerType: `NPK ${cropData.npk}`,
    npkRatio: cropData.npk,
    quantityPerHectare: `${adjustedKgPerHectare} kg/hectare`,
    totalQuantity: `${totalQuantity} kg (for ${fieldSize} hectare${fieldSize > 1 ? 's' : ''})`,
    applicationSchedule: cropData.schedule,
    additionalNotes: cropData.notes + soilNotes,
    estimatedCost: `₦${totalCost.toLocaleString()} - ₦${Math.round(totalCost * 1.2).toLocaleString()}`
  };
}
