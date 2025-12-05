import { useState } from 'react';
import { ArrowLeft, Calendar, Loader2, MapPin, Droplets, Leaf } from 'lucide-react';
import { generateRecommendations, type FormData, type Recommendation } from '../utils/cropData';

interface CropPlannerProps {
  onBack: () => void;
}

export default function CropPlanner({ onBack }: CropPlannerProps) {
  const [formData, setFormData] = useState<FormData>({
    location: '',
    soilType: '',
    rainfall: '',
    cropInterest: '',
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState('');

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ];

  const soilTypes = [
    'Clay Soil',
    'Sandy Soil',
    'Loamy Soil',
    'Silt Soil',
    'Peaty Soil',
    'Chalky Soil',
    'Not Sure'
  ];

  const rainfallPatterns = [
    'Very Low (less than 500mm/year)',
    'Low (500-1000mm/year)',
    'Moderate (1000-1500mm/year)',
    'High (1500-2000mm/year)',
    'Very High (above 2000mm/year)'
  ];

  const crops = [
    'Rice',
    'Maize (Corn)',
    'Cassava',
    'Yam',
    'Millet',
    'Sorghum',
    'Beans',
    'Groundnut (Peanut)',
    'Cocoa',
    'Oil Palm',
    'Tomatoes',
    'Pepper',
    'Onions',
    'Plantain',
    'Banana',
    'Not Sure'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const recommendations = generateRecommendations(formData);
      setRecommendation(recommendations);
    } catch (err) {
      setError('Failed to get crop recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crop Planner
            </h1>
            <p className="text-gray-600">
              Get personalized crop recommendations for your farm
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Location (State)
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select your state</option>
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Leaf className="w-4 h-4" />
                  Soil Type
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select soil type</option>
                  {soilTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Droplets className="w-4 h-4" />
                  Rainfall Pattern
                </label>
                <select
                  value={formData.rainfall}
                  onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select rainfall pattern</option>
                  {rainfallPatterns.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {pattern}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Crop Interest
                </label>
                <select
                  value={formData.cropInterest}
                  onChange={(e) => setFormData({ ...formData, cropInterest: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select crop of interest</option>
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Get Recommendations'
                )}
              </button>
            </form>

            {recommendation && (
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Best Crops for Your Area
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.bestCrops.map((crop, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-600">📅</span>
                    Best Planting Months
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.plantingMonths.map((month, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-amber-600">⚠</span>
                    Expected Challenges
                  </h3>
                  <ul className="space-y-2">
                    {recommendation.challenges.map((challenge, index) => (
                      <li key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-gray-700">
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {recommendation.additionalTips && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-emerald-600">💡</span>
                      Additional Tips
                    </h3>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-gray-700">
                      {recommendation.additionalTips}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
