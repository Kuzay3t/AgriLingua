import { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface CropAnalyzerProps {
  onBack: () => void;
}

interface AnalysisResult {
  healthStatus: string;
  confidence: number;
  issues: string[];
  recommendations: string[];
  nutrientDeficiencies: string[];
}

export default function CropAnalyzer({ onBack }: CropAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError('');
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crop-analyzer`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: selectedImage }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze the image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getHealthStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('healthy') || lowerStatus.includes('good')) return 'text-green-600';
    if (lowerStatus.includes('moderate') || lowerStatus.includes('fair')) return 'text-yellow-600';
    return 'text-red-600';
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crop Analyzer
            </h1>
            <p className="text-gray-600">
              Upload a photo of your crop for instant health analysis
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Crop Image
                </h3>
                <p className="text-gray-600 mb-4">
                  Click to browse or drag and drop your image here
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG (Max 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected crop"
                    className="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {!analysis && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Analyze Crop Health
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {analysis && (
              <div className="mt-8 pt-8 border-t border-gray-200 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    Health Status
                  </h3>
                  <p className={`text-2xl font-bold ${getHealthStatusColor(analysis.healthStatus)}`}>
                    {analysis.healthStatus}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Confidence</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(analysis.confidence)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {analysis.issues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Detected Issues
                    </h3>
                    <ul className="space-y-2">
                      {analysis.issues.map((issue, index) => (
                        <li
                          key={index}
                          className="bg-red-50 border border-red-200 rounded-lg p-3 text-gray-700"
                        >
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.nutrientDeficiencies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-amber-600">⚗️</span>
                      Nutrient Deficiencies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.nutrientDeficiencies.map((nutrient, index) => (
                        <span
                          key={index}
                          className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium"
                        >
                          {nutrient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <li
                          key={index}
                          className="bg-green-50 border border-green-200 rounded-lg p-3 text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-green-600 font-bold flex-shrink-0">{index + 1}.</span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setAnalysis(null);
                    handleRemoveImage();
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Analyze Another Image
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
