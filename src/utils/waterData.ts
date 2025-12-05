export interface WaterRequirements {
  crop: string;
  location: string;
  season: string;
  soilType: string;
  weatherPattern: string;
}

export interface IrrigationSchedule {
  when: string;
  duration: string;
  amount: string;
  reason: string;
}

export interface WaterOptimizationResult {
  dailyWaterNeed: string;
  irrigationFrequency: string;
  irrigationSchedule: IrrigationSchedule[];
  waterSavingTips: string[];
  recommendations: string[];
  cropWaterStages: {
    stage: string;
    waterNeed: string;
    importance: string;
  }[];
}

const cropWaterData: Record<string, {
  lowRequirement: number;
  moderateRequirement: number;
  highRequirement: number;
  criticalStages: string[];
}> = {
  'Maize': {
    lowRequirement: 3,
    moderateRequirement: 5,
    highRequirement: 8,
    criticalStages: ['Flowering', 'Grain filling']
  },
  'Rice': {
    lowRequirement: 5,
    moderateRequirement: 8,
    highRequirement: 12,
    criticalStages: ['Tillering', 'Flowering', 'Grain development']
  },
  'Tomato': {
    lowRequirement: 3,
    moderateRequirement: 5,
    highRequirement: 7,
    criticalStages: ['Flowering', 'Fruit development']
  },
  'Cassava': {
    lowRequirement: 2,
    moderateRequirement: 3,
    highRequirement: 5,
    criticalStages: ['First 3-4 months', 'Root bulking']
  },
  'Beans': {
    lowRequirement: 2,
    moderateRequirement: 4,
    highRequirement: 6,
    criticalStages: ['Flowering', 'Pod formation']
  },
  'Sweet Potato': {
    lowRequirement: 2,
    moderateRequirement: 4,
    highRequirement: 6,
    criticalStages: ['Vine development', 'Root enlargement']
  },
  'Cabbage': {
    lowRequirement: 3,
    moderateRequirement: 5,
    highRequirement: 7,
    criticalStages: ['Head formation', 'Head enlargement']
  },
  'Onion': {
    lowRequirement: 2,
    moderateRequirement: 4,
    highRequirement: 6,
    criticalStages: ['Bulb formation', 'Bulb enlargement']
  },
  'Pepper': {
    lowRequirement: 3,
    moderateRequirement: 4,
    highRequirement: 6,
    criticalStages: ['Flowering', 'Fruit setting']
  },
  'Banana': {
    lowRequirement: 5,
    moderateRequirement: 7,
    highRequirement: 10,
    criticalStages: ['Bunch formation', 'Fruit filling']
  }
};

export function optimizeWaterUsage(requirements: WaterRequirements): WaterOptimizationResult {
  const { crop, location, season, soilType, weatherPattern } = requirements;

  const cropData = cropWaterData[crop] || cropWaterData['Maize'];

  let baseWaterNeed = cropData.moderateRequirement;

  if (season === 'Dry season') {
    baseWaterNeed = cropData.highRequirement;
  } else if (season === 'Rainy season') {
    baseWaterNeed = cropData.lowRequirement;
  }

  if (soilType === 'Sandy') {
    baseWaterNeed *= 1.3;
  } else if (soilType === 'Clay') {
    baseWaterNeed *= 0.9;
  }

  if (weatherPattern === 'Very hot and dry') {
    baseWaterNeed *= 1.4;
  } else if (weatherPattern === 'Cool and humid') {
    baseWaterNeed *= 0.7;
  }

  const dailyWaterNeed = Math.round(baseWaterNeed * 10) / 10;

  const irrigationSchedule: IrrigationSchedule[] = [];
  let irrigationFrequency = '';

  if (season === 'Rainy season' && (weatherPattern === 'Regular rainfall' || weatherPattern === 'Cool and humid')) {
    irrigationFrequency = 'Minimal irrigation needed during rainy season';
    irrigationSchedule.push({
      when: 'Only during dry spells (7+ days without rain)',
      duration: '30-45 minutes',
      amount: `${Math.round(dailyWaterNeed * 7)} mm total`,
      reason: 'Supplement rainfall during extended dry periods'
    });
  } else if (soilType === 'Sandy') {
    irrigationFrequency = 'Every 2-3 days';
    irrigationSchedule.push(
      {
        when: 'Early morning (6-8 AM)',
        duration: '45-60 minutes',
        amount: `${Math.round(dailyWaterNeed * 2.5)} mm`,
        reason: 'Sandy soil drains quickly, needs frequent watering'
      },
      {
        when: 'Evening (5-7 PM) if very hot',
        duration: '30 minutes',
        amount: `${Math.round(dailyWaterNeed * 1.5)} mm`,
        reason: 'Additional water during peak heat stress'
      }
    );
  } else if (soilType === 'Clay') {
    irrigationFrequency = 'Every 5-7 days';
    irrigationSchedule.push({
      when: 'Early morning (6-8 AM)',
      duration: '90-120 minutes',
      amount: `${Math.round(dailyWaterNeed * 6)} mm`,
      reason: 'Clay soil retains moisture well, deep watering less often'
    });
  } else {
    irrigationFrequency = 'Every 3-4 days';
    irrigationSchedule.push(
      {
        when: 'Early morning (6-8 AM)',
        duration: '60 minutes',
        amount: `${Math.round(dailyWaterNeed * 3.5)} mm`,
        reason: 'Optimal time for water absorption'
      }
    );
  }

  const waterSavingTips: string[] = [
    'Apply mulch (grass, leaves, or plastic) to reduce evaporation by 50-70%',
    'Water early morning (5-8 AM) or evening (5-7 PM) to minimize evaporation losses',
    'Use drip irrigation or bottle drip system instead of overhead watering to save 30-50% water',
    'Check soil moisture before irrigating - water only when top 5-10cm is dry',
    'Create small basins around plants to prevent water runoff',
    'Harvest rainwater during wet season for use during dry periods',
    'Remove weeds regularly as they compete for water with crops',
    'Group crops with similar water needs together for efficient irrigation'
  ];

  const recommendations: string[] = [];

  if (soilType === 'Sandy') {
    recommendations.push('Add organic matter (compost, manure) to improve water retention in sandy soil');
    recommendations.push('Consider more frequent but lighter irrigation to prevent water loss through deep drainage');
  }

  if (soilType === 'Clay') {
    recommendations.push('Avoid overwatering clay soil as it can lead to waterlogging and root diseases');
    recommendations.push('Add organic matter and sand to improve drainage in clay soil');
  }

  if (season === 'Dry season') {
    recommendations.push('Install shade nets during extreme heat to reduce water stress on crops');
    recommendations.push('Apply mulch heavily (10-15cm thick) to conserve soil moisture');
    recommendations.push('Consider growing drought-tolerant crop varieties during extended dry seasons');
  }

  if (weatherPattern === 'Very hot and dry') {
    recommendations.push('Monitor crops daily for wilting signs, especially during midday');
    recommendations.push('Consider using shade cloth or intercropping to reduce heat stress');
  }

  if (crop === 'Rice') {
    recommendations.push('Maintain 5-10cm standing water during vegetative and reproductive stages');
    recommendations.push('Drain field 2 weeks before harvest to facilitate harvesting');
  }

  if (location.includes('arid') || weatherPattern === 'Very hot and dry') {
    recommendations.push('Explore deficit irrigation strategies - reduce water during non-critical growth stages');
    recommendations.push('Install moisture sensors or use finger test to check soil moisture before irrigating');
  }

  const cropWaterStages = cropData.criticalStages.map((stage, index) => ({
    stage,
    waterNeed: index === 0 ? 'Critical - Maximum water needed' : 'Critical - Do not stress plants',
    importance: 'Water stress during this stage can reduce yields by 30-60%'
  }));

  recommendations.push(`For ${crop}, prioritize irrigation during: ${cropData.criticalStages.join(', ')}`);

  return {
    dailyWaterNeed: `${dailyWaterNeed} mm/day (approximately ${Math.round(dailyWaterNeed * 10)} liters per 10 sq meters)`,
    irrigationFrequency,
    irrigationSchedule,
    waterSavingTips,
    recommendations,
    cropWaterStages
  };
}
