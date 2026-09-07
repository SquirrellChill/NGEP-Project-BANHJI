import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, Check, Edit3, Keyboard, Pause, Play, Plus, RotateCcw, Send, Square } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditItemModal from '../../components/dashboard/EditItemModal';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import TransactionSavedView from '../../components/dashboard/TransactionSavedView';
import Waveform from '../../components/dashboard/Waveform';
import { useLanguage } from '../../context/LanguageContext';
import { createSale } from '../../services/transactionService';
import {
  answerSaleFollowup,
  answerSaleFollowupAudio,
  resolveSaleRecord,
  transcribeSaleAudio,
} from '../../services/aiService';
import { formatCurrencyTotals, formatCurrencyValue, getPreferredCurrency, setPreferredCurrency } from '../../utils/currency';
import { normalizeReviewItem, resolveCurrency, resolveSaleDate, resolveUnitPrice, saleToPayload } from '../../utils/sales';
import '../DashboardPage.css';

const DRAFT_KEY = 'kc_add_sale_draft';
const emptyManualItem = { description: '', quantity: '1', unit_price: '', currency: getPreferredCurrency() };

const extractErrorMessage = (err, fallback) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((entry) => {
      const path = Array.isArray(entry?.loc) ? entry.loc.join('.') : '';
      return path ? `${path}: ${entry.msg}` : entry?.msg;
    }).filter(Boolean).join('; ');
  }
  return err?.message || fallback;
};

const formatElapsed = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
};

const normalizeNumberInput = (value, { integer = false } = {}) => {
  const cleaned = String(value ?? '').replace(/[^\d.]/g, '');
  const [wholeRaw, ...rest] = cleaned.split('.');
  const whole = wholeRaw.replace(/^0+(?=\d)/, '') || (cleaned.startsWith('0') ? '0' : '');
  if (!rest.length || integer) return whole;
  return `${whole || '0'}.${rest.join('')}`;
};

const parsePositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const voiceItemToDraftItem = (item, index) => normalizeReviewItem({
  id: `voice-${Date.now()}-${index}`,
  description: item.description || item.product || item.item || '',
  quantity: item.quantity ?? 1,
  unit_price: item.unit_price ?? item.price ?? 0,
  currency: item.currency || 'KHR',
  price_basis: item.price_basis || 'unit',
}, index);


export default function VoiceScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [inputMode, setInputMode] = useState(location.state?.entryMode || 'manual');
  const [saleDate, setSaleDate] = useState(() => resolveSaleDate(location.state?.saleDraft?.sale_date));
  const [draftItems, setDraftItems] = useState(() => {
    const incoming = location.state?.saleDraft?.items;
    if (Array.isArray(incoming) && incoming.length) return incoming.map(normalizeReviewItem);
    try {
      const stored = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      return Array.isArray(stored?.items) ? stored.items.map(normalizeReviewItem) : [];
    } catch {
      return [];
    }
  });
  const [manualItem, setManualItem] = useState(emptyManualItem);
  const [manualErrors, setManualErrors] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('entry');
  const [saving, setSaving] = useState(false);
  const [savedSaleId, setSavedSaleId] = useState(null);
  const [savedSale, setSavedSale] = useState(null);
  const [error, setError] = useState('');

  const [recordingMode, setRecordingMode] = useState('idle');
  const [recordingPurpose, setRecordingPurpose] = useState('sale');
  const [audioBlob, setAudioBlob] = useState(null);
  const [mimeType, setMimeType] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [history, setHistory] = useState([]);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const voiceItemIdsRef = useRef([]);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ sale_date: saleDate, items: draftItems }));
  }, [saleDate, draftItems]);


  useEffect(() => {
    if (recordingMode !== 'recording') return undefined;
    const timer = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recordingMode]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const totals = useMemo(() => {
    const original = draftItems.reduce((sum, item) => {
      const currency = resolveCurrency(item);
      sum[currency] += Number(item.quantity || 0) * resolveUnitPrice(item);
      return sum;
    }, { KHR: 0, USD: 0 });
    return formatCurrencyTotals({ khr: original.KHR, usd: original.USD });
  }, [draftItems]);

  const validateManualItem = () => {
    const next = {};
    const quantity = parsePositiveNumber(manualItem.quantity);
    const price = parsePositiveNumber(manualItem.unit_price);
    if (!manualItem.description.trim()) next.description = t('fieldRequired');
    if (!Number.isFinite(quantity) || quantity <= 0) next.quantity = t('quantityGreaterZero');
    if (!Number.isFinite(price) || price < 0 || manualItem.unit_price === '') next.unit_price = t('validPriceRequired');
    setManualErrors(next);
    return { valid: !Object.keys(next).length, quantity, price };
  };

  const addManualItem = (event) => {
    event.preventDefault();
    const result = validateManualItem();
    if (!result.valid) return;
    const item = normalizeReviewItem({
      id: `manual-${Date.now()}`,
      description: manualItem.description.trim(),
      product: manualItem.description.trim(),
      quantity: result.quantity,
      unit_price: result.price,
      currency: manualItem.currency,
      price_basis: 'unit',
    });
    setPreferredCurrency(manualItem.currency);
    setDraftItems((current) => [...current, item]);
    setManualItem({ ...emptyManualItem, currency: manualItem.currency });
    setError('');
  };

  const updateManualField = (name, value) => {
    const nextValue = name === 'quantity'
      ? normalizeNumberInput(value, { integer: false })
      : name === 'unit_price'
        ? normalizeNumberInput(value)
        : value;
    setManualItem((current) => ({ ...current, [name]: nextValue }));
    setManualErrors((current) => ({ ...current, [name]: '' }));
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setMimeType('');
    setElapsed(0);
  };

  const appendHistory = (role, text) => {
    if (text) setHistory((current) => [...current, { role, text }]);
  };

  const startRecording = async (purpose = 'sale') => {
    setInputMode('voice');
    setError('');
    setAnswerText('');
    setRecordingPurpose(purpose);
    resetRecording();
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
      setRecordingMode('recording');
    } catch {
      setRecordingMode('idle');
      setError(t('micRequired'));
    }
  };

  const pauseRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'recording') {
      recorder.pause();
      setRecordingMode('paused');
    } else if (recorder.state === 'paused') {
      recorder.resume();
      setRecordingMode('recording');
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    setRecordingMode('captured');
  };

  const restartRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    startRecording(recordingPurpose);
  };

  const mergeVoiceRecordIntoDraft = (record) => {
    const nextVoiceItems = (record?.items || []).map(voiceItemToDraftItem);
    voiceItemIdsRef.current = nextVoiceItems.map((item) => item.id);
    setDraftItems((current) => [
      ...current.filter((item) => !voiceItemIdsRef.current.includes(item.id) && !String(item.id).startsWith('voice-')),
      ...nextVoiceItems,
    ]);
  };

  const handleVoiceResult = (result) => {
    setVoiceResult(result);
    setTranscript(result.transcript || transcript);
    resetRecording();
    if (result.transcript) appendHistory('user', result.transcript);
    if (result.status === 'needs_followup' && result.question) {
      appendHistory('assistant', result.question);
      setRecordingMode('clarification');
      return;
    }
    if (result.record) {
      mergeVoiceRecordIntoDraft(result.record);
      setRecordingMode('idle');
      setViewMode('entry');
      return;
    }
    setRecordingMode('idle');
    setError(t('noSaleExtracted'));
  };

  const sendRecording = async () => {
    if (!audioBlob) {
      setError(t('recordBeforeSend'));
      return;
    }
    setRecordingMode('processing');
    setError('');
    try {
      if (recordingPurpose === 'followup' && voiceResult) {
        const response = await answerSaleFollowupAudio({
          audioBlob,
          mimeType,
          transcript: voiceResult.transcript || transcript,
          record: voiceResult.record,
          attempts: voiceResult.attempts || 0,
          asked_index: voiceResult.asked_index || 0,
          asked_field: voiceResult.asked_field || 'item',
          asked_question: voiceResult.question || '',
        });
        handleVoiceResult(response.data);
      } else if (recordingPurpose === 'continue' && voiceResult?.record) {
        const fresh = await transcribeSaleAudio({ audioBlob, mimeType });
        const mergedRecord = {
          ...voiceResult.record,
          items: [...(voiceResult.record.items || []), ...(fresh.data.record?.items || [])],
          date: voiceResult.record.date || fresh.data.record?.date,
        };
        const resolved = await resolveSaleRecord({
          transcript: `${voiceResult.transcript || transcript} ${fresh.data.transcript || ''}`.trim(),
          record: mergedRecord,
          attempts: 0,
          default_method: mergedRecord.payment_method,
        });
        handleVoiceResult(resolved.data);
      } else {
        const response = await transcribeSaleAudio({ audioBlob, mimeType });
        handleVoiceResult(response.data);
      }
    } catch (err) {
      setError(extractErrorMessage(err, t('unableTranscribe')));
      setRecordingMode('captured');
    }
  };

  const submitFollowup = async (event) => {
    event.preventDefault();
    if (!answerText.trim() || !voiceResult) return;
    setIsAnswering(true);
    setError('');
    appendHistory('user', answerText.trim());
    try {
      const response = await answerSaleFollowup({
        transcript: voiceResult.transcript || transcript,
        record: voiceResult.record,
        answer_text: answerText.trim(),
        attempts: voiceResult.attempts || 0,
        asked_index: voiceResult.asked_index || 0,
        asked_field: voiceResult.asked_field || 'item',
        asked_question: voiceResult.question || '',
      });
      setAnswerText('');
      handleVoiceResult(response.data);
    } catch (err) {
      setError(extractErrorMessage(err, t('unableTranscribe')));
      setRecordingMode('clarification');
    } finally {
      setIsAnswering(false);
    }
  };

  const openQuickEdit = () => {
    if (!voiceResult?.record) return;
    mergeVoiceRecordIntoDraft(voiceResult.record);
    setRecordingMode('idle');
  };

  const saveEditedItem = (updatedItem) => {
    setDraftItems((current) => current.map((item) => (item.id === updatedItem.id ? normalizeReviewItem(updatedItem) : item)));
    setEditingItem(null);
  };

  const deleteItem = (id) => {
    setDraftItems((current) => current.filter((item) => item.id !== id));
    setEditingItem(null);
  };

  const validateDraft = () => {
    if (!draftItems.length) return t('addOneItem');
    const invalid = draftItems.some((item) => {
      const quantity = Number(item.quantity);
      const price = resolveUnitPrice(item);
      return !String(item.description || item.product || '').trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0;
    });
    return invalid ? t('missingSaleDetails') : '';
  };

  const confirmAndSave = async () => {
    if (saving) return;
    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = saleToPayload(saleDate, draftItems);
      const response = await createSale(payload);
      setSavedSaleId(response.data?.sale_id || response.data?.saleId || null);
      sessionStorage.removeItem(DRAFT_KEY);
      setViewMode('saved');
    } catch (err) {
      setError(extractErrorMessage(err, t('couldNotSave')));
    } finally {
      setSaving(false);
    }
  };

  if (viewMode === 'saved') {
    return (
      <MobileAppShell activeTab="add" showBottomNav={false}>
        <TransactionSavedView savedSaleId={savedSaleId} onNewSale={() => {
          setDraftItems([]);
          setVoiceResult(null);
          setTranscript('');
          setHistory([]);
          setSavedSale(null);
          setSavedSaleId(null);
          setViewMode('entry');
        }} />
      </MobileAppShell>
    );
  }

  return (
    <MobileAppShell activeTab="add" className="voice-page-bg">
      <ScreenHeader title={t('addSale')} onBack={() => navigate('/dashboard')} />
      <section className="add-sale-workspace">
        <div className="input-mode-tabs" role="tablist" aria-label={t('addSaleMethod')}>
          <button className={inputMode === 'manual' ? 'active' : ''} type="button" onClick={() => setInputMode('manual')}>
            <Keyboard size={18} />{t('manualEntry')}
          </button>
          <button className={inputMode === 'voice' ? 'active' : ''} type="button" onClick={() => setInputMode('voice')}>
            <AudioLines size={18} />{t('recordSale')}
          </button>
        </div>

        <label className="dash-field sale-date-field">
          <span>{t('date')}</span>
          <input type="date" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} />
        </label>

        {inputMode === 'manual' ? (
          <form className="add-item-form" onSubmit={addManualItem} noValidate>
            <label className="dash-field">
              <span>{t('product')}</span>
              <input value={manualItem.description} onChange={(event) => updateManualField('description', event.target.value)} />
              {manualErrors.description && <small className="field-error">{manualErrors.description}</small>}
            </label>
            <div className="form-grid-two">
              <label className="dash-field">
                <span>{t('qty')}</span>
                <input inputMode="decimal" value={manualItem.quantity} onChange={(event) => updateManualField('quantity', event.target.value)} />
                {manualErrors.quantity && <small className="field-error">{manualErrors.quantity}</small>}
              </label>
              <label className="dash-field">
                <span>{t('currency')}</span>
                <div className="currency-toggle">
                  <button className={manualItem.currency === 'KHR' ? 'active' : ''} type="button" onClick={() => updateManualField('currency', 'KHR')}>KHR</button>
                  <button className={manualItem.currency === 'USD' ? 'active' : ''} type="button" onClick={() => updateManualField('currency', 'USD')}>USD</button>
                </div>
              </label>
            </div>
            <label className="dash-field">
              <span>{t('unitPrice')}</span>
              <div className="currency-input-wrap">
                <input inputMode="decimal" value={manualItem.unit_price} onChange={(event) => updateManualField('unit_price', event.target.value)} />
                <b>{manualItem.currency}</b>
              </div>
              {manualErrors.unit_price && <small className="field-error">{manualErrors.unit_price}</small>}
            </label>
            <button className="primary-action" type="submit"><Plus size={16} />{t('addToInvoice')}</button>
          </form>
        ) : (
          <section className="unified-voice-panel">
            <div className={`voice-status-card ${recordingMode}`}>
              <span className="voice-status-icon"><AudioLines size={28} /></span>
              <div>
                <strong>{t(recordingMode === 'recording' ? 'recording' : recordingMode === 'paused' ? 'paused' : recordingMode === 'captured' ? 'captured' : recordingMode === 'processing' ? 'transcribing' : recordingMode === 'clarification' ? 'answerQuestion' : 'assistantTitle')}</strong>
                <small>{recordingMode === 'idle' ? t('assistantSubtitle') : t('listeningSale')}</small>
              </div>
              <b>{formatElapsed(elapsed)}</b>
            </div>
            <Waveform active={recordingMode === 'recording' || recordingMode === 'processing'} />
            <div className="voice-action-grid">
              {(recordingMode === 'idle' || recordingMode === 'clarification') && <button className="primary-action" type="button" onClick={() => startRecording(recordingMode === 'clarification' ? 'followup' : 'sale')}><AudioLines size={16} />{recordingMode === 'clarification' ? t('answerByVoice') : t('recordSale')}</button>}
              {(recordingMode === 'recording' || recordingMode === 'paused') && <button className="outline-action" type="button" onClick={pauseRecording}>{recordingMode === 'paused' ? <Play size={16} /> : <Pause size={16} />}{recordingMode === 'paused' ? t('resumeRecording') : t('pauseRecording')}</button>}
              {(recordingMode === 'recording' || recordingMode === 'paused') && <button className="danger-action" type="button" onClick={stopRecording}><Square size={16} />{t('stopRecording')}</button>}
              {recordingMode === 'captured' && <button className="outline-action" type="button" onClick={restartRecording}><RotateCcw size={16} />{t('rerecord')}</button>}
              {recordingMode === 'captured' && <button className="primary-action" type="button" onClick={sendRecording}><Send size={16} />{t('sendRecording')}</button>}
              {voiceResult?.record && <button className="outline-action" type="button" onClick={() => startRecording('continue')}><Plus size={16} />{t('addAnotherItem')}</button>}
              {voiceResult?.record && <button className="outline-action" type="button" onClick={openQuickEdit}><Edit3 size={16} />{t('quickEditDraft')}</button>}
            </div>
            {(transcript || history.length > 0) && (
              <section className="transcript-panel">
                <h3>{t('liveTranscription')}</h3>
                {history.map((entry, index) => <p key={`${entry.role}-${index}`} className={`chat-bubble ${entry.role}`}>{entry.text}</p>)}
                {!history.length && <p>{transcript}</p>}
              </section>
            )}
            {recordingMode === 'clarification' && (
              <form className="followup-form unified-followup" onSubmit={submitFollowup}>
                <input value={answerText} onChange={(event) => setAnswerText(event.target.value)} placeholder={voiceResult?.question || t('followupPlaceholder')} disabled={isAnswering} />
                <button className="primary-action" type="submit" disabled={isAnswering || !answerText.trim()}>{isAnswering ? t('sendingAnswer') : t('sendAnswer')}</button>
              </form>
            )}
          </section>
        )}

        {error && <p className="review-error-message">{error}</p>}

        <section className="draft-sale-panel">
          <div className="section-title-row">
            <h3 className="section-heading">{t('saleDraft')}</h3>
            <span>{draftItems.length} {t('items')}</span>
          </div>
          <section className="review-items-card">
            <div className="review-grid review-head">
              <span>{t('product')}</span><span>{t('qty')}</span><span>{t('unitPrice')}</span><span>{t('total')}</span>
            </div>
            {!draftItems.length && <p className="empty-state-copy">{t('noReviewItems')}</p>}
            {draftItems.map((item) => {
              const unitPrice = resolveUnitPrice(item);
              const currency = resolveCurrency(item);
              return (
                <button className="review-grid review-row" type="button" key={item.id} onClick={() => setEditingItem(item)}>
                  <span>{item.description || item.product}</span>
                  <span>{item.quantity}</span>
                  <span>{formatCurrencyValue(unitPrice, currency)}</span>
                  <span>{formatCurrencyValue(Number(item.quantity || 0) * unitPrice, currency)}</span>
                </button>
              );
            })}
          </section>
          <section className="sale-total-section">
            <div><strong>{t('totalUsdLabel')}</strong><span>{totals.usdLabel}</span></div>
            <div><strong>{t('totalKhrLabel')}</strong><span>{totals.khrLabel}</span></div>
          </section>
          <section className="screen-actions two-col">
            <button className="primary-action" type="button" onClick={confirmAndSave} disabled={saving || !draftItems.length}><Check size={16} />{saving ? t('saving') : t('confirmSaveSale')}</button>
          </section>
        </section>
      </section>
      <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onDelete={deleteItem} onSave={saveEditedItem} />
    </MobileAppShell>
  );
}