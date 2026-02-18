'use client';

import { useState, useEffect } from 'react';

interface ESGData {
  company_name: string;
  reporting_year: number;
  scope1_tco2e: number;
  scope2_tco2e: number;
  scope3_tco2e?: number;
  energy_consumption_kwh?: number;
  notes?: string;
}

interface ESGDataFormProps {
  onDataSaved?: () => void;
}

export default function ESGDataForm({ onDataSaved }: ESGDataFormProps) {
  const [formData, setFormData] = useState<ESGData>({
    company_name: '',
    reporting_year: new Date().getFullYear(),
    scope1_tco2e: 0,
    scope2_tco2e: 0,
    scope3_tco2e: 0,
    energy_consumption_kwh: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/esg-data');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData(data);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.reporting_year) {
      newErrors.reporting_year = 'Reporting year is required';
    } else if (formData.reporting_year < 1900 || formData.reporting_year > 2100) {
      newErrors.reporting_year = 'Please enter a valid year';
    }

    if (formData.scope1_tco2e === undefined || formData.scope1_tco2e < 0) {
      newErrors.scope1_tco2e = 'Scope 1 emissions must be a non-negative number';
    }

    if (formData.scope2_tco2e === undefined || formData.scope2_tco2e < 0) {
      newErrors.scope2_tco2e = 'Scope 2 emissions must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/esg-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Notify parent component that data was saved
        if (onDataSaved) {
          onDataSaved();
        }
      } else {
        const error = await response.json();
        setErrors({ submit: error.error || 'Failed to save data' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ESGData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">ESG Data Entry</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
          )}
        </div>

        {/* Reporting Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reporting Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.reporting_year}
            onChange={(e) => handleChange('reporting_year', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          {errors.reporting_year && (
            <p className="mt-1 text-sm text-red-600">{errors.reporting_year}</p>
          )}
        </div>

        {/* Scope 1 Emissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scope 1 tCO2e <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.scope1_tco2e}
            onChange={(e) => handleChange('scope1_tco2e', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          {errors.scope1_tco2e && (
            <p className="mt-1 text-sm text-red-600">{errors.scope1_tco2e}</p>
          )}
        </div>

        {/* Scope 2 Emissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scope 2 tCO2e <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.scope2_tco2e}
            onChange={(e) => handleChange('scope2_tco2e', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          {errors.scope2_tco2e && (
            <p className="mt-1 text-sm text-red-600">{errors.scope2_tco2e}</p>
          )}
        </div>

        {/* Scope 3 Emissions (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scope 3 tCO2e (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.scope3_tco2e}
            onChange={(e) => handleChange('scope3_tco2e', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Energy Consumption (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Energy Consumption (kWh) (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.energy_consumption_kwh}
            onChange={(e) => handleChange('energy_consumption_kwh', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : 'Save ESG Data'}
          </button>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✓ Data saved successfully!
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}
      </form>
    </div>
  );
}
