import { useState } from 'react';
import { ArrowLeft, Droplets, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeSoilHealth, type SoilCharacteristics, type SoilHealthResult } from '../utils/soilHealthData';

interface SoilHealthCheckerProps {
  onBack: () => void;
}

export default function SoilHealthChecker({ onBack }: SoilHealthCheckerProps) {
  const [formData, setFormData] = useState<SoilCharacteristics>({
    color: '',
    texture: '',
    moisture: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilHealthResult | null>(null);

  const colors = [
    'Dark brown/black',
    'Medium brown',
    'Light brown/tan',
    'Red/orange',
    'Gray/pale'
  ];

  const textures = [
    'Smooth and silky',
    'Gritty and loose',
    'Sticky and dense',
    'Fine powder'
  ];

  const moistureLevels = [
    'Very dry and dusty',
    'Slightly moist',
    'Moist (holds shape)',
    'Very wet/waterlogged'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const analysis = analyzeSoilHealth(formData);
      setResult(analysis);
    } catch (error) {
      console.error('Error analyzing soil:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNutrientLevelColor = (level: string) => {
    if (level === 'High') return 'text-green-600';
    if (level === 'Medium') return 'text-blue-600';
    return 'text-amber-600';
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Soil Health Checker
            </h1>
            <p className="text-gray-600">
              Analyze your soil characteristics to understand its health and suitability
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  Soil Color
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select soil color</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">Look at your soil in natural daylight</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  Soil Texture
                </label>
                <select
                  value={formData.texture}
                  onChange={(e) => setFormData({ ...formData, texture: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select soil texture</option>
                  {textures.map((texture) => (
                    <option key={texture} value={texture}>
                      {texture}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">Rub moist soil between your fingers to feel the texture</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Droplets className="w-4 h-4" />
                  Moisture Level
                </label>
                <select
                  value={formData.moisture}
                  onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select moisture level</option>
                  {moistureLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">Check the current moisture state of your soil</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Soil...
                  </>
                ) : (
                  'Analyze Soil Health'
                )}
              </button>
            </form>

            {result && (
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Soil Analysis Results</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Identified Soil Type</span>
                      <p className="text-xl font-bold text-gray-900">{result.soilType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Health Score</span>
                      <div className="flex items-center gap-2">
                        <p className={`text-3xl font-bold ${getScoreColor(result.healthScore)}`}>
                          {result.healthScore}
                        </p>
                        <span className={`text-sm font-semibold ${getScoreColor(result.healthScore)}`}>
                          / 100 ({getScoreLabel(result.healthScore)})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        result.healthScore >= 80 ? 'bg-green-600' :
                        result.healthScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${result.healthScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrient Profile</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Nitrogen (N)</h4>
                        <span className={`font-bold ${getNutrientLevelColor(result.nutrientProfile.nitrogen.level)}`}>
                          {result.nutrientProfile.nitrogen.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.nutrientProfile.nitrogen.description}</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Phosphorus (P)</h4>
                        <span className={`font-bold ${getNutrientLevelColor(result.nutrientProfile.phosphorus.level)}`}>
                          {result.nutrientProfile.phosphorus.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.nutrientProfile.phosphorus.description}</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Potassium (K)</h4>
                        <span className={`font-bold ${getNutrientLevelColor(result.nutrientProfile.potassium.level)}`}>
                          {result.nutrientProfile.potassium.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.nutrientProfile.potassium.description}</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Organic Matter</h4>
                        <span className={`font-bold ${getNutrientLevelColor(result.nutrientProfile.organicMatter.level)}`}>
                          {result.nutrientProfile.organicMatter.level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.nutrientProfile.organicMatter.description}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">pH Level</h4>
                      <span className="font-bold text-blue-700">{result.nutrientProfile.ph.level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{result.nutrientProfile.ph.description}</p>
                  </div>
                </div>

                {result.concerns.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Concerns Identified
                    </h3>
                    <ul className="space-y-2">
                      {result.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-red-600 font-bold mt-1">•</span>
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-600 font-bold mt-1">{index + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Suitability Analysis</h3>
                  <div className="space-y-3">
                    {result.suitableCrops.map((crop, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getSuitabilityColor(crop.suitability)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{crop.crop}</h4>
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/50">
                            {crop.suitability}
                          </span>
                        </div>
                        <p className="text-sm">{crop.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Important Notes</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>This is a basic assessment. For precise analysis, conduct laboratory soil tests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Soil conditions can vary across your field - test multiple locations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Regular monitoring helps track improvements from your soil management practices</span>
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
