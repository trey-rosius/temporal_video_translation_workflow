import { proxyActivities, defineSignal, defineQuery, setHandler, condition } from '@temporalio/workflow';
import type * as activities from './activities';

export const statusQuery = defineQuery<string>('status');
export const progressQuery = defineQuery<number>('progress');
export const transcriptionQuery = defineQuery<string>('transcription');
export const updateConfigSignal = defineSignal<[any]>('updateConfig');
export const resolveTranscriptionSignal = defineSignal<[string]>('resolveTranscription');

const { ingest, transcribe, translate, dub, upload } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '10s',
    maximumAttempts: 5,
  },
});

export async function videoTranslationWorkflow(input: { bucket: string; key: string }): Promise<string> {
  let status = 'INITIALIZING';
  let progress = 0;
  let currentTranscription = '';
  let userApprovedTranscript = '';

  setHandler(statusQuery, () => status);
  setHandler(progressQuery, () => progress);
  setHandler(transcriptionQuery, () => currentTranscription);
  
  setHandler(updateConfigSignal, (config) => {
    console.log('Update config received:', config);
  });

  setHandler(resolveTranscriptionSignal, (approvedText) => {
    userApprovedTranscript = approvedText;
  });

  status = 'INGESTING';
  progress = 10;
  const localPath = await ingest(input.bucket, input.key);
  
  status = 'TRANSCRIBING';
  progress = 30;
  currentTranscription = await transcribe(localPath, input.bucket, input.key);
  
  // HUMAN-IN-THE-LOOP: Wait for user approval/modification
  status = 'AWAITING_REVIEW';
  progress = 45;
  
  await condition(() => userApprovedTranscript !== '');
  
  status = 'TRANSLATING';
  progress = 60;
  const translatedText = await translate(userApprovedTranscript);
  
  status = 'DUBBING';
  progress = 80;
  const dubbedPath = await dub(localPath, translatedText);
  
  status = 'UPLOADING';
  progress = 95;
  const finalUrl = await upload(dubbedPath, input.bucket);
  
  status = 'COMPLETED';
  progress = 100;
  return finalUrl;
}
