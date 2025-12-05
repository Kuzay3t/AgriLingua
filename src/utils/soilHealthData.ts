export interface SoilCharacteristics {
  color: string;
  texture: string;
  moisture: string;
}

export interface SoilHealthResult {
  soilType: string;
  healthScore: number;
  nutrientProfile: NutrientProfile;
  suitableCrops: CropSuitability[];
  recommendations: string[];
  concerns: string[];
}

export interface NutrientProfile {
  nitrogen: { level: string; description: string };
  phosphorus: { level: string; description: string };
  potassium: { level: string; description: string };
  organicMatter: { level: string; description: string };
  ph: { level: string; description: string };
}

export interface CropSuitability {
  crop: string;
  suitability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  notes: string;
}

export function analyzeSoilHealth(characteristics: SoilCharacteristics): SoilHealthResult {
  const { color, texture, moisture } = characteristics;

  let soilType = '';
  let healthScore = 70;
  const recommendations: string[] = [];
  const concerns: string[] = [];

  if (texture === 'Smooth and silky') {
    soilType = 'Loamy Soil';
    healthScore = 85;
  } else if (texture === 'Gritty and loose') {
    soilType = 'Sandy Soil';
    healthScore = 65;
    concerns.push('Low water retention capacity');
    recommendations.push('Add organic matter (compost, manure) to improve water retention');
    recommendations.push('Consider mulching to reduce moisture loss');
  } else if (texture === 'Sticky and dense') {
    soilType = 'Clay Soil';
    healthScore = 70;
    concerns.push('Poor drainage and aeration');
    recommendations.push('Add organic matter and sand to improve structure');
    recommendations.push('Avoid working soil when wet to prevent compaction');
  } else if (texture === 'Fine powder') {
    soilType = 'Silt Soil';
    healthScore = 75;
  }

  let nitrogenLevel = 'Medium';
  let phosphorusLevel = 'Medium';
  let potassiumLevel = 'Medium';
  let organicMatterLevel = 'Medium';
  let phLevel = 'Neutral (6.5-7.5)';

  if (color === 'Dark brown/black') {
    nitrogenLevel = 'High';
    organicMatterLevel = 'High';
    healthScore += 10;
    recommendations.push('Excellent organic matter content - maintain with regular composting');
  } else if (color === 'Light brown/tan') {
    nitrogenLevel = 'Low';
    organicMatterLevel = 'Low';
    healthScore -= 10;
    concerns.push('Low organic matter content');
    recommendations.push('Add compost, manure, or green manure crops to boost organic matter');
    recommendations.push('Consider cover cropping during fallow periods');
  } else if (color === 'Red/orange') {
    phosphorusLevel = 'High';
    potassiumLevel = 'Medium';
    phLevel = 'Slightly Acidic (5.5-6.5)';
    recommendations.push('Iron-rich soil - good for many crops but may need lime if too acidic');
  } else if (color === 'Gray/pale') {
    nitrogenLevel = 'Low';
    organicMatterLevel = 'Low';
    healthScore -= 15;
    concerns.push('Possible poor drainage or low nutrients');
    recommendations.push('Improve drainage if waterlogged');
    recommendations.push('Add organic amendments and balanced fertilizer');
  } else if (color === 'Medium brown') {
    healthScore += 5;
  }

  if (moisture === 'Very dry and dusty') {
    healthScore -= 10;
    concerns.push('Low moisture - crops may suffer water stress');
    recommendations.push('Implement irrigation system');
    recommendations.push('Use mulch to retain soil moisture');
  } else if (moisture === 'Slightly moist') {
    healthScore += 5;
  } else if (moisture === 'Moist (holds shape)') {
    healthScore += 10;
  } else if (moisture === 'Very wet/waterlogged') {
    healthScore -= 15;
    concerns.push('Excessive moisture - risk of root rot and poor aeration');
    recommendations.push('Improve drainage with ditches or raised beds');
    recommendations.push('Avoid planting until soil drains properly');
  }

  healthScore = Math.max(0, Math.min(100, healthScore));

  const nutrientProfile: NutrientProfile = {
    nitrogen: {
      level: nitrogenLevel,
      description: getNutrientDescription('nitrogen', nitrogenLevel)
    },
    phosphorus: {
      level: phosphorusLevel,
      description: getNutrientDescription('phosphorus', phosphorusLevel)
    },
    potassium: {
      level: potassiumLevel,
      description: getNutrientDescription('potassium', potassiumLevel)
    },
    organicMatter: {
      level: organicMatterLevel,
      description: getOrganicMatterDescription(organicMatterLevel)
    },
    ph: {
      level: phLevel,
      description: getPhDescription(phLevel)
    }
  };

  const suitableCrops = generateCropSuitability(soilType, color, texture, moisture);

  if (recommendations.length === 0) {
    recommendations.push('Maintain current soil management practices');
    recommendations.push('Conduct regular soil tests for precise nutrient management');
  }

  return {
    soilType,
    healthScore,
    nutrientProfile,
    suitableCrops,
    recommendations,
    concerns
  };
}

function getNutrientDescription(nutrient: string, level: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    nitrogen: {
      High: 'Excellent for leafy growth. Good for vegetables and grains.',
      Medium: 'Adequate for most crops. Supplement with fertilizer as needed.',
      Low: 'May limit plant growth. Apply nitrogen-rich fertilizers or organic matter.'
    },
    phosphorus: {
      High: 'Promotes strong root development and flowering.',
      Medium: 'Sufficient for normal crop development.',
      Low: 'May affect root growth and flowering. Apply phosphate fertilizers.'
    },
    potassium: {
      High: 'Excellent for fruit quality and disease resistance.',
      Medium: 'Adequate for most crops.',
      Low: 'May reduce yield and quality. Apply potash fertilizers.'
    }
  };
  return descriptions[nutrient]?.[level] || 'Normal range for plant growth.';
}

function getOrganicMatterDescription(level: string): string {
  const descriptions: Record<string, string> = {
    High: 'Excellent soil health. Good water retention and nutrient cycling.',
    Medium: 'Adequate organic matter. Maintain with regular additions.',
    Low: 'Needs improvement. Add compost, manure, or crop residues.'
  };
  return descriptions[level] || 'Organic matter supports soil life and structure.';
}

function getPhDescription(level: string): string {
  if (level.includes('Neutral')) {
    return 'Ideal pH for most crops. Nutrients are readily available.';
  } else if (level.includes('Acidic')) {
    return 'May limit nutrient availability. Consider lime application to raise pH.';
  } else if (level.includes('Alkaline')) {
    return 'Some nutrients may be less available. Consider sulfur to lower pH.';
  }
  return 'pH affects nutrient availability and microbial activity.';
}

function generateCropSuitability(
  soilType: string,
  color: string,
  texture: string,
  moisture: string
): CropSuitability[] {
  const crops: CropSuitability[] = [];

  if (texture === 'Smooth and silky') {
    crops.push(
      { crop: 'Maize', suitability: 'Excellent', notes: 'Thrives in loamy, well-drained soil' },
      { crop: 'Tomatoes', suitability: 'Excellent', notes: 'Perfect for vegetable production' },
      { crop: 'Beans', suitability: 'Excellent', notes: 'Good drainage and nutrient retention' },
      { crop: 'Pepper', suitability: 'Excellent', notes: 'Ideal soil structure' },
      { crop: 'Rice', suitability: 'Good', notes: 'Can adapt but prefers heavier soils' }
    );
  } else if (texture === 'Gritty and loose') {
    crops.push(
      { crop: 'Groundnut', suitability: 'Excellent', notes: 'Perfect for sandy, well-drained soil' },
      { crop: 'Cassava', suitability: 'Excellent', notes: 'Drought-tolerant, adapts to sandy soils' },
      { crop: 'Millet', suitability: 'Excellent', notes: 'Thrives in light, sandy soils' },
      { crop: 'Watermelon', suitability: 'Good', notes: 'Good drainage benefits fruit quality' },
      { crop: 'Maize', suitability: 'Fair', notes: 'Needs frequent irrigation and fertilization' }
    );
  } else if (texture === 'Sticky and dense') {
    crops.push(
      { crop: 'Rice', suitability: 'Excellent', notes: 'Ideal for water-retaining clay soils' },
      { crop: 'Yam', suitability: 'Good', notes: 'Can grow but needs good mound preparation' },
      { crop: 'Cocoa', suitability: 'Good', notes: 'Suitable if drainage is adequate' },
      { crop: 'Plantain', suitability: 'Good', notes: 'Tolerates heavy soils with organic matter' },
      { crop: 'Beans', suitability: 'Fair', notes: 'May struggle without drainage improvement' }
    );
  } else if (texture === 'Fine powder') {
    crops.push(
      { crop: 'Rice', suitability: 'Excellent', notes: 'Good water retention for paddy' },
      { crop: 'Vegetables', suitability: 'Good', notes: 'Fertile but may need drainage' },
      { crop: 'Maize', suitability: 'Good', notes: 'Grows well with good management' },
      { crop: 'Sorghum', suitability: 'Good', notes: 'Adapts to various soil types' }
    );
  }

  if (color === 'Dark brown/black') {
    crops.forEach(crop => {
      if (crop.suitability === 'Fair') crop.suitability = 'Good';
      if (crop.suitability === 'Good' && crop.crop !== 'Rice') crop.suitability = 'Excellent';
    });
  } else if (color === 'Light brown/tan' || color === 'Gray/pale') {
    crops.forEach(crop => {
      if (crop.suitability === 'Excellent') crop.suitability = 'Good';
    });
  }

  return crops.slice(0, 6);
}
