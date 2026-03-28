import { proxyActivities, defineSignal, defineQuery, setHandler } from '@temporalio/workflow';
import type * as activities from './activities';

// These are used by the worker, but the types are used by the Lambda
export const statusQuery = defineQuery<string>('status');
export const progressQuery = defineQuery<number>('progress');
export const updateConfigSignal = defineSignal<[any]>('updateConfig');

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

  setHandler(statusQuery, () => status);
  setHandler(progressQuery, () => progress);
  setHandler(updateConfigSignal, (config) => {
    console.log('Update config received:', config);
  });

  status = 'INGESTING';
  progress = 10;
  const localPath = await ingest(input.bucket, input.key);
  
  status = 'TRANSCRIBING';
  progress = 30;
  const transcript = await transcribe(localPath, input.bucket, input.key);
  
  status = 'TRANSLATING';
  progress = 50;
  const translatedText = await translate(transcript);
  
  status = 'DUBDUBBING';
  progress = 70;
  const dubbedPath = await dub(localPath, translatedText);
  
  status = 'UPLOADING';
  progress = 90;
  const finalUrl = await upload(dubbedPath, input.bucket);
  
  status = 'COMPLETED';
  progress = 100;
  return finalUrl;
}
