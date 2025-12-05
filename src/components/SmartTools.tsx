import { useState } from 'react';
import { ArrowLeft, Calendar, Image, Bug, Leaf, Droplets, CloudRain, DollarSign } from 'lucide-react';
import CropPlanner from './CropPlanner';
import CropAnalyzer from './CropAnalyzer';
import PestIdentifier from './PestIdentifier';
import FertilizerPlanner from './FertilizerPlanner';
import SoilHealthChecker from './SoilHealthChecker';
import WaterOptimizer from './WaterOptimizer';
import MarketPrices from './MarketPrices';

interface SmartToolsProps {
  onBack: () => void;
}

type Tool = 'selection' | 'planner' | 'analyzer' | 'pest' | 'fertilizer' | 'soil' | 'water' | 'market';

export default function SmartTools({ onBack }: SmartToolsProps) {
  const [activeTool, setActiveTool] = useState<Tool>('selection');

  if (activeTool === 'planner') {
    return <CropPlanner onBack={() => setActiveTool('selection')} />;
  }

  if (activeTool === 'analyzer') {
    return <CropAnalyzer onBack={() => setActiveTool('selection')} />;
  }

  if (activeTool === 'pest') {
    return <PestIdentifier onBack={() => setActiveTool('selection')} />;
  }

  if (activeTool === 'fertilizer') {
    return <FertilizerPlanner onBack={() => setActiveTool('selection')} />;
  }

  if (activeTool === 'soil') {
    return <SoilHealthChecker onBack={() => setActiveTool('selection')} />;
  }

  if (activeTool === 'water') {
    return <WaterOptimizer onBack={() => setActiveTool('selection')} />;
  }

  if (activeTool === 'market') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => setActiveTool('selection')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Tools
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <MarketPrices />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Smart Farming Tools
            </h1>
            <p className="text-xl text-gray-600">
              Advanced tools to help you make better farming decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <button
              onClick={() => setActiveTool('planner')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Crop Planner
              </h2>
              <p className="text-gray-600 mb-4">
                Get personalized crop recommendations based on your location, soil type, and rainfall patterns.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  Best crops for your area
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  Optimal planting months
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  Expected challenges
                </li>
              </ul>
            </button>

            <button
              onClick={() => setActiveTool('analyzer')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Image className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Crop Analyzer
              </h2>
              <p className="text-gray-600 mb-4">
                Upload a photo of your crop to get instant health analysis and treatment recommendations.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  Health status detection
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  Nutrient deficiency analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  Treatment recommendations
                </li>
              </ul>
            </button>

            <button
              onClick={() => setActiveTool('pest')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bug className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Pest & Disease Identifier
              </h2>
              <p className="text-gray-600 mb-4">
                Upload a photo to identify pests or diseases and get treatment recommendations.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  Pest & disease identification
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  Organic & chemical treatments
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">✓</span>
                  Prevention guide
                </li>
              </ul>
            </button>

            <button
              onClick={() => setActiveTool('fertilizer')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Fertilizer Planner
              </h2>
              <p className="text-gray-600 mb-4">
                Get personalized fertilizer recommendations with application schedules and quantities.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">✓</span>
                  NPK recommendations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">✓</span>
                  Application schedule
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">✓</span>
                  Cost estimates
                </li>
              </ul>
            </button>

            <button
              onClick={() => setActiveTool('soil')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Soil Health Checker
              </h2>
              <p className="text-gray-600 mb-4">
                Analyze your soil characteristics to understand its health and crop suitability.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">✓</span>
                  Nutrient profile analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">✓</span>
                  Crop suitability ratings
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">✓</span>
                  Health recommendations
                </li>
              </ul>
            </button>

            <button
              onClick={() => setActiveTool('water')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CloudRain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Water Optimizer
              </h2>
              <p className="text-gray-600 mb-4">
                Get smart irrigation schedules and water-saving tips based on your crop and weather.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  When to irrigate
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  How much water needed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  Water-saving strategies
                </li>
              </ul>
            </button>

            <button
              onClick={() => setActiveTool('market')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Market Prices
              </h2>
              <p className="text-gray-600 mb-4">
                View current market prices for crops across major markets in Nigeria and Africa.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  Daily updated prices
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  Price trends & forecasts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  Best time to sell
                </li>
              </ul>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
