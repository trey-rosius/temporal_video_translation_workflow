import { Connection, Client } from '@temporalio/client';
import { videoTranslationWorkflow } from '../../temporal/workflow';

export const handler = async (event: any) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

  // Only process video files uploaded to the 'uploads/' folder
  if (!key.startsWith('uploads/')) {
    console.log(`Skipping key (not in uploads/): ${key}`);
    return;
  }
  const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
  const isVideo = VIDEO_EXTENSIONS.some(ext => key.toLowerCase().endsWith(ext));
  if (!isVideo) {
    console.log(`Skipping non-video S3 key: ${key}`);
    return;
  }

  const address = process.env.TEMPORAL_ADDRESS;
  const namespace = process.env.TEMPORAL_NAMESPACE;
  const apiKey = process.env.TEMPORAL_API_KEY;

  if (!address || !namespace) {
    throw new Error('TEMPORAL_ADDRESS and TEMPORAL_NAMESPACE must be set');
  }

  const connectionOptions: any = {
    address: address,
    tls: !!apiKey,
  };

  if (apiKey) {
    connectionOptions.metadata = {
      Authorization: `Bearer ${apiKey}`,
      'temporal-namespace': namespace,
    };
    connectionOptions.tls = {
      serverNameOverride: address.split(':')[0],
    };
  }

  const connection = await Connection.connect(connectionOptions);

  const client = new Client({ 
    connection,
    namespace: namespace,
  });

  const handle = await client.workflow.start(videoTranslationWorkflow, {
    args: [{ bucket, key }],
    taskQueue: 'video-translation-queue',
    workflowId: `video-${key.replace(/[^a-zA-Z0-9]/g, '-')}`,
  });

  console.log(`Started workflow ${handle.workflowId} on namespace ${namespace}`);
};
