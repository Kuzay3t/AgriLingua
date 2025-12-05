import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Leaf } from 'lucide-react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import LanguageSelector from './LanguageSelector';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  messageType: 'text' | 'voice' | 'image';
  imageUrl?: string;
  audioUrl?: string;
  timestamp: Date;
}

interface ChatBotProps {
  onBack: () => void;
}

export default function ChatBot({ onBack }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState('english');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({ language })
          .select()
          .single();

        if (error) throw error;
        setSessionId(data.id);
      }

      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getWelcomeMessage(language),
        messageType: 'text',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing session:', error);
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getWelcomeMessage(language),
        messageType: 'text',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const getWelcomeMessage = (lang: string) => {
    const welcomeMessages: Record<string, string> = {
      english: "Hello! I'm your agricultural assistant. Ask me anything about farming, crop diseases, or best practices. You can type, send a voice message, or upload a photo of your crops.",
      hausa: "Sannu! Ni mai taimako ne na aikin noma. Ka tambaye ni wani abu game da noma, cututtukan amfanin gona, ko mafi kyawun hanyoyin aiki. Kuna iya rubuta, aika saƙon murya, ko loda hoton amfanin gonakin ku.",
      yoruba: "Pele o! Emi ni oluranlowo agbe rẹ. Beere lọwọ mi nipa ohunkohun nipa ogbin, arun ọgbin, tabi awọn iṣe to dara julọ. O le tẹ, firanṣẹ ohun ti o gba sile, tabi gbejade foto awọn ọgbin rẹ.",
      igbo: "Ndewo! Abụ m onye inyeaka gị maka ọrụ ugbo. Jụọ m ihe ọ bụla gbasara ịkọ ugbo, ọrịa ihe ọkụkụ, ma ọ bụ ụzọ kachasị mma. Ị nwere ike dee, zipu ozi olu, ma ọ bụ bulite foto ihe ị kụrụ."
    };
    return welcomeMessages[lang] || welcomeMessages.english;
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const langChangeMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: getWelcomeMessage(newLanguage),
      messageType: 'text',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, langChangeMessage]);
  };

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'voice' | 'image',
    fileUrl?: string
  ) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      messageType: type,
      imageUrl: type === 'image' ? fileUrl : undefined,
      audioUrl: type === 'voice' ? fileUrl : undefined,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (supabase && sessionId) {
        await supabase.from('messages').insert({
          session_id: sessionId,
          role: 'user',
          content,
          message_type: type,
          image_url: fileUrl,
          language,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantResponse = await generateResponse(content, type, language);
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantResponse,
        messageType: 'text',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (supabase && sessionId) {
        await supabase.from('messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: assistantResponse,
          message_type: 'text',
          language,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        messageType: 'text',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async (
    content: string,
    type: 'text' | 'voice' | 'image',
    lang: string
  ): Promise<string> => {
    if (type === 'image') {
      return getImageAnalysisResponse(lang);
    }
    return getDemoResponse(content, lang);
  };

  const getDemoResponse = (content: string, lang: string): string => {
    const responses: Record<string, string[]> = {
      english: [
        "That's a great question about farming! Based on your inquiry, I recommend focusing on soil health and proper irrigation timing.",
        "For crop disease prevention, ensure good air circulation and avoid overhead watering. Consider organic pest management solutions.",
        "The best planting time depends on your local climate. Generally, wait until soil temperature reaches at least 60°F (15°C).",
      ],
      hausa: [
        "Wannan tambaya ce mai kyau game da aikin noma! Bisa ga tambayar ku, ina ba da shawarar mai da hankali kan lafiyar ƙasa da lokacin ban ruwa mai dacewa.",
        "Don rigakafin cututtukan amfanin gona, tabbatar da isasshen motsin iska kuma ku guje wa ban ruwa a sama. Yi la'akari da hanyoyin sarrafa kwari na halitta.",
      ],
      yoruba: [
        "Ibeere ti o dara nipa ogbin! Ti o ba si ibeere rẹ, Mo ṣeduro lori ilera ile ati akoko irrigation to tọ.",
        "Fun idena arun ọgbin, rii daju pe afẹfẹ n lọ daradara ki o si yago fun omi lori. Ronu nipa awọn ojutu iṣakoso kokoro adayeba.",
      ],
      igbo: [
        "Nke ahụ bụ ajụjụ dị mma gbasara ọrụ ugbo! Dabere na ajụjụ gị, ana m akwado ilekwasị anya n'ahụike ala na oge mmiri mmiri kwesịrị ekwesị.",
        "Maka mgbochi ọrịa ihe ọkụkụ, hụ na ikuku na-agagharị nke ọma ma zere ịgba mmiri n'elu. Tụlee ụzọ njikwa ahụhụ sitere n'okike.",
      ],
    };

    const langResponses = responses[lang] || responses.english;
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  };

  const getImageAnalysisResponse = (lang: string): string => {
    const responses: Record<string, string> = {
      english: "I've analyzed your crop image. The plant appears healthy overall, but I notice some yellowing on the lower leaves. This could indicate nitrogen deficiency. I recommend applying organic compost or nitrogen-rich fertilizer. Monitor the plant over the next week.",
      hausa: "Na bincika hoton amfanin gonakin ku. Shuka ta bayyana lafiya gabaɗaya, amma na lura da wasu rawaya akan ganyen ƙasa. Wannan na iya nuna ƙarancin nitrogen. Ina ba da shawarar yin amfani da takin halitta ko takin mai yawan nitrogen. Ku sa ido kan shuka a cikin mako mai zuwa.",
      yoruba: "Mo ti ṣe itupalẹ aworan ọgbin rẹ. Ọgbin naa dabi ẹni pe o ni ilera lapapọ, ṣugbọn Mo ṣakiyesi diẹ ninu awọn ewe isalẹ. Eyi le tọka si aini nitrogen. Mo ṣeduro lilo ajẹkù ọgbin adayeba tabi abajade-ilẹ ti o ni nitrogen pupọ. Ṣe abojuto ọgbin naa fun ọsẹ to nbọ.",
      igbo: "Enyochala m foto ihe ị kụrụ. Ihe ọkụkụ ahụ na-egosi ahụike n'ozuzu, mana m hụrụ ụfọdụ odo na akwụkwọ ndị dị n'okpuru. Nke a nwere ike igosi ụkọ nitrogen. Ana m akwado itinye ihe na-esi ísì ụtọ ma ọ bụ fatịlaịza bara ụba nitrogen. Nyochaa osisi ahụ n'ime izu na-abịa."
    };
    return responses[lang] || responses.english;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AgriLingua</h1>
                <p className="text-xs text-gray-500">Agricultural Assistant</p>
              </div>
            </div>
            <LanguageSelector value={language} onChange={handleLanguageChange} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col max-w-4xl w-full mx-auto">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </main>

      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
