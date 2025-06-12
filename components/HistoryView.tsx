
import React from 'react';
import { HistoryEntry, AnalyticsData } from '../types'; // Added AnalyticsData
import { ClockIcon, TrashIcon, PlayIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon } from './IconComponents'; 

interface HistoryViewProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onViewReport: (entry: HistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onViewAnalytics: (analyticsSnapshot?: AnalyticsData) => void; // Updated prop
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory, onViewReport, onDeleteEntry, onViewAnalytics }) => {
  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(/\./g, '');
  };

  const exportedReportHistory = history.filter(entry => entry.eventType === 'Laporan Diekspor');

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
        <div className="flex items-center">
          <ClockIcon className="w-8 h-8 text-sky-600 mr-3" />
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Proyek</h2>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
            aria-label="Hapus semua riwayat aktivitas"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Hapus Semua Riwayat
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Riwayat Tercatat</p>
          <p className="text-slate-500">Aktivitas yang Anda lakukan akan dicatat di sini.</p>
        </div>
      ) : exportedReportHistory.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" /> 
          <p className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Laporan Diekspor</p>
          <p className="text-slate-500">Ekspor laporan terlebih dahulu untuk melihat riwayatnya di sini.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar-history">
          {exportedReportHistory.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row items-center justify-between p-4 gap-3 sm:gap-4"
              aria-labelledby={`history-entry-title-${entry.id}`}
            >
              {/* Left side: Info */}
              <div className="flex-grow text-center sm:text-left w-full sm:w-auto">
                <h3 id={`history-entry-title-${entry.id}`} className="text-md font-semibold text-slate-700">
                  {entry.reportProjectName || 'Tanpa Nama Proyek'}
                </h3>
                <p className="text-xs text-slate-500">
                  Tester: {entry.reportTesterName || 'N/A'} &bull; {formatTimestamp(entry.timestamp)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total: <span className="font-medium text-slate-600">{entry.reportTotalItems || 0}</span> |
                  <CheckCircleIcon className="w-3 h-3 inline mx-0.5 text-green-500" />
                  <span className="font-medium text-green-600">{entry.reportSucceedCount || 0}</span> |
                  <XCircleIcon className="w-3 h-3 inline mx-0.5 text-red-500" />
                  <span className="font-medium text-red-600">{entry.reportNotAppropriateCount || 0}</span> |
                  Durasi LLM: <span className="font-medium text-slate-600">{entry.reportDurationFormatted || 'N/A'}</span>
                </p>
              </div>

              {/* Right side: Actions */}
              <div className="flex gap-2 flex-shrink-0 mt-3 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end">
                {entry.reportHtmlContent && entry.reportProjectName && entry.reportTesterName && (
                  <button
                    onClick={() => onViewReport(entry)}
                    className="flex items-center justify-center px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-sm text-xs transition-colors duration-150 ease-in-out w-full sm:w-auto"
                    title="Lihat Laporan"
                    aria-label={`Lihat laporan untuk ${entry.reportProjectName || 'proyek ini'}`}
                  >
                    <PlayIcon className="w-4 h-4 mr-1.5" />
                    Lihat Laporan
                  </button>
                )}
                 <button
                    onClick={() => onViewAnalytics(entry.analyticsSnapshot)} 
                    className="flex items-center justify-center px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md shadow-sm text-xs transition-colors duration-150 ease-in-out w-full sm:w-auto"
                    title="Lihat Analitik (snapshot dari laporan ini)"
                    aria-label={`Lihat analitik untuk laporan ${entry.reportProjectName || 'ini'}`}
                  >
                    <ChartBarIcon className="w-4 h-4 mr-1.5" />
                    Lihat Analitik
                  </button>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="flex items-center justify-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-md shadow-sm text-xs transition-colors duration-150 ease-in-out border border-slate-300 w-full sm:w-auto"
                  title="Hapus Riwayat"
                  aria-label={`Hapus riwayat untuk ${entry.reportProjectName || 'proyek ini'}`}
                >
                  <TrashIcon className="w-4 h-4 mr-1.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar-history::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar-history::-webkit-scrollbar-track {
    background: #e2e8f0; 
    border-radius: 4px;
  }
  .custom-scrollbar-history::-webkit-scrollbar-thumb {
    background: #94a3b8; 
    border-radius: 4px;
  }
  .custom-scrollbar-history::-webkit-scrollbar-thumb:hover {
    background: #64748b; 
  }
`;
document.head.appendChild(style);

export default HistoryView;
