import React, { useState } from 'react';
import { X, Download, Upload, Trash2, Plus, Palette } from 'lucide-react';
import { useRoadmapStore } from './roadmap-store';

interface RoadmapSettingsModalProps {
  onClose: () => void;
}

const RoadmapSettingsModal: React.FC<RoadmapSettingsModalProps> = ({ onClose }) => {
  const { 
    settings, 
    updateSettings, 
    addLabel, 
    exportData, 
    importData,
    items 
  } = useRoadmapStore();
  
  const [newLabel, setNewLabel] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    setImportSuccess(false);
    
    if (!importText.trim()) {
      setImportError('Please paste JSON data to import');
      return;
    }

    const success = importData(importText);
    if (success) {
      setImportSuccess(true);
      setImportText('');
      setTimeout(() => setImportSuccess(false), 3000);
    } else {
      setImportError('Invalid JSON format. Please check your data and try again.');
    }
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !settings.availableLabels.includes(newLabel.trim())) {
      const colorClass = `bg-blue-100 text-blue-800`; // You could enhance this to use actual color
      addLabel(newLabel.trim(), colorClass);
      setNewLabel('');
      setNewLabelColor('#3B82F6');
    }
  };

  const handleRemoveLabel = (label: string) => {
    // Filter out the label from available labels
    const updatedLabels = settings.availableLabels.filter(l => l !== label);
    const { [label]: removed, ...updatedColors } = settings.labelColors;
    
    updateSettings({
      availableLabels: updatedLabels,
      labelColors: updatedColors,
    });
  };

  const handleDateRangeUpdate = (field: 'startDate' | 'endDate', value: string) => {
    const { setDateRange } = useRoadmapStore.getState();
    const currentStartDate = useRoadmapStore.getState().startDate;
    const currentEndDate = useRoadmapStore.getState().endDate;
    
    if (field === 'startDate') {
      setDateRange(value, currentEndDate);
    } else {
      setDateRange(currentStartDate, value);
    }
  };

  const themeClasses = settings.darkMode
    ? 'bg-gray-800 text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  const inputClasses = settings.darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500';

  const itemCount = Object.keys(items).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${themeClasses} rounded-lg border max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Roadmap Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              settings.darkMode ? 'hover:bg-gray-700' : ''
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* View Settings */}
          <section>
            <h3 className="text-lg font-medium mb-4">View Settings</h3>
            <div className="space-y-4">
              {/* Timeline View */}
              <div>
                <label className="block text-sm font-medium mb-2">Timeline View</label>
                <select
                  value={settings.timelineView}
                  onChange={(e) => updateSettings({ timelineView: e.target.value as any })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
                >
                  <option value="quarters">Quarters</option>
                  <option value="months">Months</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <h4 className="font-medium">Display Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.showProgress}
                      onChange={(e) => updateSettings({ showProgress: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Show progress bars</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.showLabels}
                      onChange={(e) => updateSettings({ showLabels: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Show labels</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.showDates}
                      onChange={(e) => updateSettings({ showDates: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Show dates</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Auto-save changes</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Date Range */}
          <section>
            <h3 className="text-lg font-medium mb-4">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={useRoadmapStore.getState().startDate}
                  onChange={(e) => handleDateRangeUpdate('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={useRoadmapStore.getState().endDate}
                  onChange={(e) => handleDateRangeUpdate('endDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
                />
              </div>
            </div>
          </section>

          {/* Labels Management */}
          <section>
            <h3 className="text-lg font-medium mb-4">Labels</h3>
            
            {/* Add new label */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Label name"
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              />
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-12 h-10 border rounded-lg cursor-pointer"
              />
              <button
                onClick={handleAddLabel}
                disabled={!newLabel.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Existing labels */}
            <div className="space-y-2">
              {settings.availableLabels.map((label) => (
                <div key={label} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Palette size={16} />
                    <span className={`px-2 py-1 rounded-full text-xs ${settings.labelColors[label] || 'bg-gray-100 text-gray-800'}`}>
                      {label}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className={`p-1 rounded hover:bg-gray-100 ${
                      settings.darkMode ? 'hover:bg-gray-700' : ''
                    }`}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Export/Import */}
          <section>
            <h3 className="text-lg font-medium mb-4">Data Management</h3>
            
            {/* Stats */}
            <div className={`p-4 rounded-lg mb-4 ${
              settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <p className="text-sm">
                Current roadmap contains <strong>{itemCount}</strong> items
              </p>
            </div>

            {/* Export */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Export</h4>
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Download size={16} />
                  <span>Export Roadmap</span>
                </button>
              </div>

              {/* Import */}
              <div>
                <h4 className="font-medium mb-2">Import</h4>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste JSON data here..."
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
                />
                {importError && (
                  <p className="text-red-500 text-sm mt-1">{importError}</p>
                )}
                {importSuccess && (
                  <p className="text-green-500 text-sm mt-1">Data imported successfully!</p>
                )}
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="mt-2 flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Upload size={16} />
                  <span>Import Data</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSettingsModal;