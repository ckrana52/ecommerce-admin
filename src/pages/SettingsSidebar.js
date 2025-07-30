import React from 'react';

export default function SettingsSidebar({ selected, onSelect }) {
  const options = [
    { key: 'general', label: 'General' },
    { key: 'logo', label: 'Logo' },
    { key: 'footer', label: 'Footer' },
    { key: 'social', label: 'Social Link' },
    { key: 'payments', label: 'Payments' },
    { key: 'facebook', label: 'Facebook Conversation API' },
    { key: 'analysis', label: 'Analysis Code' },
    { key: 'courier', label: 'Courier API' },
    { key: 'block', label: 'Block' },
  ];
  return (
    <div className="w-48 border-r bg-white h-full">
      {options.map(opt => (
        <div
          key={opt.key}
          className={`p-3 cursor-pointer ${selected === opt.key ? 'bg-blue-100 font-bold' : ''}`}
          onClick={() => onSelect(opt.key)}
        >
          {opt.label}
        </div>
      ))}
    </div>
  );
} 