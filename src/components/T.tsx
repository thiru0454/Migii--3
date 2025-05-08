
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslateProps {
  keyName: string;
}

export const T: React.FC<TranslateProps> = ({ keyName }) => {
  const { t } = useLanguage();
  return <>{t(keyName)}</>;
};
