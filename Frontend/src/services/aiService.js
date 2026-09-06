// // Voice extraction is served by Backend's /voice routes.
// // Uses nodeApi (not aiApi) because /voice/* endpoints require auth, and
// // only nodeApi's interceptor attaches the Authorization header. aiApi and
// // nodeApi point at the same backend anyway -- see ./api.

// import { nodeApi } from './api';

// /**
//  * Sends a freshly-recorded sale audio clip for transcription + extraction.
//  * Called from VoiceScreen.jsx as: transcribeSaleAudio({ audioBlob, mimeType })
//  * Matches Backend POST /voice/sale (multipart/form-data).
//  *
//  * Returns the raw axios response -- callers read response.data, which has
//  * the shape: { status, transcript, record, attempts, item_count,
//  * missing_slots, question, asked_field, asked_index, currency_notes,
//  * catalog_matches }.
//  */
// export const transcribeSaleAudio = ({ audioBlob, mimeType }) => {
//   const formData = new FormData();
//   const extension = (mimeType || 'audio/webm').split('/')[1]?.split(';')[0] || 'webm';
//   formData.append('audio', audioBlob, `recording.${extension}`);
//   if (mimeType) formData.append('mime_type', mimeType);

//   return nodeApi.post('/voice/sale', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
// };

// /**
//  * Sends a TYPED answer to a clarification question.
//  * Called from VoiceScreen.jsx as:
//  *   answerSaleFollowup({ transcript, record, answer_text, attempts,
//  *                         asked_index, asked_field, asked_question })
//  * Matches Backend POST /voice/followup (application/json).
//  */
// export const answerSaleFollowup = ({
//   transcript,
//   record,
//   answer_text,
//   attempts,
//   asked_index,
//   asked_field,
//   asked_question,
// }) => {
//   return nodeApi.post('/voice/followup', {
//     transcript,
//     record,
//     answer_text,
//     attempts,
//     asked_index,
//     asked_field,
//     asked_question,
//   });
// };

// /**
//  * Sends a SPOKEN answer to a clarification question.
//  * Same purpose as answerSaleFollowup, but the answer is an audio recording
//  * instead of typed text -- the backend transcribes it first, then runs the
//  * exact same clarification logic. Not yet wired up to a UI control in
//  * VoiceScreen.jsx; call this once a "record answer" button exists for the
//  * clarification step, using the same MediaRecorder pattern as
//  * startRecording/stopRecording already do for the initial sale recording.
//  *
//  * Matches Backend POST /voice/followup-audio (multipart/form-data).
//  */
// export const answerSaleFollowupAudio = ({
//   audioBlob,
//   mimeType,
//   transcript,
//   record,
//   attempts,
//   asked_index,
//   asked_field,
//   asked_question,
// }) => {
//   const formData = new FormData();
//   const extension = (mimeType || 'audio/webm').split('/')[1]?.split(';')[0] || 'webm';
//   formData.append('audio', audioBlob, `answer.${extension}`);
//   formData.append('transcript', transcript || '');
//   formData.append('record', JSON.stringify(record));
//   formData.append('attempts', attempts ?? 0);
//   formData.append('asked_index', asked_index ?? 0);
//   formData.append('asked_field', asked_field || 'item');
//   formData.append('asked_question', asked_question || '');
//   if (mimeType) formData.append('mime_type', mimeType);

//   return nodeApi.post('/voice/followup-audio', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
// };

// /**
//  * Re-checks an already-built record without re-running ASR/extraction.
//  * Used to merge a newly-recorded item into a record the seller already
//  * confirmed items for, letting them keep adding items to one sale instead
//  * of starting over. Matches Backend POST /voice/resolve (application/json).
//  */
// export const resolveSaleRecord = ({
//   transcript,
//   record,
//   attempts,
//   default_method,
// }) => {
//   return nodeApi.post('/voice/resolve', {
//     transcript,
//     record,
//     attempts,
//     default_method,
//   });
// };

// /**
//  * Saves a confirmed sale record directly, without navigating away.
//  *
//  * *** PLACEHOLDER — replace the URL/payload with whatever your real
//  * transaction-saving endpoint actually expects. This guess matches the
//  * conventions seen elsewhere in this file (nodeApi, same auth headers),
//  * but hasn't been checked against the real Backend route for saving a
//  * transaction -- swap this out once you confirm the actual endpoint. ***
//  */
// export const saveSaleRecord = ({ record, transcript }) => {
//   return nodeApi.post('/transactions', { record, transcript });
// };

// // Kept for backward compatibility with any other existing callers.
// export const extractFromSpeech = () => {
//   throw new Error('Not implemented — use transcribeSaleAudio() instead.');
// };
// Voice extraction is served by Backend's /voice routes.
// Uses nodeApi (not aiApi) because /voice/* endpoints require auth, and
// only nodeApi's interceptor attaches the Authorization header. aiApi and
// nodeApi point at the same backend anyway -- see ./api.

import { nodeApi } from './api';

/**
 * Sends a freshly-recorded sale audio clip for transcription + extraction.
 * Called from VoiceScreen.jsx as: transcribeSaleAudio({ audioBlob, mimeType })
 * Matches Backend POST /voice/sale (multipart/form-data).
 *
 * Returns the raw axios response -- callers read response.data, which has
 * the shape: { status, transcript, record, attempts, item_count,
 * missing_slots, question, asked_field, asked_index, currency_notes,
 * catalog_matches }.
 */
export const transcribeSaleAudio = ({ audioBlob, mimeType }) => {
  const formData = new FormData();
  const extension = (mimeType || 'audio/webm').split('/')[1]?.split(';')[0] || 'webm';
  formData.append('audio', audioBlob, `recording.${extension}`);
  if (mimeType) formData.append('mime_type', mimeType);

  return nodeApi.post('/voice/sale', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Sends a TYPED answer to a clarification question.
 * Called from VoiceScreen.jsx as:
 *   answerSaleFollowup({ transcript, record, answer_text, attempts,
 *                         asked_index, asked_field, asked_question })
 * Matches Backend POST /voice/followup (application/json).
 */
export const answerSaleFollowup = ({
  transcript,
  record,
  answer_text,
  attempts,
  asked_index,
  asked_field,
  asked_question,
}) => {
  return nodeApi.post('/voice/followup', {
    transcript,
    record,
    answer_text,
    attempts,
    asked_index,
    asked_field,
    asked_question,
  });
};

/**
 * Sends a SPOKEN answer to a clarification question.
 * Same purpose as answerSaleFollowup, but the answer is an audio recording
 * instead of typed text -- the backend transcribes it first, then runs the
 * exact same clarification logic. Not yet wired up to a UI control in
 * VoiceScreen.jsx; call this once a "record answer" button exists for the
 * clarification step, using the same MediaRecorder pattern as
 * startRecording/stopRecording already do for the initial sale recording.
 *
 * Matches Backend POST /voice/followup-audio (multipart/form-data).
 */
export const answerSaleFollowupAudio = ({
  audioBlob,
  mimeType,
  transcript,
  record,
  attempts,
  asked_index,
  asked_field,
  asked_question,
}) => {
  const formData = new FormData();
  const extension = (mimeType || 'audio/webm').split('/')[1]?.split(';')[0] || 'webm';
  formData.append('audio', audioBlob, `answer.${extension}`);
  formData.append('transcript', transcript || '');
  formData.append('record', JSON.stringify(record));
  formData.append('attempts', attempts ?? 0);
  formData.append('asked_index', asked_index ?? 0);
  formData.append('asked_field', asked_field || 'item');
  formData.append('asked_question', asked_question || '');
  if (mimeType) formData.append('mime_type', mimeType);

  return nodeApi.post('/voice/followup-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Re-checks an already-built record without re-running ASR/extraction.
 * Used to merge a newly-recorded item into a record the seller already
 * confirmed items for, letting them keep adding items to one sale instead
 * of starting over. Matches Backend POST /voice/resolve (application/json).
 */
export const resolveSaleRecord = ({
  transcript,
  record,
  attempts,
  default_method,
}) => {
  return nodeApi.post('/voice/resolve', {
    transcript,
    record,
    attempts,
    default_method,
  });
};

/**
 * Saves a confirmed sale record directly, without navigating away.
 *
 * *** PLACEHOLDER — replace the URL/payload with whatever your real
 * transaction-saving endpoint actually expects. This guess matches the
 * conventions seen elsewhere in this file (nodeApi, same auth headers),
 * but hasn't been checked against the real Backend route for saving a
 * transaction -- swap this out once you confirm the actual endpoint. ***
 */
export const saveSaleRecord = ({ record, transcript }) => {
  // /transactions expects a flat body -- sale_date and items at the top
  // level, not nested inside a `record` wrapper -- confirmed from the
  // actual 422 validation error: "body.sale_date: Field required;
  // body.items: Field required".
  return nodeApi.post('/transactions', {
    sale_date: record?.date || null,
    items: record?.items || [],
    payment_method: record?.payment_method || null,
    transcript,
  });
};

// Kept for backward compatibility with any other existing callers.
export const extractFromSpeech = () => {
  throw new Error('Not implemented — use transcribeSaleAudio() instead.');
};