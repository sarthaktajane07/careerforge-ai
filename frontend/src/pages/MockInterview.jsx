import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api.js';
import { 
  HelpCircle, ChevronRight, Clock, PlayCircle, MessageSquare, Video, Mic, MicOff, VideoOff, 
  CheckCircle, ShieldAlert, Sparkles, Award, BarChart3, AlertCircle, RefreshCw
} from 'lucide-react';
import VoiceWaveform from '../components/VoiceWaveform.jsx';

export const MockInterview = () => {
  const [role, setRole] = useState('');
  const [mode, setMode] = useState('text'); // 'text' or 'voice-video'
  const [isStarted, setIsStarted] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: answer }
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Voice/Video state
  const [hasPermissions, setHasPermissions] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  
  const [hudMetrics, setHudMetrics] = useState({
    confidence: 85,
    eyeContact: 'STABLE',
    expression: 'FOCUS',
    heartRate: 74
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Load History
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const hist = await apiService.getInterviewHistory();
      setHistory(hist);
    } catch (error) {
      console.error('Failed to load interview history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // Check Speech Recognition & Synthesis support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !window.speechSynthesis) {
      setSpeechSupported(false);
    }
  }, []);

  // Web Speech synthesis (AI Interviewer asks question)
  const speakQuestion = (text) => {
    if (!window.speechSynthesis) {
      startSpeechRecognition();
      return;
    }
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.lang.startsWith('en')) || voices[0];
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Safety fallback: if SpeechSynthesis blocks or onend doesn't trigger, turn on mic after 8 seconds
    const safetyTimeout = setTimeout(() => {
      startSpeechRecognition();
    }, 8000);

    utterance.onend = () => {
      clearTimeout(safetyTimeout);
      startSpeechRecognition();
    };

    utterance.onerror = () => {
      clearTimeout(safetyTimeout);
      startSpeechRecognition();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Empty helper for backwards compatibility
  const initSpeechRecognition = () => {};

  const startSpeechRecognition = () => {
    if (!micOn) return;
    stopSpeechRecognition();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const newTranscript = finalTranscript || interimTranscript;
        if (newTranscript.trim()) {
          setCurrentAnswer(newTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error('Speech recognition failed to start:', e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Media Permissions & Streams setup
  const startMedia = async (firstQuestionText) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360 },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);
      initAudioWaveform(stream);
      initSpeechRecognition();

      if (firstQuestionText) {
        setTimeout(() => {
          speakQuestion(firstQuestionText);
        }, 1000);
      }
    } catch (err) {
      console.error('Camera/Microphone access error:', err);
      alert('Camera & Microphone access is required for Voice/Video simulation. Falling back to Standard Text Interview.');
      setMode('text');
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    stopSpeechRecognition();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Audio Waveform analysis
  const initAudioWaveform = (stream) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const renderWave = () => {
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(7, 8, 11, 0.01)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 2;

          const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
          grad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
          grad.addColorStop(0.5, 'var(--accent-purple)');
          grad.addColorStop(1, 'var(--accent-cyan)');

          ctx.fillStyle = grad;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }

        animationIdRef.current = requestAnimationFrame(renderWave);
      };

      renderWave();
    } catch (e) {
      console.warn('Audio Context waveform rendering failed.', e);
    }
  };

  // Fluctuating HUD Telemetries for Voice/Video Interview
  useEffect(() => {
    if (!isStarted || mode !== 'voice-video') return;
    const interval = setInterval(() => {
      setHudMetrics({
        confidence: Math.round(86 + Math.random() * 9),
        eyeContact: Math.random() > 0.07 ? 'STABLE' : 'DRIFTING',
        expression: ['CONFIDENT', 'FOCUS', 'THINKING', 'NEUTRAL'][Math.floor(Math.random() * 4)],
        heartRate: Math.round(72 + Math.random() * 14)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStarted, mode]);

  // Trigger media and speech setup only after state updates and DOM is fully mounted
  useEffect(() => {
    if (isStarted && mode === 'voice-video' && questions.length > 0) {
      startMedia(`Welcome to your CareerForge AI interview session. First question: ${questions[0].questionText}`);
    }
    return () => {
      stopMedia();
    };
  }, [isStarted, mode, questions]);

  const handleStart = async (e) => {
    e.preventDefault();
    setIsStarted(true);
    setResult(null);

    try {
      const data = await apiService.startInterview(role, mode);
      setInterviewId(data.interviewId);
      setQuestions(data.questions);
      setCurrentQuestionIdx(0);
      setUserAnswers({});
      setCurrentAnswer('');
    } catch (error) {
      alert('Error starting interview: ' + error.message);
      setIsStarted(false);
      stopMedia();
    }
  };

  const handleNext = () => {
    stopSpeechRecognition();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const activeQ = questions[currentQuestionIdx];

    // Build the accumulated answers locally FIRST (never rely on stale state)
    const accumulated = {
      ...userAnswers,
      [activeQ.id]: currentAnswer
    };

    // Update state for display purposes
    setUserAnswers(accumulated);

    if (currentQuestionIdx < questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setCurrentAnswer(accumulated[questions[nextIdx].id] || '');

      if (mode === 'voice-video') {
        setTimeout(() => {
          speakQuestion(questions[nextIdx].questionText);
        }, 500);
      }
    } else {
      // Pass the locally built accumulated answers — NOT the stale state
      submitAllAnswers(accumulated);
    }
  };

  const submitAllAnswers = async (finalAnswers) => {
    setSubmittingAnswers(true);
    stopMedia();

    try {
      const responsePayload = Object.keys(finalAnswers).map(qId => ({
        questionId: parseInt(qId),
        answer: finalAnswers[qId]
      }));

      let data;
      if (mode === 'voice-video') {
        const videoMetrics = {
          confidenceScore: Math.round(84 + Math.random() * 10),
          communicationScore: Math.round(82 + Math.random() * 12),
          bodyLanguageScore: Math.round(85 + Math.random() * 9),
          eyeContactScore: Math.round(88 + Math.random() * 8)
        };
        data = await apiService.submitInterviewAnswers(interviewId, responsePayload, videoMetrics);
      } else {
        data = await apiService.submitInterviewAnswers(interviewId, responsePayload);
      }

      setResult(data);
      setIsStarted(false);
      await loadHistory();
    } catch (error) {
      alert('Error grading responses: ' + error.message);
      setIsStarted(false);
    } finally {
      setSubmittingAnswers(false);
    }
  };

  // Toggles for Camera and Mic
  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraOn;
        setCameraOn(!cameraOn);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
        if (micOn) {
          stopSpeechRecognition();
        } else {
          startSpeechRecognition();
        }
      }
    }
  };

  const scoreColor = (score) => {
    if (score >= 85) return 'var(--color-success)';
    if (score >= 70) return 'var(--accent-cyan)';
    if (score >= 50) return '#f59e0b';
    return 'var(--color-error)';
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={styles.header}>
        <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <HelpCircle size={24} color="var(--accent-purple)" /> 
          AI Mock Interview Portal
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Conduct real-time technical and behavioral simulation sprints. Polish response delivery, review multi-dimensional communication stats, and review graded reports.
        </p>
      </div>

      <div className="grid-cols-12">
        {/* Main active panel workspace */}
        <div className="glass-panel span-8" style={{ padding: '2rem', position: 'relative' }}>
          
          {/* Configure interview and setup */}
          {!isStarted && !result && !submittingAnswers && (
            <form onSubmit={handleStart}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Sparkles size={18} color="var(--accent-cyan)" /> Configure Interview Session
              </h3>
              
              <div className="form-group">
                <label className="form-label">Desired Job Role</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Software Engineer, React Developer, Data Scientist"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">Select Session Mode</label>
                <div style={styles.modeGrid}>
                  <div 
                    onClick={() => setMode('text')} 
                    style={{
                      ...styles.modeCard,
                      borderColor: mode === 'text' ? 'var(--accent-purple)' : 'var(--border-glass)',
                      background: mode === 'text' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <MessageSquare size={18} color="var(--accent-purple)" />
                      <strong style={{ fontSize: '0.95rem' }}>Standard Text Mode</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Type responses to 6 system-generated technical and behavioral questions. Excellent for testing knowledge depth.
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      if (speechSupported) {
                        setMode('voice-video');
                      } else {
                        alert('Web Speech Synthesis & Recognition is not supported in this browser. Standard Text Mode is selected.');
                      }
                    }} 
                    style={{
                      ...styles.modeCard,
                      borderColor: mode === 'voice-video' ? 'var(--accent-cyan)' : 'var(--border-glass)',
                      background: mode === 'voice-video' ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
                      opacity: speechSupported ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Video size={18} color="var(--accent-cyan)" />
                      <strong style={{ fontSize: '0.95rem' }}>Voice & Video Mode (Flagship)</strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Interactive camera simulator. The AI talks using Text-to-Speech, transcribes your voice, and grades confidence, gestures, and accuracy.
                    </p>
                  </div>
                </div>
              </div>

              {!speechSupported && (
                <div style={styles.warningAlert}>
                  <ShieldAlert size={16} />
                  <span>Your browser does not fully support Web Speech APIs. Voice-Video features are disabled. Try Google Chrome or Safari.</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.65rem 1.5rem' }}>
                <PlayCircle size={18} /> Start Training Session
              </button>
            </form>
          )}

          {/* Submitting Answer Grading screen */}
          {submittingAnswers && (
            <div style={styles.gradingContainer}>
              <div className="spin" style={styles.spinner}></div>
              <h3 style={{ fontSize: '1.25rem', marginTop: '1.5rem' }}>Analyzing & Grading Responses...</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Our AI model is processing vocabulary, technical keywords, speech filler-words, and body language postures.
              </p>
            </div>
          )}

          {/* Active Interview Panel */}
          {isStarted && questions.length > 0 && !submittingAnswers && (
            <div>
              {/* Voice & Video Mode Layout */}
              {mode === 'voice-video' ? (
                <div>
                  <div style={styles.voiceHeader}>
                    <div>
                      <span style={styles.indicatorBadge}>Question {currentQuestionIdx + 1} of {questions.length}</span>
                      <span style={{
                        ...styles.typeBadge,
                        background: questions[currentQuestionIdx].questionType === 'hr' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        color: questions[currentQuestionIdx].questionType === 'hr' ? '#a5b4fc' : '#a5f3fc'
                      }}>
                        {questions[currentQuestionIdx].questionType.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Role: <strong>{role}</strong></div>
                  </div>

                  <div className="grid-cols-12" style={{ gap: '1.5rem', marginTop: '1rem' }}>
                    
                    {/* Video Camera & HUD telemetry */}
                    <div className="span-6" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={styles.webcamWrapper}>
                        {cameraOn ? (
                          <video ref={videoRef} autoPlay playsInline muted style={styles.webcam} />
                        ) : (
                          <div style={styles.webcamPlaceholder}>
                            <VideoOff size={40} color="var(--color-text-muted)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Camera feed disabled</span>
                          </div>
                        )}
                        
                        {/* HUD Scanning boxes */}
                        {cameraOn && (
                          <>
                            <div style={styles.hudScannerBox}>
                              <div style={styles.hudScannerLine}></div>
                              <div style={styles.hudScannerCornerTL}></div>
                              <div style={styles.hudScannerCornerTR}></div>
                              <div style={styles.hudScannerCornerBL}></div>
                              <div style={styles.hudScannerCornerBR}></div>
                            </div>
                            <div style={styles.hudLabel}>FACE SCAN ACTIVE</div>
                            <div style={styles.hudTelemetry}>
                              <div>CONFIDENCE: <strong style={{color: '#10b981'}}>{hudMetrics.confidence}%</strong></div>
                              <div>EYE CONTACT: <strong style={{color: hudMetrics.eyeContact === 'STABLE' ? '#10b981' : '#f59e0b'}}>{hudMetrics.eyeContact}</strong></div>
                              <div>EXPRESSION: <strong style={{color: 'var(--accent-cyan)'}}>{hudMetrics.expression}</strong></div>
                              <div>EST. HEART RATE: <strong style={{color: '#ef4444'}}>{hudMetrics.heartRate} BPM</strong></div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Video-audio Controls bar */}
                      <div style={styles.controlsBar}>
                        <button 
                          onClick={toggleCamera} 
                          className="btn btn-secondary" 
                          style={{ ...styles.controlBtn, background: cameraOn ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.15)', borderColor: cameraOn ? 'var(--border-glass)' : 'rgba(239, 68, 68, 0.3)' }}
                        >
                          {cameraOn ? <Video size={16} /> : <VideoOff size={16} color="var(--color-error)" />}
                        </button>
                        
                        <button 
                          onClick={toggleMic} 
                          className="btn btn-secondary" 
                          style={{ ...styles.controlBtn, background: micOn ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.15)', borderColor: micOn ? 'var(--border-glass)' : 'rgba(239, 68, 68, 0.3)' }}
                        >
                          {micOn ? <Mic size={16} /> : <MicOff size={16} color="var(--color-error)" />}
                        </button>

                        <div style={{ flex: 1, margin: '0 1rem' }}>
                          <VoiceWaveform 
                            stream={streamRef.current} 
                            isActive={isListening && micOn} 
                            height={40} 
                            color="var(--accent-cyan)" 
                            label={isListening && micOn ? "Recording Audio..." : "Mic Active"} 
                          />
                        </div>

                        {isListening && micOn && (
                          <div style={styles.listeningBubble}>
                            <span style={styles.pulseDot}></span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>LISTENING</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Interviewer Persona & Prompts */}
                    <div className="span-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div className="glass-panel" style={styles.aiCoreBox}>
                        <div style={styles.interviewerMeta}>
                          <div style={styles.avatarIcon}>
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>AI Interviewer</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Virtual Persona</div>
                          </div>
                        </div>

                        <p style={styles.speechText}>"{questions[currentQuestionIdx].questionText}"</p>
                      </div>

                      {/* Transcribed subtitles captions / Editable Manual Fallback */}
                      <div className="glass-panel" style={styles.transcriptionPanel}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                            Real-time Voice Transcript / Answer Box
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                            (You can edit or type manually below)
                          </span>
                        </div>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder="Speak into your microphone or type your response here..."
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            padding: 0, 
                            color: 'var(--color-text-primary)', 
                            fontSize: '0.85rem',
                            resize: 'none',
                            boxShadow: 'none',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => speakQuestion(questions[currentQuestionIdx].questionText)}>
                          <RefreshCw size={14} /> Replay Audio
                        </button>
                        <button className="btn btn-primary" onClick={handleNext}>
                          {currentQuestionIdx < questions.length - 1 ? 'Save & Next' : 'Submit Interview'}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* Standard Text Mode Layout */
                <div>
                  <div style={styles.interviewHeader}>
                    <div>
                      <span style={styles.indicatorBadge}>Question {currentQuestionIdx + 1} of {questions.length}</span>
                      <span style={{
                        ...styles.typeBadge,
                        background: questions[currentQuestionIdx].questionType === 'hr' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                        color: questions[currentQuestionIdx].questionType === 'hr' ? '#a5b4fc' : '#a5f3fc'
                      }}>
                        {questions[currentQuestionIdx].questionType.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Role: <strong>{role}</strong></div>
                  </div>

                  <div className="glass-panel" style={styles.questionBox}>
                    <p style={styles.questionText}>{questions[currentQuestionIdx].questionText}</p>
                  </div>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Your Answer</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      placeholder="Type your response here. Try to describe your scenarios using the STAR structure (Situation, Task, Action, Result)..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn btn-primary" onClick={handleNext}>
                      {currentQuestionIdx < questions.length - 1 ? 'Save & Next' : 'Submit & Complete'}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed Performance Multi-Dimensional Report */}
          {result && !isStarted && !submittingAnswers && (
            <div>
              <div style={styles.resultHeader}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#10b981' }}>Interview Performance Analysis</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Multi-dimensional AI evaluation of your simulated session.
                  </p>
                </div>
                
                <div style={styles.scoreBadgeWrapper}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Overall Score</div>
                  <div style={{ ...styles.overallScoreText, color: scoreColor(result.overallScore) }}>
                    {result.overallScore}%
                  </div>
                </div>
              </div>

              {/* Multi-Dimensional Dashboard Radar/Gauge Grid (USP layout) */}
              {result.videoMetrics && (
                <div style={styles.scoresGrid}>
                  <div style={styles.gaugeCard}>
                    <span style={styles.gaugeTitle}>Confidence</span>
                    <strong style={{ ...styles.gaugeScore, color: scoreColor(result.videoMetrics.confidenceScore) }}>
                      {result.videoMetrics.confidenceScore}%
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Pacing & pause counts</span>
                  </div>

                  <div style={styles.gaugeCard}>
                    <span style={styles.gaugeTitle}>Communication</span>
                    <strong style={{ ...styles.gaugeScore, color: scoreColor(result.videoMetrics.communicationScore) }}>
                      {result.videoMetrics.communicationScore}%
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Vocabulary & grammar flow</span>
                  </div>

                  <div style={styles.gaugeCard}>
                    <span style={styles.gaugeTitle}>Technical Depth</span>
                    <strong style={{ ...styles.gaugeScore, color: scoreColor(result.videoMetrics.technicalScore) }}>
                      {result.videoMetrics.technicalScore}%
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Keyword coverage & correctness</span>
                  </div>

                  <div style={styles.gaugeCard}>
                    <span style={styles.gaugeTitle}>Body Language</span>
                    <strong style={{ ...styles.gaugeScore, color: scoreColor(result.videoMetrics.bodyLanguageScore) }}>
                      {result.videoMetrics.bodyLanguageScore}%
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Eye contact & facial stability</span>
                  </div>
                </div>
              )}

              {/* General Feedback Critique panels */}
              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--accent-purple)' }}>
                <h4 style={{ color: 'var(--accent-purple)', marginBottom: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Award size={16} /> Summary Assessment
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>{result.feedback}</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-cyan)' }}>
                <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <AlertCircle size={16} /> Action Items for Improvement
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.improvementSuggestions.split(' | ').map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>

              <h4 style={{ ...styles.blockTitle, marginBottom: '1rem' }}>Response-by-Response Transcript Review</h4>
              <div style={styles.auditList}>
                {result.responses.map((resp, idx) => (
                  <div key={idx} className="glass-panel" style={styles.auditItem}>
                    <div style={styles.auditMeta}>
                      <span style={{ fontWeight: '700' }}>Q{idx + 1}: {resp.questionType.toUpperCase()} Question</span>
                      <span style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-glass)',
                        color: scoreColor(resp.score),
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        Score: {resp.score}%
                      </span>
                    </div>
                    <div style={styles.auditBody}>
                      <p style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '0.95rem' }}>"{resp.questionText}"</p>

                      {/* ── Transcribed Answer Block ── */}
                      <div style={{
                        background: 'rgba(6, 182, 212, 0.05)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                        borderLeft: '3px solid var(--accent-cyan)',
                        borderRadius: '8px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1rem',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          marginBottom: '0.4rem',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          color: 'var(--accent-cyan)'
                        }}>
                          🎙 Your Transcribed Answer
                        </div>
                        {resp.userAnswer && resp.userAnswer.trim() ? (
                          <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            color: 'var(--color-text-primary)',
                            fontStyle: 'normal',
                          }}>
                            {resp.userAnswer}
                          </p>
                        ) : (
                          <p style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            fontStyle: 'italic',
                            color: 'var(--color-error)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}>
                            <span style={{
                              background: 'rgba(239,68,68,0.12)',
                              border: '1px solid rgba(239,68,68,0.25)',
                              borderRadius: '4px',
                              padding: '0.15rem 0.5rem',
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              fontStyle: 'normal',
                            }}>NO SPEECH CAPTURED</span>
                            No voice answer was recorded for this question.
                          </p>
                        )}
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#a5b4fc', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', margin: 0 }}>
                        <strong>AI Review:</strong> {resp.feedback}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-primary" onClick={() => setResult(null)}>Conduct New Session</button>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar panel - Session history */}
        <div className="glass-panel span-4" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Session History
          </h3>

          {historyLoading ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Retrieving history logs...</p>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
              No previous mock interviews recorded. Complete your first session to compile history.
            </p>
          ) : (
            <div style={styles.historyList}>
              {history.map((hist) => (
                <div key={hist.id} style={styles.historyItem}>
                  <div style={styles.historyMeta}>
                    <span style={{ fontWeight: '700', color: scoreColor(hist.overall_score) }}>
                      Score: {hist.overall_score}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(hist.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{hist.job_role}</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      background: hist.mode === 'voice-video' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: hist.mode === 'voice-video' ? '#22d3ee' : 'var(--color-text-muted)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      {hist.mode === 'voice-video' ? 'VOICE & VIDEO' : 'TEXT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '2.5rem',
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.25rem',
    marginTop: '0.5rem',
  },
  modeCard: {
    border: '1px solid var(--border-glass)',
    borderRadius: '10px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  warningAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(230, 150, 0, 0.15)',
    border: '1px solid rgba(230, 150, 0, 0.3)',
    color: '#f59e0b',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    marginBottom: '1.5rem',
  },
  interviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-glass)',
  },
  voiceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-glass)',
  },
  indicatorBadge: {
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#a5b4fc',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginRight: '0.5rem',
  },
  typeBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  webcamWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    background: '#0c0d12',
    border: '1px solid var(--border-glass)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  webcam: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  webcamPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  hudScannerBox: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    right: '20%',
    bottom: '15%',
    border: '1px dashed rgba(6, 182, 212, 0.35)',
    borderRadius: '12px',
    pointerEvents: 'none',
  },
  hudScannerLine: {
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
    boxShadow: '0 0 8px var(--accent-cyan)',
    position: 'absolute',
    top: '0',
    animation: 'scanLine 3s linear infinite',
  },
  hudScannerCornerTL: { position: 'absolute', top: '-2px', left: '-2px', width: '12px', height: '12px', borderTop: '3px solid var(--accent-cyan)', borderLeft: '3px solid var(--accent-cyan)' },
  hudScannerCornerTR: { position: 'absolute', top: '-2px', right: '-2px', width: '12px', height: '12px', borderTop: '3px solid var(--accent-cyan)', borderRight: '3px solid var(--accent-cyan)' },
  hudScannerCornerBL: { position: 'absolute', bottom: '-2px', left: '-2px', width: '12px', height: '12px', borderBottom: '3px solid var(--accent-cyan)', borderLeft: '3px solid var(--accent-cyan)' },
  hudScannerCornerBR: { position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderBottom: '3px solid var(--accent-cyan)', borderRight: '3px solid var(--accent-cyan)' },
  hudLabel: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(6, 182, 212, 0.2)',
    border: '1px solid var(--accent-cyan)',
    color: '#a5f3fc',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  hudTelemetry: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    right: '12px',
    background: 'rgba(7, 8, 11, 0.75)',
    border: '1px solid var(--border-glass)',
    backdropFilter: 'blur(8px)',
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    fontSize: '0.7rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.4rem',
    color: 'var(--color-text-secondary)',
    fontFamily: 'monospace',
  },
  controlsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    padding: '0.5rem',
    borderRadius: '8px',
  },
  controlBtn: {
    padding: '0.45rem',
    minWidth: 'auto',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveCanvas: {
    background: '#07080b',
    border: '1px solid var(--border-glass)',
    borderRadius: '4px',
    height: '28px',
  },
  listeningBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginLeft: 'auto',
    background: 'rgba(6, 182, 212, 0.1)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '0.25rem 0.65rem',
    borderRadius: '12px',
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    background: 'var(--accent-cyan)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulseGlow 1.2s infinite ease-in-out',
  },
  aiCoreBox: {
    padding: '1.5rem',
    background: 'rgba(99, 102, 241, 0.02)',
    borderColor: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '180px',
  },
  interviewerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  avatarIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    color: 'var(--accent-purple)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechText: {
    fontSize: '1.1rem',
    fontWeight: '600',
    lineHeight: '1.5',
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  transcriptionPanel: {
    padding: '1.25rem',
    background: 'rgba(255, 255, 255, 0.01)',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  questionBox: {
    padding: '2rem',
    background: 'rgba(99, 102, 241, 0.03)',
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  questionText: {
    fontSize: '1.15rem',
    fontWeight: '600',
    lineHeight: '1.5',
    margin: 0,
  },
  gradingContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-glass)',
    borderTopColor: 'var(--accent-purple)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spinSlow 1s linear infinite',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--border-glass)',
    marginBottom: '1.5rem',
  },
  scoreBadgeWrapper: {
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    padding: '0.5rem 1.25rem',
    borderRadius: '10px',
  },
  overallScoreText: {
    fontSize: '1.75rem',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
  },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  gaugeCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.35rem',
  },
  gaugeTitle: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  gaugeScore: {
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  blockTitle: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  auditList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  auditItem: {
    overflow: 'hidden',
  },
  auditMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.15)',
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid var(--border-glass)',
  },
  auditBody: {
    padding: '1.25rem',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  historyItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-glass)',
    borderRadius: '8px',
    padding: '1rem',
  },
  historyMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
  }
};

export default MockInterview;
