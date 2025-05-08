import React from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Language</h2>
        <LanguageSelector />
      </div>
      {/* Add more settings here in the future */}
    </div>
  );
};

export default Settings; 