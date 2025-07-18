import React, { useEffect, useState } from 'react';
import { 
  Keyboard, 
  X, 
  Command, 
  Hash, 
  ArrowRight,
  Play,
  Square,
  RotateCcw,
  Plus,
  Search,
  Filter,
  Calendar,
  Target,
  Zap,
  FileText
} from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
  action?: string;
}

const shortcuts: Shortcut[] = [
  // Global Actions
  { keys: ['Cmd', 'Shift', 'A'], description: 'Quick Capture', category: 'Global', action: 'capture' },
  { keys: ['Cmd', 'Shift', 'T'], description: 'Open Today Dashboard', category: 'Global', action: 'today' },
  { keys: ['Cmd', 'Shift', 'E'], description: 'Open Engage Mode', category: 'Global', action: 'engage' },
  { keys: ['Cmd', 'Shift', 'R'], description: 'Start Weekly Review', category: 'Global', action: 'review' },
  { keys: ['Cmd', 'K'], description: 'Command Palette', category: 'Global', action: 'command' },
  { keys: ['?'], description: 'Show Keyboard Shortcuts', category: 'Global', action: 'shortcuts' },
  
  // Navigation
  { keys: ['1'], description: 'Ideas (Inbox)', category: 'Navigation', action: 'view-inbox' },
  { keys: ['2'], description: 'Next Actions', category: 'Navigation', action: 'view-actions' },
  { keys: ['3'], description: 'Projects', category: 'Navigation', action: 'view-projects' },
  { keys: ['4'], description: 'Waiting For', category: 'Navigation', action: 'view-waiting' },
  { keys: ['5'], description: 'Someday/Maybe', category: 'Navigation', action: 'view-someday' },
  { keys: ['6'], description: 'Reference', category: 'Navigation', action: 'view-reference' },
  
  // Context Filters (Shift + Number)
  { keys: ['Shift', '1'], description: '@Calls Context', category: 'Contexts', action: 'context-calls' },
  { keys: ['Shift', '2'], description: '@Computer Context', category: 'Contexts', action: 'context-computer' },
  { keys: ['Shift', '3'], description: '@Errands Context', category: 'Contexts', action: 'context-errands' },
  { keys: ['Shift', '4'], description: '@Home Context', category: 'Contexts', action: 'context-home' },
  { keys: ['Shift', '5'], description: '@Office Context', category: 'Contexts', action: 'context-office' },
  { keys: ['Shift', '6'], description: '@Agenda Context', category: 'Contexts', action: 'context-agenda' },
  
  // Quick Actions
  { keys: ['Space'], description: 'Toggle Engage Mode', category: 'Quick Actions', action: 'toggle-engage' },
  { keys: ['Enter'], description: 'Process Selected Item', category: 'Quick Actions', action: 'process-item' },
  { keys: ['c'], description: 'Complete Selected Item', category: 'Quick Actions', action: 'complete-item' },
  { keys: ['d'], description: 'Delete Selected Item', category: 'Quick Actions', action: 'delete-item' },
  { keys: ['e'], description: 'Edit Selected Item', category: 'Quick Actions', action: 'edit-item' },
  
  // Energy Filters
  { keys: ['Cmd', '1'], description: 'High Energy Filter', category: 'Energy', action: 'energy-high' },
  { keys: ['Cmd', '2'], description: 'Medium Energy Filter', category: 'Energy', action: 'energy-medium' },
  { keys: ['Cmd', '3'], description: 'Low Energy Filter', category: 'Energy', action: 'energy-low' },
  { keys: ['Cmd', '4'], description: 'Zombie Energy Filter', category: 'Energy', action: 'energy-zombie' },
  
  // Time Filters
  { keys: ['Alt', '1'], description: '≤ 15 minutes', category: 'Time', action: 'time-15' },
  { keys: ['Alt', '2'], description: '≤ 30 minutes', category: 'Time', action: 'time-30' },
  { keys: ['Alt', '3'], description: '≤ 60 minutes', category: 'Time', action: 'time-60' },
  { keys: ['Alt', '0'], description: 'Clear Time Filter', category: 'Time', action: 'time-clear' },
  
  // List Navigation
  { keys: ['↑', '↓'], description: 'Navigate Items', category: 'Navigation', action: 'navigate' },
  { keys: ['Tab'], description: 'Next Section', category: 'Navigation', action: 'next-section' },
  { keys: ['Shift', 'Tab'], description: 'Previous Section', category: 'Navigation', action: 'prev-section' },
  { keys: ['Escape'], description: 'Clear Selection/Close Modal', category: 'Navigation', action: 'escape' },
  
  // Clarification Workflow
  { keys: ['y'], description: 'Yes (Actionable)', category: 'Clarification', action: 'actionable-yes' },
  { keys: ['n'], description: 'No (Not Actionable)', category: 'Clarification', action: 'actionable-no' },
  { keys: ['1'], description: 'Do Now', category: 'Clarification', action: 'do-now' },
  { keys: ['2'], description: 'Schedule', category: 'Clarification', action: 'schedule' },
  { keys: ['3'], description: 'Delegate', category: 'Clarification', action: 'delegate' },
  { keys: ['4'], description: 'Defer', category: 'Clarification', action: 'defer' },
];

const categoryIcons: Record<string, React.ReactNode> = {
  'Global': <Command size={16} className="text-purple-400" />,
  'Navigation': <ArrowRight size={16} className="text-blue-400" />,
  'Contexts': <Hash size={16} className="text-green-400" />,
  'Quick Actions': <Zap size={16} className="text-yellow-400" />,
  'Energy': <Target size={16} className="text-red-400" />,
  'Time': <Calendar size={16} className="text-cyan-400" />,
  'Clarification': <FileText size={16} className="text-orange-400" />
};

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase())) ||
    shortcut.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cursor-border">
          <div className="flex items-center gap-3">
            <Keyboard size={20} className="text-cursor-accent" />
            <div>
              <h2 className="text-xl font-semibold text-cursor-text">Keyboard Shortcuts</h2>
              <p className="text-sm text-cursor-text-muted">Master GTD with keyboard efficiency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cursor-bg rounded-lg transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-cursor-border">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cursor-text-muted" />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cursor-bg border border-cursor-border rounded-md text-cursor-text placeholder-cursor-text-muted focus:outline-none focus:border-cursor-accent"
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-cursor-text">
                  {categoryIcons[category]}
                  <span>{category}</span>
                </div>
                
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={`${category}-${index}`}
                      className="flex items-center justify-between p-3 bg-cursor-bg rounded-lg hover:bg-cursor-border transition-colors"
                    >
                      <span className="text-sm text-cursor-text">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-mono bg-cursor-sidebar border border-cursor-border rounded text-cursor-text-muted">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-cursor-text-muted text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(groupedShortcuts).length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="text-cursor-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-cursor-text mb-2">No shortcuts found</h3>
              <p className="text-cursor-text-muted">
                Try adjusting your search terms or browse all categories above.
              </p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="p-6 border-t border-cursor-border bg-cursor-bg/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Command size={14} className="text-cursor-accent" />
              <span className="text-cursor-text-muted">
                <strong className="text-cursor-text">Cmd</strong> = ⌘ on Mac
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-cursor-accent" />
              <span className="text-cursor-text-muted">
                <strong className="text-cursor-text">Numbers</strong> for quick access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cursor-accent" />
              <span className="text-cursor-text-muted">
                <strong className="text-cursor-text">Space</strong> for engage mode
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Keyboard size={14} className="text-cursor-accent" />
              <span className="text-cursor-text-muted">
                <strong className="text-cursor-text">?</strong> to show this help
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};