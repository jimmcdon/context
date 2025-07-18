import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, X, CheckCircle, AlertTriangle } from 'lucide-react';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (content: string, metadata?: VoiceMetadata) => void;
  placeholder?: string;
}

export interface VoiceMetadata {
  confidence: number;
  duration: number;
  detectedContext?: string;
  detectedEnergy?: 'high' | 'medium' | 'low' | 'zombie';
  detectedTime?: number;
  isProject?: boolean;
  isUrgent?: boolean;
}

// Natural language patterns for parsing voice input
const CONTEXT_PATTERNS = {
  '@Calls': /\b(call|phone|ring|dial|contact)\b/i,
  '@Computer': /\b(email|type|code|write|design|research|online|website|computer)\b/i,
  '@Errands': /\b(buy|shop|store|pick up|drop off|bank|post office|errands)\b/i,
  '@Home': /\b(home|house|clean|organize|fix|repair|family)\b/i,
  '@Office': /\b(office|work|meeting|discuss|review|present)\b/i,
  '@Agenda': /\b(discuss|talk to|meeting with|ask|tell|agenda)\b/i
};

const ENERGY_PATTERNS = {
  high: /\b(brainstorm|create|design|plan|strategy|important|complex|difficult)\b/i,
  medium: /\b(review|organize|update|call|email|write|prepare)\b/i,
  low: /\b(file|sort|backup|archive|simple|easy|quick)\b/i,
  zombie: /\b(mindless|routine|automatic|simple task|easy)\b/i
};

const TIME_PATTERNS = {
  quick: { pattern: /\b(quick|fast|2 min|two min|briefly)\b/i, minutes: 2 },
  short: { pattern: /\b(short|15 min|fifteen min|quick)\b/i, minutes: 15 },
  medium: { pattern: /\b(30 min|thirty min|half hour)\b/i, minutes: 30 },
  long: { pattern: /\b(hour|60 min|long|detailed)\b/i, minutes: 60 }
};

const PROJECT_PATTERNS = /\b(project|plan|strategy|system|process|develop|build|create)\b/i;
const URGENT_PATTERNS = /\b(urgent|asap|immediately|deadline|due|important|critical)\b/i;

export const VoiceCapture: React.FC<VoiceCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  placeholder = "What's on your mind?"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if browser supports Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice capture is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      startTimeRef.current = Date.now();
      
      // Update duration counter
      intervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let totalConfidence = 0;
      let resultCount = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += text;
          totalConfidence += result[0].confidence;
          resultCount++;
        } else {
          interimTranscript += text;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
      if (resultCount > 0) {
        setConfidence(totalConfidence / resultCount);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const parseNaturalLanguage = useCallback((text: string): Partial<VoiceMetadata> => {
    const metadata: Partial<VoiceMetadata> = {};
    
    // Detect context
    for (const [context, pattern] of Object.entries(CONTEXT_PATTERNS)) {
      if (pattern.test(text)) {
        metadata.detectedContext = context;
        break;
      }
    }
    
    // Detect energy level
    for (const [energy, pattern] of Object.entries(ENERGY_PATTERNS)) {
      if (pattern.test(text)) {
        metadata.detectedEnergy = energy as 'high' | 'medium' | 'low' | 'zombie';
        break;
      }
    }
    
    // Detect time estimates
    for (const [, timeInfo] of Object.entries(TIME_PATTERNS)) {
      if (timeInfo.pattern.test(text)) {
        metadata.detectedTime = timeInfo.minutes;
        break;
      }
    }
    
    // Detect if it's a project
    if (PROJECT_PATTERNS.test(text)) {
      metadata.isProject = true;
    }
    
    // Detect urgency
    if (URGENT_PATTERNS.test(text)) {
      metadata.isUrgent = true;
    }
    
    return metadata;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) return;
    
    setTranscript('');
    setError(null);
    setDuration(0);
    setConfidence(0);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleCapture = () => {
    if (!transcript.trim()) {
      setError('No speech detected. Please try again.');
      return;
    }

    const parsedMetadata = parseNaturalLanguage(transcript);
    const metadata: VoiceMetadata = {
      confidence,
      duration,
      ...parsedMetadata
    };

    onCapture(transcript.trim(), metadata);
    setTranscript('');
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cursor-sidebar border border-cursor-border rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cursor-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isListening ? 'bg-red-500/20' : 'bg-cursor-accent/20'}`}>
              {isListening ? (
                <Mic className="text-red-400" size={20} />
              ) : (
                <MicOff className="text-cursor-accent" size={20} />
              )}
            </div>
            <div>
              <h3 className="font-medium text-cursor-text">Voice Capture</h3>
              <p className="text-sm text-cursor-text-muted">
                {isListening ? 'Listening...' : 'Click to start recording'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cursor-bg rounded transition-colors text-cursor-text-muted hover:text-cursor-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Recording Status */}
        {isListening && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-400">Recording</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-cursor-text-muted">
                <span>{formatDuration(duration)}</span>
                {confidence > 0 && (
                  <span>Confidence: {Math.round(confidence * 100)}%</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transcript */}
        <div className="p-4">
          <div className="min-h-[120px] p-4 bg-cursor-bg border border-cursor-border rounded-lg">
            {transcript ? (
              <div className="space-y-2">
                <p className="text-cursor-text">{transcript}</p>
                {confidence > 0 && (
                  <div className="flex items-center gap-2 text-sm text-cursor-text-muted">
                    <Volume2 size={14} />
                    <span>Confidence: {Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-cursor-text-muted italic">{placeholder}</p>
            )}
          </div>

          {/* Smart Suggestions */}
          {transcript && (
            <div className="mt-4 p-3 bg-cursor-bg/50 rounded-lg">
              <div className="text-sm text-cursor-text-muted mb-2">Smart Suggestions:</div>
              <div className="space-y-1 text-xs">
                {(() => {
                  const parsed = parseNaturalLanguage(transcript);
                  const suggestions = [];
                  
                  if (parsed.detectedContext) {
                    suggestions.push(`📍 Context: ${parsed.detectedContext}`);
                  }
                  if (parsed.detectedEnergy) {
                    suggestions.push(`⚡ Energy: ${parsed.detectedEnergy}`);
                  }
                  if (parsed.detectedTime) {
                    suggestions.push(`⏱️ Time: ${parsed.detectedTime} min`);
                  }
                  if (parsed.isProject) {
                    suggestions.push(`🎯 Detected as project`);
                  }
                  if (parsed.isUrgent) {
                    suggestions.push(`🚨 Marked as urgent`);
                  }
                  
                  return suggestions.length > 0 
                    ? suggestions.map((suggestion, i) => (
                        <div key={i} className="text-cursor-text-muted">{suggestion}</div>
                      ))
                    : <div className="text-cursor-text-muted">No specific patterns detected</div>;
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-t border-cursor-border">
          {!isSupported ? (
            <div className="w-full text-center text-cursor-text-muted">
              Voice capture not available in this browser
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-cursor-text-muted hover:text-cursor-text transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-3">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    className="flex items-center gap-2 bg-cursor-accent text-white px-4 py-2 rounded hover:bg-cursor-accent/90 transition-colors"
                  >
                    <Mic size={16} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    <MicOff size={16} />
                    Stop
                  </button>
                )}
                
                {transcript && !isListening && (
                  <button
                    onClick={handleCapture}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Capture
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};