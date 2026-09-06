import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import VoiceAssistantPanel from '../../components/dashboard/VoiceAssistantPanel';
import { useLanguage } from '../../context/LanguageContext';
import { answerSaleFollowup, transcribeSaleAudio } from '../../services/aiService';
import '../DashboardPage.css';

const formatElapsed = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
};

export default function VoiceScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mode, setMode] = useState('standby');
  const [audioBlob, setAudioBlob] = useState(null);
  const [mimeType, setMimeType] = useState('');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [voiceResult, setVoiceResult] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (mode !== 'listening') return undefined;
    const timer = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [mode]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const startRecording = async () => {
    setError('');
    setTranscript('');
    setAudioBlob(null);
    setVoiceResult(null);
    setAnswerText('');
    setElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      setMimeType(recorder.mimeType || preferredType || 'audio/webm');

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setMode('listening');
    } catch {
      setError(t('micRequired'));
      setMode('standby');
    }
  };

  const pauseRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'recording') {
      recorder.pause();
      setMode('paused');
    } else if (recorder.state === 'paused') {
      recorder.resume();
      setMode('listening');
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    setMode('captured');
  };

  const restartRecording = async () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    await startRecording();
  };

  const sendRecording = async () => {
    if (!audioBlob) {
      setError(t('recordBeforeSend'));
      return;
    }

    setMode('transcribing');
    setError('');

    try {
      const response = await transcribeSaleAudio({ audioBlob, mimeType });
      handleVoiceResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || t('unableTranscribe'));
      setMode('captured');
    }
  };

  const handleVoiceResult = (result) => {
    setVoiceResult(result);
    setTranscript(result.transcript || '');

    if (result.status === 'needs_followup' && result.question) {
      setAnswerText('');
      setMode('clarification');
      return;
    }

    if (result.record) {
      if (result.status === 'manual_entry') {
        setError(t('manualReviewNeeded'));
      }
      navigate('/dashboard/transactions', {
        state: {
          record: result.record,
          transcript: result.transcript,
          voiceStatus: result.status,
        },
      });
      return;
    }

    setError(t('noSaleExtracted'));
    setMode('captured');
  };

  const submitFollowup = async (event) => {
    event.preventDefault();
    if (!voiceResult || !answerText.trim()) return;

    setIsAnswering(true);
    setError('');

    try {
      const response = await answerSaleFollowup({
        transcript: voiceResult.transcript || transcript,
        record: voiceResult.record,
        answer_text: answerText,
        attempts: voiceResult.attempts || 0,
        asked_index: voiceResult.asked_index || 0,
        asked_field: voiceResult.asked_field || 'item',
        asked_question: voiceResult.question || '',
      });
      handleVoiceResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || t('unableTranscribe'));
      setMode('captured');
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <MobileAppShell activeTab="voice" showBottomNav={false} className="voice-page-bg">
      <ScreenHeader title={t('saleRecording')} onBack={() => window.history.back()} />
      <VoiceAssistantPanel
        mode={mode}
        transcript={transcript}
        error={error}
        elapsed={formatElapsed(elapsed)}
        onStart={startRecording}
        onPause={pauseRecording}
        onStop={stopRecording}
        onRestart={restartRecording}
        onSend={sendRecording}
        question={voiceResult?.question || ''}
        answerText={answerText}
        onAnswerChange={setAnswerText}
        onAnswerSubmit={submitFollowup}
        isAnswering={isAnswering}
      />
    </MobileAppShell>
  );
}
