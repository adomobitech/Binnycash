'use client';

import React from 'react';


interface OfferFiltersProps {
  selectedDevices: string[];
  onSelectDevice: (device: string) => void;
}

const devices = [
  { 
    id: 'android', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.523 15.3414C17.523 15.3414 17.523 15.3414 17.523 15.3414C17.523 16.1432 16.8924 16.7738 16.0906 16.7738C15.2889 16.7738 14.6583 16.1432 14.6583 15.3414C14.6583 14.5397 15.2889 13.9091 16.0906 13.9091C16.8924 13.9091 17.523 14.5397 17.523 15.3414ZM9.34167 15.3414C9.34167 15.3414 9.34167 15.3414 9.34167 15.3414C9.34167 16.1432 8.71108 16.7738 7.90933 16.7738C7.10759 16.7738 6.47699 16.1432 6.47699 15.3414C6.47699 14.5397 7.10759 13.9091 7.90933 13.9091C8.71108 13.9091 9.34167 14.5397 9.34167 15.3414ZM17.9622 10.7416L19.8661 7.44426C19.9868 7.23517 19.915 6.96781 19.7059 6.84717C19.4968 6.72652 19.2295 6.79828 19.1088 7.00737L17.1706 10.3644C15.6171 9.64654 13.8631 9.24584 12.0003 9.24584C10.1374 9.24584 8.38338 9.64654 6.82998 10.3644L4.89173 7.00737C4.77109 6.79828 4.50373 6.72652 4.29464 6.84717C4.08554 6.96781 4.01379 7.23517 4.13444 7.44426L6.03831 10.7416C2.63935 12.6075 0.354181 16.166 0.0546875 20.315H23.9458C23.6463 16.166 21.3612 12.6075 17.9622 10.7416Z"/></svg> },
  { 
    id: 'ios', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.72.845-1.391 2.275-1.222 3.637 1.35.104 2.623-.624 3.51-1.625z"/></svg> },
  { 
    id: 'windows', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> },
  { 
    id: 'mac', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg> },
  { 
    id: 'ipad', 
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg> },
];

export default function OfferFilters({ selectedDevices = [], onSelectDevice }: OfferFiltersProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-[#1A1C24] px-2 rounded-xl border border-white/5">
      {devices.map((dev) => {
        const isActive = selectedDevices.includes(dev.id); 
        
        return (
          <button
            key={dev.id}
            onClick={() => onSelectDevice(dev.id)}
            title={dev.id}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25'
                : 'text-[#8F95A3] hover:text-white hover:bg-[#232630]'
            }`}
          >
            {dev.icon}
          </button>
        );
      })}
    </div>
  );
}