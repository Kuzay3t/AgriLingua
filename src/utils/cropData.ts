export interface CropData {
  soils: string[];
  rainfall: string[];
  months: string[];
  challenges: string[];
}

export const cropDatabase: Record<string, CropData> = {
  'Rice': {
    soils: ['Clay Soil', 'Loamy Soil', 'Silt Soil'],
    rainfall: ['High (1500-2000mm/year)', 'Very High (above 2000mm/year)'],
    months: ['April', 'May', 'June', 'July'],
    challenges: ['Rice blast disease', 'Stem borers', 'Flooding management'],
  },
  'Maize (Corn)': {
    soils: ['Loamy Soil', 'Sandy Soil', 'Clay Soil'],
    rainfall: ['Moderate (1000-1500mm/year)', 'High (1500-2000mm/year)'],
    months: ['March', 'April', 'May', 'August'],
    challenges: ['Fall armyworm', 'Streak virus', 'Drought stress'],
  },
  'Cassava': {
    soils: ['Sandy Soil', 'Loamy Soil'],
    rainfall: ['Moderate (1000-1500mm/year)', 'High (1500-2000mm/year)'],
    months: ['March', 'April', 'May'],
    challenges: ['Cassava mosaic disease', 'Mealybugs', 'Poor soil fertility'],
  },
  'Yam': {
    soils: ['Loamy Soil', 'Sandy Soil'],
    rainfall: ['Moderate (1000-1500mm/year)', 'High (1500-2000mm/year)'],
    months: ['March', 'April', 'May'],
    challenges: ['Yam anthracnose', 'Nematodes', 'Storage pests'],
  },
  'Millet': {
    soils: ['Sandy Soil', 'Loamy Soil'],
    rainfall: ['Very Low (less than 500mm/year)', 'Low (500-1000mm/year)', 'Moderate (1000-1500mm/year)'],
    months: ['June', 'July', 'August'],
    challenges: ['Birds damage', 'Drought', 'Low soil fertility'],
  },
  'Sorghum': {
    soils: ['Clay Soil', 'Loamy Soil', 'Sandy Soil'],
    rainfall: ['Low (500-1000mm/year)', 'Moderate (1000-1500mm/year)'],
    months: ['May', 'June', 'July'],
    challenges: ['Striga weed', 'Birds', 'Grain mold'],
  },
  'Groundnut (Peanut)': {
    soils: ['Sandy Soil', 'Loamy Soil'],
    rainfall: ['Low (500-1000mm/year)', 'Moderate (1000-1500mm/year)'],
    months: ['April', 'May', 'June'],
    challenges: ['Rosette disease', 'Leaf spot', 'Aflatoxin contamination'],
  },
  'Beans': {
    soils: ['Loamy Soil', 'Clay Soil'],
    rainfall: ['Moderate (1000-1500mm/year)', 'High (1500-2000mm/year)'],
    months: ['March', 'April', 'August', 'September'],
    challenges: ['Bean beetle', 'Root rot', 'Pod borer'],
  },
  'Tomatoes': {
    soils: ['Loamy Soil', 'Sandy Soil'],
    rainfall: ['Moderate (1000-1500mm/year)'],
    months: ['November', 'December', 'January', 'February'],
    challenges: ['Late blight', 'Tomato yellow leaf curl virus', 'Fruit fly'],
  },
  'Pepper': {
    soils: ['Loamy Soil', 'Sandy Soil'],
    rainfall: ['Moderate (1000-1500mm/year)', 'High (1500-2000mm/year)'],
    months: ['March', 'April', 'May'],
    challenges: ['Bacterial wilt', 'Aphids', 'Fruit rot'],
  },
  'Cocoa': {
    soils: ['Loamy Soil', 'Clay Soil'],
    rainfall: ['High (1500-2000mm/year)', 'Very High (above 2000mm/year)'],
    months: ['May', 'June', 'July'],
    challenges: ['Black pod disease', 'Capsid bugs', 'Swollen shoot virus'],
  },
  'Oil Palm': {
    soils: ['Loamy Soil', 'Clay Soil'],
    rainfall: ['Very High (above 2000mm/year)', 'High (1500-2000mm/year)'],
    months: ['March', 'April', 'May'],
    challenges: ['Bud rot', 'Rhinoceros beetle', 'Leaf spot'],
  },
  'Onions': {
    soils: ['Loamy Soil', 'Sandy Soil'],
    rainfall: ['Low (500-1000mm/year)', 'Moderate (1000-1500mm/year)'],
    months: ['October', 'November', 'December'],
    challenges: ['Purple blotch', 'Thrips', 'Downy mildew'],
  },
  'Plantain': {
    soils: ['Loamy Soil', 'Clay Soil'],
    rainfall: ['High (1500-2000mm/year)', 'Very High (above 2000mm/year)'],
    months: ['March', 'April', 'May', 'June'],
    challenges: ['Black sigatoka', 'Weevils', 'Nematodes'],
  },
  'Banana': {
    soils: ['Loamy Soil', 'Clay Soil'],
    rainfall: ['High (1500-2000mm/year)', 'Very High (above 2000mm/year)'],
    months: ['March', 'April', 'May', 'June'],
    challenges: ['Panama disease', 'Weevils', 'Leaf spot'],
  },
};

export interface FormData {
  location: string;
  soilType: string;
  rainfall: string;
  cropInterest: string;
}

export interface Recommendation {
  bestCrops: string[];
  plantingMonths: string[];
  challenges: string[];
  additionalTips: string;
}

export function generateRecommendations(formData: FormData): Recommendation {
  const { location, soilType, rainfall, cropInterest } = formData;
  const bestCrops: string[] = [];

  if (cropInterest && cropInterest !== 'Not Sure' && cropDatabase[cropInterest]) {
    bestCrops.push(cropInterest);
  }

  for (const [crop, data] of Object.entries(cropDatabase)) {
    if (bestCrops.includes(crop)) continue;

    const soilMatch = soilType === 'Not Sure' || data.soils.includes(soilType);
    const rainfallMatch = data.rainfall.includes(rainfall);

    if (soilMatch && rainfallMatch) {
      bestCrops.push(crop);
    }
  }

  if (bestCrops.length === 0) {
    for (const [crop, data] of Object.entries(cropDatabase)) {
      if (data.soils.includes(soilType) || soilType === 'Not Sure') {
        bestCrops.push(crop);
        if (bestCrops.length >= 3) break;
      }
    }
  }

  const primaryCrop = cropInterest !== 'Not Sure' && cropDatabase[cropInterest]
    ? cropInterest
    : bestCrops[0];

  const cropData = cropDatabase[primaryCrop] || cropDatabase['Maize (Corn)'];

  const plantingMonths = cropData.months;
  const challenges = cropData.challenges;

  let additionalTips = `For ${location} state, ensure you: `;

  if (rainfall.includes('Low') || rainfall.includes('Very Low')) {
    additionalTips += 'Consider irrigation systems, mulching to retain moisture. ';
  } else if (rainfall.includes('High') || rainfall.includes('Very High')) {
    additionalTips += 'Ensure good drainage systems, consider raised beds. ';
  }

  if (soilType === 'Sandy Soil') {
    additionalTips += 'Add organic matter regularly to improve water retention and fertility. ';
  } else if (soilType === 'Clay Soil') {
    additionalTips += 'Work on improving drainage and avoid working soil when wet. ';
  } else if (soilType === 'Loamy Soil') {
    additionalTips += 'Your soil is ideal for most crops - maintain fertility with proper fertilization. ';
  }

  additionalTips += 'Always test soil pH and conduct regular pest monitoring.';

  return {
    bestCrops: bestCrops.slice(0, 5),
    plantingMonths,
    challenges,
    additionalTips,
  };
}
