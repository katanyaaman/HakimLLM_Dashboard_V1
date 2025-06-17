
import React from 'react';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import { ActiveView } from '../App'; // Import ActiveView type

interface LayoutProps {
  children: React.ReactNode;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isDataLoaded: boolean; // Added prop
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, isDataLoaded }) => {
  // Kondisi untuk padding pada <main>
  // Jika tampilan adalah 'laporan', maka tidak ada padding agar ReportPreview bisa full
  // Jika tidak, gunakan padding default
  const mainPaddingClass = activeView === 'laporan'
    ? 'p-0' 
    : 'p-4 sm:p-6 lg:p-8';

  return (
    <div className="h-screen flex flex-col">
      <HeaderBar activeView={activeView} isDataLoaded={isDataLoaded} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className={`flex-1 overflow-y-auto bg-slate-100 ${mainPaddingClass}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;