import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatBot from './components/ChatBot';
import SmartTools from './components/SmartTools';

type View = 'landing' | 'chat' | 'tools';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {currentView === 'chat' && (
        <ChatBot onBack={() => setCurrentView('landing')} />
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
  );
}

export default App;
