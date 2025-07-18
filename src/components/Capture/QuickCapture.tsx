import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Mic, MicOff } from 'lucide-react';
import { VoiceCapture, VoiceMetadata } from './VoiceCapture';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (content: string, metadata?: any) => void;
}

export const QuickCapture: React.FC<QuickCaptureProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const [content, setContent] = useState('');
  const [showVoiceCapture, setShowVoiceCapture] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    if (content.trim()) {
      onCapture(content.trim(), {
        source: 'quick-add',
        timestamp: new Date(),
        urgency: 'medium'
      });
      setContent('');
      onClose();
    }
  }, [content, onCapture, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleCtrlEnter = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleCtrlEnter);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleCtrlEnter);
    };
  }, [isOpen, onClose, handleSubmit]);


  const handleVoiceCapture = (voiceContent: string, metadata?: VoiceMetadata) => {
    setContent(voiceContent);
    setShowVoiceCapture(false);
    
    // Auto-capture if we have good confidence and smart parsing
    if (metadata && metadata.confidence > 0.8 && (metadata.detectedContext || metadata.detectedEnergy)) {
      onCapture(voiceContent, {
        source: 'voice',
        timestamp: new Date(),
        ...metadata
      });
      setContent('');
      onClose();
    }
  };

  const toggleVoiceCapture = () => {
    setShowVoiceCapture(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-32 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cursor-border">
          <h3 className="text-lg font-medium text-cursor-text">Capture Ideas</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What idea is on your mind? Capture it here..."
            className="w-full bg-cursor-bg border border-cursor-border rounded-md p-3 text-cursor-text placeholder-cursor-text-muted resize-none focus:outline-none focus:border-cursor-accent"
            rows={4}
          />
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoiceCapture}
                className="p-2 rounded transition-colors bg-cursor-bg text-cursor-text-muted hover:text-cursor-text hover:bg-cursor-border"
                title="Voice input"
              >
                <Mic size={16} />
              </button>
              
              <span className="text-xs text-cursor-text-muted">
                Cmd+Shift+A
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="flex items-center gap-2 bg-cursor-accent text-white px-4 py-2 rounded hover:bg-cursor-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                <span>Capture</span>
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-cursor-text-muted">
            Tip: Use Cmd+Enter to quickly capture, Escape to cancel
          </div>
        </div>
      </div>

      {/* Voice Capture Modal */}
      <VoiceCapture
        isOpen={showVoiceCapture}
        onClose={() => setShowVoiceCapture(false)}
        onCapture={handleVoiceCapture}
        placeholder="Speak your idea..."
      />
    </div>
  );
};