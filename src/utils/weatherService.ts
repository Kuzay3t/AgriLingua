export interface WeatherData {
  location: string;
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast: {
    date: string;
    day: string;
    temp: {
      min: number;
      max: number;
    };
    humidity: number;
    precipitation: number;
    description: string;
    icon: string;
  }[];
  alerts: {
    type: 'heatwave' | 'storm' | 'frost' | 'heavy-rain' | 'drought';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  farmingAdvice: {
    message: string;
    type: 'positive' | 'warning' | 'caution';
  }[];
  plantingWindows: {
    status: 'ideal' | 'good' | 'poor';
    message: string;
  };
}

export interface LocationData {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';

export async function getCurrentLocation(): Promise<LocationData> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    return {
      city: data.city || 'Lagos',
      country: data.country_name || 'Nigeria',
      lat: data.latitude || 6.5244,
      lon: data.longitude || 3.3792
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return {
      city: 'Lagos',
      country: 'Nigeria',
      lat: 6.5244,
      lon: 3.3792
    };
  }
}

export async function getWeatherData(lat: number, lon: number, locationName: string): Promise<WeatherData> {
  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    const forecastData = await forecastResponse.json();

    const dailyForecasts = processForecastData(forecastData.list);

    const alerts = generateAlerts(currentData, dailyForecasts);
    const farmingAdvice = generateFarmingAdvice(currentData, dailyForecasts);
    const plantingWindows = assessPlantingConditions(currentData, dailyForecasts);

    return {
      location: locationName,
      current: {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6),
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon
      },
      forecast: dailyForecasts,
      alerts,
      farmingAdvice,
      plantingWindows
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getMockWeatherData(locationName);
  }
}

function processForecastData(list: any[]): WeatherData['forecast'] {
  const dailyData: { [key: string]: any[] } = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateStr = date.toISOString().split('T')[0];

    if (!dailyData[dateStr]) {
      dailyData[dateStr] = [];
    }
    dailyData[dateStr].push(item);
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return Object.entries(dailyData)
    .slice(0, 7)
    .map(([dateStr, items]) => {
      const temps = items.map(item => item.main.temp);
      const precip = items.reduce((sum, item) => sum + (item.rain?.['3h'] || 0), 0);
      const avgHumidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;

      const middayItem = items[Math.floor(items.length / 2)];
      const date = new Date(dateStr);

      return {
        date: dateStr,
        day: days[date.getDay()],
        temp: {
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps))
        },
        humidity: Math.round(avgHumidity),
        precipitation: Math.round(precip * 10) / 10,
        description: middayItem.weather[0].description,
        icon: middayItem.weather[0].icon
      };
    });
}

function generateAlerts(current: any, forecast: any[]): WeatherData['alerts'] {
  const alerts: WeatherData['alerts'] = [];

  if (current.main.temp > 35) {
    alerts.push({
      type: 'heatwave',
      message: 'Extreme heat warning! Protect crops and ensure adequate irrigation.',
      severity: 'high'
    });
  }

  if (current.main.temp < 10) {
    alerts.push({
      type: 'frost',
      message: 'Low temperature alert! Risk of frost damage to sensitive crops.',
      severity: 'high'
    });
  }

  const totalRain = forecast.slice(0, 3).reduce((sum, day) => sum + day.precipitation, 0);
  if (totalRain > 50) {
    alerts.push({
      type: 'heavy-rain',
      message: 'Heavy rainfall expected in the next 3 days. Ensure proper drainage.',
      severity: 'medium'
    });
  }

  if (current.wind.speed > 10) {
    alerts.push({
      type: 'storm',
      message: 'Strong winds detected. Avoid spraying pesticides or fertilizers.',
      severity: 'medium'
    });
  }

  const avgRain = forecast.reduce((sum, day) => sum + day.precipitation, 0) / 7;
  if (avgRain < 2 && current.main.humidity < 40) {
    alerts.push({
      type: 'drought',
      message: 'Dry conditions ahead. Plan irrigation schedule carefully.',
      severity: 'medium'
    });
  }

  return alerts;
}

function generateFarmingAdvice(current: any, forecast: any[]): WeatherData['farmingAdvice'] {
  const advice: WeatherData['farmingAdvice'] = [];

  const todayRain = forecast[0]?.precipitation || 0;
  const tomorrowRain = forecast[1]?.precipitation || 0;

  if (todayRain < 1 && current.wind.speed < 5 && current.main.temp < 30) {
    advice.push({
      message: 'Perfect conditions for spraying pesticides and fertilizers',
      type: 'positive'
    });
  }

  if (todayRain > 10 || tomorrowRain > 10) {
    advice.push({
      message: 'Do not apply fertilizer - heavy rain will wash it away',
      type: 'warning'
    });
  }

  if (current.wind.speed > 7) {
    advice.push({
      message: 'High winds - postpone any spraying activities',
      type: 'warning'
    });
  }

  if (current.main.temp > 32) {
    advice.push({
      message: 'Very hot - water crops early morning or evening only',
      type: 'caution'
    });
  }

  if (forecast[0].humidity > 80 && current.main.temp > 25) {
    advice.push({
      message: 'High humidity - monitor crops for fungal diseases',
      type: 'caution'
    });
  }

  const nextWeekRain = forecast.slice(0, 7).reduce((sum, day) => sum + day.precipitation, 0);
  if (nextWeekRain < 5 && current.main.humidity < 50) {
    advice.push({
      message: 'Dry week ahead - plan irrigation and apply mulch',
      type: 'caution'
    });
  }

  if (advice.length === 0) {
    advice.push({
      message: 'Normal farming conditions - proceed with regular activities',
      type: 'positive'
    });
  }

  return advice;
}

function assessPlantingConditions(current: any, forecast: any[]): WeatherData['plantingWindows'] {
  const avgTemp = (current.main.temp + forecast.slice(0, 7).reduce((sum, day) => sum + (day.temp.max + day.temp.min) / 2, 0) / 7) / 2;
  const avgRain = forecast.slice(0, 7).reduce((sum, day) => sum + day.precipitation, 0);
  const avgHumidity = forecast.slice(0, 7).reduce((sum, day) => sum + day.humidity, 0) / 7;

  if (avgTemp >= 20 && avgTemp <= 30 && avgRain > 10 && avgRain < 100 && avgHumidity > 50) {
    return {
      status: 'ideal',
      message: 'Excellent planting conditions - good temperature, moisture, and humidity'
    };
  }

  if (avgTemp >= 18 && avgTemp <= 35 && avgRain > 5 && avgHumidity > 40) {
    return {
      status: 'good',
      message: 'Suitable for planting most crops - monitor moisture levels'
    };
  }

  if (avgTemp > 35 || avgTemp < 15) {
    return {
      status: 'poor',
      message: 'Temperature not optimal for planting - wait for better conditions'
    };
  }

  if (avgRain < 5) {
    return {
      status: 'poor',
      message: 'Insufficient rainfall - ensure irrigation is available before planting'
    };
  }

  return {
    status: 'good',
    message: 'Fair conditions - select appropriate crop varieties for current weather'
  };
}

function getMockWeatherData(locationName: string): WeatherData {
  return {
    location: locationName,
    current: {
      temp: 28,
      feelsLike: 30,
      humidity: 65,
      windSpeed: 12,
      description: 'partly cloudy',
      icon: '02d'
    },
    forecast: [
      {
        date: new Date().toISOString().split('T')[0],
        day: 'Today',
        temp: { min: 22, max: 30 },
        humidity: 65,
        precipitation: 2,
        description: 'partly cloudy',
        icon: '02d'
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        day: 'Tomorrow',
        temp: { min: 23, max: 31 },
        humidity: 70,
        precipitation: 5,
        description: 'light rain',
        icon: '10d'
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        day: 'Day 3',
        temp: { min: 21, max: 29 },
        humidity: 75,
        precipitation: 8,
        description: 'moderate rain',
        icon: '10d'
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        day: 'Day 4',
        temp: { min: 22, max: 28 },
        humidity: 68,
        precipitation: 3,
        description: 'scattered clouds',
        icon: '03d'
      },
      {
        date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
        day: 'Day 5',
        temp: { min: 23, max: 30 },
        humidity: 60,
        precipitation: 0,
        description: 'clear sky',
        icon: '01d'
      }
    ],
    alerts: [
      {
        type: 'heavy-rain',
        message: 'Moderate rainfall expected tomorrow. Ensure proper drainage.',
        severity: 'medium'
      }
    ],
    farmingAdvice: [
      {
        message: 'Good conditions for spraying tomorrow morning',
        type: 'positive'
      },
      {
        message: 'Postpone fertilizer application until after the rain',
        type: 'caution'
      }
    ],
    plantingWindows: {
      status: 'good',
      message: 'Suitable for planting most crops - monitor moisture levels'
    }
  };
}

export const popularLocations = [
  { name: 'Lagos, Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Kano, Nigeria', lat: 12.0022, lon: 8.5920 },
  { name: 'Abuja, Nigeria', lat: 9.0765, lon: 7.3986 },
  { name: 'Ibadan, Nigeria', lat: 7.3775, lon: 3.9470 },
  { name: 'Maseru, Lesotho', lat: -29.3167, lon: 27.4833 },
  { name: 'Nairobi, Kenya', lat: -1.2864, lon: 36.8172 },
  { name: 'Accra, Ghana', lat: 5.6037, lon: -0.1870 },
  { name: 'Kampala, Uganda', lat: 0.3476, lon: 32.5825 }
];
