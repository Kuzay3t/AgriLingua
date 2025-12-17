import { Leaf, Camera, Mic } from 'lucide-react';
import WeatherDashboard from './WeatherDashboard';
import { useEffect, useState } from 'react';
import { t } from '../i18n/languageManager';

interface LandingPageProps {
  onStartChat: () => void;
  onOpenTools: () => void;
}

export default function LandingPage({ onStartChat, onOpenTools }: LandingPageProps) {
  const [uiText, setUiText] = useState({
    appTitle: 'AgriLingua',
    landingWelcome: 'Agricultural Advice, In Your Language',
    landingStartChat: 'Start Chatting',
    landingSmartTools: 'Smart Farming Tools',
    landingMultilingualSupport: 'Multilingual Support',
    landingMultilingualDesc: 'Communicate in Hausa, Yoruba, Igbo, or English. Get responses in your preferred language.',
    landingImageAnalysis: 'Image Analysis',
    landingImageDesc: 'Upload photos of your crops for instant disease detection and treatment advice.',
    landingVoiceInput: 'Voice Input',
    landingVoiceDesc: 'Record voice messages for hands-free communication while working in the field.',
    landingEmpowering: 'Empowering farmers with AI-driven agricultural knowledge',
    callAgriLingua: 'Call AgriLingua',
    callPhoneNumber: 'Call +1 (518) 263-7042',
    copyPhoneNumber: 'Copy Phone Number',
    phoneNumberCopied: 'Phone number copied to clipboard!',
    back: 'Back'
  });

  useEffect(() => {
    const handleLanguageChange = () => {
      setUiText({
        appTitle: t('appTitle'),
        landingWelcome: t('landingWelcome'),
        landingStartChat: t('landingStartChat'),
        landingSmartTools: t('landingSmartTools'),
        landingMultilingualSupport: t('landingMultilingualSupport'),
        landingMultilingualDesc: t('landingMultilingualDesc'),
        landingImageAnalysis: t('landingImageAnalysis'),
        landingImageDesc: t('landingImageDesc'),
        landingVoiceInput: t('landingVoiceInput'),
        landingVoiceDesc: t('landingVoiceDesc'),
        landingEmpowering: t('landingEmpowering'),
        callAgriLingua: t('callAgriLingua'),
        callPhoneNumber: t('callPhoneNumber'),
        copyPhoneNumber: t('copyPhoneNumber'),
        phoneNumberCopied: t('phoneNumberCopied'),
        back: t('back')
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

  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText('+15182637042');
    // Show a temporary confirmation message
    const originalText = uiText.copyPhoneNumber;
    setUiText(prev => ({ ...prev, copyPhoneNumber: uiText.phoneNumberCopied }));
    setTimeout(() => {
      setUiText(prev => ({ ...prev, copyPhoneNumber: originalText }));
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl mb-6 shadow-lg">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {uiText.landingWelcome.split(',')[0]},<br />
              <span className="text-emerald-600">{uiText.landingWelcome.split(',')[1]}</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {uiText.landingMultilingualDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onStartChat}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
              >
                <span className="text-2xl">💬</span>
                {uiText.landingStartChat}
              </button>
              <button
                onClick={onOpenTools}
                className="bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
              >
                <span className="text-2xl">🔧</span>
                {uiText.landingSmartTools}
              </button>
            </div>
            
            {/* Call AgriLingua Section */}
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-md max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                {uiText.callAgriLingua}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="tel:+15182637042"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
                >
                  <span className="text-xl">📞</span>
                  {uiText.callPhoneNumber}
                </a>
                <button
                  onClick={handleCopyPhoneNumber}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
                >
                  <span className="text-xl">📋</span>
                  {uiText.copyPhoneNumber}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <WeatherDashboard />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uiText.landingMultilingualSupport}
              </h3>
              <p className="text-gray-600">
                {uiText.landingMultilingualDesc}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uiText.landingImageAnalysis}
              </h3>
              <p className="text-gray-600">
                {uiText.landingImageDesc}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uiText.landingVoiceInput}
              </h3>
              <p className="text-gray-600">
                {uiText.landingVoiceDesc}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            {uiText.landingEmpowering}
          </p>
        </div>
      </footer>
    </div>
  );
}