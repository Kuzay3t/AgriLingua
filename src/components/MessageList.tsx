import { Loader2, User, Bot } from 'lucide-react';
import type { Message } from './ChatBot';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
          >
            {message.role === 'user' ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>

          <div
            className={`flex-1 max-w-[75%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            } flex flex-col`}
          >
            <div
              className={`rounded-2xl px-4 py-3 shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-gray-900 rounded-tl-none'
              }`}
            >
              {message.imageUrl && (
                <div className="mb-2">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded crop"
                    className="rounded-lg max-w-full h-auto"
                  />
                </div>
              )}
              {message.audioUrl && (
                <div className="mb-2">
                  <audio controls src={message.audioUrl} className="max-w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            </div>
            <span
              className={`text-xs text-gray-500 mt-1 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}
