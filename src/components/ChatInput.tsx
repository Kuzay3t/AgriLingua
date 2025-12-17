import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Camera, X, StopCircle } from 'lucide-react';
import { t } from '../i18n/languageManager';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text' | 'voice' | 'image', fileUrl?: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uiText, setUiText] = useState({
    imageReady: 'Image ready to send',
    addDescription: 'Add a description (optional)',
    sendImage: 'Send Image',
    uploadCropImage: 'Upload crop image',
    recordVoiceMessage: 'Record voice message',
    stopRecording: 'Stop recording',
    recording: 'Recording...',
    askAboutFarming: 'Ask about farming, crops, diseases...',
    sendMessage: 'Send message',
    recordingClickStop: 'Recording... Click the stop button when finished'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setUiText({
        imageReady: t('chatInputImageReady'),
        addDescription: t('chatInputAddDescription'),
        sendImage: t('chatInputSendImage'),
        uploadCropImage: t('chatInputUploadCropImage'),
        recordVoiceMessage: t('chatInputRecordVoiceMessage'),
        stopRecording: t('chatInputStopRecording'),
        recording: t('chatInputRecording'),
        askAboutFarming: t('chatInputAskAboutFarming'),
        sendMessage: t('chatInputSendMessage'),
        recordingClickStop: t('chatInputRecordingClickStop')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim(), 'text');
      setInput('');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSend = () => {
    if (selectedImage && imagePreview) {
      const message = input.trim() || 'Please analyze this crop image';
      onSendMessage(message, 'image', imagePreview);
      setInput('');
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleImageCancel = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const message = 'Voice message';
        onSendMessage(message, 'voice', audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (imagePreview) {
    return (
      <div className="p-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <div className="flex items-start gap-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">{uiText.imageReady}</p>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={uiText.addDescription}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <button
              onClick={handleImageCancel}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <button
          onClick={handleImageSend}
          disabled={disabled}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {uiText.sendImage}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isRecording}
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={uiText.uploadCropImage}
        >
          <Camera className="w-5 h-5 text-gray-600" />
        </button>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-100 hover:bg-red-200 text-red-600 animate-pulse'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={isRecording ? uiText.stopRecording : uiText.recordVoiceMessage}
        >
          {isRecording ? (
            <StopCircle className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? uiText.recording : uiText.askAboutFarming}
            disabled={disabled || isRecording}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !input.trim() || isRecording}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          title={uiText.sendMessage}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {isRecording && (
        <p className="text-sm text-red-600 mt-2 text-center animate-pulse">
          {uiText.recordingClickStop}
        </p>
      )}
    </form>
  );
}