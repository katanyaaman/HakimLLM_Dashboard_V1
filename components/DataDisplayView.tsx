
import React, { useState, useMemo, useCallback } from 'react';
import { EvaluatedQuestion } from '../types';
import { 
    FolderPlusIcon, 
    ArrowLeftIcon, 
    CircleStackIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    Squares2X2Icon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChevronUpDownIcon,
    XMarkIcon
} from './IconComponents';

interface DataDisplayViewProps {
  data: EvaluatedQuestion[];
  setActiveView: (view: 'proyek') => void;
}

type SortableKeys = keyof EvaluatedQuestion;

interface SortConfig {
  key: SortableKeys;
  direction: 'ascending' | 'descending';
}

const DataDisplayView: React.FC<DataDisplayViewProps> = ({ data, setActiveView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'number', direction: 'ascending' });

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalItems: 0, withLlmAnswer: 0, withoutLlmAnswer: 0, uniqueTopics: 0 };
    }
    const withLlmAnswer = data.filter(item => item.previousLlmAnswer && item.previousLlmAnswer.trim() !== '').length;
    const uniqueTopics = new Set(data.map(item => item.title)).size;
    return {
      totalItems: data.length,
      withLlmAnswer,
      withoutLlmAnswer: data.length - withLlmAnswer,
      uniqueTopics,
    };
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let sortableData = [...data];
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      sortableData = sortableData.filter(item => 
        item.number.toLowerCase().includes(lowerSearchTerm) ||
        item.title.toLowerCase().includes(lowerSearchTerm) ||
        item.questionText.toLowerCase().includes(lowerSearchTerm) ||
        item.kbAnswer.toLowerCase().includes(lowerSearchTerm) ||
        (item.previousLlmAnswer && item.previousLlmAnswer.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        let comparison = 0;
        if (sortConfig.key === 'number') {
            // Try to sort numerically if possible, fallback to string
            const numA = parseFloat(String(valA));
            const numB = parseFloat(String(valB));
            if (!isNaN(numA) && !isNaN(numB)) {
                comparison = numA - numB;
            } else {
                comparison = String(valA).localeCompare(String(valB));
            }
        } else if (valA === undefined || valA === null) {
          comparison = (valB === undefined || valB === null) ? 0 : -1;
        } else if (valB === undefined || valB === null) {
          comparison = 1;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableData;
  }, [data, searchTerm, sortConfig]);

  const requestSort = useCallback((key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const getSortIcon = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUpDownIcon className="w-4 h-4 text-slate-400" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUpIcon className="w-4 h-4 text-sky-600" />;
    }
    return <ArrowDownIcon className="w-4 h-4 text-sky-600" />;
  };
  
  const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; bgColorClass?: string }> = 
    ({ icon, label, value, bgColorClass = "bg-sky-50" }) => (
    <div className={`flex items-center p-3 rounded-lg shadow-sm ${bgColorClass} border border-slate-200`}>
      <div className="mr-3 text-sky-600">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div className="text-lg font-bold text-slate-700">{value}</div>
      </div>
    </div>
  );


  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-xl p-8">
        <FolderPlusIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Data Dimuat</p>
        <p className="text-slate-500 mb-6">
          Untuk melihat data di sini, silakan unggah file CSV/Excel melalui tampilan 'Proyek'.
        </p>
        <button
          onClick={() => setActiveView('proyek')}
          className="flex items-center justify-center mx-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm transition-colors duration-150 ease-in-out"
          aria-label="Kembali ke tampilan Proyek untuk mengunggah data"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Kembali ke Proyek
        </button>
      </div>
    );
  }

  const headers: { key: SortableKeys; label: string }[] = [
    { key: 'number', label: "NOMOR" },
    { key: 'title', label: "TITLE/TOPIK" },
    { key: 'questionText', label: "PERTANYAAN" },
    { key: 'kbAnswer', label: "JAWABAN KB (KONTEKS)" },
    { key: 'previousLlmAnswer', label: "JAWABAN LLM (DARI FILE)" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center">
          <CircleStackIcon className="w-7 h-7 text-sky-600 mr-3" /> 
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Loaded Dataset</h2>
        </div>
         <button
          onClick={() => setActiveView('proyek')}
          className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm text-sm transition-colors"
          aria-label="Kembali ke tampilan Proyek"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
          Kembali ke Proyek
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<CircleStackIcon className="w-5 h-5" />} label="Total Item" value={stats.totalItems} bgColorClass="bg-sky-50" />
        <StatCard icon={<CheckCircleIcon className="w-5 h-5 text-green-600" />} label="Dengan Jawaban LLM" value={stats.withLlmAnswer} bgColorClass="bg-green-50" />
        <StatCard icon={<XCircleIcon className="w-5 h-5 text-red-600" />} label="Tanpa Jawaban LLM" value={stats.withoutLlmAnswer} bgColorClass="bg-red-50" />
        <StatCard icon={<Squares2X2Icon className="w-5 h-5" />} label="Topik Unik" value={stats.uniqueTopics} bgColorClass="bg-purple-50"/>
      </div>

      {/* Search Bar */}
      <div className="mb-5 relative">
        <input 
          type="search" 
          placeholder="Cari dalam data (Nomor, Topik, Pertanyaan, dll)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
        </div>
        {searchTerm && (
            <button 
                onClick={() => setSearchTerm('')} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Hapus pencarian"
            >
                <XMarkIcon className="w-5 h-5"/>
            </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y-0">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              {headers.map(header => (
                <th 
                  key={header.key} 
                  scope="col" 
                  className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => requestSort(header.key)}
                  aria-sort={sortConfig?.key === header.key ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
                >
                  <div className="flex items-center">
                    {header.label}
                    <span className="ml-1.5">{getSortIcon(header.key)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredAndSortedData.map((item, index) => {
              const hasNoLlmAnswer = !item.previousLlmAnswer || item.previousLlmAnswer.trim() === '';
              return (
                <tr 
                  key={item.id || index} 
                  className={`
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} 
                    ${hasNoLlmAnswer ? 'bg-yellow-50 hover:bg-yellow-100/70' : 'hover:bg-sky-50/70'}
                    transition-colors duration-150
                  `}
                  title={hasNoLlmAnswer ? "Item ini tidak memiliki 'Jawaban LLM (dari file)' dan tidak dapat dievaluasi." : ""}
                >
                  <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap font-medium border-b border-slate-200">{item.number}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 whitespace-normal break-words min-w-[150px] max-w-[250px] border-b border-slate-200">{item.title}</td>
                  <td className="px-5 py-3 text-sm text-slate-700 whitespace-normal break-words min-w-[200px] max-w-[350px] leading-relaxed border-b border-slate-200">{item.questionText}</td>
                  <td className="px-5 py-3 text-sm text-slate-600 whitespace-normal break-words min-w-[250px] max-w-[400px] italic leading-relaxed border-b border-slate-200">{item.kbAnswer}</td>
                  <td className={`px-5 py-3 text-sm whitespace-normal break-words min-w-[250px] max-w-[400px] leading-relaxed border-b border-slate-200 ${hasNoLlmAnswer ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                    {item.previousLlmAnswer || "(Kosong)"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filteredAndSortedData.length === 0 && searchTerm && (
        <p className="text-center text-slate-500 mt-6 py-4">Tidak ada data yang cocok dengan pencarian Anda.</p>
      )}
      {filteredAndSortedData.length > 10 && (
         <p className="text-xs text-slate-500 mt-4 text-center">Scroll ke samping untuk melihat semua kolom jika tabel terlalu lebar.</p>
      )}
    </div>
  );
};

export default DataDisplayView;
