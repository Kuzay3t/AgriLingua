import { useState, useEffect } from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  ThermometerSun,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import {
  getWeatherData,
  getCurrentLocation,
  popularLocations,
  type WeatherData,
  type LocationData
} from '../utils/weatherService';

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setSelectedLocation(`${location.city}, ${location.country}`);
      const data = await getWeatherData(location.lat, location.lon, `${location.city}, ${location.country}`);
      setWeatherData(data);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (name: string, lat: number, lon: number) => {
    setLoading(true);
    setShowLocationPicker(false);
    setSelectedLocation(name);

    try {
      const data = await getWeatherData(lat, lon, name);
      setWeatherData(data);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (icon: string, size: 'small' | 'large' = 'large') => {
    const sizeClass = size === 'small' ? 'w-8 h-8' : 'w-24 h-24';

    const iconMap: { [key: string]: JSX.Element } = {
      '01d': <Sun className={`${sizeClass} text-yellow-500`} />,
      '01n': <Sun className={`${sizeClass} text-gray-400`} />,
      '02d': <Cloud className={`${sizeClass} text-gray-400`} />,
      '02n': <Cloud className={`${sizeClass} text-gray-500`} />,
      '03d': <Cloud className={`${sizeClass} text-gray-500`} />,
      '03n': <Cloud className={`${sizeClass} text-gray-600`} />,
      '04d': <Cloud className={`${sizeClass} text-gray-600`} />,
      '04n': <Cloud className={`${sizeClass} text-gray-700`} />,
      '09d': <CloudRain className={`${sizeClass} text-blue-500`} />,
      '09n': <CloudRain className={`${sizeClass} text-blue-600`} />,
      '10d': <CloudRain className={`${sizeClass} text-blue-400`} />,
      '10n': <CloudRain className={`${sizeClass} text-blue-500`} />,
      '11d': <CloudRain className={`${sizeClass} text-gray-700`} />,
      '11n': <CloudRain className={`${sizeClass} text-gray-800`} />,
      '13d': <Cloud className={`${sizeClass} text-blue-200`} />,
      '13n': <Cloud className={`${sizeClass} text-blue-300`} />,
      '50d': <Wind className={`${sizeClass} text-gray-400`} />,
      '50n': <Wind className={`${sizeClass} text-gray-500`} />
    };

    return iconMap[icon] || <Cloud className={`${sizeClass} text-gray-400`} />;
  };

  const getAlertIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'heatwave': <ThermometerSun className="w-5 h-5" />,
      'frost': <ThermometerSun className="w-5 h-5" />,
      'storm': <Wind className="w-5 h-5" />,
      'heavy-rain': <CloudRain className="w-5 h-5" />,
      'drought': <Sun className="w-5 h-5" />
    };
    return iconMap[type] || <AlertTriangle className="w-5 h-5" />;
  };

  const getAlertColor = (severity: string) => {
    const colorMap: { [key: string]: string } = {
      'high': 'bg-red-100 border-red-300 text-red-800',
      'medium': 'bg-orange-100 border-orange-300 text-orange-800',
      'low': 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };
    return colorMap[severity] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getAdviceIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'positive': <CheckCircle className="w-5 h-5 text-green-600" />,
      'warning': <AlertTriangle className="w-5 h-5 text-red-600" />,
      'caution': <AlertCircle className="w-5 h-5 text-orange-600" />
    };
    return iconMap[type] || <AlertCircle className="w-5 h-5 text-gray-600" />;
  };

  const getAdviceColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'positive': 'bg-green-50 border-green-200',
      'warning': 'bg-red-50 border-red-200',
      'caution': 'bg-orange-50 border-orange-200'
    };
    return colorMap[type] || 'bg-gray-50 border-gray-200';
  };

  const getPlantingStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'ideal': 'bg-green-100 border-green-300 text-green-800',
      'good': 'bg-blue-100 border-blue-300 text-blue-800',
      'poor': 'bg-red-100 border-red-300 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Local Weather Hub</h2>
            <p className="text-sm text-gray-600">Real-time farming conditions</p>
          </div>
        </div>
        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-blue-200 hover:border-blue-400 transition-colors"
        >
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">{selectedLocation}</span>
        </button>
      </div>

      {showLocationPicker && (
        <div className="mb-6 bg-white rounded-xl p-4 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Select Location</h3>
          <div className="grid grid-cols-2 gap-2">
            {popularLocations.map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleLocationChange(loc.name, loc.lat, loc.lon)}
                className="text-left px-3 py-2 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors text-sm"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              7-Day Forecast
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {weatherData.forecast.map((day, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100"
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.day}
                    </p>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.icon, 'small')}
                    </div>
                    <p className="text-xs text-gray-600 capitalize mb-2">{day.description}</p>
                    <div className="flex justify-center items-center gap-1 mb-2">
                      <span className="text-lg font-bold text-gray-900">{day.temp.max}°</span>
                      <span className="text-sm text-gray-500">{day.temp.min}°</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                      <Droplets className="w-3 h-3" />
                      <span>{day.precipitation}mm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {weatherData.farmingAdvice.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Farming Advice Today
              </h3>
              <div className="space-y-3">
                {weatherData.farmingAdvice.map((advice, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${getAdviceColor(advice.type)}`}
                  >
                    {getAdviceIcon(advice.type)}
                    <p className="text-sm font-medium text-gray-900">{advice.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`rounded-xl p-6 border-2 ${getPlantingStatusColor(weatherData.plantingWindows.status)}`}>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Planting Window Status
            </h3>
            <p className="text-sm font-medium uppercase mb-1">{weatherData.plantingWindows.status}</p>
            <p className="text-sm">{weatherData.plantingWindows.message}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Conditions</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-600">Temperature</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{weatherData.current.temp}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThermometerSun className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">Feels Like</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{weatherData.current.feelsLike}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Humidity</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{weatherData.current.humidity}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Wind Speed</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{weatherData.current.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          {weatherData.alerts.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Weather Alerts
              </h3>
              <div className="space-y-3">
                {weatherData.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                  >
                    {getAlertIcon(alert.type)}
                    <p className="text-xs font-medium">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-xs text-gray-600 text-center">
          Weather data updates every hour. Forecasts and advice are tailored for agricultural activities.
        </p>
      </div>
    </div>
  );
}
