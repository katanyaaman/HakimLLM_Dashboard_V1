
import React, { useMemo, useState } from 'react'; 
import { EvaluatedQuestion, AnalyticsData } from '../types'; // Import AnalyticsData from types
import {
  ChartBarIcon,
  ClockIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FolderPlusIcon,
  QuestionMarkCircleIcon,
  DownloadIcon,
  RefreshIcon, 
  LinkIcon, // For historical data indicator
} from './IconComponents';
import { generateAnalyticsHTMLReport } from '../services/reportService'; 

interface AnalitikViewProps {
  questionsData: EvaluatedQuestion[];
  historicalSnapshot?: AnalyticsData | null;
  onSwitchToLiveAnalytics?: () => void;
}


const getScoreColorText = (score?: number): string => {
  if (score === undefined || score === null) return 'text-slate-500';
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreColorBg = (score?: number): string => {
    if (score === undefined || score === null) return 'bg-slate-300'; 
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };


const AnalitikView: React.FC<AnalitikViewProps> = ({ questionsData, historicalSnapshot, onSwitchToLiveAnalytics }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const analyticsData = useMemo((): AnalyticsData | null => {
    if (historicalSnapshot) {
      return historicalSnapshot;
    }

    if (!questionsData || questionsData.length === 0) {
      return null;
    }

    const totalItems = questionsData.length;
    const evaluatedItems = questionsData.filter(q => q.evaluation);
    const notEvaluatedCount = totalItems - evaluatedItems.length;

    const itemsLlmAnswerKosong = questionsData.filter(q => 
        q.evaluation && 
        q.evaluation.error &&
        (q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'") || q.evaluation.justification.includes("Jawaban LLM kosong"))
    ).length;

    const validScores = evaluatedItems
      .map(q => q.evaluation?.score)
      .filter(score => typeof score === 'number' && !isNaN(score)) as number[];
    
    const averageScore = validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
    
    let scoreInterpretation = "Data evaluasi tidak cukup";
    if (validScores.length > 0) {
        if (averageScore >= 0.9) scoreInterpretation = "Sangat Baik";
        else if (averageScore >= 0.75) scoreInterpretation = "Baik";
        else if (averageScore >= 0.5) scoreInterpretation = "Cukup";
        else if (averageScore > 0) scoreInterpretation = "Perlu Perbaikan Signifikan";
        else scoreInterpretation = "Evaluasi Belum Optimal";
    }
    if (validScores.length === 0 && totalItems > 0 && notEvaluatedCount < totalItems) scoreInterpretation = "Belum ada skor valid";
    else if (notEvaluatedCount === totalItems) scoreInterpretation = "Semua item belum dievaluasi";


    const countSesuai = evaluatedItems.filter(q => q.evaluation?.isAppropriate === true).length;
    const countTidakSesuai = evaluatedItems.filter(q => q.evaluation?.isAppropriate === false).length;
    
    const countErrorLlmAktual = evaluatedItems.filter(q => 
      q.evaluation?.error &&
      q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "" &&
      !q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'") &&
      !q.evaluation.justification.includes("Jawaban LLM kosong")
    ).length;


    const topicsData: { 
        [key: string]: { 
            scores: number[], 
            count: number, 
            sesuai: number, 
            tidakSesuai: number, 
            errorLlmAktual: number, 
            llmAnswerKosong: number,
            belumDievaluasi: number 
        } 
    } = {};

    questionsData.forEach(q => {
      if (!topicsData[q.title]) {
        topicsData[q.title] = { scores: [], count: 0, sesuai: 0, tidakSesuai: 0, errorLlmAktual: 0, llmAnswerKosong: 0, belumDievaluasi: 0 };
      }
      topicsData[q.title].count++;
      if (q.evaluation) {
        if (typeof q.evaluation.score === 'number' && !isNaN(q.evaluation.score)) {
          topicsData[q.title].scores.push(q.evaluation.score);
        }
        if (q.evaluation.isAppropriate === true) topicsData[q.title].sesuai++;
        else if (q.evaluation.isAppropriate === false) topicsData[q.title].tidakSesuai++;
        
        if (q.evaluation.error) {
            if (q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "" && !q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'") && !q.evaluation.justification.includes("Jawaban LLM kosong")) {
                topicsData[q.title].errorLlmAktual++;
            } else if (q.evaluation.justification.includes("Tidak ada 'Jawaban LLM'") || q.evaluation.justification.includes("Jawaban LLM kosong")) {
                topicsData[q.title].llmAnswerKosong++;
            }
        }
      } else {
        topicsData[q.title].belumDievaluasi++;
      }
    });

    const kinerjaPerTopik = Object.entries(topicsData).map(([title, data]) => {
      const avgScore = data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0;
      return {
        topik: title,
        skorRataRata: avgScore,
        totalItem: data.count,
        sesuai: data.sesuai,
        tidakSesuai: data.tidakSesuai,
        errorLlmAktual: data.errorLlmAktual,
        llmAnswerKosong: data.llmAnswerKosong,
        belumDievaluasi: data.belumDievaluasi,
      };
    }).sort((a,b) => b.skorRataRata - a.skorRataRata); 

    const itemSkorTerendah = questionsData
      .filter(q => q.evaluation && typeof q.evaluation.score === 'number' && !isNaN(q.evaluation.score))
      .sort((a, b) => (a.evaluation!.score!) - (b.evaluation!.score!))
      .slice(0, 5)
      .map((q) => ({
        id: q.id,
        number: q.number,
        title: q.title,
        justification: q.evaluation!.justification || "Tidak ada justifikasi.",
        score: q.evaluation!.score!,
      }));

    const scoreBins = [
        { label: '0-0.19', min: 0, max: 0.19, count: 0, color: 'bg-red-500' },
        { label: '0.2-0.39', min: 0.2, max: 0.39, count: 0, color: 'bg-red-400' },
        { label: '0.4-0.59', min: 0.4, max: 0.59, count: 0, color: 'bg-yellow-500' },
        { label: '0.6-0.79', min: 0.6, max: 0.79, count: 0, color: 'bg-yellow-400' },
        { label: '0.8-1.0', min: 0.8, max: 1.0, count: 0, color: 'bg-green-500' },
    ];
    validScores.forEach(score => {
        for (const bin of scoreBins) {
            if (score >= bin.min && score <= bin.max) {
                bin.count++;
                break;
            }
        }
    });
    const maxDistributionCount = Math.max(...scoreBins.map(bin => bin.count), 0);

    let totalQuestionTextLength = 0;
    let questionTextCount = 0;
    let totalKbAnswerLength = 0;
    let kbAnswerCount = 0;
    let totalPreviousLlmAnswerLength = 0;
    let previousLlmAnswerCount = 0;

    questionsData.forEach(q => {
        if (q.questionText) {
            totalQuestionTextLength += q.questionText.length;
            questionTextCount++;
        }
        if (q.kbAnswer) {
            totalKbAnswerLength += q.kbAnswer.length;
            kbAnswerCount++;
        }
        if (q.previousLlmAnswer && q.previousLlmAnswer.trim() !== "") {
            totalPreviousLlmAnswerLength += q.previousLlmAnswer.length;
            previousLlmAnswerCount++;
        }
    });
    
    const avgQuestionLength = questionTextCount > 0 ? (totalQuestionTextLength / questionTextCount).toFixed(0) : '0';
    const avgKbAnswerLength = kbAnswerCount > 0 ? (totalKbAnswerLength / kbAnswerCount).toFixed(0) : '0';
    const avgPrevLlmAnswerLength = previousLlmAnswerCount > 0 ? (totalPreviousLlmAnswerLength / previousLlmAnswerCount).toFixed(0) : '0';

    const topikBermasalah = kinerjaPerTopik
        .map(t => ({
            topik: t.topik,
            totalBermasalah: t.tidakSesuai + t.errorLlmAktual,
            detailTidakSesuai: t.tidakSesuai,
            detailErrorAktual: t.errorLlmAktual,
        }))
        .filter(t => t.totalBermasalah > 0)
        .sort((a, b) => b.totalBermasalah - a.totalBermasalah)
        .slice(0, 5);


    return {
      totalItems,
      evaluatedItemCount: evaluatedItems.length,
      averageScore,
      scoreInterpretation,
      proporsi: {
        sesuai: countSesuai,
        tidakSesuai: countTidakSesuai,
        errorLlmAktual: countErrorLlmAktual,
      },
      kinerjaPerTopik,
      itemSkorTerendah,
      scoreDistribution: { bins: scoreBins, maxCount: maxDistributionCount },
      unprocessedSummary: {
          belumDievaluasiSamaSekali: notEvaluatedCount,
          llmAnswerKosong: itemsLlmAnswerKosong,
      },
      averageTextLengths: {
          pertanyaan: avgQuestionLength,
          jawabanKb: avgKbAnswerLength,
          jawabanLlm: avgPrevLlmAnswerLength,
      },
      topikBermasalah,
    };
  }, [questionsData, historicalSnapshot, refreshTrigger]); 

  const handleLocalRefreshAnalytics = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExportAnalyticsToHTML = () => {
    if (!analyticsData) {
      alert("Tidak ada data analitik untuk diekspor.");
      return;
    }
    const htmlContent = generateAnalyticsHTMLReport(analyticsData);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'laporan_analitik_hakim_llm.html');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (!analyticsData) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-xl p-8">
        <FolderPlusIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-xl font-semibold text-slate-700 mb-2">Belum Ada Data Evaluasi</p>
        <p className="text-slate-500">Unggah dan evaluasi data terlebih dahulu untuk melihat analitik.</p>
      </div>
    );
  }

  const { 
      evaluatedItemCount, 
      averageScore, 
      scoreInterpretation, 
      proporsi, 
      kinerjaPerTopik, 
      itemSkorTerendah,
      scoreDistribution,
      unprocessedSummary,
      averageTextLengths,
      topikBermasalah,
    } = analyticsData;

  const getProgressBarColor = (score?: number) => {
    if (score === undefined || score === null || isNaN(score)) return 'bg-slate-300';
    if (score >= 0.8) return 'bg-sky-500'; 
    if (score >= 0.5) return 'bg-sky-400';
    return 'bg-sky-300';
  };
  
  const scoreValueForDisplay = (averageScore * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-0 sm:mb-2 gap-3">
        <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-sky-600 mr-3" />
            <h1 className="text-3xl font-bold text-slate-800">Dashboard Analitik</h1>
        </div>
        <div className="flex items-center gap-2">
            {historicalSnapshot && onSwitchToLiveAnalytics ? (
                <button
                    onClick={onSwitchToLiveAnalytics}
                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                    title="Kembali ke analitik data saat ini"
                    aria-label="Lihat analitik data saat ini"
                >
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    Analitik Terkini
                </button>
            ) : (
                <button
                    onClick={handleLocalRefreshAnalytics}
                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                    title="Refresh data analitik"
                    aria-label="Refresh data analitik"
                >
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    Refresh
                </button>
            )}
            <button
                onClick={handleExportAnalyticsToHTML}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm text-sm transition-colors duration-150 ease-in-out"
                title="Unduh laporan analitik ini sebagai file HTML"
                aria-label="Unduh laporan analitik sebagai HTML"
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download HTML
            </button>
        </div>
      </div>

      {historicalSnapshot && (
        <div className="p-3 mb-4 bg-sky-50 border border-sky-200 rounded-md text-sm text-sky-700 flex items-center">
          <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          Menampilkan snapshot analitik historis. Untuk melihat data terkini, klik tombol "Analitik Terkini".
        </div>
      )}


      {/* Row 1: Skor Kualitas & Proporsi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skor Kualitas Keseluruhan */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center text-base font-medium text-slate-500 mb-3">
            <ClockIcon className="w-5 h-5 mr-2" />
            SKOR KUALITAS KESELURUHAN
          </div>
          <p className="text-5xl font-bold text-sky-600 mb-2">
            {scoreValueForDisplay}%
          </p>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full ${getProgressBarColor(averageScore)}`}
              style={{ width: `${scoreValueForDisplay}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500">Interpretasi: {scoreInterpretation}</p>
        </div>

        {/* Proporsi Hasil Evaluasi */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center text-base font-medium text-slate-500 mb-4">
            <ClockIcon className="w-5 h-5 mr-2" />
            PROPORSI HASIL EVALUASI (dari item dievaluasi)
          </div>
          <div className="space-y-3">
            {[
              { label: 'Sesuai', value: proporsi.sesuai, color: 'bg-green-500', icon: <CheckCircleIcon className="w-5 h-5 text-green-500" /> },
              { label: 'Tidak Sesuai', value: proporsi.tidakSesuai, color: 'bg-red-500', icon: <XCircleIcon className="w-5 h-5 text-red-500" /> },
              { label: 'Error Proses Aktual', value: proporsi.errorLlmAktual, color: 'bg-yellow-500', icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /> },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center text-slate-700">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    {item.value} ({evaluatedItemCount > 0 ? ((item.value / evaluatedItemCount) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.color}`}
                    style={{ width: evaluatedItemCount > 0 ? `${(item.value / evaluatedItemCount) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Total Evaluasi & Status Pemrosesan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center text-base font-medium text-slate-500 mb-2">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                TOTAL EVALUASI
            </div>
            <p className="text-5xl font-bold text-slate-700">{evaluatedItemCount}</p>
            <p className="text-xs text-slate-500">item dari {analyticsData.totalItems} total telah dievaluasi.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center text-base font-medium text-slate-500 mb-3">
                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                STATUS PEMROSESAN ITEM
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Belum Dievaluasi Sama Sekali:</span>
                    <span className="font-semibold text-sky-600">{unprocessedSummary.belumDievaluasiSamaSekali} item</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Jawaban LLM Pengguna Kosong (Tidak Diproses):</span>
                    <span className="font-semibold text-amber-600">{unprocessedSummary.llmAnswerKosong} item</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* Row 3: Distribusi Skor & Rata-rata Panjang Teks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Skor Kualitas */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center text-base font-medium text-slate-500 mb-4">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            DISTRIBUSI SKOR KUALITAS
          </div>
          {scoreDistribution.maxCount > 0 ? (
            <div className="space-y-2">
              {scoreDistribution.bins.map(bin => (
                <div key={bin.label} className="flex items-center text-sm">
                  <span className="w-16 text-slate-600">{bin.label}</span>
                  <div className="flex-grow bg-slate-200 rounded-full h-4 mr-2">
                    <div
                      className={`h-4 rounded-full ${bin.color} transition-all duration-500 ease-out`}
                      style={{ width: scoreDistribution.maxCount > 0 ? `${(bin.count / scoreDistribution.maxCount) * 100}%` : '0%'}}
                    ></div>
                  </div>
                  <span className="w-8 text-slate-700 font-medium text-right">{bin.count}</span>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-slate-500 text-sm py-4">Tidak ada data skor untuk ditampilkan.</p>
          )}
        </div>

        {/* Rata-rata Panjang Teks */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center text-base font-medium text-slate-500 mb-3">
                <TableCellsIcon className="w-5 h-5 mr-2" />
                RATA-RATA PANJANG TEKS
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pertanyaan:</span>
                    <span className="font-semibold text-slate-700">{averageTextLengths.pertanyaan} karakter</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Jawaban KB:</span>
                    <span className="font-semibold text-slate-700">{averageTextLengths.jawabanKb} karakter</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-600">Jawaban LLM Pengguna:</span>
                    <span className="font-semibold text-slate-700">{averageTextLengths.jawabanLlm} karakter</span>
                </div>
            </div>
        </div>
      </div>


      {/* Row 4: Analisis Kinerja & Item Skor Terendah & Topik Bermasalah */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Analisis Kinerja per Topik */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center text-base font-medium text-slate-500 mb-4">
             <TableCellsIcon className="w-5 h-5 mr-2" />
            ANALISIS KINERJA PER TOPIK
          </div>
          {kinerjaPerTopik.length > 0 ? (
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar-thin">
              <table className="min-w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">TOPIK</th>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">SKOR RATA-RATA</th>
                    <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" title="Sesuai">SES</th>
                    <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" title="Tidak Sesuai">TDK</th>
                    <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" title="Error Aktual">ERR</th>
                    <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" title="Jawaban LLM Kosong">KSG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kinerjaPerTopik.map((item, index) => (
                    <tr key={index} className="hover:bg-sky-50/30 transition-colors">
                      <td className="py-2.5 px-3 text-sm text-slate-700 font-medium whitespace-nowrap max-w-[200px] truncate" title={item.topik}>{item.topik}</td>
                      <td className="py-2.5 px-3 text-sm text-slate-700 w-24">
                        {(item.totalItem - item.belumDievaluasi - item.llmAnswerKosong) > 0 ? (
                            <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-sky-500"
                                style={{ width: `${item.skorRataRata * 100}%` }}
                            ></div>
                            </div>
                        ) : (
                            <span className="text-slate-400 italic text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-green-600 text-center font-medium">{item.sesuai > 0 ? item.sesuai : '-'}</td>
                      <td className="py-2.5 px-3 text-sm text-red-600 text-center font-medium">{item.tidakSesuai > 0 ? item.tidakSesuai : '-'}</td>
                      <td className="py-2.5 px-3 text-sm text-yellow-600 text-center font-medium">{item.errorLlmAktual > 0 ? item.errorLlmAktual : '-'}</td>
                      <td className="py-2.5 px-3 text-sm text-amber-700 text-center font-medium">{item.llmAnswerKosong > 0 ? item.llmAnswerKosong : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4">Tidak ada data topik untuk ditampilkan.</p>
          )}
        </div>
        
        <div className="space-y-6">
            {/* Item dengan Skor Terendah */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center text-base font-medium text-slate-500 mb-4">
                    <ArrowTrendingDownIcon className="w-5 h-5 mr-2" />
                    ITEM DENGAN SKOR TERENDAH (TOP 5)
                </div>
                {itemSkorTerendah.length > 0 ? (
                    <ul className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar-thin pr-1">
                    {itemSkorTerendah.map((item, idx) => (
                        <li key={item.id} className="p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all">
                        <div className="flex justify-between items-start mb-0.5">
                            <p className="text-sm font-medium text-slate-700 max-w-[calc(100%-80px)] truncate" title={`${item.number} - ${item.title}`}>
                                <span className="text-slate-600">{`#${idx + 1}`} - {item.title}</span>
                            </p>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md text-white ${getScoreColorBg(item.score)}`}>
                                Skor: {item.score.toFixed(2)}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate" title={item.justification}>
                            Justifikasi: <span className="italic">{item.justification}</span>
                        </p>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-sm py-4">Tidak ada item dengan skor untuk ditampilkan di sini.</p>
                )}
            </div>

            {/* Topik Paling Bermasalah */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center text-base font-medium text-slate-500 mb-4">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500" />
                    TOPIK PERLU PERHATIAN KHUSUS (TOP 5)
                </div>
                {topikBermasalah.length > 0 ? (
                <div className="overflow-x-auto max-h-[160px] custom-scrollbar-thin">
                    <table className="min-w-full">
                        <thead className="sticky top-0 bg-white z-10">
                        <tr>
                            <th className="py-2 px-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">TOPIK</th>
                            <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" title="Tidak Sesuai">TDK SESUAI</th>
                            <th className="py-2 px-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider" title="Error Aktual">ERROR AKTUAL</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {topikBermasalah.map((item, index) => (
                            <tr key={index} className="hover:bg-red-50/30 transition-colors">
                            <td className="py-2.5 px-3 text-sm text-slate-700 font-medium whitespace-nowrap max-w-xs truncate" title={item.topik}>{item.topik}</td>
                            <td className="py-2.5 px-3 text-sm text-red-600 text-center font-medium">{item.detailTidakSesuai > 0 ? item.detailTidakSesuai : '-'}</td>
                            <td className="py-2.5 px-3 text-sm text-yellow-600 text-center font-medium">{item.detailErrorAktual > 0 ? item.detailErrorAktual : '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                <p className="text-slate-500 text-sm py-4">Tidak ada topik bermasalah yang teridentifikasi.</p>
                )}
            </div>
        </div> {/* End of combined right column */}


      </div>
    </div>
  );
};


const style = document.createElement('style');
style.innerHTML = `
  .custom-scrollbar-thin::-webkit-scrollbar {
    width: 6px; height: 6px;
  }
  .custom-scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f5f9; /* slate-100 */
    border-radius: 3px;
  }
  .custom-scrollbar-thin::-webkit-scrollbar-thumb {
    background: #cbd5e1; /* slate-300 */
    border-radius: 3px;
  }
  .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #94a3b8; /* slate-400 */
  }
`;
document.head.appendChild(style);


export default AnalitikView;
