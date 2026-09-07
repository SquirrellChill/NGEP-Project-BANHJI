// Voice extraction is served by Backend's authenticated /voice routes.
// Use nodeApi so the existing Authorization: Bearer token interceptor is preserved.

import { nodeApi } from './api';

const audioExtension = (mimeType) =>
  (mimeType || 'audio/webm').split('/')[1]?.split(';')[0] || 'webm';

export const transcribeSaleAudio = ({ audioBlob, mimeType }) => {
  const formData = new FormData();
  const extension = audioExtension(mimeType);
  formData.append('audio', audioBlob, `recording.${extension}`);
  if (mimeType) formData.append('mime_type', mimeType);

  return nodeApi.post('/voice/sale', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

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
  const extension = audioExtension(mimeType);
  formData.append('audio', audioBlob, `answer.${extension}`);
  formData.append('transcript', transcript || '');
  formData.append('record', JSON.stringify(record || {}));
  formData.append('attempts', attempts ?? 0);
  formData.append('asked_index', asked_index ?? 0);
  formData.append('asked_field', asked_field || 'item');
  formData.append('asked_question', asked_question || '');
  if (mimeType) formData.append('mime_type', mimeType);

  return nodeApi.post('/voice/followup-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

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

export const saveSaleRecord = ({ sale_date, items, record }) => {
  return nodeApi.post('/transactions', {
    sale_date: sale_date || record?.date || null,
    items: items || record?.items || [],
  });
};

export const extractFromSpeech = transcribeSaleAudio;