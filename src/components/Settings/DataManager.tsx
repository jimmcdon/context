import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGTDStore } from '../../store/gtdStore';
import { storage } from '../../utils/storage';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { exportData, importData, clearAllData } = useGTDStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `gtd-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = importData(text);
      setImportStatus(success ? 'success' : 'error');
      
      // Reset status after 3 seconds
      setTimeout(() => setImportStatus('idle'), 3000);
      
      if (success) {
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    onClose();
  };

  const storageInfo = storage.getStorageInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <h2 className="text-lg font-semibold text-cursor-text">Data Management</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Storage Info */}
          <div className="bg-cursor-bg rounded-lg p-4">
            <h3 className="text-sm font-medium text-cursor-text mb-2">Storage Usage</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cursor-text-muted">Used:</span>
              <span className="text-cursor-text">{(storageInfo.used / 1024).toFixed(1)} KB</span>
            </div>
            <div className="mt-2 w-full bg-cursor-border rounded-full h-2">
              <div 
                className="bg-cursor-accent h-2 rounded-full transition-all"
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Export */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-cursor-text">Backup Your Data</h3>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center gap-3 p-3 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors disabled:opacity-50"
            >
              <Download size={20} className="text-cursor-accent" />
              <div className="text-left flex-1">
                <div className="font-medium text-cursor-text">
                  {isExporting ? 'Exporting...' : 'Export All Data'}
                </div>
                <div className="text-sm text-cursor-text-muted">
                  Download a JSON backup file
                </div>
              </div>
            </button>
          </div>

          {/* Import */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-cursor-text">Restore Data</h3>
            <button
              onClick={handleImport}
              className="w-full flex items-center gap-3 p-3 bg-cursor-bg border border-cursor-border rounded-lg hover:border-cursor-accent transition-colors"
            >
              <Upload size={20} className="text-cursor-accent" />
              <div className="text-left flex-1">
                <div className="font-medium text-cursor-text">Import Data</div>
                <div className="text-sm text-cursor-text-muted">
                  Restore from JSON backup file
                </div>
              </div>
            </button>
            
            {importStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={16} />
                <span>Data imported successfully!</span>
              </div>
            )}
            
            {importStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle size={16} />
                <span>Import failed. Please check the file format.</span>
              </div>
            )}
          </div>

          {/* Clear Data */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-cursor-text">Reset</h3>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center gap-3 p-3 bg-cursor-bg border border-red-500/30 rounded-lg hover:border-red-500 transition-colors text-red-400"
              >
                <Trash2 size={20} />
                <div className="text-left flex-1">
                  <div className="font-medium">Clear All Data</div>
                  <div className="text-sm text-red-400/70">
                    Permanently delete everything
                  </div>
                </div>
              </button>
            ) : (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-400 mb-3">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Are you sure?</span>
                </div>
                <p className="text-sm text-red-400/80 mb-4">
                  This will permanently delete all your GTD data including items, projects, and settings. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearData}
                    className="flex-1 bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 bg-cursor-bg text-cursor-text py-2 px-3 rounded hover:bg-cursor-border transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};