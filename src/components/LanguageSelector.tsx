
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, availableLanguages } from '@/contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    
    const selectedLang = availableLanguages.find(lang => lang.code === langCode);
    toast.success(t('changeLanguage'));
  };
  
  return (
    <div className="flex items-center gap-2">
      <Languages size={18} className="text-muted-foreground" />
      
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
