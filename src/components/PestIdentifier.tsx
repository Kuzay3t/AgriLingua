import { useState } from 'react';
import { ArrowLeft, Bug, Upload, Loader2, Camera, AlertCircle, Check } from 'lucide-react';

interface PestIdentifierProps {
  onBack: () => void;
}

interface AnalysisResult {
  diseaseName: string;
  likelyCause: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  prevention: string[];
  severity: string;
  additionalNotes: string;
}

export default function PestIdentifier({ onBack }: PestIdentifierProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pest-identifier`;
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
      setResult(data);
    } catch (err) {
      setError('Failed to identify pest or disease. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg">
              <Bug className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pest & Disease Identifier
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload a photo of your affected crop to identify pests or diseases and get treatment recommendations
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              {!selectedImage ? (
                <div className="space-y-6">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-gray-50 hover:bg-orange-50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>

                  <div className="flex items-center justify-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  <label
                    htmlFor="camera-upload"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold cursor-pointer hover:from-orange-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                    Take a Photo
                    <input
                      id="camera-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={selectedImage}
                      alt="Selected crop"
                      className="w-full h-96 object-cover"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setResult(null);
                        setError('');
                      }}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-md"
                    >
                      Change Photo
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  {!result && !loading && (
                    <button
                      onClick={handleAnalyze}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Analyze Image
                    </button>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Analyzing your image...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                      </div>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {result.diseaseName}
                        </h2>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                            Severity: {result.severity}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          <span className="font-semibold">Likely Cause:</span> {result.likelyCause}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </span>
                          Organic Treatment
                        </h3>
                        <ul className="space-y-2">
                          {result.organicTreatment.map((treatment, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-green-600 font-bold mt-1">•</span>
                              <span>{treatment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </span>
                          Chemical Treatment
                        </h3>
                        <ul className="space-y-2">
                          {result.chemicalTreatment.map((treatment, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-blue-600 font-bold mt-1">•</span>
                              <span>{treatment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </span>
                          Prevention Guide
                        </h3>
                        <ul className="space-y-2">
                          {result.prevention.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-purple-600 font-bold mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {result.additionalNotes && (
                        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Additional Notes</h3>
                          <p className="text-gray-700 leading-relaxed">{result.additionalNotes}</p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setResult(null);
                          setError('');
                        }}
                        className="w-full py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Analyze Another Image
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Tips for Best Results
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Take clear, well-lit photos of the affected area</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Focus on leaves, stems, or fruits showing symptoms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Include multiple angles if symptoms vary</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Avoid blurry or overly dark images</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
