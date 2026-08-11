'use client';

import React from 'react';

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.523 15.341c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm-11.046 0c.551 0 .998.447.998.998s-.447.998-.998.998-.998-.447-.998-.998.447-.998.998-.998zm11.38-5.343l2.05-3.551a.498.498 0 00-.182-.682.498.498 0 00-.682.182l-2.079 3.602c-1.472-.673-3.132-1.049-4.888-1.049s-3.416.376-4.888 1.049L5.341 5.767a.498.498 0 00-.682-.182.498.498 0 00-.182.682l2.05 3.551C3.518 11.458 1.5 14.869 1.5 18.828h21c0-3.959-2.018-7.37-5.023-8.83z"/></svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z" /></svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
);

const LaptopIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
);

const devices = [
  { id: 'all', label: 'All', icon: null },
  { id: 'android', label: 'Android', icon: <AndroidIcon /> },
  { id: 'ios', label: 'iOS', icon: <AppleIcon /> },
  { id: 'windows', label: 'Windows', icon: <MonitorIcon /> },
  { id: 'mac', label: 'Mac', icon: <LaptopIcon /> },
  { id: 'ipad', label: 'iPad', icon: <MobileIcon /> }
];

export default function OfferFilters({ 
  selectedDevice, 
  selectedDevices, 
  onSelectDevice 
}: any) {
  
  // 🔥 FIX: Bridge logic to support both Dashboard (Array) and Offers Page (String) 🔥
  let activeList: string[] = [];
  if (typeof selectedDevice === 'string') {
    activeList = [selectedDevice];
  } else if (Array.isArray(selectedDevices)) {
    activeList = selectedDevices;
  }

  const isAllSelected = activeList.length === 0 || activeList.includes('all') || activeList.includes('');

  const handleSelect = (id: string) => {
    if (onSelectDevice) onSelectDevice(id);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {devices.map((dev) => {
        const isActive = dev.id === 'all' ? isAllSelected : activeList.includes(dev.id); 
        
        return (
          <button
            key={dev.id}
            onClick={() => handleSelect(dev.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                : 'bg-white/5 text-[#9CA3AF] hover:text-white border border-white/10'
            }`}
          >
            {dev.icon}
            {dev.label}
          </button>
        );
      })}
    </div>
  );
}