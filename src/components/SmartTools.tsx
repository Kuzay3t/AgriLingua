import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Leaf, Droplets } from 'lucide-react';
import CropPlanner from './CropPlanner';
import FertilizerPlanner from './FertilizerPlanner';
import SoilHealthChecker from './SoilHealthChecker';
import { t } from '../i18n/languageManager';

interface SmartToolsProps {
  onBack: () => void;
}

type Tool = 'selection' | 'planner' | 'fertilizer' | 'soil';

export default function SmartTools({ onBack }: SmartToolsProps) {
  const [activeTool, setActiveTool] = useState<Tool>('selection');
  const [uiText, setUiText] = useState({
    toolsTitle: 'Smart Farming Tools',
    toolsSubtitle: 'Advanced tools to help you make better farming decisions',
    toolsBack: 'Back to Home',
    toolsCropPlanner: 'Crop Planner',
    toolsCropPlannerDesc: 'Get personalized crop recommendations based on your location, soil type, and rainfall patterns.',
    toolsBestCrops: 'Best crops for your area',
    toolsOptimalPlanting: 'Optimal planting months',
    toolsExpectedChallenges: 'Expected challenges',
    toolsFertilizerPlanner: 'Fertilizer Planner',
    toolsFertilizerPlannerDesc: 'Get personalized fertilizer recommendations with application schedules and quantities.',
    toolsNPK: 'NPK recommendations',
    toolsApplication: 'Application schedule',
    toolsCostEstimates: 'Cost estimates',
    toolsSoilHealth: 'Soil Health Checker',
    toolsSoilHealthDesc: 'Analyze your soil characteristics to understand its health and crop suitability.',
    toolsNutrientProfile: 'Nutrient profile analysis',
    toolsCropSuitability: 'Crop suitability ratings',
    toolsHealthRecommendations: 'Health recommendations',
  });

  useEffect(() => {
    const handleLanguageChange = () => {
      setUiText({
        toolsTitle: t('toolsTitle'),
        toolsSubtitle: t('toolsSubtitle'),
        toolsBack: t('toolsBack'),
        toolsCropPlanner: t('toolsCropPlanner'),
        toolsCropPlannerDesc: t('toolsCropPlannerDesc'),
        toolsBestCrops: t('toolsBestCrops'),
        toolsOptimalPlanting: t('toolsOptimalPlanting'),
        toolsExpectedChallenges: t('toolsExpectedChallenges'),
        toolsFertilizerPlanner: t('toolsFertilizerPlanner'),
        toolsFertilizerPlannerDesc: t('toolsFertilizerPlannerDesc'),
        toolsNPK: t('toolsNPK'),
        toolsApplication: t('toolsApplication'),
        toolsCostEstimates: t('toolsCostEstimates'),
        toolsSoilHealth: t('toolsSoilHealth'),
        toolsSoilHealthDesc: t('toolsSoilHealthDesc'),
        toolsNutrientProfile: t('toolsNutrientProfile'),
        toolsCropSuitability: t('toolsCropSuitability'),
        toolsHealthRecommendations: t('toolsHealthRecommendations'),
      });
    };

    // Listen for language changes
    window.addEventListener('agri:lang-changed', handleLanguageChange);
    
    // Set initial text
    handleLanguageChange();
    
    return () => {
      window.removeEventListener('agri:lang-changed', handleLanguageChange);
    };
  }, []);

  if (activeTool === 'planner') return <CropPlanner onBack={() => setActiveTool('selection')} />;
  if (activeTool === 'fertilizer') return <FertilizerPlanner onBack={() => setActiveTool('selection')} />;
  if (activeTool === 'soil') return <SoilHealthChecker onBack={() => setActiveTool('selection')} />;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {uiText.toolsBack}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {uiText.toolsTitle}
            </h1>
            <p className="text-xl text-gray-600">
              {uiText.toolsSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* planner */}
            <button
              onClick={() => setActiveTool('planner')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {uiText.toolsCropPlanner}
              </h2>
              <p className="text-gray-600 mb-4">
                {uiText.toolsCropPlannerDesc}
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  {uiText.toolsBestCrops}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  {uiText.toolsOptimalPlanting}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  {uiText.toolsExpectedChallenges}
                </li>
              </ul>
            </button>

            {/* fertilizer */}
            <button
              onClick={() => setActiveTool('fertilizer')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {uiText.toolsFertilizerPlanner}
              </h2>
              <p className="text-gray-600 mb-4">
                {uiText.toolsFertilizerPlannerDesc}
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">✓</span>
                  {uiText.toolsNPK}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">✓</span>
                  {uiText.toolsApplication}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-1">✓</span>
                  {uiText.toolsCostEstimates}
                </li>
              </ul>
            </button>

            {/* soil */}
            <button
              onClick={() => setActiveTool('soil')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-left group"
            >
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {uiText.toolsSoilHealth}
              </h2>
              <p className="text-gray-600 mb-4">
                {uiText.toolsSoilHealthDesc}
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">✓</span>
                  {uiText.toolsNutrientProfile}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">✓</span>
                  {uiText.toolsCropSuitability}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">✓</span>
                  {uiText.toolsHealthRecommendations}
                </li>
              </ul>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}