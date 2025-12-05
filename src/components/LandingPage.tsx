import { MessageSquare, Leaf, Globe, Camera, Mic, Wrench } from 'lucide-react';
import WeatherDashboard from './WeatherDashboard';

interface LandingPageProps {
  onStartChat: () => void;
  onOpenTools: () => void;
}

export default function LandingPage({ onStartChat, onOpenTools }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              AgriLingua
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl mb-6 shadow-lg">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Agricultural Advice,<br />
              <span className="text-emerald-600">In Your Language</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Get expert farming guidance through our AI-powered assistant.
              Ask questions in Hausa, Yoruba, Igbo, or English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onStartChat}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
              >
                <MessageSquare className="w-6 h-6" />
                Start Chatting
              </button>
              <button
                onClick={onOpenTools}
                className="bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
              >
                <Wrench className="w-6 h-6" />
                Smart Farming Tools
              </button>
            </div>
          </div>

          <div className="mt-16">
            <WeatherDashboard />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multilingual Support
              </h3>
              <p className="text-gray-600">
                Communicate in Hausa, Yoruba, Igbo, or English. Get responses in your preferred language.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Image Analysis
              </h3>
              <p className="text-gray-600">
                Upload photos of your crops for instant disease detection and treatment advice.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Voice Input
              </h3>
              <p className="text-gray-600">
                Record voice messages for hands-free communication while working in the field.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            Empowering farmers with AI-driven agricultural knowledge
          </p>
        </div>
      </footer>
    </div>
  );
}
