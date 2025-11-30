import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import FinancialTable from './components/FinancialTable';
import AddCompanyForm from './components/AddCompanyForm';
import { analyzeCompetitors, analyzeSingleCompany } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { downloadCSV, downloadPDF } from './utils/export';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [isAdding, setIsAdding] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setLoadingState(LoadingState.LOADING);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await analyzeCompetitors(query);
      setResult(data);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : "An unexpected error occurred");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleAddCompany = async (query: string) => {
    if (!result) return;

    // 1. Pre-fetch check: specific ticker or name match
    const normalizedQuery = query.trim().toUpperCase();
    const duplicatePreCheck = result.companies.find(
      c => c.ticker.toUpperCase() === normalizedQuery || c.name.toUpperCase() === normalizedQuery
    );

    if (duplicatePreCheck) {
      alert(`The company "${duplicatePreCheck.name}" (${duplicatePreCheck.ticker}) is already in the list.`);
      return;
    }

    setIsAdding(true);
    try {
      const { company, sources } = await analyzeSingleCompany(query);
      
      // 2. Post-fetch check: check against returned actual ticker to ensure no duplicates via different naming (e.g. "Target" vs "TGT")
      setResult(prev => {
        if (!prev) return null;

        const alreadyExists = prev.companies.some(
          c => c.ticker.toUpperCase() === company.ticker.toUpperCase()
        );

        if (alreadyExists) {
          alert(`The company "${company.name}" (${company.ticker}) is already in the list.`);
          return prev;
        }

        // Merge sources and unique them
        const newSources = [...prev.sources, ...sources].filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i).slice(0, 12);
        
        return {
          companies: [...prev.companies, company],
          sources: newSources
        };
      });
    } catch (error) {
      alert("Could not add company. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleExportCSV = () => {
    if (result) downloadCSV(result.companies);
  };

  const handleExportPDF = () => {
    if (result) downloadPDF(result.companies, `Competitor Analysis: ${result.companies[0].name}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0zm1.5 0v.002c0 .019.002.038.006.058l.005.027c.005.027.01.054.017.082l.01.033c.01.033.02.066.031.098l.013.036c.015.038.032.076.049.112l.018.038c.022.044.045.087.07.13l.02.036c.028.048.058.095.09.14l.022.031c.036.05.074.098.114.145l.024.027c.044.049.09.096.137.141l.026.024a7.46 7.46 0 00.16.14l.03.023c.058.045.118.088.18.128l.03.02c.067.043.136.084.207.122l.032.017c.077.04.156.077.237.111l.032.013c.088.035.178.067.27.096l.032.01c.098.028.198.052.3.073l.031.006c.11.02.221.036.334.048l.03.003c.123.01.248.016.374.018l.028.001c.148.002.298.002.448 0h.002a7.492 7.492 0 00.327-.01l.031-.003a7.488 7.488 0 00.334-.048l.031-.006c.102-.02.202-.045.3-.073l.032-.01c.092-.029.182-.06.27-.096l.032-.013c.08-.034.16-.07.237-.111l.032-.017c.07-.038.14-.079.207-.122l.03-.02a7.514 7.514 0 00.18-.128l.03-.023a7.485 7.485 0 00.16-.14l.026-.024a7.463 7.463 0 00.137-.141l.024-.027a7.467 7.467 0 00.114-.145l.022-.031c.032-.045.062-.092.09-.14l.02-.036a7.493 7.493 0 00.07-.13l.018-.038a7.478 7.478 0 00.049-.112l.013-.036a7.49 7.49 0 00.031-.098l.01-.033a7.466 7.466 0 00.017-.082l.005-.027a7.426 7.426 0 00.006-.058v-.002H13.5v-7.5a.75.75 0 00-.75-.75H12v.002a7.426 7.426 0 00-.058.006l-.027.005a7.466 7.466 0 00-.082.017l-.033.01a7.49 7.49 0 00-.098.031l-.036.013a7.478 7.478 0 00-.112.049l-.038.018a7.493 7.493 0 00-.13.07l-.036.02a7.493 7.493 0 00-.14.09l-.031.022a7.467 7.467 0 00-.145.114l-.027.024a7.463 7.463 0 00-.141.137l-.024.026a7.485 7.485 0 00-.14.16l-.023.03a7.514 7.514 0 00-.128.18l-.02.03a7.483 7.483 0 00-.122.207l-.017.032a7.463 7.463 0 00-.111.237l-.013.032a7.48 7.48 0 00-.096.27l-.01.032a7.465 7.465 0 00-.073.3l-.006.031a7.49 7.49 0 00-.048.334l-.003.03a7.483 7.483 0 00-.018.374l-.001.028v.448z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FinCompete<span className="text-indigo-600">.ai</span></h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Comparative Valuation Tool
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Compare Financial Metrics Instantly</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Get a comprehensive table comparing Market Cap, ROE, WACC, and more for any public company and its top 5 competitors. Data sourced from Yahoo Finance, TIKR, and others.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={loadingState === LoadingState.LOADING} />

        {loadingState === LoadingState.LOADING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Scanning financial markets & generating report...</p>
            <p className="text-slate-400 text-sm">This may take up to 20 seconds</p>
          </div>
        )}

        {loadingState === LoadingState.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-1">Analysis Failed</h3>
            <p className="text-red-700">{errorMsg || "We couldn't retrieve the data. Please check the ticker symbol or try again later."}</p>
          </div>
        )}

        {loadingState === LoadingState.SUCCESS && result && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-slate-800">Competitive Landscape: {result.companies[0]?.name}</h3>
                <span className="text-sm text-slate-500">Currency: Reported</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="mr-2 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="mr-2 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
            
            <FinancialTable data={result.companies} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AddCompanyForm onAdd={handleAddCompany} isAdding={isAdding} />
              
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Data Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {result.sources.length > 0 ? (
                    result.sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:ring-1 hover:ring-indigo-700/20 transition-all"
                      >
                        {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                        <svg className="ml-1.5 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm italic">Aggregated from market data providers via Google Search.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-xs text-indigo-800">
              <strong>Disclaimer:</strong> Financial figures (especially WACC, Ke, Kd) are estimates derived from public sources and models. Always verify with official filings before making investment decisions.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;