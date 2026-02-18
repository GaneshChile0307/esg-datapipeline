'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface ReportDownloadProps {
  esgData: ESGData | null;
  selectedStrategy: SelectedStrategy | null;
}

export default function ReportDownload({ esgData, selectedStrategy }: ReportDownloadProps) {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!esgData) return;

    setGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.35) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.35 + 5;
      };

      // Title
      pdf.setFillColor(59, 130, 246); // Blue
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESG Report', margin, 25);
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 33);

      yPosition = 50;
      pdf.setTextColor(0, 0, 0);

      // Company Information
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Company Information', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Company: ${esgData.company_name}`, margin, yPosition);
      yPosition += 7;
      pdf.text(`Reporting Year: ${esgData.reporting_year}`, margin, yPosition);
      yPosition += 15;

      // Emissions Data Section
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Emissions Data', margin, yPosition);
      yPosition += 10;

      const total = esgData.scope1_tco2e + esgData.scope2_tco2e + (esgData.scope3_tco2e || 0);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Scope 1
      pdf.setFillColor(239, 68, 68); // Red
      pdf.rect(margin, yPosition - 3, 5, 5, 'F');
      pdf.text(`Scope 1 (Direct Emissions): ${esgData.scope1_tco2e.toFixed(2)} tCO₂e`, margin + 8, yPosition);
      yPosition += 7;

      // Scope 2
      pdf.setFillColor(249, 115, 22); // Orange
      pdf.rect(margin, yPosition - 3, 5, 5, 'F');
      pdf.text(`Scope 2 (Energy Indirect): ${esgData.scope2_tco2e.toFixed(2)} tCO₂e`, margin + 8, yPosition);
      yPosition += 7;

      // Scope 3 (if present)
      if (esgData.scope3_tco2e && esgData.scope3_tco2e > 0) {
        pdf.setFillColor(234, 179, 8); // Yellow
        pdf.rect(margin, yPosition - 3, 5, 5, 'F');
        pdf.text(`Scope 3 (Value Chain): ${esgData.scope3_tco2e.toFixed(2)} tCO₂e`, margin + 8, yPosition);
        yPosition += 7;
      }

      // Total
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total Emissions: ${total.toFixed(2)} tCO₂e`, margin, yPosition);
      yPosition += 15;

      // Chart section
      pdf.setFontSize(18);
      pdf.text('Emissions Chart', margin, yPosition);
      yPosition += 10;

      // Capture chart as image
      const chartElement = document.querySelector('.recharts-wrapper');
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement as HTMLElement, {
            backgroundColor: '#ffffff',
            scale: 2,
          });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page for the chart
          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        } catch (error) {
          console.error('Error capturing chart:', error);
          pdf.setFontSize(10);
          pdf.text('(Chart could not be captured)', margin, yPosition);
          yPosition += 15;
        }
      }

      // Strategy Section
      if (selectedStrategy) {
        // New page for strategy
        pdf.addPage();
        yPosition = margin;

        pdf.setFillColor(34, 197, 94); // Green
        pdf.rect(0, 0, pageWidth, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ESG Strategy', margin, 20);

        yPosition = 40;
        pdf.setTextColor(0, 0, 0);

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const variantLabel = selectedStrategy.variant === 'short' ? 'Short Strategy (2-4 sentences)' :
                            selectedStrategy.variant === 'neutral' ? 'Neutral Strategy (5-8 sentences)' :
                            'Detailed Strategy';
        pdf.text(variantLabel, margin, yPosition);
        yPosition += 10;

        // Strategy content
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const strategyLines = pdf.splitTextToSize(selectedStrategy.content, pageWidth - 2 * margin);
        
        strategyLines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
      }

      // Footer on last page
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${pageCount} | ${esgData.company_name} ESG Report ${esgData.reporting_year}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `ESG_Report_${esgData.company_name.replace(/\s+/g, '_')}_${esgData.reporting_year}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!esgData) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Download Report</h3>
        <div className="text-gray-500 text-center py-8">
          Please save ESG data first to generate a report.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Download ESG Report</h3>

      <div className="space-y-4">
        {/* Report Preview Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📄 Report Contents:</h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>✓ Company information</li>
            <li>✓ Emissions data (Scope 1, 2{esgData.scope3_tco2e ? ', 3' : ''})</li>
            <li>✓ Emissions chart visualization</li>
            {selectedStrategy ? (
              <li>✓ Selected ESG strategy ({selectedStrategy.variant})</li>
            ) : (
              <li className="text-orange-600">⚠ No strategy selected (generate and select one first)</li>
            )}
          </ul>
        </div>

        {/* Download Button */}
        <button
          onClick={generatePDF}
          disabled={generating}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              📥 Download PDF Report
            </>
          )}
        </button>

        {/* Info text */}
        <p className="text-xs text-gray-500 text-center">
          PDF includes company data, emissions chart, and selected strategy
        </p>
      </div>
    </div>
  );
}
