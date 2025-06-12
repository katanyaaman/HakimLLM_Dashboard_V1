
import React from 'react';
import { ActiveView } from '../App'; // Assuming ActiveView is exported from App.tsx

interface HeaderBarProps {
  activeView: ActiveView; // Prop masih diterima, tapi tidak digunakan untuk breadcrumbs
  isDataLoaded: boolean; // Prop masih diterima, tapi tidak digunakan untuk breadcrumbs
}

const HeaderBar: React.FC<HeaderBarProps> = ({ activeView, isDataLoaded }) => {
  // Logika breadcrumbs dihapus sepenuhnya

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="font-bold text-2xl text-sky-700">HAKIM LLM</span>
          </div>
          
          {/* Elemen <nav> untuk breadcrumbs dihapus */}

           {/* Placeholder for right side, e.g., user profile or logout button */}
           {/* Ini tetap ada untuk menjaga konsistensi layout jika ada elemen di kanan nantinya */}
           <div className="w-10 h-10 flex items-center justify-center">
             {/* Example: User icon or logout button */}
           </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
