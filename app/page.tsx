'use client';

import { useState, useEffect } from 'react';
import ESGDataForm from './components/ESGDataForm';
import EmissionsChart from './components/EmissionsChart';
import StrategyGenerator from './components/StrategyGenerator';
import ReportDownload from './components/ReportDownload';

interface ESGData {
  company_name: string;
  reporting_year: number;
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e?: number;
  energy_consumption_kwh?: number;
  notes?: string;
}

interface SelectedStrategy {
  variant: 'short' | 'neutral' | 'detailed';
  content: string;
}

export default function Home() {
  const [esgData, setEsgData] = useState<ESGData | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<SelectedStrategy | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
    loadSelectedStrategy();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/esg-data');
      if (response.ok) {
        const data = await response.json();
        setEsgData(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadSelectedStrategy = async () => {
    try {
      const response = await fetch('/api/selected-strategy');
      if (response.ok) {
        const data = await response.json();
        setSelectedStrategy(data);
      }
    } catch (error) {
      console.error('Failed to load strategy:', error);
    }
  };

  const handleStrategySelected = () => {
    // Reload selected strategy when user selects one
    loadSelectedStrategy();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          ESG Reporting Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Data Entry Form */}
          <div>
            <ESGDataForm onDataSaved={loadData} />
          </div>
          
          {/* Emissions Chart */}
          <div>
            <EmissionsChart data={esgData} />
          </div>
        </div>

        {/* Strategy Generation - Full Width */}
        <div className="mb-6">
          <StrategyGenerator esgData={esgData} onStrategySelected={handleStrategySelected} />
        </div>

        {/* Report Download - Full Width */}
        <div className="mb-6">
          <ReportDownload esgData={esgData} selectedStrategy={selectedStrategy} />
        </div>
      </div>
    </div>
  );
}
