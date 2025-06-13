<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pratinjau Komponen React - ReportPreview</title>
    <!-- 1. Impor Tailwind CSS untuk styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- 2. Impor library React & ReactDOM -->
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <!-- 3. Impor Babel untuk mentranspilasi JSX di browser -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { background-color: #e2e8f0; /* slate-200 */ padding: 1rem; }
        /* Menambahkan tinggi pada root agar komponen bisa full height */
        #root, #root > div { height: 100%; }
    </style>
</head>
<body>

    <div id="root" style="height: 90vh;"></div>

    <script type="text/babel">
        // --- Placeholder untuk Ikon Komponen (Karena file aslinya tidak ada) ---
        // Di proyek nyata, ini akan menjadi file terpisah. Di sini kita buat sebagai komponen sederhana.
        const FolderPlusIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>;
        const ArrowLeftIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
        const DownloadIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
        const DocumentPlusIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
        const RefreshIcon = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.991v4.99" /></svg>;

        // --- Kode Komponen yang Anda Berikan ---
        const ReportPreview = ({ 
            htmlContent, 
            testerName, 
            projectName, 
            onClearData, 
            onExportReportRequest, 
            onRefreshReport,
            hasEvaluatedItems 
        }) => {
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

          {/* PERBAIKAN: Menghapus style={{height: '80vh'}} dari div utama ini */}
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
                style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
                aria-live="polite" 
                aria-atomic="true"
              >
                <iframe
                    srcDoc={htmlContent}
                    title={`Laporan Evaluasi - ${projectName || 'N/A'} oleh ${testerName || 'N/A'}`}
                    className="w-full h-full border-none rounded-b-md"
                    sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          );
        };
        
        // --- Komponen "App" untuk mengontrol preview ---
        const App = () => {
            const [htmlContent, setHtmlContent] = React.useState(null);
            const [hasEvaluatedItems, setHasEvaluatedItems] = React.useState(false);

            const dummyHtml = `
              <html>
                <body style="font-family: sans-serif; padding: 20px; height: 150vh; background: linear-gradient(to bottom, #fff, #f0f0f0);">
                  <h1>Contoh Laporan</h1>
                  <p>Ini adalah konten HTML yang ditampilkan di dalam pratinjau iframe.</p>
                  <p>Konten ini sengaja dibuat sangat panjang untuk mensimulasikan kebutuhan scroll.</p>
                  <p style="margin-top: 100vh;">Ini adalah bagian bawah dari konten.</p>
                </body>
              </html>`;

            const handleGenerateReport = () => {
                setHtmlContent(dummyHtml);
            };

            const handleClearData = () => {
                console.log('Fungsi onClearData dipanggil!');
                setHtmlContent(null);
            };

            const handleExport = () => {
                alert('Fungsi onExportReportRequest dipanggil!');
            };
            
            const handleRefresh = () => {
                alert('Fungsi onRefreshReport dipanggil!');
            };

            return (
                <div className="space-y-4 h-full flex flex-col">
                    <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between gap-4">
                        <h2 className="text-lg font-bold">Kontrol Pratinjau</h2>
                        <div className="flex items-center gap-4">
                            <button onClick={handleGenerateReport} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Tampilkan Laporan</button>
                             <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="toggle-evaluated" 
                                    checked={hasEvaluatedItems} 
                                    onChange={() => setHasEvaluatedItems(!hasEvaluatedItems)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="toggle-evaluated" className="ml-2 block text-sm text-gray-900">
                                    Sudah Ada Item Dievaluasi?
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    {/* Memberikan flex-grow agar ReportPreview mengisi sisa ruang */}
                    <div className="flex-grow">
                        <ReportPreview 
                            htmlContent={htmlContent}
                            testerName="Budi"
                            projectName="Proyek Alfa"
                            onClearData={handleClearData}
                            onExportReportRequest={handleExport}
                            onRefreshReport={handleRefresh}
                            hasEvaluatedItems={hasEvaluatedItems}
                        />
                    </div>
                </div>
            );
        };

        // Render komponen App ke dalam DOM
        ReactDOM.render(<App />, document.getElementById('root'));

    </script>

</body>
</html>
