import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Image, X } from 'lucide-react';

// Simple Markdown-to-JSX renderer for chat messages
function parseMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType;
      elements.push(
        <ListTag key={`list-${elements.length}`} className="ml-4 my-2 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      listType = null;
    }
  };

  const parseInlineMarkdown = (line: string) => {
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
    line = line.replace(/`(.+?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: line }} />;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.match(/^[\*\-]\s+/)) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(trimmed.replace(/^[\*\-]\s+/, ''));
    }
    else if (trimmed.match(/^\d+\.\s+/)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
    }
    else {
      flushList();
      if (trimmed) {
        elements.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed mb-2">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      }
    }
  });

  flushList();
  return elements;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const generateId = () => {
	if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
		return (crypto as any).randomUUID();
	}
	return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: 'Hello! I am AgriLingua, your farming helper. You can ask me anything about farming - crops, soil, pests, water, or any problem on your farm. I am here to help you!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const endRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_HISTORY_LENGTH = 10;
  const TIMEOUT_MS = 30000;
  const MAX_OUTPUT_TOKENS = 2048;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => setLoadTime(t => t + 1), 1000);
    } else {
      setLoadTime(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const systemPrompt = `You are AgriLingua, a friendly farming helper for African smallholder farmers. You understand that many farmers may have limited formal education, so you explain things in SIMPLE, CLEAR language that anyone can understand.

Your knowledge covers:
- Growing crops (maize, cassava, rice, vegetables, etc.)
- Soil and fertilizer
- Pests, diseases, and weeds
- Water and rain
- Simple, affordable farming methods
- Local African farming practices and climate
- Selling crops at the market

When answering farmers:
- Use SIMPLE ENGLISH. Use short, common words. Avoid big, complicated words.
- Speak like a helpful neighbor or elder, not like a textbook or scientist.
- Break things into SMALL, EASY steps that anyone can follow.
- Always recommend CHEAP or FREE solutions first (like local materials, ash, neem leaves, compost, manual methods).
- Give SPECIFIC amounts and timing (e.g., "2 handfuls per plant" or "apply every 2 weeks").
- Understand African realities: limited money, no fancy equipment, reliance on rain, local seeds, walking to farms.
- Be encouraging and respectful. Farming is hard work. Show you care.
- If you need more information, ask simple questions like: "What does the leaf look like?" or "Is your soil sandy or clay?"
- Keep answers SHORT and focused. Farmers are busy. Give the most important info first.

Things to remember:
- Many farmers cannot read well. Use lists and short sentences.
- Focus on what farmers can DO with what they HAVE.
- Don't mention expensive chemicals, machines, or lab tests unless asked.
- Stay positive. Help farmers solve problems with what's available to them.

When farmers send images of plants or pests:
- Identify the problem clearly (disease, pest, nutrient issue)
- Explain what you see in simple words
- Give practical solutions they can do right away

Do NOT give medical, legal, or money advice. Only farming help.

Use simple Markdown: **bold for important points**, lists with * for steps. Keep it clean and easy to read.`;

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: 'Transcribe this audio to text. Only return the transcription, nothing else.' },
                  { 
                    inline_data: {
                      mime_type: 'audio/webm',
                      data: base64Audio
                    }
                  }
                ]
              }]
            })
          });

          const data = await response.json();
          const transcription = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (transcription) {
            setInput(transcription);
          } else {
            alert('Could not transcribe audio. Please try again.');
          }
        } catch (error) {
          console.error('Transcription fetch error:', error);
          alert('Error transcribing audio. Please try typing instead.');
        } finally {
          setIsLoading(false);
        }
      };
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Error transcribing audio. Please try typing instead.');
      setIsLoading(false);
    }
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Please use an image smaller than 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getErrorMessage = (err: any, context?: string): string => {
    if (!err) return 'Something went wrong. Please try again.';
    const msg = err.message || err.toString() || 'Unknown error';

    if (msg.includes('GEMINI_API_KEY is not set') || msg.includes('API key not configured')) {
      return 'AgriLingua needs setup - API key is missing. Please add your API key and refresh the page.';
    }

    if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
      return 'Network problem. Please check your internet connection and try again.';
    }

    if (msg.includes('429') || msg.includes('rate limit')) {
      return 'Too many requests right now. Please wait a moment and try again.';
    }

    if (msg.includes('timeout') || msg.includes('AbortError')) {
      return 'Request took too long. Try a shorter question or wait and try again.';
    }

    if (msg.includes('Conversation too long')) {
      return 'Chat history is too long. Start a new conversation for faster responses.';
    }

    return context ? `Error: ${msg}. Please try again.` : `Error: ${msg}`;
  };

  const sendMessage = async () => {
    if (!input.trim() && !selectedImage) return;

    const userMsg: Message = { 
      id: generateId(), 
      role: 'user', 
      content: input.trim() || 'What do you see in this image?',
      image: selectedImage || undefined
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setImageFile(null);
    setIsLoading(true);
    setLoadTime(0);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set.');
      }

      let recentMessages = messages.slice(-(MAX_HISTORY_LENGTH / 2));
      if (recentMessages.length > MAX_HISTORY_LENGTH) {
        recentMessages = recentMessages.filter((_, i) => i % 2 === 0).slice(0, MAX_HISTORY_LENGTH);
      }
      if (recentMessages[0]?.content?.includes('Hello! I am AgriLingua') && recentMessages.length > 5) {
        recentMessages.shift();
      }

      const contents = [
        ...recentMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      ];

      // Add current message with image if present
      const currentParts: any[] = [{ text: userMsg.content }];
      if (currentImage) {
        // Safely extract base64 and MIME type
        const base64Match = currentImage.match(/base64,(.+)$/);
        const mimeMatch = currentImage.match(/^data:([^;]+)/);
        
        if (base64Match?.[1] && mimeMatch?.[1]) {
          const base64Data = base64Match[1];
          const mimeType = mimeMatch[1];
          
          currentParts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          });
        }
      }

      contents.push({
        role: 'user',
        parts: currentParts
      });

      let totalInputChars = contents.reduce((sum, turn) => 
        sum + (turn.parts || []).reduce((s: number, p: any) => s + (p.text?.length || 0), 0), 0
      ) + systemPrompt.length;
      
      if (totalInputChars > 50000) {
        while (totalInputChars > 50000 && recentMessages.length > 1) {
          recentMessages.shift();
          contents.splice(0, 2);
          totalInputChars = contents.reduce((sum, turn) => 
            sum + (turn.parts || []).reduce((s: number, p: any) => s + (p.text?.length || 0), 0), 0
          ) + systemPrompt.length;
        }
        if (totalInputChars > 50000) {
          throw new Error('Conversation too long—start a new chat.');
        }
      }

      const payload = {
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
      };

      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, TIMEOUT_MS);

      let res: Response | null = null;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount < maxRetries && !res?.ok) {
        try {
          res = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: abortControllerRef.current?.signal,
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (res.status === 429) {
            const errorBody = await res.text();
            const retryAfterMatch = errorBody.match(/retry in (\d+(?:\.\d+)?)s/);
            const retryAfter = Math.min(retryAfterMatch ? parseFloat(retryAfterMatch[1]) * 1000 : 2000 * Math.pow(2, retryCount), 5000);
            await new Promise(resolve => setTimeout(resolve, retryAfter));
            retryCount++;
            timeoutId = setTimeout(() => abortControllerRef.current?.abort(), TIMEOUT_MS);
            continue;
          }

          if (!res.ok) {
            const errorBody = await res.text();
            throw new Error(`Gemini API error ${res.status}: ${errorBody}`);
          }
        } catch (fetchErr: any) {
          if (timeoutId) clearTimeout(timeoutId);
          if (fetchErr.name === 'AbortError') {
            throw new Error(`Request timeout after ${TIMEOUT_MS / 1000}s`);
          }
          if (retryCount >= maxRetries - 1) {
            throw fetchErr;
          }
          retryCount++;
          timeoutId = setTimeout(() => abortControllerRef.current?.abort(), TIMEOUT_MS);
        }
      }

      if (!res?.ok) {
        throw new Error(`Failed after ${maxRetries} retries. Try again soon.`);
      }

      const data = await res.json();

      let assistantText: string | null = null;
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        assistantText = data.candidates[0].content.parts[0].text;
      } else if (data?.candidates?.[0]?.content?.text) {
        assistantText = data.candidates[0].content.text;
      } else if (typeof data?.candidates?.[0]?.content === 'string') {
        assistantText = data.candidates[0].content;
      }

      if (!assistantText || !assistantText.trim()) {
        throw new Error('No response from AI.');
      }

      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantText.trim(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, 'while generating response');
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: errorMsg,
        },
      ]);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) sendMessage();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg flex flex-col" style={{ height: '80vh' }}>
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-t-lg">
          <h2 className="text-xl font-bold">AgriLingua</h2>
          <p className="text-sm opacity-90">Your Farming Helper</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                {m.image && (
                  <img 
                    src={m.image} 
                    alt="Uploaded" 
                    className="rounded mb-2 max-w-full h-auto"
                  />
                )}
                <div className="text-sm break-words">
                  {m.role === 'assistant' ? parseMarkdown(m.content) : m.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg rounded-bl-none text-sm">
                Thinking{loadTime > 0 ? `... (${loadTime}s)` : ''}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="h-20 rounded border-2 border-emerald-500"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              title="Upload image"
            >
              <Image size={20} className="text-gray-600" />
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`p-2 border rounded-lg disabled:opacity-50 ${
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600 border-red-500' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} className="text-gray-600" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask me about your farm, crops, soil, pests..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isLoading}
            />
            
            <button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
          </div>
        </div>
      </div>
    </div>
  );
}

