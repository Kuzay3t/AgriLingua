import { useState } from 'react';
import { ArrowLeft, Droplets, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { optimizeWaterUsage, type WaterRequirements, type WaterOptimizationResult } from '../utils/waterData';

interface WaterOptimizerProps {
  onBack: () => void;
}

export default function WaterOptimizer({ onBack }: WaterOptimizerProps) {
  const [formData, setFormData] = useState<WaterRequirements>({
    crop: '',
    location: '',
    season: '',
    soilType: '',
    weatherPattern: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterOptimizationResult | null>(null);

  const crops = [
    'Maize',
    'Rice',
    'Tomato',
    'Cassava',
    'Beans',
    'Sweet Potato',
    'Cabbage',
    'Onion',
    'Pepper',
    'Banana'
  ];

  const locations = [
    'Coastal region',
    'Highland area',
    'Lowland/valley',
    'Semi-arid region',
    'Humid tropical zone'
  ];

  const seasons = [
    'Rainy season',
    'Dry season',
    'Transition period'
  ];

  const soilTypes = [
    'Sandy',
    'Loam',
    'Clay',
    'Sandy loam'
  ];

  const weatherPatterns = [
    'Regular rainfall',
    'Intermittent rainfall',
    'Very hot and dry',
    'Cool and humid',
    'Moderate conditions'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const optimization = optimizeWaterUsage(formData);
      setResult(optimization);
    } catch (error) {
      console.error('Error optimizing water usage:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tools
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Water & Irrigation Optimizer
            </h1>
            <p className="text-gray-600">
              Get smart irrigation schedules and water-saving recommendations
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Crop Type
                </label>
                <select
                  value={formData.crop}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select your crop</option>
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Location Type
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select your location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Current Season
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select current season</option>
                  {seasons.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Soil Type
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select soil type</option>
                  {soilTypes.map((soilType) => (
                    <option key={soilType} value={soilType}>
                      {soilType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Weather Pattern
                </label>
                <select
                  value={formData.weatherPattern}
                  onChange={(e) => setFormData({ ...formData, weatherPattern: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select weather pattern</option>
                  {weatherPatterns.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {pattern}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">Based on recent weather conditions in your area</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Droplets className="w-5 h-5" />
                    Optimize Water Usage
                  </>
                )}
              </button>
            </form>

            {result && (
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    Water Requirements
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Daily Water Need</span>
                      <p className="text-xl font-bold text-blue-900">{result.dailyWaterNeed}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Irrigation Frequency</span>
                      <p className="text-xl font-bold text-blue-900">{result.irrigationFrequency}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-600" />
                    Irrigation Schedule
                  </h3>
                  <div className="space-y-3">
                    {result.irrigationSchedule.map((schedule, index) => (
                      <div key={index} className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{schedule.when}</h4>
                            <p className="text-sm text-gray-600 mt-1">Duration: {schedule.duration}</p>
                          </div>
                          <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {schedule.amount}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{schedule.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {result.cropWaterStages.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Critical Water Stages for {formData.crop}
                    </h3>
                    <div className="space-y-3">
                      {result.cropWaterStages.map((stage, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                          <h4 className="font-semibold text-gray-900 mb-1">{stage.stage}</h4>
                          <p className="text-sm text-orange-800 font-medium mb-1">{stage.waterNeed}</p>
                          <p className="text-sm text-gray-600">{stage.importance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Water-Saving Tips
                  </h3>
                  <ul className="space-y-2">
                    {result.waterSavingTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 font-bold mt-1">{index + 1}.</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Recommendations for Your Conditions
                    </h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Important Notes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Adjust irrigation based on actual rainfall - monitor weather forecasts regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Check soil moisture before irrigating using the finger test (insert finger 5-10cm deep)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Water requirements vary by crop growth stage - increase during flowering and fruiting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Overwatering can be as harmful as under-watering - watch for signs of waterlogging</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
