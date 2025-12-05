import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

const languages = [
  { code: 'english', label: 'English', flag: '🇬🇧' },
  { code: 'hausa', label: 'Hausa', flag: '🇳🇬' },
  { code: 'yoruba', label: 'Yoruba', flag: '🇳🇬' },
  { code: 'igbo', label: 'Igbo', flag: '🇳🇬' },
];

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-600" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
