import { useState } from 'react';
import SettingsSidebar from './SettingsSidebar';

export default function SettingsTable() {
  const [selected, setSelected] = useState('general');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SettingsSidebar selected={selected} onSelect={setSelected} />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        {/* পরবর্তীতে: logo, footer, social, ইত্যাদি groupwise ফর্ম এখানে দেখাবেন */}
      </div>
    </div>
  );
} 