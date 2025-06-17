
import React, { useRef, useEffect } from 'react';
import { FolderPlusIcon, ArrowLeftIcon, DownloadIcon, DocumentPlusIcon, RefreshIcon, PrinterIcon } from './IconComponents'; 

interface ReportPreviewProps {
  htmlContent: string | null;
  testerName: string | null;
  projectName: string | null;
  onClearData: () => void; 
  onExportReportRequest: () => void;
  onRefreshReport: () => void; 
  hasEvaluatedItems: boolean; 
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ 
    htmlContent, 
    testerName, 
    projectName, 
    onClearData, 
    onExportReportRequest, 
    onRefreshReport,
    hasEvaluatedItems 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && htmlContent) {
      const handleLoad = () => {
        if (iframe.contentWindow) {
          // Set a minimum height, e.g., 300px, or use scrollHeight
          const scrollHeight = iframe.contentWindow.document.body.scrollHeight;
          iframe.style.height = `${scrollHeight + 20}px`; // Add small buffer
        }
      };

      // Set srcDoc first
      iframe.srcdoc = htmlContent;
      // Then add event listener
      iframe.addEventListener('load', handleLoad);
      
      // Initial load might be missed if srcdoc is set before listener in some cases
      // So, if already loaded (e.g. fast rendering), call handler manually
      if (iframe.contentWindow && iframe.contentWindow.document.readyState === 'complete') {
        handleLoad();
      }

      return () => {
        iframe.removeEventListener('load', handleLoad);
        // Clear srcdoc when htmlContent is null or component unmounts to prevent stale content
        // iframe.srcdoc = ""; 
      };
    } else if (iframe) {
      // If htmlContent becomes null, reset iframe height or hide it.
      // For now, it's handled by the component returning a different view.
      // If we kept the iframe, we'd do:
      // iframe.style.height = '0px'; 
      // iframe.srcdoc = "";
    }
  }, [htmlContent]);


  const handlePrintReport = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus(); 
      iframeRef.current.contentWindow.print();
    } else {
      alert("Tidak dapat mencetak laporan. Konten pratinjau tidak ditemukan.");
    }
  };

  if (!htmlContent) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-xl p-8">
        <FolderPlusIcon className="w-16 h-16 text-slate-300 mx-auto mb-6" /> 
        <p className="text-2xl font-semibold text-slate-700 mb-3">Belum Ada Laporan</p> 
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
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

  const isExportButtonActive = hasEvaluatedItems;
  const isPrintButtonActive = !!htmlContent;

  return (
    <div className="bg-white rounded-xl shadow-xl h-full flex flex-col"> {/* Removed overflow-hidden */}
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
                    className="flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                    title="Refresh pratinjau laporan dengan data terkini"
                    aria-label="Refresh pratinjau laporan"
                >
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    Refresh
                </button>
                <button
                    onClick={handlePrintReport}
                    disabled={!isPrintButtonActive}
                    className={`flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out
                               ${isPrintButtonActive 
                                 ? 'bg-green-500 hover:bg-green-600 text-white' 
                                 : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                               }`}
                    title={isPrintButtonActive ? "Cetak laporan ini atau simpan sebagai PDF" : "Konten laporan tidak tersedia untuk dicetak"}
                    aria-label="Cetak Laporan"
                >
                    <PrinterIcon className={`w-4 h-4 mr-2 ${isPrintButtonActive ? 'text-white' : 'text-slate-400'}`} />
                    Cetak
                </button>
                <button
                    onClick={onExportReportRequest}
                    disabled={!isExportButtonActive}
                    className={`flex-1 sm:flex-initial flex items-center justify-center px-4 py-2 font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out
                               ${isExportButtonActive 
                                 ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                 : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                               }`}
                    title={isExportButtonActive ? "Ekspor laporan ini sebagai file HTML" : "Evaluasi item terlebih dahulu untuk mengaktifkan ekspor"}
                    aria-label="Ekspor hasil sebagai HTML"
                >
                    <DownloadIcon className={`w-4 h-4 mr-2 ${isExportButtonActive ? 'text-white' : 'text-slate-400'}`} />
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
        style={{ width: '100%', border: 'none' }} // Removed overflow: hidden from style
        aria-live="polite" 
        aria-atomic="true"
      >
        <iframe
            ref={iframeRef}
            // srcDoc is now set in useEffect to ensure 'load' event fires reliably
            title={`Laporan Evaluasi - ${projectName || 'N/A'} oleh ${testerName || 'N/A'}`}
            className="w-full border-none rounded-b-md" // Removed h-full
            sandbox="allow-scripts allow-same-origin allow-modals" 
            scrolling="no" // Added scrolling="no"
        />
      </div>
    </div>
  );
};

export default ReportPreview;
