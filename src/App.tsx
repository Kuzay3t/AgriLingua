import { useState, useEffect } from 'react';
import { Leaf, ArrowLeft } from 'lucide-react';
import LandingPage from './components/LandingPage';
import ChatBot from './components/ChatBot';
import SmartTools from './components/SmartTools';
import { getCurrentLangLabel, setAppLanguage, t, SUPPORTED_LANGUAGES } from './i18n/languageManager';

type View = 'landing' | 'chat' | 'tools';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentLang, setCurrentLang] = useState(getCurrentLangLabel());
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const getLanguageName = (langCode: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l: { label: string; }) => l.label === langCode);
    return lang ? lang.name : 'English';
  };

  const handleLanguageSelect = (lang: 'en' | 'yo' | 'ig' | 'ha') => {
    setAppLanguage(lang);
    setShowLangDropdown(false);
  };

  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const lang = customEvent.detail?.label || getCurrentLangLabel();
      setCurrentLang(lang);
    };

    window.addEventListener('agri:lang-changed', handleLanguageChange);
    return () => {
      window.removeEventListener('agri:lang-changed', handleLanguageChange);
    };
  }, []);

  return (
    <>
      {/* Prominent language selector - place near top-left or top-right of header */}
      <header className="bg-white/80 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* left area (logo etc) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('appTitle')}
              </h1>
            </div>
          </div>

          {/* Make language selector obvious and polished */}
          <div className="flex items-center gap-3 relative">
            <label className="sr-only">{t('landingMultilingualSupport')}</label>
            <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 shadow-sm cursor-pointer"
                 onClick={() => setShowLangDropdown(!showLangDropdown)}>
              <span className="text-sm text-emerald-700 mr-2">🌍</span>
              <span className="text-sm font-medium text-gray-700">
                {getLanguageName(currentLang)}
              </span>
              <svg className={`w-4 h-4 text-emerald-600 ml-1 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} 
                   viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.355a.75.75 0 111.14.98l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" />
              </svg>
            </div>
            
            {/* Language dropdown menu */}
            {showLangDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20">
                  {SUPPORTED_LANGUAGES.map((lang: { label: string; name: string; }) => (
                    <button
                      key={lang.label}
                      onClick={() => handleLanguageSelect(lang.label as 'en' | 'yo' | 'ig' | 'ha')}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors ${
                        currentLang === lang.label ? 'bg-emerald-100 font-medium' : 'text-gray-800'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}

                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        {currentView === 'chat' && (
          <div className="h-screen flex flex-col">
            <ChatBot onBack={() => setCurrentView('landing')} />
          </div>
        )}
        {currentView === 'tools' && (
          <SmartTools onBack={() => setCurrentView('landing')} />
        )}
        {currentView === 'landing' && (
          <LandingPage
            onStartChat={() => setCurrentView('chat')}
            onOpenTools={() => setCurrentView('tools')}
          />
        )}
      </div>
    </>
  );
}

export default App;