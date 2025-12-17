import { useState, useRef, useEffect } from 'react';
import { Mic, Image, X, Loader2 } from 'lucide-react';
import OpenAI from 'openai';

// Local server URL (LM Studio default)
const LOCAL_API_BASE = 'http://localhost:1234/v1';
const LOCAL_MODEL = 'local-model'; // Fixed in LM Studio

const client = new OpenAI({
  apiKey: 'lm-studio', // Any string, ignored locally
  baseURL: LOCAL_API_BASE,
  dangerouslyAllowBrowser: true, // Required for frontend fetch
});

const systemPrompt = `You are AgriLingua, a friendly farming helper for African smallholder farmers.

Speak directly in the user's language (English, Igbo, Hausa, Yoruba, Pidgin, etc.). Short sentences. Like a helpful neighbor.

Topics: crops (maize, cassava, rice, yam, etc.), soil, fertilizer, pests, diseases, water, cheap methods, local practices.

Always recommend CHEAP or FREE solutions first (compost, neem, ash, manual methods).

Give SPECIFIC amounts and timing.

Be encouraging and respectful.

Use simple Markdown: bold for key points, - for lists.

When shown images of plants/pests: identify the issue and give practical advice.

Only farming help – no medical/legal/financial advice.`;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: 'Hello! I am AgriLingua, your farming helper. Ask me anything in English, Igbo, Hausa, Yoruba, or Pidgin – I will reply in your language!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Simple Markdown parser (kept from your original)
  function parseMarkdown(text: string) {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListTag key={`list-${elements.length}`} className="ml-4 my-2 space-y-1">
            {listItems.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">{item}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };
lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (listType !== 'ul') flushList();
        listType = 'ul';
        listItems.push(trimmed.slice(2));
      } else if (/^\d+\.\s/.test(trimmed)) {
        if (listType !== 'ol') flushList();
        listType = 'ol';
        listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      } else {
        flushList();
        if (trimmed) {
          let formatted = trimmed
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>');
          elements.push(
            <p key={`p-${index}`} className="text-sm leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: formatted }} />
          );
        }
      }
    });
    flushList();
    return elements;
  }

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const userText = input.trim() || 'Describe this farming image and give advice.';
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      image: selectedImage ?? undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const apiMessages: any[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.image
            ? [{ type: 'text', text: m.content }, { type: 'image_url', image_url: { url: m.image } }]
            : m.content,
        })),
        {
          role: 'user',
          content: currentImage
            ? [{ type: 'text', text: userText }, { type: 'image_url', image_url: { url: currentImage } }]
            : userText,
        },
      ];

      const completion = await client.chat.completions.create({
        model: LOCAL_MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      const reply = completion.choices[0]?.message?.content?.trim() ?? 'No response.';
setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: reply ?? 'No response.',
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: err.message.includes('fetch') || err.message.includes('Failed to fetch')
          ? 'Error: Cannot connect to local model. Make sure LM Studio is running and the server is started on port 1234.'
          : 'Error: Something went wrong. Check console.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg flex flex-col" style={{ height: '80vh' }}>
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-bold">AgriLingua (Powered by N-ATLaS - Local)</h2>
          <p className="text-sm opacity-90">Your Offline Farming Helper – Works without Internet!</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                {m.image && <img src={m.image} alt="Uploaded" className="rounded mb-2 max-w-full h-auto" />}
                <div className="text-sm break-words">
                  {m.role === 'assistant' ? parseMarkdown(m.content) : m.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                <Loader2 className="animate-spin" width={16} height={16} />
                Thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img src={selectedImage} alt="Selected" className="h-20 rounded border-2 border-emerald-500" />
              <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                <X width={16} height={16} />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Image width={20} height={20} className="text-gray-600" />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isLoading && sendMessage()}
              placeholder="Ask in any language (Igbo, Hausa, Yoruba...)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isLoading}
            />

            <button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}