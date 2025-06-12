
import React, { useState } from 'react';
import {
  Squares2X2Icon,
  CircleStackIcon,
  DocumentPlusIcon,
  ClockIcon,
  LinkIcon,
  ChartBarIcon,
  ArrowUpCircleIcon,
  LifebuoyIcon,
  HeartIcon,
} from './IconComponents';
import FeedbackModal from './FeedbackModal';
import { ActiveView } from '../App'; // Import ActiveView type

interface IconProps {
  className?: string;
}

interface NavItemProps {
  icon: React.ReactElement<IconProps>;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  viewId?: ActiveView; // Added viewId to manage active state correctly
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => {
  const commonClasses = `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group
    ${isActive 
      ? 'bg-sky-100 text-sky-700' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  
  const iconElement = React.cloneElement(icon, {
    className: `mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-500'}`
  });

  return (
    <button type="button" onClick={onClick} className={commonClasses + " w-full text-left"}>
      {iconElement}
      {label}
    </button>
  );
};

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const mainNavItems = [
    { viewId: 'proyek' as ActiveView, icon: <Squares2X2Icon />, label: 'Proyek' },
    { viewId: 'data_display' as ActiveView, icon: <CircleStackIcon />, label: 'Kumpulan Data' }, // Changed viewId
    { viewId: 'laporan' as ActiveView, icon: <DocumentPlusIcon />, label: 'Pratinjau Laporan' },
    { viewId: 'riwayat' as ActiveView, icon: <ClockIcon />, label: 'Riwayat' },
    { viewId: 'integrasi' as ActiveView, icon: <LinkIcon />, label: 'Integrasi LLM' },
    { viewId: 'analitik' as ActiveView, icon: <ChartBarIcon />, label: 'Analitik' },
  ];

  const handleFeedbackSubmit = (name: string, email: string, message: string) => {
    const subject = encodeURIComponent("Masukan Pengguna HAKIM LLM");
    const body = encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\n\nMasukan:\n${message}`
    );
    window.location.href = `mailto:katanyaman@outlook.com?subject=${subject}&body=${body}`;
    setIsFeedbackModalOpen(false);
  };
  
  const footerNavItems = [
    { label: 'Dukungan', icon: <LifebuoyIcon />, onClick: () => alert('Fitur Dukungan akan segera hadir!') },
    { label: 'Beri Masukan', icon: <HeartIcon />, onClick: () => setIsFeedbackModalOpen(true) },
  ];

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <nav className="space-y-1.5">
            {mainNavItems.map(item => (
              <NavItem 
                key={item.label} 
                icon={item.icon} 
                label={item.label} 
                isActive={activeView === item.viewId} 
                onClick={() => setActiveView(item.viewId)} 
              />
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button 
            onClick={() => alert('Fitur Tingkatkan Paket akan segera hadir!')}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowUpCircleIcon className="mr-2 h-5 w-5 transform -rotate-90" />
            Tingkatkan Paket
          </button>
          <nav className="space-y-1.5 pt-2">
            {footerNavItems.map(item => (
              <NavItem 
                key={item.label} 
                icon={item.icon} 
                label={item.label} 
                onClick={item.onClick} 
              />
            ))}
          </nav>
        </div>
      </aside>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};

export default Sidebar;
