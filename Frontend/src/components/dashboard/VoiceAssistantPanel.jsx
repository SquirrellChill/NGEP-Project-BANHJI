import { ChevronUp, Mic, Pause, Play, RotateCcw, Send, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Waveform from './Waveform';

export default function VoiceAssistantPanel({
  mode,
  transcript = '',
  error = '',
  elapsed = '00:00',
  onStart,
  onPause,
  onStop,
  onRestart,
  onSend,
  question = '',
  answerText = '',
  onAnswerChange,
  onAnswerSubmit,
  isAnswering = false,
}) {
  const { t } = useLanguage();
  const isRecording = mode === 'listening' || mode === 'transcribing' || mode === 'clarification';
  const title = mode === 'standby' ? t('assistantTitle') : mode === 'paused' ? t('paused') : mode === 'captured' ? t('captured') : mode === 'transcribing' ? t('transcribing') : mode === 'clarification' ? t('answerQuestion') : t('recording');
  const subtitle = mode === 'standby' ? t('assistantSubtitle') : t('listeningSale');

  if (mode === 'standby') {
    return (
      <section className="voice-standby">
        <AssistantAvatar />
        <h2>{title}<br />{subtitle}</h2>
        {error && <p className="review-error-message">{error}</p>}
        <button className="voice-start-button" type="button" onClick={onStart}>
          <span>{t('tapMic')}</span>
          <b><Mic size={20} fill="currentColor" /></b>
        </button>
      </section>
    );
  }

  return (
    <section className="voice-active-screen">
      <div className="recording-indicator">
        <div className={`recording-orb ${isRecording ? 'active' : ''}`}>
          <Mic size={42} />
        </div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {(mode === 'transcribing' || mode === 'listening' || mode === 'paused' || mode === 'captured') && (
        <section className="live-transcription-card">
          <div>
            <h3>{t('liveTranscription')}</h3>
            <button type="button" aria-label="Collapse transcription"><ChevronUp size={18} /></button>
          </div>
          <p>{transcript || (mode === 'captured' ? t('readyToSend') : t('recordingAudio'))}</p>
          {error && <p className="review-error-message">{error}</p>}
        </section>
      )}
      {mode === 'clarification' && (
        <section className="chat-history">
          {transcript && <p className="chat-bubble user">{transcript}</p>}
          <p className="chat-bubble assistant">{question}</p>
          {error && <p className="review-error-message">{error}</p>}
          <form className="followup-form" onSubmit={onAnswerSubmit}>
            <input
              value={answerText}
              onChange={(event) => onAnswerChange(event.target.value)}
              placeholder={t('followupPlaceholder')}
              disabled={isAnswering}
            />
            <button className="primary-action" type="submit" disabled={isAnswering || !answerText.trim()}>
              {isAnswering ? t('sendingAnswer') : t('sendAnswer')}
            </button>
          </form>
        </section>
      )}
      <section className="voice-control-drawer">
        <div className="voice-timer">{elapsed}</div>
        <Waveform active={isRecording} />
        <div className="voice-primary-actions">
          <button type="button" aria-label={mode === 'paused' ? 'Play recording' : 'Pause recording'} onClick={onPause} disabled={mode === 'captured' || mode === 'transcribing' || mode === 'clarification'}>
            {mode === 'paused' ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
          </button>
          <button className="stop" type="button" aria-label="Stop recording" onClick={onStop} disabled={mode === 'captured' || mode === 'transcribing' || mode === 'clarification'}>
            <Square size={20} fill="currentColor" />
          </button>
        </div>
        <div className="voice-secondary-actions">
          <button type="button" aria-label="Restart recording" onClick={onRestart} disabled={mode === 'transcribing' || isAnswering}>
            <RotateCcw size={24} />
          </button>
          <button className="send" type="button" aria-label="Send recording" onClick={onSend} disabled={mode !== 'captured'}>
            <Send size={20} fill="currentColor" />
          </button>
        </div>
      </section>
    </section>
  );
}

function AssistantAvatar() {
  return (
    <div className="assistant-avatar-halo">
      <div className="assistant-avatar-inner">
        <div className="assistant-head">
          <div className="assistant-face">
            <span />
            <b />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
