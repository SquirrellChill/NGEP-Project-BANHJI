import { nodeApi } from './api';

export const transcribeSaleAudio = ({ audioBlob, mimeType }) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, `sale-recording.${mimeType?.includes('mp4') ? 'mp4' : 'webm'}`);
  if (mimeType) formData.append('mime_type', mimeType);

  return nodeApi.post('/voice/sale', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const answerSaleFollowup = (payload) => nodeApi.post('/voice/followup', payload);
