import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities';
import * as http from 'http';

async function run() {
  const address = process.env.TEMPORAL_ADDRESS;
  const namespace = process.env.TEMPORAL_NAMESPACE;
  const apiKey = process.env.TEMPORAL_API_KEY;

  if (!address || !namespace) {
    throw new Error('TEMPORAL_ADDRESS and TEMPORAL_NAMESPACE must be set');
  }

  // Start a simple health check server
  const healthServer = http.createServer((_req, res) => {
    res.writeHead(200);
    res.end('OK');
  });
  
  const port = process.env.PORT || 8080;
  healthServer.listen(port, () => {
    console.log(`Health check server listening on port ${port}`);
  });

  console.log(`Connecting to Temporal at ${address} in namespace ${namespace}`);
  
  // Quick network check
  try {
    const { execSync } = require('child_process');
    console.log("Network check (ping):");
    try {
      execSync(`ping -c 1 ${address.split(':')[0]}`, { stdio: 'inherit' });
    } catch (e) {
      console.log("Ping failed (expected in some VPCs), trying nc...");
    }
  } catch (err) {
    console.warn("Network diagnostic tools failed:", err);
  }

  console.log(`Connecting to Temporal at ${address} in namespace ${namespace}`);
  
  const connectionOptions: any = {
    address: address,
    tls: !!apiKey,
  };

  if (apiKey) {
    connectionOptions.metadata = {
      Authorization: `Bearer ${apiKey}`,
      'temporal-namespace': namespace,
    };
    // Ensure TLS is configured for cloud
    connectionOptions.tls = {
      serverNameOverride: address.split(':')[0],
    };
  }

  const connection = await NativeConnection.connect(connectionOptions);

  const worker = await Worker.create({
    connection,
    namespace: namespace,
    workflowsPath: require.resolve('./workflow'),
    activities,
    taskQueue: 'video-translation-queue',
    bundlerOptions: {
      webpackConfigHook: (config: any) => {
        config.optimization = config.optimization || {};
        config.optimization.minimize = false;
        return config;
      },
    },
  });

  console.log(`Worker started on namespace ${namespace}, listening on task queue: video-translation-queue`);
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
