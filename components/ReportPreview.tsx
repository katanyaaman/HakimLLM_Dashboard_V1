
import React from 'react';
import { FolderPlusIcon, ArrowLeftIcon, DownloadIcon, DocumentPlusIcon, RefreshIcon } from './IconComponents'; 

interface ReportPreviewProps {
  htmlContent: string | null;
  testerName: string | null;
  projectName: string | null;
  onClearData: () => void; 
  onExportReportRequest: () => void;
  onRefreshReport: () => void; // New prop for refreshing
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ htmlContent, testerName, projectName, onClearData, onExportReportRequest, onRefreshReport }) => {
  if (!htmlContent) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-xl p-8">
        <FolderPlusIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Laporan</p>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Untuk melihat laporan di sini, silakan unggah data dan sistem akan otomatis menampilkannya, atau gunakan tombol "Ekspor Hasil sebagai HTML" untuk membuat laporan dengan nama kustom. Anda juga bisa melihat laporan dari Riwayat.
        </p>
        <button
          onClick={onClearData} 
          className="flex items-center justify-center mx-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out"
          aria-label="Kembali ke tampilan Proyek dan hapus data saat ini"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Kembali & Hapus Data
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full flex flex-col">
        <div className="p-4 sm:p-5 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
                <DocumentPlusIcon className="w-7 h-7 text-sky-600 mr-3 hidden sm:block"/>
                <div>
                    <h2 className="text-xl font-bold text-sky-700">Pratinjau Laporan</h2>
                    {testerName && projectName && (
                        <p className="text-xs sm:text-sm text-slate-500">
                            Tester: <span className="font-medium text-slate-700">{testerName}</span> | Project: <span className="font-medium text-slate-700">{projectName}</span>
                        </p>
                    )}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                 <button
                    onClick={onRefreshReport}
                    className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                    title="Refresh pratinjau laporan dengan data terkini"
                    aria-label="Refresh pratinjau laporan"
                >
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    Refresh
                </button>
                <button
                    onClick={onExportReportRequest}
                    className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                    title="Ekspor laporan ini sebagai file HTML"
                    aria-label="Ekspor hasil sebagai HTML"
                >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Ekspor HTML
                </button>
                <button
                  onClick={onClearData}
                  className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                  title="Kembali ke tampilan unggah dan hapus semua data serta laporan ini"
                  aria-label="Kembali ke tampilan Proyek dan hapus semua data"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Kembali & Hapus
                </button>
            </div>
        </div>
      <div 
        className="report-preview-content flex-grow p-0.5 sm:p-1" 
        style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
        aria-live="polite" 
        aria-atomic="true"
      >
        <iframe
            srcDoc={htmlContent}
            title={`Laporan Evaluasi - ${projectName} oleh ${testerName}`}
            className="w-full h-full border-none rounded-b-md"
            sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

export default ReportPreview;
