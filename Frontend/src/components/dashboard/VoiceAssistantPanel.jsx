import { Mic, Pause, Play, RotateCcw, Send, Square } from 'lucide-react';
import Waveform from './Waveform';

export default function VoiceAssistantPanel({ mode, onModeChange }) {
  const isRecording = mode === 'listening' || mode === 'transcribing' || mode === 'clarification';
  const title = mode === 'standby' ? "Hi I'm Your Assistant" : mode === 'paused' ? 'Paused' : mode === 'captured' ? 'Speech Captured' : 'Recording...';
  const subtitle = mode === 'standby' ? 'for Daily Updates' : 'Listening for your sale details';

  if (mode === 'standby') {
    return (
      <section className="voice-standby">
        <AssistantAvatar />
        <h2>{title}<br />{subtitle}</h2>
        <button className="voice-start-button" type="button" onClick={() => onModeChange('listening')}>
          <span>Tap the Micro to speak...</span>
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
            <h3>Live transcription</h3>
            <button type="button" aria-label="Collapse transcription">⌄</button>
          </div>
          <p>Sold two milk teas and two green teas for ten dollars total.</p>
        </section>
      )}
      {mode === 'clarification' && (
        <section className="chat-history">
          <p className="chat-bubble user">Sold coffee and tea.</p>
          <p className="chat-bubble assistant">Can you confirm the quantities and prices?</p>
        </section>
      )}
      <section className="voice-control-drawer">
        <div className="voice-timer">{mode === 'paused' ? '00:12' : '00:18'}</div>
        <Waveform active={isRecording} />
        <div className="voice-primary-actions">
          <button type="button" aria-label={mode === 'paused' ? 'Play recording' : 'Pause recording'} onClick={() => onModeChange(mode === 'paused' ? 'listening' : 'paused')}>
            {mode === 'paused' ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
          </button>
          <button className="stop" type="button" aria-label="Stop recording" onClick={() => onModeChange('captured')}>
            <Square size={20} fill="currentColor" />
          </button>
        </div>
        <div className="voice-secondary-actions">
          <button type="button" aria-label="Restart recording" onClick={() => onModeChange('listening')}>
            <RotateCcw size={24} />
          </button>
          <button className="send" type="button" aria-label="Send recording" onClick={() => onModeChange('clarification')}>
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
