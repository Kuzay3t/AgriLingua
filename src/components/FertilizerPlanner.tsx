import { useState } from 'react';
import { ArrowLeft, Leaf, Loader2, Calendar, DollarSign, Package } from 'lucide-react';
import { generateFertilizerRecommendation, type FertilizerInput, type FertilizerRecommendation } from '../utils/fertilizerData';

interface FertilizerPlannerProps {
  onBack: () => void;
}

export default function FertilizerPlanner({ onBack }: FertilizerPlannerProps) {
  const [formData, setFormData] = useState<FertilizerInput>({
    cropType: '',
    soilType: '',
    fieldSize: 1,
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<FertilizerRecommendation | null>(null);

  const crops = [
    'Rice',
    'Maize (Corn)',
    'Cassava',
    'Yam',
    'Tomatoes',
    'Pepper',
    'Groundnut (Peanut)',
    'Beans'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = generateFertilizerRecommendation(formData);
      setRecommendation(result);
    } catch (error) {
      console.error('Error generating recommendation:', error);
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fertilizer Planner
            </h1>
            <p className="text-gray-600">
              Get personalized fertilizer recommendations for your crop
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Leaf className="w-4 h-4" />
                  Crop Type
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select crop type</option>
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Package className="w-4 h-4" />
                  Soil Type
                </label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                  <Calendar className="w-4 h-4" />
                  Field Size (Hectares)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.fieldSize}
                  onChange={(e) => setFormData({ ...formData, fieldSize: parseFloat(e.target.value) || 0.1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter the size of your field in hectares</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  'Get Fertilizer Plan'
                )}
              </button>
            </form>

            {recommendation && (
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Recommended Fertilizer
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Fertilizer Type:</span>
                      <span className="text-xl font-bold text-teal-700">{recommendation.fertilizerType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">NPK Ratio:</span>
                      <span className="text-lg font-semibold text-gray-900">{recommendation.npkRatio}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Per Hectare:</span>
                      <span className="text-lg font-semibold text-gray-900">{recommendation.quantityPerHectare}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-teal-200">
                      <span className="text-gray-700 font-medium">Total Quantity:</span>
                      <span className="text-xl font-bold text-teal-700">{recommendation.totalQuantity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Application Schedule
                  </h3>
                  <div className="space-y-3">
                    {recommendation.applicationSchedule.map((schedule, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{schedule.stage}</h4>
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {schedule.amount}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p><span className="font-medium">Timing:</span> {schedule.timing}</p>
                          <p><span className="font-medium">Method:</span> {schedule.method}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    Estimated Cost
                  </h3>
                  <p className="text-2xl font-bold text-amber-700">{recommendation.estimatedCost}</p>
                  <p className="text-sm text-gray-600 mt-2">Based on current market prices. Actual costs may vary by location and supplier.</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Additional Notes & Tips
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{recommendation.additionalNotes}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Important Reminders</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>Always conduct soil tests for precise nutrient recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>Apply fertilizers when soil is moist but not waterlogged</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>Split applications are more efficient than single large doses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>Store fertilizers in a cool, dry place away from moisture</span>
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
