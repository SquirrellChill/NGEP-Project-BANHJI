import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileAppShell from '../../components/dashboard/MobileAppShell';
import ScreenHeader from '../../components/dashboard/ScreenHeader';
import VoiceAssistantPanel from '../../components/dashboard/VoiceAssistantPanel';
import ReviewSalePanel from '../../components/dashboard/ReviewSalePanel';
import EditItemModal from '../../components/dashboard/EditItemModal';
import TransactionSavedView from '../../components/dashboard/TransactionSavedView';
import { useLanguage } from '../../context/LanguageContext';
import {
  answerSaleFollowup,
  answerSaleFollowupAudio,
  resolveSaleRecord,
  saveSaleRecord,
  transcribeSaleAudio,
} from '../../services/aiService';
import '../DashboardPage.css';

const extractErrorMessage = (err, fallback) => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // FastAPI/Pydantic validation error shape: [{type, loc, msg, input}, ...]
    // Include `loc` (the exact field path, e.g. ["body","items",0,"price"])
    // alongside `msg` -- "Field required" alone doesn't say WHICH field,
    // which is exactly the information needed to fix a payload mismatch.
    return detail
      .map((d) => {
        if (!d || typeof d !== 'object') return JSON.stringify(d);
        const path = Array.isArray(d.loc) ? d.loc.join('.') : '';
        return path ? `${path}: ${d.msg}` : d.msg || JSON.stringify(d);
      })
      .join('; ');
  }
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return fallback;
};

// The AI pipeline returns relative terms ("today", "yesterday") or null,
// not an actual date -- but /transactions requires a real date string
// (confirmed: "body.sale_date: Input should be a valid date"). Resolves
// to YYYY-MM-DD in the browser's local time.
const resolveSaleDate = (relativeDate) => {
  const now = new Date();
  const normalized = (relativeDate || '').trim().toLowerCase();

  if (normalized === 'yesterday') {
    now.setDate(now.getDate() - 1);
  } else if (normalized && normalized !== 'today') {
    // Already looks like a specific date the model extracted -- try it
    // directly rather than assuming "today".
    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }

  return now.toISOString().split('T')[0];
};

const formatElapsed = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
};

// Converts the backend's record shape ({item, quantity, price, currency})
// into the shape ReviewSalePanel/EditItemModal already expect elsewhere in
// this app ({id, product, quantity, unit_price, currency}). These
// components are shared with the manual-entry transaction flow -- reusing
// them (instead of a second, custom summary UI) keeps the review/edit/save
// experience identical regardless of whether the sale came in by voice or
// by hand, and avoids re-implementing currency formatting/conversion that
// utils/currency.js already handles correctly.
const toReviewItems = (items) =>
  (items || []).map((item, index) => ({
    id: `voice-item-${index}`,
    product: item.item || '',
    quantity: item.quantity ?? 1,
    currency: item.currency || 'USD',
    unit_price: item.price ?? 0,
  }));

// The reverse conversion, for sending the (possibly user-edited) items back
// through the AI pipeline's record shape when needed, and for the final save.
const toBackendItems = (reviewItems) =>
  reviewItems.map((item) => ({
    item: item.product,
    quantity: Number(item.quantity),
    unit: null,
    price: Number(item.unit_price),
    currency: item.currency,
    price_basis: 'unit',
  }));

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
  const [isSaving, setIsSaving] = useState(false);
  const [recordingPurpose, setRecordingPurpose] = useState('sale');
  const [history, setHistory] = useState([]);
  const [chatActive, setChatActive] = useState(false);

  // Review-step state, in the shape ReviewSalePanel/EditItemModal expect --
  // separate from voiceResult.record, which stays in the AI pipeline's own
  // shape until the moment we hand off to these shared components.
  const [reviewItems, setReviewItems] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  // Quick-edit during the clarification loop -- lets the seller correct
  // ANY field of the item currently being asked about (not just the one
  // field the current question targets), e.g. fixing a misheard item name
  // while the bot is asking about price. Separate from EditItemModal,
  // which only applies once the record is already complete.
  const [showQuickEdit, setShowQuickEdit] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const previousTranscriptRef = useRef('');

  useEffect(() => {
    if (mode !== 'listening') return undefined;
    const timer = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [mode]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const resetRecordingPanel = () => {
    setAudioBlob(null);
    setElapsed(0);
    setMimeType('');
  };

  const appendHistory = (role, text) => {
    if (!text) return;
    setHistory((current) => [...current, { role, text }]);
  };

  const startRecording = async (purpose = 'sale') => {
    setError('');
    if (purpose === 'sale') {
      setTranscript('');
      setVoiceResult(null);
      setHistory([]);
      setChatActive(false);
      previousTranscriptRef.current = '';
    }
    setAnswerText('');
    setRecordingPurpose(purpose);
    resetRecordingPanel();

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

  const cancelActiveRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    resetRecordingPanel();
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
    await startRecording(recordingPurpose);
  };

  const sendRecording = async () => {
    if (!audioBlob) {
      setError(t('recordBeforeSend'));
      return;
    }

    setMode('transcribing');
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
      } else if (recordingPurpose === 'continue' && voiceResult) {
        await sendContinueRecording();
      } else {
        const response = await transcribeSaleAudio({ audioBlob, mimeType });
        handleVoiceResult(response.data);
      }
    } catch (err) {
      setError(extractErrorMessage(err, t('unableTranscribe')));
      setMode('captured');
    }
  };

  const sendContinueRecording = async () => {
    const freshResponse = await transcribeSaleAudio({ audioBlob, mimeType });
    const newData = freshResponse.data;

    appendHistory('user', newData.transcript);

    const priorRecord = voiceResult.record;
    const mergedRecord = {
      items: [...(priorRecord.items || []), ...(newData.record?.items || [])],
      date: priorRecord.date || newData.record?.date || null,
      payment_method: priorRecord.payment_method || newData.record?.payment_method || null,
    };
    const mergedTranscript = `${previousTranscriptRef.current} ${newData.transcript}`.trim();

    const resolved = await resolveSaleRecord({
      transcript: mergedTranscript,
      record: mergedRecord,
      attempts: 0,
      default_method: mergedRecord.payment_method,
    });

    previousTranscriptRef.current = mergedTranscript;
    handleContinueResolved(resolved.data);
  };

  // Hands off to the review screen -- converts the AI pipeline's record
  // shape into what ReviewSalePanel/EditItemModal expect, and switches out
  // of the chat UI entirely for this step (these are full panels elsewhere
  // in the app, not chat bubbles -- keeping that consistent matters more
  // than forcing every step into one visual style).
  const enterReview = (record) => {
    setReviewItems(toReviewItems(record.items));
    setDeletedIds([]);
    setMode('review');
  };

  const handleVoiceResult = (result) => {
    const newTranscript = result.transcript || '';
    const isFirstTurn = history.length === 0;
    const userTurnText = isFirstTurn
      ? newTranscript
      : newTranscript.slice(previousTranscriptRef.current.length).trim() || newTranscript;

    appendHistory('user', userTurnText);
    previousTranscriptRef.current = newTranscript;

    setVoiceResult(result);
    setTranscript(newTranscript);
    resetRecordingPanel();

    if (result.status === 'needs_followup' && result.question) {
      appendHistory('assistant', result.question);
      setAnswerText('');
      setChatActive(true);
      setMode('clarification');
      return;
    }

    setChatActive(false);

    if (result.status === 'needs_confirmation' && result.record) {
      enterReview(result.record);
      return;
    }

    if (result.record) {
      setError(t('manualReviewNeeded'));
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
    setMode('standby');
  };

  const submitFollowup = async (event) => {
    event.preventDefault();
    if (!voiceResult || !answerText.trim()) return;

    cancelActiveRecording();
    setIsAnswering(true);
    setError('');
    appendHistory('user', answerText);

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
      previousTranscriptRef.current = response.data.transcript || previousTranscriptRef.current;
      handleFollowupResult(response.data);
    } catch (err) {
      setError(extractErrorMessage(err, t('unableTranscribe')));
      setMode('clarification');
    } finally {
      setIsAnswering(false);
    }
  };

  const handleFollowupResult = (result) => {
    setVoiceResult(result);
    setTranscript(result.transcript || '');
    resetRecordingPanel();

    if (result.status === 'needs_followup' && result.question) {
      appendHistory('assistant', result.question);
      setAnswerText('');
      setChatActive(true);
      setMode('clarification');
      return;
    }

    setChatActive(false);

    if (result.status === 'needs_confirmation' && result.record) {
      enterReview(result.record);
      return;
    }

    if (result.record) {
      setError(t('manualReviewNeeded'));
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
    setMode('standby');
  };

  const handleContinueResolved = (result) => {
    setVoiceResult(result);
    setTranscript(result.transcript || '');
    resetRecordingPanel();

    if (result.status === 'needs_followup' && result.question) {
      appendHistory('assistant', result.question);
      setAnswerText('');
      setChatActive(true);
      setMode('clarification');
      return;
    }

    if (result.status === 'needs_confirmation' && result.record) {
      enterReview(result.record);
      return;
    }

    if (result.record) {
      setError(t('manualReviewNeeded'));
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
    setChatActive(false);
    setMode('standby');
  };

  const startFollowupRecording = () => startRecording('followup');
  const continueRecording = () => startRecording('continue');

  // Lets the seller stop the clarification loop on their own terms and go
  // straight to review with whatever's been captured so far -- even if
  // some fields are still blank. toReviewItems() already defaults a
  // missing quantity/price to sensible placeholders (1 / 0), so those
  // gaps show up as editable fields on the review screen via the real
  // EditItemModal, rather than forcing every remaining question first.
  const finishAndReview = () => {
    if (!voiceResult?.record) return;
    cancelActiveRecording();
    setChatActive(false);
    enterReview(voiceResult.record);
  };

  // Applies a direct correction to the item currently being asked about,
  // then re-validates the WHOLE record through /voice/resolve -- reusing
  // the same completeness/currency logic as every other path, so a manual
  // correction is treated exactly like a spoken one would be. This is what
  // lets the seller fix the item name while the bot is still asking about
  // price, instead of that correction being silently dropped because it
  // didn't answer the specific question asked.
  const applyQuickEdit = async (updatedFields) => {
    if (!voiceResult?.record) return;

    const itemIndex = voiceResult.asked_index ?? 0;
    const items = voiceResult.record.items.map((item, index) =>
      index === itemIndex ? { ...item, ...updatedFields } : item
    );
    const updatedRecord = { ...voiceResult.record, items };

    const correctionSummary = Object.entries(updatedFields)
      .filter(([, value]) => value !== null && value !== '')
      .map(([field, value]) => `${field}: ${value}`)
      .join(', ');
    appendHistory('user', `✏️ ${correctionSummary}`);

    cancelActiveRecording();
    setIsAnswering(true);
    setError('');

    try {
      const resolved = await resolveSaleRecord({
        transcript: voiceResult.transcript || transcript,
        record: updatedRecord,
        attempts: voiceResult.attempts || 0,
        default_method: updatedRecord.payment_method,
      });
      setShowQuickEdit(false);
      handleFollowupResult(resolved.data);
    } catch (err) {
      setError(extractErrorMessage(err, t('unableTranscribe')));
    } finally {
      setIsAnswering(false);
    }
  };

  // --- Review screen handlers (ReviewSalePanel / EditItemModal) ---

  const openEditItem = (item) => setEditingItem(item);
  const closeEditItem = () => setEditingItem(null);

  const saveEditedItem = (updatedItem) => {
    setReviewItems((current) =>
      current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setEditingItem(null);
  };

  const deleteEditedItem = (id) => {
    setDeletedIds((current) => [...current, id]);
    setEditingItem(null);
  };

  const confirmAndSave = async () => {
    const finalItems = reviewItems.filter((item) => !deletedIds.includes(item.id));
    if (!finalItems.length) {
      setError(t('noSaleExtracted'));
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Map straight from reviewItems (already in ReviewSalePanel/
      // EditItemModal's own shape: product, unit_price) to the exact field
      // names /transactions actually requires (description, unit_price) --
      // confirmed from the real 422 validation errors. No need to round-
      // trip through the AI pipeline's {item, price} shape for this call;
      // reviewItems already holds whatever the seller last edited.
      const backendItems = finalItems.map((item) => ({
        description: item.product,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency: item.currency,
      }));

      await saveSaleRecord({
        sale_date: resolveSaleDate(voiceResult?.record?.date),
        items: backendItems,
        payment_method: voiceResult?.record?.payment_method || null,
        transcript: voiceResult?.transcript || transcript,
      });

      setMode('saved');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not save. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const recordNextSale = () => {
    setVoiceResult(null);
    setTranscript('');
    setReviewItems([]);
    setDeletedIds([]);
    setEditingItem(null);
    startRecording('sale');
  };

  // --- Render ---

  if (mode === 'saved') {
    return (
      <MobileAppShell activeTab="voice" showBottomNav={false} className="voice-page-bg">
        <ScreenHeader title={t('saleRecording')} onBack={() => window.history.back()} />
        <TransactionSavedView onNewSale={recordNextSale} />
      </MobileAppShell>
    );
  }

  if (mode === 'review') {
    return (
      <MobileAppShell activeTab="voice" showBottomNav={false} className="voice-page-bg">
        <ScreenHeader title={t('saleRecording')} onBack={() => window.history.back()} />
        <ReviewSalePanel
          items={reviewItems}
          deletedIds={deletedIds}
          onEdit={openEditItem}
          onConfirm={confirmAndSave}
          error={error}
          isSaving={isSaving}
        />
        {editingItem && (
          <EditItemModal
            item={editingItem}
            onClose={closeEditItem}
            onSave={saveEditedItem}
            onDelete={deleteEditedItem}
          />
        )}
      </MobileAppShell>
    );
  }

  return (
    <MobileAppShell activeTab="voice" showBottomNav={false} className="voice-page-bg">
      <ScreenHeader title={t('saleRecording')} onBack={() => window.history.back()} />
      <VoiceAssistantPanel
        mode={mode}
        inFollowup={chatActive}
        transcript={transcript}
        error={error}
        elapsed={formatElapsed(elapsed)}
        onStart={() => startRecording('sale')}
        onPause={pauseRecording}
        onStop={stopRecording}
        onRestart={restartRecording}
        onSend={sendRecording}
        onRecordAnswer={startFollowupRecording}
        onContinueRecording={continueRecording}
        onFinishAndReview={finishAndReview}
        onOpenQuickEdit={() => setShowQuickEdit(true)}
        onCloseQuickEdit={() => setShowQuickEdit(false)}
        onApplyQuickEdit={applyQuickEdit}
        showQuickEdit={showQuickEdit}
        currentItem={voiceResult?.record?.items?.[voiceResult?.asked_index ?? 0] || null}
        question={voiceResult?.question || ''}
        history={history}
        answerText={answerText}
        onAnswerChange={setAnswerText}
        onAnswerSubmit={submitFollowup}
        isAnswering={isAnswering}
      />
    </MobileAppShell>
  );
}